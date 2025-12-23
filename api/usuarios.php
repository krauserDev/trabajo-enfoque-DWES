<?php
// API para gestión de usuarios: login, registro, CRUD

// Seguridad: no mostrar errores en pantalla
error_reporting(E_ALL);
ini_set('display_errors', 0); 

require_once 'config.php';

// Obtiene la acción a ejecutar desde la URL y el método HTTP
$action = $_GET['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];

// Lee datos JSON del cuerpo de la petición
$input = json_decode(file_get_contents('php://input'), true);

// Procesa la acción solicitada
switch($action) {
    
    // Registrar nuevo usuario
    case 'register':
        if ($method === 'POST') {
            $nombre = $input['nombre'] ?? '';
            $email = $input['email'] ?? '';
            $password = $input['password'] ?? '';
            
            // Valida que todos los campos obligatorios estén completos
            if (empty($nombre) || empty($email) || empty($password)) {
                enviarJSON(['success' => false, 'message' => 'Todos los campos son obligatorios']);
            }
            
            // Verifica si el email ya existe en la BD
            try {
                $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE email = ?");
                $stmt->execute([$email]);
                if ($stmt->fetch()) {
                    enviarJSON(['success' => false, 'message' => 'El email ya está registrado']);
                }
                
                // Crea el usuario con contraseña hasheada (cifrada)
                $passwordHash = password_hash($password, PASSWORD_DEFAULT);
                $stmt = $pdo->prepare("INSERT INTO usuarios (nombre, email, password, tipo) VALUES (?, ?, ?, 'cliente')");
                $stmt->execute([$nombre, $email, $passwordHash]);
                
                enviarJSON(['success' => true, 'message' => 'Usuario registrado correctamente']);
            } catch (Exception $e) {
                enviarJSON(['success' => false, 'message' => 'Error al registrar: ' . $e->getMessage()]);
            }
        }
        break;
    
    // Login: autentica usuario con email y contraseña
    case 'login':
        if ($method === 'POST') {
            $email = $input['email'] ?? '';
            $password = $input['password'] ?? '';
            
            // Valida que email y contraseña no estén vacíos
            if (empty($email) || empty($password)) {
                enviarJSON(['success' => false, 'message' => 'Email y contraseña son obligatorios']);
            }
            
            try {
                // Busca el usuario por email en la BD
                $stmt = $pdo->prepare("SELECT * FROM usuarios WHERE email = ?");
                $stmt->execute([$email]);
                $usuario = $stmt->fetch(PDO::FETCH_ASSOC);
                
                // Verifica contraseña (usa password_verify para comparar hasheadas)
                if ($usuario && password_verify($password, $usuario['password'])) {
                    // Crea la sesión del usuario
                    $_SESSION['usuario_id'] = $usuario['id'];
                    $_SESSION['usuario_nombre'] = $usuario['nombre'];
                    $_SESSION['usuario_tipo'] = $usuario['tipo'];
                    
                    enviarJSON([
                        'success' => true,
                        'message' => 'Login exitoso',
                        'usuario' => [
                            'id' => $usuario['id'],
                            'nombre' => $usuario['nombre'],
                            'tipo' => $usuario['tipo']
                        ]
                    ]);
                } else {
                    enviarJSON(['success' => false, 'message' => 'Email o contraseña incorrectos']);
                }
            } catch (Exception $e) {
                enviarJSON(['success' => false, 'message' => 'Error en el servidor: ' . $e->getMessage()]);
            }
        }
        break;
    
    // Logout: destruye la sesión del usuario
    case 'logout':
        session_destroy();
        enviarJSON(['success' => true, 'message' => 'Sesión cerrada']);
        break;
    
    // Verificar: comprueba si hay usuario logueado
    case 'verificar':
        if (verificarSesion()) {
            enviarJSON([
                'logueado' => true,
                'usuario' => [
                    'id' => $_SESSION['usuario_id'],
                    'nombre' => $_SESSION['usuario_nombre'],
                    'tipo' => $_SESSION['usuario_tipo']
                ]
            ]);
        } else {
            enviarJSON(['logueado' => false]);
        }
        break;
    
    // Listar todos los usuarios (solo administradores)
    case 'listar':
        if (!esAdmin()) {
            enviarJSON(['success' => false, 'message' => 'Acceso denegado']);
        }
        
        try {
            // Obtiene lista de todos los usuarios sin mostrar contraseñas
            $stmt = $pdo->query("SELECT id, nombre, email, tipo FROM usuarios ORDER BY id DESC");
            $usuarios = $stmt->fetchAll(PDO::FETCH_ASSOC);
            enviarJSON($usuarios);
        } catch (Exception $e) {
            enviarJSON(['success' => false, 'message' => 'Error al listar usuarios']);
        }
        break;
    
    // Obtener datos de un usuario específico (solo administradores)
    case 'obtener':
        if (!esAdmin()) {
            enviarJSON(['success' => false, 'message' => 'Acceso denegado']);
        }
        
        // Obtiene ID de parámetro y busca usuario en BD
        $id = $_GET['id'] ?? 0;
        try {
            // Usa prepared statement para evitar SQL injection
            $stmt = $pdo->prepare("SELECT id, nombre, email, tipo FROM usuarios WHERE id = ?");
            $stmt->execute([$id]);
            $usuario = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($usuario) {
                enviarJSON(['success' => true, 'usuario' => $usuario]);
            } else {
                enviarJSON(['success' => false, 'message' => 'Usuario no encontrado']);
            }
        } catch (Exception $e) {
            enviarJSON(['success' => false, 'message' => 'Error al obtener usuario']);
        }
        break;
    
    // Crear usuario (solo admin) 
    case 'crear':
        if (!esAdmin()) {
            enviarJSON(['success' => false, 'message' => 'Acceso denegado']);
        }
        
        if ($method === 'POST') {
            // Extrae datos del cuerpo JSON
            $nombre = $input['nombre'] ?? '';
            $email = $input['email'] ?? '';
            $password = $input['password'] ?? '';
            $tipo = $input['tipo'] ?? 'cliente';
            
            // Valida que todos los campos sean obligatorios
            if (empty($nombre) || empty($email) || empty($password)) {
                enviarJSON(['success' => false, 'message' => 'Todos los campos son obligatorios']);
            }
            
            try {
                // Verifica que el email sea único en la BD
                $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE email = ?");
                $stmt->execute([$email]);
                if ($stmt->fetch()) {
                    enviarJSON(['success' => false, 'message' => 'El email ya existe']);
                }
                
                // Hashea la contraseña antes de insertar
                $passwordHash = password_hash($password, PASSWORD_DEFAULT);
                $stmt = $pdo->prepare("INSERT INTO usuarios (nombre, email, password, tipo) VALUES (?, ?, ?, ?)");
                $stmt->execute([$nombre, $email, $passwordHash, $tipo]);
                
                enviarJSON(['success' => true, 'message' => 'Usuario creado']);
            } catch (Exception $e) {
                enviarJSON(['success' => false, 'message' => 'Error al crear usuario']);
            }
        }
        break;
    
    // Editar usuario (solo admin) 
    case 'editar':
        if (!esAdmin()) {
            enviarJSON(['success' => false, 'message' => 'Acceso denegado']);
        }
        
        if ($method === 'POST') {
            // Obtiene datos de actualización
            $id = $input['id'] ?? 0;
            $nombre = $input['nombre'] ?? '';
            $email = $input['email'] ?? '';
            $tipo = $input['tipo'] ?? 'cliente';
            
            // Campos obligatorios
            if (empty($nombre) || empty($email)) {
                enviarJSON(['success' => false, 'message' => 'Nombre y email son obligatorios']);
            }
            
            try {
                // Actualiza contraseña solo si se proporciona una nueva
                if (!empty($input['password'])) {
                    // Si hay nueva contraseña, la hashea y actualiza junto con datos
                    $passwordHash = password_hash($input['password'], PASSWORD_DEFAULT);
                    $stmt = $pdo->prepare("UPDATE usuarios SET nombre = ?, email = ?, password = ?, tipo = ? WHERE id = ?");
                    $stmt->execute([$nombre, $email, $passwordHash, $tipo, $id]);
                } else {
                    // Si no hay contraseña, actualiza solo datos básicos
                    $stmt = $pdo->prepare("UPDATE usuarios SET nombre = ?, email = ?, tipo = ? WHERE id = ?");
                    $stmt->execute([$nombre, $email, $tipo, $id]);
                }
                
                enviarJSON(['success' => true, 'message' => 'Usuario actualizado']);
            } catch (Exception $e) {
                enviarJSON(['success' => false, 'message' => 'Error al actualizar usuario']);
            }
        }
        break;
    
    // Eliminar usuario (solo admin) 
    case 'eliminar':
        if (!esAdmin()) {
            enviarJSON(['success' => false, 'message' => 'Acceso denegado']);
        }
        
        if ($method === 'POST') {
            // Obtiene ID del usuario a eliminar
            $id = $input['id'] ?? 0;
            
            // Validación de seguridad: impide que un admin se elimine a sí mismo
            if ($id == $_SESSION['usuario_id']) {
                enviarJSON(['success' => false, 'message' => 'No puedes eliminarte a ti mismo']);
            }
            
            try {
                // Elimina el usuario de la BD usando prepared statement
                $stmt = $pdo->prepare("DELETE FROM usuarios WHERE id = ?");
                $stmt->execute([$id]);
                
                enviarJSON(['success' => true, 'message' => 'Usuario eliminado']);
            } catch (Exception $e) {
                enviarJSON(['success' => false, 'message' => 'Error al eliminar usuario']);
            }
        }
        break;
    
    default:
        enviarJSON(['success' => false, 'message' => 'Acción no válida']);
}
?>