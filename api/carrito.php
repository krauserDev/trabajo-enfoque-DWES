<?php
// API para gestión del carrito de compras
// Operaciones: agregar, obtener, eliminar, vaciar carrito

require_once 'config.php';

// Obtiene la acción y método HTTP de la petición
$action = $_GET['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];

// Verifica que el usuario esté logueado (requisito para usar el carrito)
if (!verificarSesion()) {
    enviarJSON(['success' => false, 'message' => 'Debes iniciar sesión']);
}

// Obtiene el ID del usuario actual
$usuarioId = obtenerUsuarioId();

// Lee datos JSON del cuerpo de la petición
$input = json_decode(file_get_contents('php://input'), true);

// Procesa la acción solicitada
switch($action) {
    
    // Agregar producto al carrito del usuario
    case 'agregar':
        if ($method === 'POST') {
            // Extrae datos de la petición
            $productoId = $input['producto_id'] ?? 0;
            $cantidad = $input['cantidad'] ?? 1;
            
            try {
                // Verifica si el producto ya está en el carrito del usuario
                $stmt = $pdo->prepare("SELECT id, cantidad FROM carrito WHERE usuario_id = ? AND producto_id = ?");
                $stmt->execute([$usuarioId, $productoId]);
                $item = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($item) {
                    // Si ya existe: suma la cantidad al existente
                    $nuevaCantidad = $item['cantidad'] + $cantidad;
                    $stmt = $pdo->prepare("UPDATE carrito SET cantidad = ? WHERE id = ?");
                    $stmt->execute([$nuevaCantidad, $item['id']]);
                } else {
                    // Si no existe: lo añade como nuevo item
                    $stmt = $pdo->prepare("INSERT INTO carrito (usuario_id, producto_id, cantidad) VALUES (?, ?, ?)");
                    $stmt->execute([$usuarioId, $productoId, $cantidad]);
                }
                
                enviarJSON(['success' => true, 'message' => 'Producto agregado al carrito']);
            } catch (Exception $e) {
                enviarJSON(['success' => false, 'message' => 'Error al agregar al carrito']);
            }
        }
        break;
    
    // Obtener todos los items del carrito del usuario
    case 'obtener':
        try {
            // Une carrito con productos para obtener toda la información
            $stmt = $pdo->prepare("
                SELECT c.id as carrito_id, c.cantidad, p.id, p.nombre, p.marca, p.precio, p.imagen
                FROM carrito c
                INNER JOIN productos p ON c.producto_id = p.id
                WHERE c.usuario_id = ?
            ");
            $stmt->execute([$usuarioId]);
            $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            $total = 0;
            foreach ($items as $item) {
                $total += $item['precio'] * $item['cantidad'];
            }
            
            enviarJSON([
                'items' => $items,
                'total' => $total
            ]);
        } catch (Exception $e) {
            enviarJSON(['success' => false, 'message' => 'Error al obtener carrito']);
        }
        break;
    
    // Eliminar un producto del carrito
    case 'eliminar':
        if ($method === 'POST') {
            // Obtiene ID del artículo en el carrito a eliminar
            $carritoId = $input['carrito_id'] ?? 0;
            
            try {
                // Elimina el item solo si pertenece al usuario logueado (seguridad)
                $stmt = $pdo->prepare("DELETE FROM carrito WHERE id = ? AND usuario_id = ?");
                $stmt->execute([$carritoId, $usuarioId]);
                
                enviarJSON(['success' => true, 'message' => 'Item eliminado']);
            } catch (Exception $e) {
                enviarJSON(['success' => false, 'message' => 'Error al eliminar item']);
            }
        }
        break;
    
    // Vaciar todo el carrito del usuario
    case 'vaciar':
        try {
            // Elimina todos los items del carrito del usuario actual
            $stmt = $pdo->prepare("DELETE FROM carrito WHERE usuario_id = ?");
            $stmt->execute([$usuarioId]);
            
            enviarJSON(['success' => true, 'message' => 'Carrito vaciado']);
        } catch (Exception $e) {
            enviarJSON(['success' => false, 'message' => 'Error al vaciar carrito']);
        }
        break;
    
    default:
        enviarJSON(['success' => false, 'message' => 'Acción no válida']);
}
?>