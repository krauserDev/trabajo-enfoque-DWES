<?php
// API para gestión de pedidos: crear, ver detalle, listar historial de pedidos

require_once 'config.php';

// Obtiene la acción y método HTTP de la petición
$action = $_GET['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];

// Verifica que el usuario esté logueado (requisito para usar pedidos)
if (!verificarSesion()) {
    enviarJSON(['success' => false, 'message' => 'Debes iniciar sesión']);
}

// Obtiene el ID del usuario actual
$usuarioId = obtenerUsuarioId();

// Lee datos JSON del cuerpo de la petición
$input = json_decode(file_get_contents('php://input'), true);

switch($action) {
    
    // Crear nuevo pedido desde el carrito del usuario
    case 'crear':
        if ($method === 'POST') {
            // Obtiene la dirección de envío
            $direccion = $input['direccion'] ?? '';
            
            // Valida que la dirección no esté vacía
            if (empty($direccion)) {
                enviarJSON(['success' => false, 'message' => 'La dirección es obligatoria']);
            }
            
            try {
                // Obtiene todos los items del carrito del usuario
                $stmt = $pdo->prepare("
                    SELECT c.producto_id, c.cantidad, p.precio
                    FROM carrito c
                    INNER JOIN productos p ON c.producto_id = p.id
                    WHERE c.usuario_id = ?
                ");
                $stmt->execute([$usuarioId]);
                $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                // Verifica que el carrito no esté vacío
                if (empty($items)) {
                    enviarJSON(['success' => false, 'message' => 'El carrito está vacío']);
                }
                
                // Calcula el total del pedido sumando todos los items
                $total = 0;
                foreach ($items as $item) {
                    $total += $item['precio'] * $item['cantidad'];
                }
                
                // Inicia transacción para garantizar consistencia de datos
                $pdo->beginTransaction();
                
                // Crea el registro del pedido
                $stmt = $pdo->prepare("INSERT INTO pedidos (usuario_id, total, direccion) VALUES (?, ?, ?)");
                $stmt->execute([$usuarioId, $total, $direccion]);
                $pedidoId = $pdo->lastInsertId();
                
                // Crea los items asociados al pedido
                $stmt = $pdo->prepare("INSERT INTO pedido_items (pedido_id, producto_id, cantidad, precio) VALUES (?, ?, ?, ?)");
                foreach ($items as $item) {
                    $stmt->execute([$pedidoId, $item['producto_id'], $item['cantidad'], $item['precio']]);
                }
                
                // Vacía el carrito después de crear el pedido
                $stmt = $pdo->prepare("DELETE FROM carrito WHERE usuario_id = ?");
                $stmt->execute([$usuarioId]);
                
                // Confirma la transacción (aplica todos los cambios)
                $pdo->commit();
                
                enviarJSON([
                    'success' => true,
                    'message' => 'Pedido realizado correctamente',
                    'pedido_id' => $pedidoId
                ]);
                
            } catch (Exception $e) {
                $pdo->rollBack();
                enviarJSON(['success' => false, 'message' => 'Error al crear el pedido: ' . $e->getMessage()]);
            }
        }
        break;
    
    // Detalle de un pedido específico
    case 'detalle':
        // Obtiene el ID del pedido desde la URL
        $pedidoId = $_GET['id'] ?? 0;
        
        try {
            // Busca el pedido verificando que pertenezca al usuario actual (seguridad)
            $stmt = $pdo->prepare("SELECT * FROM pedidos WHERE id = ? AND usuario_id = ?");
            $stmt->execute([$pedidoId, $usuarioId]);
            $pedido = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$pedido) {
                enviarJSON(['success' => false, 'message' => 'Pedido no encontrado']);
            }
            
            // Obtiene los productos incluidos en este pedido
            $stmt = $pdo->prepare("
                SELECT pi.cantidad, pi.precio, p.nombre, p.marca
                FROM pedido_items pi
                INNER JOIN productos p ON pi.producto_id = p.id
                WHERE pi.pedido_id = ?
            ");
            $stmt->execute([$pedidoId]);
            $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Responde con datos del pedido e items detallados
            enviarJSON([
                'success' => true,
                'pedido' => [
                    'id' => $pedido['id'],
                    'total' => $pedido['total'],
                    'direccion' => $pedido['direccion'],
                    'fecha' => $pedido['created_at'],
                    'items' => $items
                ]
            ]);
        } catch (Exception $e) {
            enviarJSON(['success' => false, 'message' => 'Error al obtener pedido']);
        }
        break;
    
    // Listar todos los pedidos del usuario autenticado
    case 'listar':
        try {
            // Obtiene pedidos del usuario ordenados por más reciente primero
            $stmt = $pdo->prepare("SELECT * FROM pedidos WHERE usuario_id = ? ORDER BY created_at DESC");
            $stmt->execute([$usuarioId]);
            $pedidos = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            enviarJSON($pedidos);
        } catch (Exception $e) {
            enviarJSON(['success' => false, 'message' => 'Error al listar pedidos']);
        }
        break;
    
    default:
        enviarJSON(['success' => false, 'message' => 'Acción no válida']);
}
?>