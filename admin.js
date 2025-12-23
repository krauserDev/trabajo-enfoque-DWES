// Función para hacer peticiones al servidor
async function llamarAPI(url, metodo = 'GET', datos = null) {
    const opciones = {
        method: metodo,
        headers: {'Content-Type': 'application/json'}
    };
    
    if (datos) {
        opciones.body = JSON.stringify(datos);
    }
    
    const respuesta = await fetch(url, opciones);
    return await respuesta.json();
}

// Gestión de productos

// Cargar lista de productos de la base de datos y mostrarlos en la tabla
// Genera filas dinámicas con información de cada producto y botones de editar/eliminar
async function cargarProductos() {
    const productos = await llamarAPI('api/productos.php?action=listar');
    const tbody = document.querySelector('#tabla-productos tbody');
    
    tbody.innerHTML = '';
    
    if (productos && productos.length > 0) {
        // Iterar sobre cada producto y crear una fila en la tabla con sus datos
        productos.forEach(producto => {
            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td class="fw-bold">${producto.id}</td>
                <td>${producto.nombre}</td>
                <td><span class="badge bg-secondary">${producto.marca}</span></td>
                <td class="text-primary fw-bold">${producto.precio} €</td>
                <td>
                    <span class="badge ${producto.stock > 5 ? 'bg-success' : 'bg-warning'}">
                        ${producto.stock} uds
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-warning me-1" onclick="editarProducto(${producto.id})" title="Editar">
                        <i class="bi bi-pencil-fill"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="eliminarProducto(${producto.id})" title="Eliminar">
                        <i class="bi bi-trash-fill"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(fila);
        });
    } else {
        // Si no hay productos, mostrar mensaje informativo en la tabla
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-muted py-4">
                    <i class="bi bi-inbox fs-1"></i>
                    <p class="mt-2">No hay productos registrados</p>
                </td>
            </tr>
        `;
    }
}

// Mostrar formulario para crear un nuevo producto
// Limpia el formulario y muestra el contenedor, permitiendo crear un nuevo producto desde cero
function mostrarFormProducto() {
    const form = document.getElementById('form-producto');
    form.classList.remove('d-none');
    document.getElementById('form-titulo').innerHTML = '<i class="bi bi-plus-circle"></i> Nuevo Producto';
    document.getElementById('producto-form').reset();
    document.getElementById('producto-id').value = '';
    
    // Restaurar estado del botón a su estado inicial
    const boton = document.getElementById('btn-guardar-producto');
    boton.disabled = false;
    boton.innerHTML = '<i class="bi bi-check-circle"></i> Guardar';
    
    // Scroll automático hasta el formulario para mejor experiencia de usuario
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Ocultar formulario de producto y limpiar sus datos
// Esconde el formulario y reinicia los campos
function ocultarFormProducto() {
    document.getElementById('form-producto').classList.add('d-none');
    document.getElementById('producto-form').reset();
}

// Guardar producto (crear nuevo o editar existente)
// Valida si hay ID para determinar si es crear o editar, y envía los datos al servidor
async function guardarProducto(e) {
    e.preventDefault();
    
    const form = e.target;
    const boton = document.getElementById('btn-guardar-producto');
    const textoOriginal = boton.innerHTML;
    
    // Mostrar spinner en el botón mientras se procesa la solicitud
    boton.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Guardando...';
    boton.disabled = true;
    
    // Determinar si es crear o editar basándose en si existe ID
    const productoId = form.querySelector('input[name="id"]').value;
    const accion = productoId ? 'editar' : 'crear';
    
    const datos = {
        nombre: form.nombre.value,
        marca: form.marca.value,
        precio: form.precio.value,
        imagen: form.imagen.value,
        descripcion: form.descripcion.value,
        stock: form.stock.value
    };
    
    // Si es edición, agregar el ID a los datos
    if (productoId) {
        datos.id = productoId;
    }
    
    // Enviar datos al servidor según la acción (crear o editar)
    const resultado = await llamarAPI(`api/productos.php?action=${accion}`, 'POST', datos);
    
    if (resultado.success) {
        // Si se guardó correctamente, mostrar notificación de éxito y recargar tabla
        mostrarToast('Producto guardado correctamente', 'success');
        boton.innerHTML = textoOriginal;
        boton.disabled = false;
        ocultarFormProducto();
        cargarProductos();
    } else {
        // Si hay algún error, mostrar notificación de error y restaurar botón
        mostrarToast('Error al guardar el producto', 'danger');
        boton.innerHTML = textoOriginal;
        boton.disabled = false;
    }
}

// Editar producto: obtener datos del producto y cargarlos en el formulario
// Busca el producto en la base de datos y lo muestra en el formulario para editarlo
async function editarProducto(id) {
    const datos = await llamarAPI(`api/productos.php?action=obtener&id=${id}`);
    
    if (datos.success) {
        const producto = datos.producto;
        const form = document.getElementById('producto-form');
        
        // Mostrar formulario y cambiar título a "Editar Producto"
        document.getElementById('form-producto').classList.remove('d-none');
        document.getElementById('form-titulo').innerHTML = '<i class="bi bi-pencil-square"></i> Editar Producto';
        
        // Cargar datos del producto en los campos del formulario
        form.querySelector('input[name="id"]').value = producto.id;
        form.nombre.value = producto.nombre;
        form.marca.value = producto.marca;
        form.precio.value = producto.precio;
        form.imagen.value = producto.imagen;
        form.descripcion.value = producto.descripcion;
        form.stock.value = producto.stock;
        
        // Restaurar estado del botón
        const boton = document.getElementById('btn-guardar-producto');
        boton.disabled = false;
        boton.innerHTML = '<i class="bi bi-check-circle"></i> Guardar';
        
        // Scroll automático hasta el formulario
        document.getElementById('form-producto').scrollIntoView({ behavior: 'smooth' });
    }
}

// Eliminar producto con confirmación mediante modal Bootstrap
// Crea un modal dinámico para confirmar la eliminación del producto
async function eliminarProducto(id) {
    const modalHtml = `
        <div class="modal fade" id="confirmModal" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content bg-dark text-light">
                    <div class="modal-header border-secondary">
                        <h5 class="modal-title">
                            <i class="bi bi-exclamation-triangle text-warning"></i> Confirmar eliminación
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        ¿Estás seguro de eliminar este producto?
                    </div>
                    <div class="modal-footer border-secondary">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button type="button" class="btn btn-danger" id="confirmar-eliminar">
                            <i class="bi bi-trash-fill"></i> Eliminar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Insertar modal en el DOM dinámicamente
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modalElement = document.getElementById('confirmModal');
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
    
    // Asignar evento al botón de confirmar eliminación
    document.getElementById('confirmar-eliminar').onclick = async () => {
        console.log('Eliminando producto con ID:', id);
        const resultado = await llamarAPI('api/productos.php?action=eliminar', 'POST', {id: id});
        console.log('Resultado de eliminación:', resultado);
        
        if (resultado.success) {
            // Si la eliminación fue exitosa, mostrar notificación y recargar tabla
            mostrarToast('Producto eliminado', 'success');
            await cargarProductos();
        } else {
            // Si hubo error, mostrar notificación de error
            mostrarToast('Error al eliminar el producto', 'danger');
        }
        
        modal.hide();
        modalElement.remove();
    };
    
    // Remover modal del DOM cuando se cierre el evento hidden de Bootstrap
    modalElement.addEventListener('hidden.bs.modal', () => {
        modalElement.remove();
    });
}

// Gestión de usuarios

// Cargar lista de usuarios de la base de datos y mostrarlos en la tabla
// Genera filas dinámicas con información de cada usuario y botones de editar/eliminar
async function cargarUsuarios() {
    const usuarios = await llamarAPI('api/usuarios.php?action=listar');
    const tbody = document.querySelector('#tabla-usuarios tbody');
    
    tbody.innerHTML = '';
    
    if (usuarios && usuarios.length > 0) {
        // Iterar sobre cada usuario y crear una fila en la tabla con sus datos
        usuarios.forEach(usuario => {
            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td class="fw-bold">${usuario.id}</td>
                <td>${usuario.nombre}</td>
                <td><i class="bi bi-envelope"></i> ${usuario.email}</td>
                <td>
                    <span class="badge ${usuario.tipo === 'admin' ? 'bg-danger' : 'bg-info'}">
                        ${usuario.tipo === 'admin' ? '<i class="bi bi-shield-fill"></i> Admin' : '<i class="bi bi-person"></i> Cliente'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-warning me-1" onclick="editarUsuario(${usuario.id})" title="Editar">
                        <i class="bi bi-pencil-fill"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="eliminarUsuario(${usuario.id})" title="Eliminar">
                        <i class="bi bi-trash-fill"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(fila);
        });
    } else {
        // Si no hay usuarios, mostrar mensaje informativo en la tabla
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-muted py-4">
                    <i class="bi bi-inbox fs-1"></i>
                    <p class="mt-2">No hay usuarios registrados</p>
                </td>
            </tr>
        `;
    }
}

// Mostrar formulario para crear un nuevo usuario
// Limpia el formulario y muestra el contenedor, permitiendo crear un nuevo usuario desde cero
function mostrarFormUsuario() {
    const form = document.getElementById('form-usuario');
    form.classList.remove('d-none');
    document.getElementById('form-usuario-titulo').innerHTML = '<i class="bi bi-person-plus"></i> Nuevo Usuario';
    document.getElementById('usuario-form').reset();
    document.getElementById('usuario-id').value = '';
    
    // Restaurar estado del botón a su estado inicial
    const boton = document.getElementById('btn-guardar-usuario');
    boton.disabled = false;
    boton.innerHTML = '<i class="bi bi-check-circle"></i> Guardar';
    
    // Scroll automático hasta el formulario
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Ocultar formulario de usuario y limpiar sus datos
// Esconde el formulario y reinicia los campos
function ocultarFormUsuario() {
    document.getElementById('form-usuario').classList.add('d-none');
    document.getElementById('usuario-form').reset();
}

// Guardar usuario (crear nuevo o editar existente)
// Valida si hay ID para determinar si es crear o editar, y envía los datos al servidor
async function guardarUsuario(e) {
    e.preventDefault();
    
    const form = e.target;
    const boton = document.getElementById('btn-guardar-usuario');
    const textoOriginal = boton.innerHTML;
    
    // Mostrar spinner en el botón mientras se procesa la solicitud
    boton.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Guardando...';
    boton.disabled = true;
    
    // Determinar si es crear o editar basándose en si existe ID
    const usuarioId = form.querySelector('input[name="id"]').value;
    const accion = usuarioId ? 'editar' : 'crear';
    
    const datos = {
        nombre: form.nombre.value,
        email: form.email.value,
        tipo: form.tipo.value
    };
    
    // Incluir contraseña solo si se proporcionó (permite editar sin cambiar contraseña)
    const password = form.password.value;
    if (password) {
        datos.password = password;
    }
    
    // Si es edición, agregar el ID a los datos
    if (usuarioId) {
        datos.id = usuarioId;
    }
    
    // Enviar datos al servidor según la acción (crear o editar)
    const resultado = await llamarAPI(`api/usuarios.php?action=${accion}`, 'POST', datos);
    
    if (resultado.success) {
        // Si se guardó correctamente, mostrar notificación de éxito y recargar tabla
        mostrarToast('Usuario guardado correctamente', 'success');
        boton.innerHTML = textoOriginal;
        boton.disabled = false;
        ocultarFormUsuario();
        cargarUsuarios();
    } else {
        // Si hubo error, mostrar notificación con el mensaje del servidor
        mostrarToast('Error: ' + (resultado.message || 'Error desconocido'), 'danger');
        boton.innerHTML = textoOriginal;
        boton.disabled = false;
    }
}

// Editar usuario: obtener datos del usuario y cargarlos en el formulario
// Busca el usuario en la base de datos y lo muestra en el formulario para editarlo
async function editarUsuario(id) {
    const datos = await llamarAPI(`api/usuarios.php?action=obtener&id=${id}`);
    
    if (datos.success) {
        const usuario = datos.usuario;
        const form = document.getElementById('usuario-form');
        
        // Mostrar formulario y cambiar título a "Editar Usuario"
        document.getElementById('form-usuario').classList.remove('d-none');
        document.getElementById('form-usuario-titulo').innerHTML = '<i class="bi bi-pencil-square"></i> Editar Usuario';
        
        // Cargar datos del usuario en los campos del formulario
        form.querySelector('input[name="id"]').value = usuario.id;
        form.nombre.value = usuario.nombre;
        form.email.value = usuario.email;
        form.tipo.value = usuario.tipo;
        form.password.value = '';
        
        // Restaurar estado del botón
        const boton = document.getElementById('btn-guardar-usuario');
        boton.disabled = false;
        boton.innerHTML = '<i class="bi bi-check-circle"></i> Guardar';
        
        // Scroll automático hasta el formulario
        document.getElementById('form-usuario').scrollIntoView({ behavior: 'smooth' });
    }
}

// Eliminar usuario con confirmación mediante modal Bootstrap
// Crea un modal dinámico para confirmar la eliminación del usuario
async function eliminarUsuario(id) {
    const modalHtml = `
        <div class="modal fade" id="confirmModal" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content bg-dark text-light">
                    <div class="modal-header border-secondary">
                        <h5 class="modal-title">
                            <i class="bi bi-exclamation-triangle text-warning"></i> Confirmar eliminación
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        ¿Estás seguro de eliminar este usuario?
                    </div>
                    <div class="modal-footer border-secondary">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button type="button" class="btn btn-danger" id="confirmar-eliminar">
                            <i class="bi bi-trash-fill"></i> Eliminar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Insertar modal en el DOM dinámicamente
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modalElement = document.getElementById('confirmModal');
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
    
    // Asignar evento al botón de confirmar eliminación
    document.getElementById('confirmar-eliminar').onclick = async () => {
        console.log('Eliminando usuario con ID:', id);
        const resultado = await llamarAPI('api/usuarios.php?action=eliminar', 'POST', {id: id});
        console.log('Resultado de eliminación:', resultado);
        
        if (resultado.success) {
            // Si la eliminación fue exitosa, mostrar notificación y recargar tabla
            mostrarToast('Usuario eliminado', 'success');
            await cargarUsuarios();
        } else {
            // Si hay error, mostrar notificación de error
            mostrarToast('Error al eliminar el usuario', 'danger');
        }
        
        modal.hide();
        modalElement.remove();
    };
    
    // Remover modal del DOM cuando se cierre el evento hidden de Bootstrap
    modalElement.addEventListener('hidden.bs.modal', () => {
        modalElement.remove();
    });
}

// Utilidades

// Mostrar notificación Toast (Bootstrap) en la esquina inferior derecha
// Parámetro tipo define el color: 'success' (verde) o 'danger' (rojo)
// El toast se muestra automáticamente y desaparece después de 3 segundos
function mostrarToast(mensaje, tipo = 'success') {
    // Crear contenedor de toasts si no existe (evita tener múltiples contenedores)
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        document.body.appendChild(toastContainer);
    }
    
    const toastId = 'toast-' + Date.now();
    const bgClass = tipo === 'success' ? 'bg-success' : 'bg-danger';
    const icon = tipo === 'success' ? 'check-circle' : 'exclamation-triangle';
    
    toastContainer.innerHTML = `
        <div id="${toastId}" class="toast ${bgClass} text-white" role="alert">
            <div class="toast-body">
                <i class="bi bi-${icon}"></i> ${mensaje}
            </div>
        </div>
    `;
    
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement, { delay: 3000 });
    toast.show();
}

// Verificar que el usuario autenticado es administrador
// Si no es admin, muestra alerta y redirige al inicio
async function verificarAdmin() {
    const datos = await llamarAPI('api/usuarios.php?action=verificar');
    
    // Si el usuario no está autenticado o no es admin, denegar acceso
    if (!datos || !datos.logueado || datos.usuario.tipo !== 'admin') {
        alert('Acceso denegado. Solo administradores.');
        window.location.href = 'index.html';
    }
}

// Cerrar sesión del administrador en el servidor y redirigir al inicio
async function cerrarSesion() {
    await llamarAPI('api/usuarios.php?action=logout');
    window.location.href = 'index.html';
}

// Eventos al cargar la página - Esperar a que el DOM esté completamente cargado
// Verificar permisos de admin, cargar datos iniciales y asignar eventos a botones
document.addEventListener('DOMContentLoaded', () => {
    // Verificar que el usuario sea administrador antes de cargar la página
    verificarAdmin();
    
    // Cargar datos iniciales de productos y usuarios en las tablas
    cargarProductos();
    cargarUsuarios();
    
    // Asignar manejadores de eventos para formulario y botones de productos
    document.getElementById('btn-nuevo-producto').onclick = mostrarFormProducto;
    document.getElementById('btn-cancelar-producto').onclick = ocultarFormProducto;
    document.getElementById('producto-form').onsubmit = guardarProducto;
    
    // Asignar manejadores de eventos para formulario y botones de usuarios
    document.getElementById('btn-nuevo-usuario').onclick = mostrarFormUsuario;
    document.getElementById('btn-cancelar-usuario').onclick = ocultarFormUsuario;
    document.getElementById('usuario-form').onsubmit = guardarUsuario;
    
    // Asignar manejadores de eventos para botones de navegación
    document.getElementById('btn-logout').onclick = cerrarSesion;
    document.getElementById('btn-volver-tienda').onclick = () => window.location.href = 'index.html';
});