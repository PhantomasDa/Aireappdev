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
                const fechaCompleta = new Date(ano, mes - 1, dia);
                const diaSemana = fechaCompleta.getDay();
                if (diaSemana < 1 || diaSemana > 4) { // Mostrar solo de lunes (1) a jueves (4)
                    continue;
                }
                const nombreDia = fechaCompleta.toLocaleString('default', { weekday: 'long' });
                const diaContainer = document.createElement('div');
                diaContainer.className = 'calendar-day';
                diaContainer.innerHTML = `<h3>${nombreDia.charAt(0).toUpperCase() + nombreDia.slice(1)} ${dia}</h3>`;

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
                            userElement.onclick = () => mostrarFichaUsuario(usuario, clase.id); // Asegurarse de pasar el clase.id
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
    const clasesDisponibles = parseInt(document.getElementById('popup_clases_disponibles').value, 10);
    const fechaActivacion = document.getElementById('popup_fecha_activacion').value;
    const fechaExpiracion = document.getElementById('popup_fecha_expiracion').value;

    if (!usuarioId) {
        alert('ID de usuario no encontrado');
        return;
    }

    const cambios = {
        id: usuarioId,
        nombre: nombre || undefined,
        email: email || undefined,
        telefono: telefono || undefined,
        clases_disponibles: clasesDisponibles || undefined,
        fecha_activacion: fechaActivacion || undefined,
        fecha_expiracion: fechaExpiracion || undefined
    };

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
}function mostrarFichaUsuario(usuario, claseId) {
    console.log('Usuario seleccionado:', usuario);
    console.log('Clase ID seleccionado:', claseId);

    const usuarioIdElement = document.getElementById('popup_usuario_id');
    const nombreElement = document.getElementById('popup_nombre');
    const emailElement = document.getElementById('popup_email');
    const telefonoElement = document.getElementById('popup_telefono');
    const clasesDisponiblesElement = document.getElementById('popup_clases_disponibles');
    const fechaActivacionElement = document.getElementById('popup_fecha_activacion');
    const fechaExpiracionElement = document.getElementById('popup_fecha_expiracion');
    const fotoPerfilElement = document.getElementById('popup_foto_perfil');

    usuarioIdElement.value = usuario.usuario_id; 
    usuarioIdElement.dataset.claseId = claseId; // Guardar claseId
    nombreElement.value = usuario.nombre;
    emailElement.value = usuario.email;
    telefonoElement.value = usuario.telefono;
    clasesDisponiblesElement.value = usuario.clases_disponibles || '0'; // Asignar clases disponibles
    fechaActivacionElement.value = usuario.fecha_activacion ? usuario.fecha_activacion.split('T')[0] : '';
    fechaExpiracionElement.value = usuario.fecha_expiracion ? usuario.fecha_expiracion.split('T')[0] : '';
    fotoPerfilElement.src = usuario.foto_perfil || 'ruta_a_imagen_default.jpg';

    document.getElementById('popup').style.display = 'flex';

    console.log('Valores asignados:', {
        id: usuarioIdElement.value,
        nombre: nombreElement.value,
        email: emailElement.value,
        telefono: telefonoElement.value,
        clases_disponibles: clasesDisponiblesElement.value,
        fecha_activacion: fechaActivacionElement.value,
        fecha_expiracion: fechaExpiracionElement.value,
        foto_perfil: fotoPerfilElement.src,
        clase_id: claseId
    });
}
function eliminarClaseUsuario() {
    const usuarioId = parseInt(document.getElementById('popup_usuario_id').value, 10);
    const claseId = parseInt(document.getElementById('popup_usuario_id').dataset.claseId, 10);

    console.log('Usuario ID:', usuarioId);
    console.log('Clase ID:', claseId);

    if (!usuarioId || isNaN(claseId)) {
        alert('ID de usuario o clase no encontrado');
        return;
    }

    const data = { usuarioId, claseId };

    fetch(`/admin/eliminar-clase-usuario`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (response.ok) {
            alert('Clase eliminada y cupos actualizados correctamente');
            cerrarPopup();
            cargarClasesUsuariosMes(new Date());
        } else {
            return response.json().then(error => {
                throw new Error(error.message);
            });
        }
    })
    .catch(error => {
        console.error('Error al eliminar la clase:', error);
        alert('Error al eliminar la clase: ' + error.message);
    });
}


function cerrarPopup() {
    document.getElementById('popup').style.display = 'none';
}
document.addEventListener("DOMContentLoaded", function() {
    // Otros inicializadores
    document.querySelector('.close-button').addEventListener('click', cerrarPopup);
});


