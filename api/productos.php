<?php
// API para gestión de productos: listar, crear, editar, eliminar (CRUD)

require_once 'config.php';

// Obtiene la acción y método HTTP de la petición
$action = $_GET['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];

// Lee datos JSON enviados en la petición
$input = json_decode(file_get_contents('php://input'), true);

// Procesa la acción solicitada
switch($action) {
    
    // Listar todos los productos activos
    case 'listar':
        try {
            // Obtiene todos los productos ordenados por más recientes
            $stmt = $pdo->query("SELECT * FROM productos WHERE activo = 1 ORDER BY id DESC");
            $productos = $stmt->fetchAll(PDO::FETCH_ASSOC);
            enviarJSON($productos);
        } catch (Exception $e) {
            enviarJSON(['success' => false, 'message' => 'Error al listar productos']);
        }
        break;
    
    // Obtener un producto específico por su ID
    case 'obtener':
        $id = $_GET['id'] ?? 0;
        try {
            // Usa ? para evitar inyección SQL con prepared statement
            $stmt = $pdo->prepare("SELECT * FROM productos WHERE id = ?");
            $stmt->execute([$id]);
            $producto = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($producto) {
                enviarJSON(['success' => true, 'producto' => $producto]);
            } else {
                enviarJSON(['success' => false, 'message' => 'Producto no encontrado']);
            }
        } catch (Exception $e) {
            enviarJSON(['success' => false, 'message' => 'Error al obtener producto']);
        }
        break;
    
    // Crear nuevo producto (solo administradores)
    case 'crear':
        if (!esAdmin()) {
            enviarJSON(['success' => false, 'message' => 'Acceso denegado']);
        }
        
        if ($method === 'POST') {
            // Extrae datos del cuerpo de la petición
            $nombre = $input['nombre'] ?? '';
            $marca = $input['marca'] ?? '';
            $precio = $input['precio'] ?? 0;
            $imagen = $input['imagen'] ?? '';
            $descripcion = $input['descripcion'] ?? '';
            $stock = $input['stock'] ?? 0;
            
            // Valida que los datos requeridos no estén vacíos
            if (empty($nombre) || empty($marca) || $precio <= 0) {
                enviarJSON(['success' => false, 'message' => 'Datos incompletos']);
            }
            
            try {
                $stmt = $pdo->prepare("INSERT INTO productos (nombre, marca, precio, imagen, descripcion, stock) VALUES (?, ?, ?, ?, ?, ?)");
                $stmt->execute([$nombre, $marca, $precio, $imagen, $descripcion, $stock]);
                
                enviarJSON(['success' => true, 'message' => 'Producto creado', 'id' => $pdo->lastInsertId()]);
            } catch (Exception $e) {
                enviarJSON(['success' => false, 'message' => 'Error al crear producto']);
            }
        }
        break;
    
    // Editar producto (solo admin)
    case 'editar':
        if (!esAdmin()) {
            enviarJSON(['success' => false, 'message' => 'Acceso denegado']);
        }
        
        if ($method === 'POST') {
            // Extrae datos del producto a actualizar
            $id = $input['id'] ?? 0;
            $nombre = $input['nombre'] ?? '';
            $marca = $input['marca'] ?? '';
            $precio = $input['precio'] ?? 0;
            $imagen = $input['imagen'] ?? '';
            $descripcion = $input['descripcion'] ?? '';
            $stock = $input['stock'] ?? 0;
            
            // Valida que los campos obligatorios tengan contenido válido
            if (empty($nombre) || empty($marca) || $precio <= 0) {
                enviarJSON(['success' => false, 'message' => 'Datos incompletos']);
            }
            
            try {
                // Actualiza todos los campos del producto usando prepared statement
                $stmt = $pdo->prepare("UPDATE productos SET nombre = ?, marca = ?, precio = ?, imagen = ?, descripcion = ?, stock = ? WHERE id = ?");
                $stmt->execute([$nombre, $marca, $precio, $imagen, $descripcion, $stock, $id]);
                
                enviarJSON(['success' => true, 'message' => 'Producto actualizado']);
            } catch (Exception $e) {
                enviarJSON(['success' => false, 'message' => 'Error al actualizar producto']);
            }
        }
        break;
    
    // Eliminar producto (solo admin)
    case 'eliminar':
        if (!esAdmin()) {
            enviarJSON(['success' => false, 'message' => 'Acceso denegado']);
            exit;
        }
        
        if ($method === 'POST') {
            // Obtiene ID del producto a eliminar
            $id = $input['id'] ?? 0;
            
            try {
                // Elimina el producto de la BD usando prepared statement
                $stmt = $pdo->prepare("DELETE FROM productos WHERE id = ?");
                $stmt->execute([$id]);
                
                enviarJSON(['success' => true, 'message' => 'Producto eliminado']);
            } catch (Exception $e) {
                enviarJSON(['success' => false, 'message' => 'Error al eliminar producto: ' . $e->getMessage()]);
            }
        }
        break;
    
    default:
        enviarJSON(['success' => false, 'message' => 'Acción no válida']);
}
?>