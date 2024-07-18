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

    let fechaActual = new Date();
    cargarClasesUsuariosMes(fechaActual);

    window.cambiarMes = function (incremento) {
        fechaActual.setMonth(fechaActual.getMonth() + incremento);
        cargarClasesUsuariosMes(fechaActual);
    };
});
function cargarClasesUsuariosMes(fecha) {
    const mes = fecha.getMonth() + 1; // Mes actual (1-12)
    const ano = fecha.getFullYear(); // Año actual
    const nombreMes = fecha.toLocaleString('default', { month: 'long', year: 'numeric' });

    document.getElementById('nombre_mes').innerText = nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1);

    fetchData(`/admin/clases-usuarios-mes?mes=${mes}&ano=${ano}`)
        .then(clasesConUsuarios => {
            const contenedor = document.getElementById('clases_usuarios');
            contenedor.innerHTML = '';

            const diasDelMes = new Date(ano, mes, 0).getDate(); // Número de días en el mes
            const clasesPorDia = {};

            clasesConUsuarios.forEach(clase => {
                const dia = new Date(clase.fecha_hora).getDate();
                if (!clasesPorDia[dia]) {
                    clasesPorDia[dia] = [];
                }
                clasesPorDia[dia].push(clase);
            });

            for (let dia = 1; dia <= diasDelMes; dia++) {
                const diaContainer = document.createElement('div');
                diaContainer.className = 'calendar-day';
                diaContainer.innerHTML = `<h3>${dia}</h3>`;

                if (clasesPorDia[dia]) {
                    clasesPorDia[dia].forEach(clase => {
                        const horaClase = new Date(clase.fecha_hora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        const claseContainer = document.createElement('div');
                        claseContainer.className = 'clase-container';
                        claseContainer.innerHTML = `<strong>${horaClase}</strong>`;

                        clase.usuarios.forEach(usuario => {
                            const userElement = document.createElement('div');
                            userElement.className = 'user';
                            userElement.innerHTML = usuario.nombre;
                            userElement.onclick = () => mostrarFichaUsuario(usuario);
                            claseContainer.appendChild(userElement);
                        });

                        diaContainer.appendChild(claseContainer);
                    });
                } else {
                    diaContainer.innerHTML += '<p>No hay clases</p>';
                }

                contenedor.appendChild(diaContainer);
            }
        })
        .catch(error => console.error('Error al cargar clases y usuarios:', error));
}

function guardarCambiosUsuario() {
    const usuarioId = parseInt(document.getElementById('popup_usuario_id').value, 10);
    const nombre = document.getElementById('popup_nombre').value;
    const email = document.getElementById('popup_email').value;
    const telefono = document.getElementById('popup_telefono').value;

    // Validar que el ID esté presente
    if (!usuarioId) {
        alert('ID de usuario no encontrado');
        return;
    }

    // Crear un objeto con los cambios
    const cambios = {};
    if (nombre) cambios.nombre = nombre;
    if (email) cambios.email = email;
    if (telefono) cambios.telefono = telefono;

    // Agregar el ID del usuario al objeto de cambios
    cambios.id = usuarioId;

    // Log adicional antes de enviar
    console.log('Datos a enviar:', JSON.stringify(cambios));

    fetch(`/admin/actualizar-usuario`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(cambios)
    })
    .then(response => {
        if (response.ok) {
            cerrarPopup();
            cargarClasesUsuariosMes(new Date());
        } else {
            return response.json().then(error => {
                throw new Error(error.message);
            });
        }
    })
    .catch(error => {
        console.error('Error al guardar los cambios:', error);
        alert('Error al guardar los cambios: ' + error.message);
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

function mostrarFichaUsuario(usuario) {
    console.log('Usuario seleccionado:', usuario);

    const usuarioIdElement = document.getElementById('popup_usuario_id');
    const nombreElement = document.getElementById('popup_nombre');
    const emailElement = document.getElementById('popup_email');
    const telefonoElement = document.getElementById('popup_telefono');

    console.log('Elementos del popup:', {
        usuarioIdElement,
        nombreElement,
        emailElement,
        telefonoElement
    });

    usuarioIdElement.value = usuario.usuario_id; // Cambiado de usuario.id a usuario.usuario_id
    nombreElement.value = usuario.nombre;
    emailElement.value = usuario.email;
    telefonoElement.value = usuario.telefono;
    document.getElementById('popup').style.display = 'flex';

    console.log('Valores asignados:', {
        id: usuarioIdElement.value,
        nombre: nombreElement.value,
        email: emailElement.value,
        telefono: telefonoElement.value
    });
}
