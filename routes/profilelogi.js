document.addEventListener('DOMContentLoaded', () => {
    initPage();
});

function initPage() {
    actualizarClasesDisponibles();
    cargarProximasClases();
    cargarNombreUsuario();
    inicializarCalendario();
}

function inicializarCalendario() {
    const calendarEl = document.getElementById('calendario');
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'es',
        validRange: {
            start: new Date() // Empieza desde hoy
        },
        initialDate: new Date(), // La fecha inicial mostrada es hoy
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: ''
        },
        buttonText: {
            today: 'Hoy'
        },
        dateClick: (info) => {
            cargarHorarios(info.dateStr);
            document.querySelectorAll('.fc-daygrid-day.selected-date').forEach(date => date.classList.remove('selected-date'));
            info.dayEl.classList.add('selected-date');
        }
    });
    calendar.render();
}

function fetchData(url, options = {}) {
    options.headers = {
        ...options.headers,
        'Authorization': 'Bearer ' + localStorage.getItem('token')
    };
    return fetch(url, options).then(response => {
        if (!response.ok) throw response.json().then(error => new Error(error.message));
        return response.json();
    });
}

function cargarNombreUsuario() {
    fetchData('/perfil/usuario')
        .then(usuario => {
            document.getElementById('user_name').textContent = `Bienvenido, ${usuario.nombre}`;
            document.getElementById('profile_picture').src = usuario.foto_perfil;
        })
        .catch(error => console.error('Error al cargar el nombre del usuario:', error));
}

function cargarProximasClases() {
    fetchData('/perfil/proximas-clases')
        .then(clases => {
            const proximasClasesDiv = document.getElementById('proximas_clases');
            proximasClasesDiv.innerHTML = clases.length === 0 
                ? '<p>No tienes clases reservadas.</p>' 
                : clases.map(clase => {
                    const fechaClase = new Date(clase.fecha_hora);
                    const diaSemana = fechaClase.toLocaleDateString('es-ES', { weekday: 'long' });
                    const fechaFormateada = `${diaSemana} ${fechaClase.toLocaleDateString('es-ES')} ${fechaClase.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
                    return `<div>Fecha: ${fechaFormateada} <button onclick="reagendarClase(${clase.id})">Reagendar Clase</button></div>`;
                }).join('');
        })
        .catch(error => console.error('Error al cargar las próximas clases:', error));
}

function cargarHorarios(fecha) {
    fetchData(`/perfil/horarios?fecha=${fecha}`)
        .then(clases => {
            const horariosContenido = document.getElementById('horariosContenido');
            horariosContenido.innerHTML = clases.map(clase => {
                const fechaClase = new Date(clase.fecha_hora).toLocaleString();
                return `<div>Horario: ${fechaClase} - Cupos Disponibles: ${clase.cupos_disponibles} <button onclick="reservarCupo(${clase.id}, '${fechaClase}')">Reservar Cupo</button></div>`;
            }).join('');
            document.getElementById('horariosPopup').classList.add('active');
        })
        .catch(error => console.error('Error al cargar los horarios:', error));
}

function cerrarHorariosPopup() {
    document.getElementById('horariosPopup').classList.remove('active');
}

function cerrarPopup() {
    document.getElementById('reservaPopup').classList.remove('active');
}

function reservarCupo(claseId, fechaClase) {
    if (clasesDisponibles > 0) {
        const popup = document.getElementById('reservaPopup');
        document.getElementById('claseId').value = claseId;
        document.querySelector('#reservaPopup p').textContent = `Qué emoción, vas a reservar tu clase para ${fechaClase}, recuerda que puedes cancelar con 24 horas de anticipación :)`;
        popup.classList.add('active');
    } else {
        alert('No tienes clases disponibles para reservar.');
    }
}

function confirmarReserva() {
    const claseId = document.getElementById('claseId').value;
    fetchData('/perfil/reservar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claseId })
    })
    .then(data => {
        const fechaFormateada = new Date(data.fecha).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        document.getElementById('confirmationText').textContent = `Felicitaciones! Tu clase ha sido reservada para ${fechaFormateada}.`;
        mostrarModal('confirmationModal');
        cerrarPopup(); // Cerrar el popup de reserva
    })
    .catch(error => manejarErrorReserva(error));
}

function cerrarYRecargar() {
    cerrarModal('confirmationModal');
    location.reload(); // Recargar la página
}

function cerrarTodosLosPopups() {
    const popups = document.querySelectorAll('.popup, .modal');
    popups.forEach(popup => {
        popup.style.display = 'none';
    });
}

function manejarErrorReserva(error) {
    console.error('Error al reservar la clase:', error);
    switch (error.message) {
        case 'No se pueden reservar clases para fechas anteriores al día siguiente':
            mostrarModal('dateErrorModal');
            break;
        case 'Ya tienes una clase registrada en esta fecha':
            mostrarModal('sameDayErrorModal');
            break;
        case 'Ya estás registrado en esta clase':
            mostrarModal('errorModal');
            break;
        default:
            alert('Error al reservar la clase: ' + error.message);
    }
}

function mostrarModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
}

function cerrarModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function cerrarReagendarPopup() {
    cerrarModal('reagendarPopup');
}

function actualizarClasesDisponibles() {
    fetchData('/perfil/clases-disponibles')
        .then(data => {
            clasesDisponibles = data.clases_disponibles;
            document.getElementById('clases_disponibles').textContent = `Número de clases disponibles: ${clasesDisponibles}`;
        })
        .catch(error => {
            console.error('Error al cargar las clases disponibles:', error);
            document.getElementById('clases_disponibles').textContent = 'Error al cargar las clases disponibles';
        });
}

function reagendarClase(claseId) {
    fetchData(`/perfil/proximas-clases`)
        .then(clases => {
            const claseActual = clases.find(clase => clase.id === claseId);
            if (claseActual) {
                const fechaObj = new Date(claseActual.fecha_hora);
                const diaSemana = fechaObj.toLocaleDateString('es-ES', { weekday: 'long' });
                const fechaFormateada = `${diaSemana} ${fechaObj.toLocaleDateString('es-ES')} ${fechaObj.toLocaleTimeString('es-ES')}`;
                document.getElementById('claseActualMensaje').innerHTML = `Vas a reagendar tu clase del <span class="fecha">${fechaFormateada}</span>`;
            }
        })
        .catch(error => console.error('Error al obtener la fecha de la clase actual:', error));

    fetchData(`/perfil/fechas-reagendar/${claseId}`)
        .then(fechas => {
            const fechasReagendarDiv = document.getElementById('fechasReagendar');
            fechasReagendarDiv.innerHTML = '';

            fechas.forEach(fecha => {
                const fechaObj = new Date(fecha.fecha_hora);
                const diaSemana = fechaObj.toLocaleDateString('es-ES', { weekday: 'long' });
                const fechaFormateada = `${diaSemana} ${fechaObj.toLocaleDateString('es-ES')} ${fechaObj.toLocaleTimeString('es-ES')}`;
                fechasReagendarDiv.innerHTML += `
                    <div class="fecha-container">
                        <div>Fecha: <span class="fecha">${fechaFormateada}</span></div>
                        <div>Cupos disponibles: ${fecha.cupos_disponibles}</div>
                        <button onclick="confirmarReagendar(${claseId}, '${fecha.fecha_hora}')">Reagendar</button>
                    </div>
                `;
            });
            document.getElementById('reagendarPopup').style.display = 'block';
        })
        .catch(error => console.error('Error al obtener fechas para reagendar:', error));
}

function confirmarReagendar(claseId, nuevaFecha) {
    console.log('Reagendando clase', claseId, 'a la nueva fecha', nuevaFecha);
    fetch('/perfil/reagendar', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        body: JSON.stringify({ claseId, nuevaFecha: new Date(nuevaFecha).toISOString() })
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(error => { throw new Error(error.message); });
        }
        return response.json();
    })
    .then(data => {
        alert(data.message);
        cerrarReagendarPopup();
        cargarProximasClases();
    })
    .catch(error => {
        console.error('Error al reagendar la clase:', error);
        alert('Error al reagendar la clase: ' + error.message);
    });
}

function logout() {
    localStorage.removeItem('token');
    window.location.href = '/';
}

function loadComponent(id, url, callback) {
    fetch(url)
        .then(response => response.text())
        .then(data => {
            document.getElementById(id).innerHTML = data;
            if (callback) callback();
        })
        .catch(error => console.error('Error loading component:', error));
}

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
});

function toggleProximasClases() {
    const proximasClasesDiv = document.getElementById('proximas_clases');
    proximasClasesDiv.classList.toggle('active');
}

document.addEventListener('DOMContentLoaded', () => {
    const header = document.createElement('div');
    header.classList.add('toggle-header');
    header.textContent = 'Ver/ocultar próximas clases';
    header.onclick = toggleProximasClases;

    const proximasClasesContainer = document.getElementById('proximas_clases');
    proximasClasesContainer.parentNode.insertBefore(header, proximasClasesContainer);
});

function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    })
    .then(response => response.json())
    .then(data => {
        localStorage.setItem('token', data.accessToken);
        window.location.href = '/profile.html';
    })
    .catch(error => console.error('Error al iniciar sesión:', error));
}
