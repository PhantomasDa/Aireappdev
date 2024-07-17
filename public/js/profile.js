// profile.js



function cargarNombreUsuario() {
    fetchData('/perfil/usuario')
        .then(usuario => {
            document.getElementById('user_name').textContent = `Holis, ${usuario.nombre}`;
            // Asegúrate de que la URL sea correcta
            document.getElementById('profile_picture').src = usuario.foto_perfil;
        })
        .catch(error => console.error('Error al cargar el nombre del usuario:', error));
}

function cargarProximasClases() {
    fetchData('/perfil/proximas-clases')
        .then(clases => {
            const proximasClasesDiv = document.getElementById('proximas_clases');
            proximasClasesDiv.innerHTML = clases.length === 0 
                ? '<p style="color:black">No tienes clases reservadas.</p>' 
                : clases.map((clase, index) => {
                    const fechaClase = new Date(clase.fecha_hora);
                    const opcionesFecha = { weekday: 'long', month: 'long', day: 'numeric' };
                    const opcionesHora = { hour: '2-digit', minute: '2-digit', hour12: true };
                    const fechaFormateada = fechaClase.toLocaleDateString('es-ES', opcionesFecha);
                    const horaFormateada = fechaClase.toLocaleTimeString('es-ES', opcionesHora);
                    const ordinal = index === 0 ? 'Primera' : index === 1 ? 'Segunda' : index === 2 ? 'Tercera' : `${index + 1}ª`;

                    // Obtener la fecha actual sin horas, minutos y segundos
                    const fechaActual = new Date();
                    fechaActual.setHours(0, 0, 0, 0);
                    fechaClase.setHours(0, 0, 0, 0); // Resetear las horas para comparar solo fechas
                    
                    // Validar si la fecha de la clase coincide con la fecha actual
                    const botonReagendar = fechaClase.getTime() === fechaActual.getTime()
                        ? '<p style="color:red">Lo sentimos, no puedes reagendar esta clase, ya que es hoy.</p>'
                        : `<button class="my-button-reservas-2" onclick="reagendarClase(${clase.id})">Reagendar Clase</button>`;

                    return `
                        <div class="card">
                            <div class="card-header">${ordinal} clase</div>
                            <div class="card-body">
                                ${fechaFormateada} a las ${horaFormateada}
                            </div>
                            <div class="card-footer">
                                ${botonReagendar}
                            </div>
                        </div>`;
                }).join('');
        })
        .catch(error => console.error('Error al cargar las próximas clases:', error));
}

function actualizarClasesDisponibles() {
    console.log('Función actualizarClasesDisponibles iniciada.');

    fetchData('/perfil/clases-disponibles')
        .then(data => {
            console.log('Datos recibidos:', data);

            const clasesDisponiblesElement = document.getElementById('clases_disponibles');
            if (!clasesDisponiblesElement) {
                console.error('Elemento con ID "clases_disponibles" no encontrado.');
                return;
            }

            const clasesDisponibles = data.clases_disponibles;
            clasesDisponiblesElement.textContent = `${clasesDisponibles}`;
            console.log('Clases disponibles actualizadas:', clasesDisponibles);

            const informacionExtraElement = document.getElementById('informacion_extra');
            if (!informacionExtraElement) {
                console.error('Elemento con ID "informacion_extra" no encontrado.');
                return;
            }

            const ahora = new Date();
            const opcionesFecha = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            const opcionesHora = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };
            const fechaFormateada = ahora.toLocaleDateString('es-ES', opcionesFecha);
            const horaFormateada = ahora.toLocaleTimeString('es-ES', opcionesHora);
            informacionExtraElement.textContent = `Hoy ${fechaFormateada}, ${horaFormateada} :)`;
            console.log('Información extra actualizada:', informacionExtraElement.textContent);
        })
        .catch(error => {
            console.error('Error al cargar las clases disponibles:', error);
            const clasesDisponiblesElement = document.getElementById('clases_disponibles');
            if (clasesDisponiblesElement) {
                clasesDisponiblesElement.textContent = 'Error al cargar las clases disponibles';
            }
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

function actualizarFechaExpiracionPaquete() {
    fetchData('/perfil/fecha-expiracion-paquete')
        .then(data => {
            const fechaExpiracionPaqueteElement = document.getElementById('fechaExpiracionPaquete');

            if (data.fecha_expiracion) {
                const fechaExpiracion = new Date(data.fecha_expiracion);
                const opciones = { year: 'numeric', month: 'long', day: 'numeric' };

                fechaExpiracionPaqueteElement.textContent = fechaExpiracion.toLocaleDateString(undefined, opciones);
            } else {
                fechaExpiracionPaqueteElement.textContent = 'No hay paquete activo';
            }
        })
        .catch(error => {
            console.error('Error al cargar la fecha de expiración del paquete:', error);
            document.getElementById('fechaExpiracionPaquete').textContent = 'Error al cargar la fecha de expiración del paquete';
        });
}

function actualizarEstadoDelPaquete() {
    fetchData('/perfil/estado-paquete')
        .then(data => {
            const estadoDelPaqueteElement = document.getElementById('estadodelpaquete');
            
            if (data.estado === 'Activo') {
                estadoDelPaqueteElement.textContent = 'Activo';
                estadoDelPaqueteElement.style.color = 'green';
            } else if (data.estado === 'Inactivo') {
                estadoDelPaqueteElement.textContent = 'Inactivo';
                estadoDelPaqueteElement.style.color = 'red';
            } else {
                estadoDelPaqueteElement.textContent = 'Información no disponible';
                estadoDelPaqueteElement.style.color = 'grey';
            }
        })
        .catch(error => {
            console.error('Error al cargar el estado del paquete:', error);
            document.getElementById('estadodelpaquete').textContent = 'Error al cargar el estado del paquete';
            document.getElementById('estadodelpaquete').style.color = 'grey';
        });
}



document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded and parsed');
    actualizarEstadoDelPaquete();
});


document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded and parsed');
    actualizarFechaExpiracionPaquete();
});


