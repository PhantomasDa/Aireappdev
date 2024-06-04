// profile.js

function cargarNombreUsuario() {
    fetchData('/perfil/usuario')
        .then(usuario => {
            document.getElementById('user_name').textContent = `Bienvenid@, ${usuario.nombre}`;
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
                : clases.map((clase, index) => {
                    const fechaClase = new Date(clase.fecha_hora);
                    const opcionesFecha = { weekday: 'long', month: 'long', day: 'numeric' };
                    const opcionesHora = { hour: '2-digit', minute: '2-digit', hour12: true };
                    const fechaFormateada = fechaClase.toLocaleDateString('es-ES', opcionesFecha);
                    const horaFormateada = fechaClase.toLocaleTimeString('es-ES', opcionesHora);
                    const ordinal = index === 0 ? 'Primera' : index === 1 ? 'Segunda' : index === 2 ? 'Tercera' : `${index + 1}ª`;
                    return `<div>${ordinal} clase: ${fechaFormateada} a las ${horaFormateada} <button class="my-button-reservas-2" onclick="reagendarClase(${clase.id})">Reagendar Clase</button></div>`;
                }).join('');
        })
        .catch(error => console.error('Error al cargar las próximas clases:', error));
}

function actualizarClasesDisponibles() {
    fetchData('/perfil/clases-disponibles')
        .then(data => {
            const clasesDisponibles = data.clases_disponibles;
            document.getElementById('clases_disponibles').textContent = `Número de clases disponibles: ${clasesDisponibles}`;
        })
        .catch(error => {
            console.error('Error al cargar las clases disponibles:', error);
            document.getElementById('clases_disponibles').textContent = 'Error al cargar las clases disponibles';
        });
}

function manejarErrorReserva(error) {
    console.error('Error al reservar la clase:', error);
    const errorMessage = error.message || error;
    switch (errorMessage) {
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
            alert('Error al reservar la clase: ' + errorMessage);
    }
}

function confirmarReserva() {
    const claseId = document.getElementById('claseId').value;
    console.log('Intentando reservar la clase con ID:', claseId); // Agrega esto para depurar

    fetchData('/perfil/reservar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claseId })
    })
    .then(data => {
        const fechaClase = new Date(data.fecha);
        const opcionesFecha = { weekday: 'long', month: 'long', day: 'numeric' };
        const opcionesHora = { hour: '2-digit', minute: '2-digit', hour12: true };
        const fechaFormateada = fechaClase.toLocaleDateString('es-ES', opcionesFecha);
        const horaFormateada = fechaClase.toLocaleTimeString('es-ES', opcionesHora);
        document.getElementById('confirmationText').textContent = `Felicitaciones! Tu clase ha sido reservada para ${fechaFormateada} a las ${horaFormateada}.`;
        mostrarModal('confirmationModal');
        cerrarPopup();
    })
    .catch(error => {
        if (error instanceof Response) {
            error.json().then(errorMessage => {
                manejarErrorReserva({ message: errorMessage.message || errorMessage });
            }).catch(() => {
                manejarErrorReserva({ message: error.statusText });
            });
        } else {
            manejarErrorReserva({ message: error.message });
        }
    });
}


function mostrarReservaPopup(claseId) {
    document.getElementById('claseId').value = claseId;
    document.getElementById('reservaPopup').style.display = 'block';
}

function reservarCupo(claseId) {
    mostrarReservaPopup(claseId);
}

function toggleProximasClases() {
    const proximasClasesDiv = document.getElementById('proximas_clases');
    proximasClasesDiv.classList.toggle('active');
}

document.addEventListener('DOMContentLoaded', () => {
    const header = document.createElement('div');
    header.classList.add('toggle-header');
    header.textContent = 'Ocultar próximas clases';
    header.onclick = toggleProximasClases;

    const proximasClasesContainer = document.getElementById('proximas_clases');
    proximasClasesContainer.parentNode.insertBefore(header, proximasClasesContainer);
});

async function marcarDisponibilidad(start, end) {
    const month = start.getMonth() + 1;
    const year = start.getFullYear();
    try {
        const response = await fetch(`/profile/disponibilidad-clases?month=${month}&year=${year}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        if (!response.ok) {
            throw new Error('Error en la solicitud al servidor');
        }
        const disponibilidad = await response.json();

        const dias = document.querySelectorAll('.fc-daygrid-day');
        dias.forEach(dia => {
            const dateStr = dia.getAttribute('data-date');
            const fecha = disponibilidad.find(d => d.fecha === dateStr);
            if (fecha) {
                if (fecha.cupos_disponibles > 0) {
                    dia.classList.add('cupos-disponibles');
                } else {
                    dia.classList.add('sin-cupos');
                }
            } else {
                dia.classList.add('sin-actividades');
            }
        });
    } catch (error) {
        console.error('Error obteniendo disponibilidad de clases:', error);
    }
}
