<?php
// http://localhost/prj/trabajoDWES/api/config.php - Configuración de conexión a la base de datos

// Configurar reporte de errores sin mostrarlos al usuario en pantalla por seguridad
error_reporting(E_ALL);
ini_set('display_errors', 0);

// Inicia sesión (si no está ya iniciada)
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Credenciales de conexión a MySQL
$host = 'localhost';
$dbname = 'tienda_zapatillas';
$username = 'root';  
$password = '';      

// Conexión PDO a la base de datos
$pdo = null;

// Crea la conexión con manejo de errores
try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password); 
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch(PDOException $e) {
    // Registra el error en el log del servidor
    error_log("Error de conexión a BD: " . $e->getMessage());
    
    // Envía respuesta JSON con código de error HTTP 500
    header('Content-Type: application/json');
    http_response_code(500);
    // Retorna el error en formato JSON
    echo json_encode([
        'success' => false, 
        'message' => 'Error de conexión a la base de datos',
        'error' => $e->getMessage(),
        'hint' => 'Verifica que MySQL esté corriendo en XAMPP y que la base de datos "tienda_zapatillas" exista'
    ]);
    exit;
}

// Envía datos en formato JSON al cliente
function enviarJSON($datos) {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($datos);
    exit;
}

// Verifica si existe una sesión de usuario activa
function verificarSesion() {
    return isset($_SESSION['usuario_id']) && !empty($_SESSION['usuario_id']);
}

// Verifica si el usuario actual es administrador
function esAdmin() {
    return isset($_SESSION['usuario_tipo']) && $_SESSION['usuario_tipo'] === 'admin';
}

// Obtiene el ID del usuario logueado
function obtenerUsuarioId() {
    return $_SESSION['usuario_id'] ?? null;
}
?>