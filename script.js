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

// Mostrar mensaje de error en el contenedor de errores del DOM
// Busca elementos de error y actualiza el texto, removiendo la clase d-none para hacerlo visible
function mostrarError(mensaje) {
    const errorDiv = document.getElementById('mensaje-error');
    const errorTexto = document.getElementById('mensaje-error-texto');
    
    if (errorDiv && errorTexto) {
        errorTexto.textContent = mensaje;
        errorDiv.classList.remove('d-none');
    }
}

// index.html (Catálogo con Bootstrap)

// Cargar productos usando Bootstrap Cards
// Obtiene lista de productos del API y genera tarjetas HTML con imagen, nombre, precio y botón
// Si no hay productos, muestra mensaje informativo
async function cargarProductos() {
    const productos = await llamarAPI('api/productos.php?action=listar');
    const contenedor = document.getElementById('productos');
    
    if (!contenedor) return;
    
    if (!productos || productos.length === 0) {
        contenedor.innerHTML = `
            <div class="col-12 text-center">
                <div class="alert alert-info">
                    <i class="bi bi-info-circle"></i> No hay productos disponibles
                </div>
            </div>
        `;
        return;
    }
    
    contenedor.innerHTML = '';
    
    // Iterar sobre cada producto del array y crear su tarjeta HTML con imagen, marca y precio
    productos.forEach(producto => {
        const col = document.createElement('div');
        col.className = 'col'; // Bootstrap maneja el responsive automáticamente para ajustar columnas
        
        // Crear estructura HTML de la tarjeta con imagen, marca, nombre, precio y botón de carrito
        col.innerHTML = `
            <div class="card h-100 shadow-sm producto-card" style="cursor: pointer;">
                <img src="${producto.imagen}" class="card-img-top" alt="${producto.nombre}" style="height: 250px; object-fit: cover;">
                <div class="card-body d-flex flex-column">
                    <span class="badge bg-secondary fs-6 mb-2 align-self-start">${producto.marca}</span>
                    <h5 class="card-title">${producto.nombre}</h5>
                    <p class="card-text text-primary fs-4 fw-bold mt-auto">${producto.precio} €</p>
                    <button class="btn btn-primary w-100" onclick="event.stopPropagation(); agregarAlCarrito(${producto.id})">
                        <i class="bi bi-cart-plus"></i> Añadir al carrito
                    </button>
                </div>
            </div>
        `;
        
        // Asignar evento de clic a la tarjeta para mostrar el modal con detalles del producto
        col.querySelector('.producto-card').onclick = () => mostrarDetalleProducto(producto.id);
        
        contenedor.appendChild(col);
    });
}

// Mostrar detalle del producto en modal Bootstrap
// Obtiene información completa del producto y la muestra en un modal con imagen, descripción y stock
async function mostrarDetalleProducto(productoId) {
    const resultado = await llamarAPI(`api/productos.php?action=obtener&id=${productoId}`);
    
    if (!resultado.success) {
        alert('Error al cargar el producto');
        return;
    }
    
    const producto = resultado.producto;
    const contenido = document.getElementById('detalle-contenido');
    
    // Generar contenido del modal con layout de dos columnas: imagen izquierda, datos derecha
    contenido.innerHTML = ` 
        <div class="row">
            <div class="col-md-6">
                <img src="${producto.imagen}" class="img-fluid rounded" alt="${producto.nombre}">
            </div>
            <div class="col-md-6">
                <span class="badge bg-secondary fs-6 mb-2">${producto.marca}</span>
                <h2 class="text-primary">${producto.nombre}</h2>
                <p class="lead">${producto.descripcion || 'Sin descripción disponible'}</p>
                <hr>
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <span class="fs-3 text-primary fw-bold">${producto.precio} €</span>
                    <span class="badge bg-info">Stock: ${producto.stock} unidades</span>
                </div>
                <button class="btn btn-primary btn-lg w-100" onclick="agregarAlCarrito(${producto.id}); bootstrap.Modal.getInstance(document.getElementById('modal-detalle')).hide();">
                    <i class="bi bi-cart-plus"></i> Añadir al carrito
                </button>
            </div>
        </div>
    `;
    
    // Instanciar y mostrar el modal de Bootstrap con los detalles del producto
    const modal = new bootstrap.Modal(document.getElementById('modal-detalle'));
    modal.show();
}

// Agregar producto al carrito (realiza POST al servidor)
// Si es exitoso, muestra notificación verde y actualiza contador del badge
// Si falla, muestra notificación roja y redirige a login después de 2 segundos
async function agregarAlCarrito(productoId) {
    const resultado = await llamarAPI('api/carrito.php?action=agregar', 'POST', {
        producto_id: productoId,
        cantidad: 1
    });
    
    if (resultado.success) {
        // Si se añadió correctamente, mostrar notificación verde y actualizar cantidad en el badge
        mostrarToast('Producto añadido al carrito', 'success');
        actualizarContadorCarrito();
    } else {
        mostrarToast('Debes iniciar sesión para agregar productos', 'danger');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
    }
}

// Mostrar notificación Toast (Bootstrap) en la esquina inferior derecha
// Parámetro tipo define el color: 'success' (verde) o 'danger' (rojo)
// El toast se muestra automáticamente y desaparece después de unos segundos
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
    
    toastContainer.innerHTML = `
        <div id="${toastId}" class="toast ${bgClass} text-white" role="alert">
            <div class="toast-body">
                <i class="bi bi-check-circle"></i> ${mensaje}
            </div>
        </div>
    `;
    
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement);
    toast.show();
}

// Actualizar contador del carrito en el header
// Suma la cantidad total de artículos del carrito y lo muestra en el badge
// Se llama cada vez que se añade o elimina un producto
async function actualizarContadorCarrito() {
    const datos = await llamarAPI('api/carrito.php?action=obtener');
    const contador = document.getElementById('cart-count');
    
    if (!contador) return;
    
    if (datos && datos.items) {
        // Usar reduce para sumar todas las cantidades de cada item en el carrito
        const total = datos.items.reduce((suma, item) => suma + parseInt(item.cantidad), 0);
        contador.textContent = total;
    } else {
        contador.textContent = '0';
    }
}

// Verificar sesión del usuario y actualizar visibilidad de botones del header
// Muestra login si no está autenticado, muestra logout y nombre si lo está
// Muestra botón admin solo si el usuario tiene tipo 'admin'
async function verificarSesion() {
    const datos = await llamarAPI('api/usuarios.php?action=verificar');
    
    const btnLogin = document.getElementById('btn-login');
    const btnLogout = document.getElementById('btn-logout');
    const btnAdmin = document.getElementById('btn-admin');
    const nombreUsuario = document.getElementById('usuario-nombre');
    
    if (!btnLogin) return;
    
    if (datos && datos.logueado) {
        // Usuario autenticado: ocultar botón login y mostrar logout, nombre y panel admin
        btnLogin.style.display = 'none';
        btnLogout.style.display = 'block';
        nombreUsuario.textContent = `👋 Hola, ${datos.usuario.nombre}`;
        
        // Si es administrador, mostrar botón de acceso al panel admin
        if (datos.usuario.tipo === 'admin') {
            btnAdmin.style.display = 'block';
        }
    } else {
        // Usuario no autenticado: mostrar login, ocultar logout y panel admin
        btnLogin.style.display = 'block';
        btnLogout.style.display = 'none';
        if (btnAdmin) btnAdmin.style.display = 'none';
        nombreUsuario.textContent = '';
    }
}

// Cerrar sesión del usuario en el servidor y redirigir al inicio
// Limpia la sesión del lado del servidor
async function cerrarSesion() {
    await llamarAPI('api/usuarios.php?action=logout');
    window.location.href = 'index.html';
}

// login.html
// Inicializar formulario de login con validación de credenciales
// Muestra spinner mientras se procesa y maneja respuesta del servidor
function inicializarLogin() {
    const formulario = document.getElementById('form-login');
    if (!formulario) return;
    
    formulario.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Extraer valores del formulario de login
        const email = formulario.email.value;
        const password = formulario.password.value;
        
        // Cambiar botón a estado deshabilitado mostrando spinner mientras se procesa
        const boton = formulario.querySelector('button[type="submit"]');
        const textoOriginal = boton.innerHTML;
        boton.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Iniciando...';
        boton.disabled = true;
        
        const resultado = await llamarAPI('api/usuarios.php?action=login', 'POST', {
            email: email,
            password: password
        });
        
        // Si credenciales son válidas, redirigir a inicio; si no, mostrar error y restaurar botón
        if (resultado.success) {
            window.location.href = 'index.html';
        } else {
            mostrarError(resultado.message || 'Error al iniciar sesión');
            boton.innerHTML = textoOriginal;
            boton.disabled = false;
        }
    });
}

// register.html
// Inicializar formulario de registro con validación de datos nuevos
// Crea nuevo usuario en el servidor y redirige a login si es exitoso
function inicializarRegistro() {
    const formulario = document.getElementById('form-register');
    if (!formulario) return;
    
    formulario.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Obtener valores del formulario de registro (nombre, email, contraseña)
        const nombre = formulario.nombre.value;
        const email = formulario.email.value;
        const password = formulario.password.value;
        
        // Deshabilitar botón y mostrar spinner mientras se registra el usuario
        const boton = formulario.querySelector('button[type="submit"]');
        const textoOriginal = boton.innerHTML;
        boton.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Registrando...';
        boton.disabled = true;
        
        const resultado = await llamarAPI('api/usuarios.php?action=register', 'POST', {
            nombre: nombre,
            email: email,
            password: password
        });
        
        // Si registro es exitoso, mostrar mensaje de éxito y redirigir a login tras 3 segundos; si no, mostrar error
        if (resultado.success) {
            // Crear y mostrar modal elegante de éxito
            const modalExito = document.createElement('div');
            modalExito.className = 'modal fade';
            modalExito.setAttribute('tabindex', '-1');
            modalExito.innerHTML = `
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content border-0 shadow-lg">
                        <div class="modal-body text-center py-5">
                            <div class="mb-4">
                                <i class="bi bi-check-circle text-success" style="font-size: 4rem;"></i>
                            </div>
                            <h4 class="modal-title mb-3">¡Registro Exitoso!</h4>
                            <p class="mb-4">Tu cuenta ha sido creada correctamente. Serás redirigido a la página de inicio de sesión.</p>
                            <div class="d-flex gap-2 justify-content-center">
                                <button type="button" class="btn btn-primary px-4" onclick="window.location.href='login.html'">
                                    <i class="bi bi-box-arrow-in-right"></i> Ir a Login
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modalExito);
            const modal = new bootstrap.Modal(modalExito);
            modal.show();
            
            // Redirigir automáticamente después de 3 segundos
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 3000);
        } else {
            mostrarError(resultado.message || 'Error en el registro');
            boton.innerHTML = textoOriginal;
            boton.disabled = false;
        }
    });
}

// carrito.html
// Cargar items del carrito y mostrar resumen con total y formulario de envío
// Si carrito está vacío, muestra mensaje informativo con enlace a tienda
async function cargarCarrito() {
    const itemsDiv = document.getElementById('carrito-items');
    if (!itemsDiv) return;
    
    const datos = await llamarAPI('api/carrito.php?action=obtener');
    const totalDiv = document.getElementById('carrito-total');
    const formDiv = document.getElementById('form-checkout');
    
    // Si no hay items o carrito está vacío, mostrar mensaje informativo
    if (!datos || !datos.items || datos.items.length === 0) {
        itemsDiv.innerHTML = `
            <div class="alert alert-info text-center">
                <i class="bi bi-cart-x fs-1"></i>
                <h4 class="mt-3">Tu carrito está vacío</h4>
                <p>¡Ve a la tienda para añadir más productos!</p>
                <a href="index.html" class="btn btn-primary">
                    <i class="bi bi-shop"></i> Ir a la tienda
                </a>
            </div>
        `;
        totalDiv.innerHTML = '';
        formDiv.innerHTML = '';
        return;
    }
    
    // Generar HTML de tarjetas Bootstrap para cada item del carrito con imagen, nombre y botón eliminar
    let html = '<div class="row g-3">';
    datos.items.forEach(item => {
        html += `
            <div class="col-12">
                <div class="card">
                    <div class="row g-0">
                        <div class="col-md-3">
                            <img src="${item.imagen}" class="img-fluid rounded-start" style="height: 150px; object-fit: cover; width: 100%;">
                        </div>
                        <div class="col-md-9">
                            <div class="card-body">
                                <div class="d-flex justify-content-between">
                                    <div>
                                        <h5 class="card-title">${item.nombre}</h5>
                                        <p class="card-text text-muted">${item.marca}</p>
                                        <p class="card-text">
                                            <span class="text-primary fs-5 fw-bold">${item.precio} €</span>
                                            <span class="ms-3">Cantidad: <strong>${item.cantidad}</strong></span>
                                        </p>
                                    </div>
                                    <button class="btn btn-outline-danger" onclick="eliminarDelCarrito(${item.carrito_id})">
                                        <i class="bi bi-trash"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    html += '</div>';
    itemsDiv.innerHTML = html;
    
    // Mostrar tarjeta con total a pagar en color primario destacado
    totalDiv.innerHTML = `
        <div class="card bg-primary text-white mt-4">
            <div class="card-body">
                <h3 class="card-title">Total: ${datos.total.toFixed(2)} €</h3>
            </div>
        </div>
    `;
    
    // Mostrar formulario con campo de dirección para completar la compra
    formDiv.innerHTML = `
        <div class="card mt-4">
            <div class="card-body">
                <h5 class="card-title"><i class="bi bi-truck"></i> Datos de envío</h5>
                <form id="form-compra">
                    <div class="mb-3">
                        <label for="direccion" class="form-label">Dirección completa</label>
                        <textarea 
                            class="form-control" 
                            id="direccion" 
                            name="direccion" 
                            rows="3" 
                            placeholder="Calle, número, piso, código postal, ciudad..." 
                            required
                        ></textarea>
                    </div>
                    <button type="submit" class="btn btn-success btn-lg w-100">
                        <i class="bi bi-check-circle"></i> CONFIRMAR COMPRA
                    </button>
                </form>
            </div>
        </div>
    `;
    
    document.getElementById('form-compra').addEventListener('submit', confirmarCompra);
}

// Eliminar item del carrito con confirmación mediante modal Bootstrap
// Crea dinámicamente un modal, lo muestra y lo elimina después de cerrar
async function eliminarDelCarrito(carritoId) {
    const modalHtml = `
        <div class="modal fade" id="confirmModal" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header border-bottom">
                        <h5 class="modal-title">
                            <i class="bi bi-exclamation-circle text-warning"></i> Confirmar eliminación
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        ¿Deseas eliminar este artículo del carrito?
                    </div>
                    <div class="modal-footer border-top">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button type="button" class="btn btn-danger" id="confirmar-eliminar-carrito">
                            <i class="bi bi-trash"></i> Eliminar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Insertar modal en el DOM dinámicamente y crear instancia de Bootstrap
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modalElement = document.getElementById('confirmModal');
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
    
    // Asignar manejador de evento del botón confirmar eliminación del item
    document.getElementById('confirmar-eliminar-carrito').onclick = async () => {
        await llamarAPI('api/carrito.php?action=eliminar', 'POST', {
            carrito_id: carritoId
        });
        
        cargarCarrito();
        modal.hide();
        modalElement.remove();
    };
    
    // Remover modal del DOM cuando se cierre el evento hidden de Bootstrap
    modalElement.addEventListener('hidden.bs.modal', () => {
        modalElement.remove();
    });
}

// Procesar confirmación de compra y crear pedido en el servidor
// Extrae dirección de envío y la envía para generar el pedido con su ID
async function confirmarCompra(e) {
    e.preventDefault();
    
    // Obtener dirección de envío del campo textarea del formulario
    const direccion = e.target.direccion.value;
    
    const resultado = await llamarAPI('api/pedidos.php?action=crear', 'POST', {
        direccion: direccion
    });
    
    // Si la compra es exitosa, redirigir a página de confirmación con ID del pedido en URL
    if (resultado.success) {
        window.location.href = `confirmacion.html?pedido=${resultado.pedido_id}`;
    } else {
        alert('Error: ' + resultado.message);
    }
}

// confirmacion.html
// Cargar y mostrar detalles del pedido confirmado incluyendo artículos y total
// Obtiene el ID del pedido desde URL y lo consulta al servidor
async function cargarConfirmacion() {
    const infoDiv = document.getElementById('pedido-info');
    if (!infoDiv) return;
    
    // Extraer ID del pedido desde parámetro URL (?pedido=XXX)
    const params = new URLSearchParams(window.location.search);
    const pedidoId = params.get('pedido');
    
    const datos = await llamarAPI(`api/pedidos.php?action=detalle&id=${pedidoId}`);
    
    if (!datos.success) {
        infoDiv.innerHTML = '<div class="alert alert-danger">Error al cargar el pedido</div>';
        return;
    }
    
    const pedido = datos.pedido;
    // Generar HTML con detalles del pedido: número, total, fecha, dirección e items
    let html = `
        <div class="card">
            <div class="card-body">
                <p class="mb-2"><strong>Número de pedido:</strong> <span class="badge bg-primary">#${pedido.id}</span></p>
                <p class="mb-2"><strong>Total pagado:</strong> <span class="text-success fs-4">${pedido.total} €</span></p>
                <p class="mb-2"><strong>Fecha:</strong> ${pedido.fecha}</p>
                <hr>
                <p class="mb-2"><strong>Dirección de envío:</strong></p>
                <div class="alert alert-secondary">${pedido.direccion}</div>
                <hr>
                <h5><i class="bi bi-bag-check"></i> Artículos del pedido:</h5>
                <ul class="list-group list-group-flush">
    `;
    
    // Iterar sobre cada item del pedido y añadirlo a la lista con nombre, cantidad y precio
    pedido.items.forEach(item => {
        html += `
            <li class="list-group-item d-flex justify-content-between">
                <span>${item.nombre} x ${item.cantidad}</span>
                <strong>${item.precio} €</strong>
            </li>
        `;
    });
    
    html += '</ul></div></div>';
    infoDiv.innerHTML = html;
}

// Eventos al cargar la página - Esperar a que el DOM esté completamente cargado
// Asignar eventos a botones de navegación e inicializar funciones según la página actual
document.addEventListener('DOMContentLoaded', () => {
    // Obtener referencias a todos los botones de navegación del header
    const btnLogin = document.getElementById('btn-login');
    const btnLogout = document.getElementById('btn-logout');
    const btnCarrito = document.getElementById('btn-carrito');
    const btnAdmin = document.getElementById('btn-admin');
    const btnVolver = document.getElementById('btn-volver');
    const btnVolverTienda = document.getElementById('btn-volver-tienda');
    
    // Asignar manejadores de clic para cada botón de navegación
    if (btnLogin) btnLogin.onclick = () => window.location.href = 'login.html';
    if (btnLogout) btnLogout.onclick = cerrarSesion;
    if (btnCarrito) btnCarrito.onclick = () => window.location.href = 'carrito.html';
    if (btnAdmin) btnAdmin.onclick = () => window.location.href = 'admin.html';
    if (btnVolver) btnVolver.onclick = () => window.location.href = 'index.html';
    if (btnVolverTienda) btnVolverTienda.onclick = () => window.location.href = 'index.html';
    
    // Ejecutar funciones de inicialización
    // Cada función valida si los elementos existen antes de ejecutarse
    verificarSesion();
    cargarProductos();
    actualizarContadorCarrito();
    inicializarLogin();
    inicializarRegistro();
    cargarCarrito();
    cargarConfirmacion();
});