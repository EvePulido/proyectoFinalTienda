let contenedor = document.getElementById('contenedor');
let productos = []; // Lista de productos cargados desde el backend
let detalle_pedido = []; // Lista de productos agregados al carrito

// Mostrar login al cargar la página
document.addEventListener("DOMContentLoaded", () => {
    mostrarLogin(); // Muestra el formulario de inicio de sesión
});

function mostrarLogin() {
    contenedor.innerHTML = `
        <form id="formContainer">
            <h3>Iniciar sesión</h3>
            <label>Correo electrónico:
                <input type="text" id="txtEmail">
            </label>
            <label>Contraseña
                <input type="password" id="password">
            </label>
            <button type="button" onclick="login()" class="btn-login">Login</button>
            <button type="button" class="switch" onclick="mostrarRegistro()">¿No tienes cuenta? Registrarse</button>
            <div id="mensaje"></div>
        </form>`
}


function mostrarRegistro() {
    contenedor.innerHTML = `
        <form id="formContainer">
            <h3>Registrarse</h3>
            <div class="contenedor-columnas">
                <div class="columna">
                    <label>Nombre
                        <input type="text" id="txtNombre">
                    </label>
                    <label>Correo electrónico:
                        <input type="text" id="txtEmail">
                    </label>
                </div>
                <div class="columna">
                    <label>Apellidos
                        <input type="text" id="txtApellidos">
                    </label>
                    <label>Teléfono:
                        <input type="text" id="txtTelefono">
                    </label>
                </div>
            </div>
            <label>Dirección:
                <input type="text" id="txtDireccion">
            </label>
            <div class="contenedor-columnas">
                <div class="columna">
                    <label>Contraseña
                        <input type="password" id="password">
                    </label>
                </div>
                <div class="columna">
                    <label>Repetir contraseña
                        <input type="password" id="password_repeat">
                    </label>
                </div>
            </div>
            <button type="button" onclick="registrarse()" class="btn-login">Registrarse</button>
            <button type="button" class="switch" onclick="mostrarLogin()">¿Ya tienes cuenta? Iniciar Sesión</button>
            <div id="mensaje"></div>
        </form>`;
}

function login() {
    let email = document.getElementById('txtEmail').value; // Obtener email
    let password = document.getElementById('password').value; // Obtener contraseña
    fetch('http://localhost:3000/api/login', { // Enviar solicitud al backend
        method: 'POST',
        body: JSON.stringify({ email, password }), // Datos del login
        headers: {
            'Content-type': 'application/json; charset=UTF-8',
        },
    })
        .then((res) => res.json()) // Convertir respuesta a JSON
        .then((json) => {
            document.getElementById('mensaje').innerText = json.message || '¡Inicio de sesión exitoso!'; // Mostrar mensaje
            mostrarTienda(json.token, json.user.id); // Ir a la tienda
        });
}

function registrarse() {
    let nombre = document.getElementById('txtNombre').value; // Obtener nombre
    let apellidos = document.getElementById('txtApellidos').value; // Obtener apellidos
    let email = document.getElementById('txtEmail').value; // Obtener email
    let telefono = document.getElementById('txtTelefono').value; // Obtener teléfono
    let direccion = document.getElementById('txtDireccion').value; // Obtener dirección
    let password = document.getElementById('password').value; // Obtener contraseña
    let password_repeat = document.getElementById('password_repeat').value; // Obtener repetición de contraseña

    fetch('http://localhost:3000/api/sign-up', { // Enviar solicitud al backend
        method: 'POST',
        body: JSON.stringify({ apellidos, nombre, password, direccion, telefono, email, password_repeat }),
        headers: {
            'Content-type': 'application/json; charset=UTF-8',
        },
    })
        .then((response) => response.json()) // Convertir respuesta
        .then((json) => {
            document.getElementById('mensaje').innerText = json.message || 'Registro exitoso'; // Mostrar mensaje
        });
}

function mostrarTienda(token, id) {
    fetch('http://localhost:3000/api/tienda', { // Solicitar vista de tienda
        method: 'GET',
        headers: {
            'Content-type': 'application/json; charset=UTF-8',
            'Authorization': 'Bearer ' + token,
        },
    })
        .then(res => res.json()) // Convertir respuesta
        .then(res => {
            if (res.estado === 200) { // Mostrar estructura tienda
                contenedor.innerHTML = `
                    <header>
                        <h1>Bienvenido a la Tienda</h1>
                        <button id="logout" class="btnSombreado" onclick="mostrarLogin()">Cerrar sesión</button>
                    </header>
                    <main>
                        <section id="productos">
                            <h2>Productos</h2>
                            <label class="buscador" for="txtBusqueda">Buscar producto:
                                <input type="text" placeholder="Ingrese el nombre del producto" class="inputCantidad" id="txtBusqueda">
                            </label>
                            <div id="mensajeCarrito" style="color: red; margin-bottom: 10px;"></div>
                            <div id="listaProductos"></div>
                        </section>
                        <aside class="carrito">
                            <ul class="nav nav-tabs">
                                <li class="nav-item">
                                    <button type="button" class="nav-link" onclick="mostrarCarrito('${token}')">Carrito</button>
                                </li>
                                <li class="nav-item">
                                    <button type="button" class="nav-link" onclick="mostrarPedidos('${token}', ${id})">Pedidos</button>
                                </li>
                            </ul>
                            <div class="contenedorCarrito">
                                <ul id="listaCarrito"></ul>
                            </div>
                        </aside>
                    </main>`;
                cargarProductos(token); // Cargar productos
                mostrarCarrito(token); // Mostrar carrito vacío
            }
        });
}

function cargarProductos(token) {
    fetch(`http://localhost:3000/api/productos`, { // Obtener productos
        method: 'GET',
        headers: {
            'Content-type': 'application/json; charset=UTF-8',
            'Authorization': 'Bearer ' + token,
        },
    })
        .then((res) => res.json()) // Convertir respuesta
        .then((json) => {
            productos = json.productos; // Guardar productos
            mostrarProductos(productos, token); // Mostrar productos
            // Filtrado dinámico
            document.getElementById('txtBusqueda').addEventListener('input', function () {
                const texto = this.value.toLowerCase(); // Obtener texto
                const filtrados = productos.filter(p =>
                    p.nombre.toLowerCase().includes(texto)
                );
                mostrarProductos(filtrados, token); // Mostrar resultados filtrados
            });
        });
}

function mostrarProductos(productos, token) {
    let lista = document.getElementById("listaProductos"); // Contenedor de productos
    lista.innerHTML = ''; // Limpiar contenido
    productos.forEach(producto => {  // Agregar tarjeta de producto
        lista.innerHTML += `
            <div class="card" style="width: 18rem;">
                <img src="${producto.imagen}" class="card-img-top mx-auto d-block mt-3" style="max-height: 160px; width: auto;" alt="Imagen de ${producto.nombre}">
                <div class="card-body">
                    <h4 class="card-title">${producto.nombre}</h4>
                    <h5 class="card-title">$${producto.precio}</h5>
                    <p class="card-text">${producto.descripcion}</p>
                    <label for="cantidad${producto.id}" class="me-2 mb-0">Cantidad:
                        <input type="number" value="1" min="1" class="inputCantidad" id="cantidad${producto.id}">  
                    </label>
                    <h6 class="card-title">Disponibles: ${producto.stock}</h6>
                    <button type="button" class="btn btn-primary btnSombreado" onclick="agregarCarrito(${producto.id}, '${token}')">Agregar al carrito</button>
                </div>
            </div>`;
    });
}

function mostrarCarrito(token) {
    let listaCarrito = document.getElementById('listaCarrito'); // Lista del carrito
    listaCarrito.innerHTML = ''; // Vaciar vista
    let total = 0; // Inicializar total

    detalle_pedido.forEach(elemento => {
        const producto = productos.find(prod => prod.id === elemento.id); // Buscar producto
        if (producto) {
            let subtotal = elemento.precio_unitario * elemento.cantidad; // Calcular subtotal
            total += subtotal; // Sumar al total
            listaCarrito.innerHTML += `
                <li>
                    ${producto.nombre} - Cantidad: ${elemento.cantidad} - Precio unitario: $${parseFloat(elemento.precio_unitario).toFixed(2)}
                </li>`;
        }
    });

    listaCarrito.innerHTML += `<li><strong>Subtotal: $${total.toFixed(2)}</strong></li>`; // Mostrar total
    listaCarrito.innerHTML += `<button type="button" class="btn btn-success" onclick="confirmarPedido('${token}')">Confirmar pedido</button>`; // Botón de confirmar
}

function agregarCarrito(id, token) {
    const cantidadInput = document.getElementById(`cantidad${id}`); // Obtener el input de cantidad para este producto
    let cantidad = parseInt(cantidadInput.value); // Convertir la cantidad a número entero

    if (cantidad <= 0 || isNaN(cantidad)) { // Validar que la cantidad sea válida
        mostrarMensajeCarrito("Cantidad inválida"); // Mostrar mensaje de error
        return; // Salir de la función
    }

    const producto = productos.find(p => p.id === id); // Buscar el producto en la lista de productos
    if (!producto) { // Si no se encuentra el producto
        mostrarMensajeCarrito("Producto no encontrado"); // Mostrar error
        return; // Salir de la función
    }

    const existente = detalle_pedido.find(item => item.id === id); // Ver si ya está agregado al carrito
    const cantidadExistente = existente ? existente.cantidad : 0; // Obtener cantidad que ya está en el carrito
    const nuevaCantidadTotal = cantidadExistente + cantidad; // Calcular cantidad total con lo nuevo

    if (nuevaCantidadTotal > producto.stock) { // Validar si excede el stock disponible
        mostrarMensajeCarrito(`Solo hay ${producto.stock} unidades disponibles.`); // Mostrar advertencia
        return; // Salir de la función
    }

    if (existente) { // Si ya existe en el carrito
        existente.cantidad += cantidad; // Sumar la cantidad al producto existente
    } else { // Si es un nuevo producto en el carrito
        detalle_pedido.push({ // Agregar al carrito
            id: producto.id, // ID del producto
            cantidad: cantidad, // Cantidad seleccionada
            precio_unitario: producto.precio // Precio unitario del producto
        });
    }

    mostrarMensajeCarrito(`${producto.nombre} agregado al carrito.`); // Mostrar confirmación
    mostrarCarrito(token); // Actualizar visualmente el carrito
}


function mostrarPedidos(token, id) {
    let listaCarrito = document.getElementById('listaCarrito'); // Contenedor
    listaCarrito.innerHTML = ''; // Limpiar
    fetch(`http://localhost:3000/api/pedidos/${id}`, { // Obtener pedidos
        method: 'GET',
        headers: {
            'Content-type': 'application/json; charset=UTF-8',
            'Authorization': 'Bearer ' + token,
        },
    })
        .then((res) => res.json()) // Convertir respuesta
        .then((json) => {
            json.pedidos.forEach(pedido => { // Mostrar pedidos del usuario
                let fecha = pedido.fecha.replace('T', ' ').slice(0, -5); // Formatear fecha
                listaCarrito.innerHTML += `
                    <li>
                        <label> Número de pedido: </label> ${pedido.id}<br>
                        <label> Fecha: </label> ${fecha} <br>
                        <label> Total: </label> $${pedido.total}<br>
                    </li>`;
            });
        });
}

function confirmarPedido(token) {
    if (detalle_pedido.length === 0) {
        mostrarMensajeCarrito("El carrito está vacío."); // Validar carrito
        return;
    }
    fetch('http://localhost:3000/api/pedido', { // Enviar pedido
        method: 'POST',
        body: JSON.stringify({ productos: detalle_pedido }),
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
    })
        .then(res => res.json()) // Convertir respuesta
        .then(data => {
            if (data.message) {
                mostrarMensajeCarrito(data.message, 'green'); // Mostrar éxito
                detalle_pedido = []; // Vaciar carrito
                mostrarCarrito(token); // Actualizar vista
                cargarProductos(token); // Refrescar stock
            } else if (data.error) {
                mostrarMensajeCarrito(data.error); // Mostrar error
            }
        })
        .catch(err => {
            mostrarMensajeCarrito("Ocurrió un error al confirmar el pedido."); // Error de red
            console.error('Fetch error:', err);
        });
}

function mostrarMensajeCarrito(mensaje, color = 'red') {
    const contenedorMensaje = document.getElementById('mensajeCarrito'); // Contenedor de mensaje
    contenedorMensaje.style.color = color; // Estilo
    contenedorMensaje.textContent = mensaje; // Mostrar texto
    setTimeout(() => {
        contenedorMensaje.textContent = ''; // Borrar después de 5s
    }, 5000);
}