document.addEventListener("DOMContentLoaded", function() {
    loadComponent('menu', 'menu.html', initializeMenu);
    loadComponent('footer', 'footer.html');
    loadComponent('sidebar-container', 'sidebar.html');

    function initializeMenu() {
        const toggleButton = document.getElementById('navbar-toggle');
        const closeButton = document.getElementById('close-button');
        const fullscreenMenu = document.getElementById('fullscreen-menu');

        if (toggleButton && closeButton && fullscreenMenu) {
            toggleButton.addEventListener('click', () => {
                fullscreenMenu.classList.add('open');
            });

            closeButton.addEventListener('click', () => {
                fullscreenMenu.classList.remove('open');
            });
        }
    }

    document.querySelector('#guardar-cambios-usuarios-btn').addEventListener('click', guardarCambiosUsuarios);
});



function cargarClasesUsuarios() {
    const fecha = document.getElementById('fecha_clases').value;
    fetchData(`/admin/clases-usuarios?fecha=${fecha}`)
        .then(clasesConUsuarios => {
            const contenedor = document.getElementById('clases_usuarios');
            contenedor.innerHTML = clasesConUsuarios.map(clase => `
                <div class="class-container">
                    <h2>Clase: ${new Date(clase.fecha_hora).toLocaleString()}</h2>
                    <p>Cupos Disponibles: ${clase.cupos_disponibles}</p>
                    <table>
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Email</th>
                                <th>Teléfono</th>
                                <th>Asistencia</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${clase.usuarios.map(usuario => `
                                <tr>
                                    <td>${usuario.nombre}</td>
                                    <td>${usuario.email}</td>
                                    <td>${usuario.telefono}</td>
                                    <td><input type="checkbox" name="asistencia_${usuario.id}" data-usuario-id="${usuario.id}" data-clase-id="${clase.id}"></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    <button onclick="enviarAsistencia(${clase.id})">Enviar Asistencia</button>
                </div>
            `).join('');
        })
        .catch(error => console.error('Error al cargar clases y usuarios:', error));
}


function fetchData(url, options = {}) {
    const token = localStorage.getItem('token');
    console.log('Token:', token);  // Verificar si el token está presente
    options.headers = {
        ...options.headers,
        'Authorization': 'Bearer ' + token
    };
    return fetch(url, options)
        .then(response => {
            if (!response.ok) {
                if (response.status === 401) {
                    // Token inválido, redirigir a la página de inicio de sesión
                    alert('Sesión expirada o no autorizada. Por favor, inicia sesión nuevamente.');
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                }
                return response.text().then(errorText => {
                    try {
                        const errorJson = JSON.parse(errorText);
                        throw new Error(errorJson.message || 'Error desconocido');
                    } catch (e) {
                        console.error('Error en la respuesta del servidor (no JSON):', errorText);
                        throw new Error('Respuesta del servidor no es JSON');
                    }
                });
            }
            return response.json();
        });
}


function cargarUsuarios() {
    fetchData('/admin/usuarios-completos')
        .then(usuarios => {
            const contenedorUsuarios = document.getElementById('usuarios');
            contenedorUsuarios.innerHTML = '';

            const usuariosMap = {};

            // Agrupar información por usuario
            usuarios.forEach(usuario => {
                if (!usuariosMap[usuario.id]) {
                    usuariosMap[usuario.id] = {
                        ...usuario,
                        paquetes: [],
                        reservaciones: []
                    };
                }

                // Agregar información de paquetes y reservaciones
                if (usuario.paquete_fecha_compra) {
                    usuariosMap[usuario.id].paquetes.push({
                        fecha_compra: usuario.paquete_fecha_compra,
                        fecha_activacion: usuario.paquete_fecha_activacion,
                        fecha_expiracion: usuario.paquete_fecha_expiracion,
                        max_reagendamientos: usuario.paquete_max_reagendamientos,
                        reagendamientos_usados: usuario.paquete_reagendamientos_usados,
                        informacion: usuario.paquete_informacion,
                        comprobante_pago: usuario.paquete_comprobante_pago
                    });
                }

                if (usuario.reserva_clase_id) {
                    usuariosMap[usuario.id].reservaciones.push({
                        clase_id: usuario.reserva_clase_id,
                        fecha_reserva: usuario.reserva_fecha_reserva,
                        reagendamientos: usuario.reserva_reagendamientos
                    });
                }
            });

            // Crear una tarjeta por usuario
Object.values(usuariosMap).forEach(usuario => {
    const card = document.createElement('div');
    card.className = 'card';
    card.id = `usuario-${usuario.id}`;

    card.innerHTML = `
        <div><strong>Nombre:</strong> <span class="field-value" data-field="nombre">${usuario.nombre}</span><input type="text" class="field-input" value="${usuario.nombre}" data-field="nombre" data-id="${usuario.id}" style="display: none;"></div>
        <div><strong>Email:</strong> <span class="field-value" data-field="email">${usuario.email}</span><input type="text" class="field-input" value="${usuario.email}" data-field="email" data-id="${usuario.id}" style="display: none;"></div>
        <div><strong>Fecha Registro:</strong> <span class="field-value" data-field="fecha_registro">${usuario.fecha_registro}</span><input type="text" class="field-input" value="${usuario.fecha_registro}" data-field="fecha_registro" data-id="${usuario.id}" style="display: none;"></div>
        <div><strong>Paquete:</strong> <span class="field-value" data-field="paquete">${usuario.paquete}</span><input type="text" class="field-input" value="${usuario.paquete}" data-field="paquete" data-id="${usuario.id}" style="display: none;"></div>
        <div><strong>Clases Disponibles:</strong> <span class="field-value" data-field="clases_disponibles">${usuario.clases_disponibles}</span><input type="text" class="field-input" value="${usuario.clases_disponibles}" data-field="clases_disponibles" data-id="${usuario.id}" style="display: none;"></div>
        <div><strong>Teléfono:</strong> <span class="field-value" data-field="telefono">${usuario.telefono}</span><input type="text" class="field-input" value="${usuario.telefono}" data-field="telefono" data-id="${usuario.id}" style="display: none;"></div>
        <div><strong>Motivación:</strong> <span class="field-value" data-field="motivacion">${usuario.motivacion}</span><input type="text" class="field-input" value="${usuario.motivacion}" data-field="motivacion" data-id="${usuario.id}" style="display: none;"></div>
        <div><strong>Fecha Nacimiento:</strong> <span class="field-value" data-field="fecha_nacimiento">${usuario.fecha_nacimiento}</span><input type="text" class="field-input" value="${usuario.fecha_nacimiento}" data-field="fecha_nacimiento" data-id="${usuario.id}" style="display: none;"></div>
        <div><strong>Género:</strong> <span class="field-value" data-field="genero">${usuario.genero}</span><input type="text" class="field-input" value="${usuario.genero}" data-field="genero" data-id="${usuario.id}" style="display: none;"></div>
        <div><strong>Comprobante Pago:</strong> <img style="max-width:400px;" class="comprobante" src="../uploads/${usuario.comprobante_pago}" alt="Comprobante de Pago"><input type="text" class="field-input" value="${usuario.comprobante_pago}" data-field="comprobante_pago" data-id="${usuario.id}" style="display: none;"></div>
        <div><strong>Rol:</strong> <span class="field-value" data-field="rol">${usuario.rol}</span><input type="text" class="field-input" value="${usuario.rol}" data-field="rol" data-id="${usuario.id}" style="display: none;"></div>
        <div>
            <button onclick="togglePaqueteInfo(${usuario.id})">Mostrar más</button>
            <div id="paquete-info-${usuario.id}" style="display: none;">
                <h3>Información del Paquete</h3>
                ${usuario.paquetes.map(paquete => `
                    <div><strong>Fecha de Compra:</strong> ${paquete.fecha_compra || 'N/A'}</div>
                    <div><strong>Fecha de Activación:</strong> ${paquete.fecha_activacion || 'N/A'}</div>
                    <div><strong>Fecha de Expiración:</strong> ${paquete.fecha_expiracion || 'N/A'}</div>
                    <div><strong>Max Reagendamientos:</strong> ${paquete.max_reagendamientos || 'N/A'}</div>
                    <div><strong>Reagendamientos Usados:</strong> ${paquete.reagendamientos_usados || 'N/A'}</div>
                    <div><strong>Información del Paquete:</strong> ${paquete.informacion || 'N/A'}</div>
                    <div><strong>Comprobante de Pago:</strong> <img class="comprobante" src="${paquete.comprobante_pago || ''}" alt="Comprobante de Pago"></div>
                `).join('')}
            </div>
        </div>
        <div>
            <button onclick="toggleReservaciones(${usuario.id})">Mostrar Reservaciones</button>
            <div id="reservaciones-info-${usuario.id}" style="display: none;">
                <h3>Reservaciones</h3>
                ${usuario.reservaciones.map(reserva => `
                    <div><strong>Clase ID:</strong> ${reserva.clase_id || 'N/A'}</div>
                    <div><strong>Fecha de Reserva:</strong> ${reserva.fecha_reserva || 'N/A'}</div>
                    <div><strong>Reagendamientos:</strong> ${reserva.reagendamientos || 'N/A'}</div>
                `).join('')}
            </div>
        </div>
        <button onclick="editarUsuario(${usuario.id})">Editar</button>
        <button onclick="guardarCambiosUsuario(${usuario.id})" style="display: none;">Guardar</button>
    `;

    contenedorUsuarios.appendChild(card);
});

        })
        .catch(error => console.error('Error al cargar usuarios:', error));
}

function togglePaqueteInfo(usuarioId) {
    const paqueteInfo = document.getElementById(`paquete-info-${usuarioId}`);
    if (paqueteInfo.style.display === 'none') {
        paqueteInfo.style.display = 'block';
    } else {
        paqueteInfo.style.display = 'none';
    }
}

function toggleReservaciones(usuarioId) {
    const reservacionesInfo = document.getElementById(`reservaciones-info-${usuarioId}`);
    if (reservacionesInfo.style.display === 'none') {
        reservacionesInfo.style.display = 'block';
    } else {
        reservacionesInfo.style.display = 'none';
    }
}



function editarUsuario(usuarioId) {
    const card = document.getElementById(`usuario-${usuarioId}`);
    card.querySelectorAll('.field-value').forEach(span => span.style.display = 'none');
    card.querySelectorAll('.field-input').forEach(input => input.style.display = 'inline-block');
    card.querySelector('button[onclick^="editarUsuario"]').style.display = 'none';
    card.querySelector('button[onclick^="guardarCambiosUsuario"]').style.display = 'inline-block';
}



function guardarCambiosUsuario(usuarioId) {
    console.log('Iniciando guardarCambiosUsuario');
    const card = document.getElementById(`usuario-${usuarioId}`);
    if (!card) {
        console.error('No se encontró el elemento de la tarjeta del usuario');
        return;
    }

    const inputs = card.querySelectorAll('.field-input');
    const cambios = Array.from(inputs).reduce((acc, input) => {
        const id = parseInt(input.getAttribute('data-id'), 10);
        const field = input.getAttribute('data-field');
        const value = input.value;
        const originalElement = card.querySelector(`.field-value[data-field="${field}"]`);

        if (!originalElement) {
            console.error(`No se encontró el elemento original para el campo ${field}`);
            return acc;
        }

        let originalValue = originalElement.textContent.trim();
        
        // Para el caso específico de `comprobante_pago`
        if (field === 'comprobante_pago' && originalElement.querySelector('img')) {
            originalValue = originalElement.querySelector('img').getAttribute('src').split('/').pop();
        }

        if (value !== originalValue) {
            acc.push({ id, field, value });
        }
        return acc;
    }, []);

    if (cambios.length === 0) {
        console.log('No hay cambios para guardar');
        return;
    }

    console.log('Cambios a enviar:', JSON.stringify({ cambios }));

    fetch('http://localhost:3000/admin/actualizar-usuarios', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ cambios })
    })
    .then(response => {
        console.log('Respuesta del servidor:', response);
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('Error en la respuesta del servidor');
        }
    })
    .then(data => {
        console.log('Datos recibidos del servidor:', data);
        alert('Cambios guardados correctamente');
        cargarUsuarios();
    })
    .catch(error => {
        console.error('Error al guardar cambios:', error);
        alert('Error al guardar cambios: ' + error.message);
    });
}


function loadComponent(id, url, callback) {
    fetch(url)
        .then(response => response.text())
        .then(data => {
            const element = document.getElementById(id);
            if (element) {
                element.innerHTML = data;
                if (callback) callback();
            } else {
                console.error(`Elemento con id "${id}" no encontrado.`);
            }
        })
        .catch(error => console.error('Error loading component:', error));
}