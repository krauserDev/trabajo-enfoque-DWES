# Trabajo de enfoque del módulo DWES del FP superior de DAW.
Este es mi trabajo de enfoque de módulo profesional Desarrollo web en entorno servidor. Trata de una tienda online de zapatillas de deporte.

# Como ejecutar la aplicación en tu máquina.
1. Debes tener instalado Xampp y activar Apache y MySQL.
2. Descarga el proyecto del repositorio de GitHub y mételo en la carpeta htdocs de tu máquina local.
3. Accede a phpMyAdmin en la siguiente URL: http://localhost/phpmyadmin
4. Crea una base de datos con el nombre "tienda_zapatillas". Después importa el archivo database.sql incluido en el repositorio.
5. La configuración de conexión a MySQL debería estar preparada por defecto. De no ser así, debes acceder al archivo api/config.php e introduce los siguientes datos de conexión:
$host = 'localhost';
$dbname = 'tienda_zapatillas';
$username = 'root';
$password = '';
6. Por último, abre el navegador e introduce la URL donde esté alojado el proyecto. Por ejemplo: http://localhost/trabajoDWES/index.html
