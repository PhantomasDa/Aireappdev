document.addEventListener('DOMContentLoaded', () => {
    initPage();
});

function initPage() {
    actualizarClasesDisponibles();
    cargarProximasClases();
    cargarNombreUsuario();
    inicializarCalendario();
}

async function marcarDisponibilidad() {
    const year = new Date().getFullYear();
    try {
        const responseDisponibilidad = await fetch(`/perfil/disponibilidad-clases?year=${year}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        if (!responseDisponibilidad.ok) {
            throw new Error('Error en la solicitud al servidor para disponibilidad');
        }
        const disponibilidad = await responseDisponibilidad.json();

        const responseAgendadas = await fetch(`/perfil/clases-agendadas?year=${year}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        if (!responseAgendadas.ok) {
            throw new Error('Error en la solicitud al servidor para clases agendadas');
        }
        const agendadas = await responseAgendadas.json();

        const dias = document.querySelectorAll('.fc-daygrid-day');
        dias.forEach(dia => {
            const dateStr = dia.getAttribute('data-date');
            const claseAgendada = agendadas.find(d => moment(d.fecha).format('YYYY-MM-DD') === dateStr);
            if (claseAgendada) {
                dia.classList.add('clase-agendada');
            } else {
                const fecha = disponibilidad.find(d => moment(d.fecha).format('YYYY-MM-DD') === dateStr);
                if (fecha) {
                    if (parseInt(fecha.cupos_disponibles) > 0) {
                        dia.classList.add('cupos-disponibles');
                    } else {
                        dia.classList.add('sin-actividades');
                    }
                } else {
                    dia.classList.add('sin-actividades');
                }
            }
        });
    } catch (error) {
        console.error('Error obteniendo disponibilidad de clases:', error);
    }
}

async function inicializarCalendario() {
    const calendarEl = document.getElementById('calendario');
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'es',
        validRange: {
            start: new Date()
        },
        initialDate: new Date(),
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: ''
        },
        buttonText: {
            today: 'Hoy'
        },
        dateClick: (info) => {
            manejarClickEnFecha(info.dateStr, info.dayEl);
        },
        datesSet: async () => {
            await marcarDisponibilidad();
        }
    });
    calendar.render();
}

function manejarClickEnFecha(fecha, dayEl) {
    // Convertir la fecha seleccionada a un formato sin horas para evitar problemas de zona horaria
    const fechaSeleccionada = new Date(fecha);
    fechaSeleccionada.setDate(fechaSeleccionada.getDate() + 1); // Sumar un día
    fechaSeleccionada.setHours(0, 0, 0, 0);

    console.log(`Fecha seleccionada (ajustada): ${fechaSeleccionada.toISOString().split('T')[0]}`);
    
    fetchData(`/perfil/proximas-clases`)
        .then(clases => {
            console.log('Clases próximas obtenidas:', clases);
            const claseEnFecha = clases.find(clase => {
                const fechaClase = new Date(clase.fecha_hora);
                fechaClase.setHours(0, 0, 0, 0);
                // Ajustar la comparación de fechas para ignorar la hora
                const esMismaFecha = fechaClase.getTime() === fechaSeleccionada.getTime();
                console.log(`Comparando ${fechaClase.toISOString().split('T')[0]} con ${fechaSeleccionada.toISOString().split('T')[0]}: ${esMismaFecha}`);
                return esMismaFecha;
            });

            if (claseEnFecha) {
                console.log(`Clase encontrada en la fecha ${fecha}:`, claseEnFecha);
                mostrarConfirmacionReagendar(claseEnFecha.id, fecha);
            } else {
                console.log(`No hay clase en la fecha ${fecha}, cargando horarios disponibles...`);
                cargarHorarios(fecha);
            }

            document.querySelectorAll('.fc-daygrid-day.selected-date').forEach(date => date.classList.remove('selected-date'));
            dayEl.classList.add('selected-date');
        })
        .catch(error => console.error('Error al verificar clase en la fecha seleccionada:', error));
}

function mostrarConfirmacionReagendar(claseId, nuevaFecha) {
    claseIdGlobal = claseId;
    nuevaFechaGlobal = nuevaFecha;

    document.getElementById('confirmacionReagendarMensaje').innerHTML = `
        ¿Deseas reagendar tu clase actual al <span class="fecha">${nuevaFecha}</span>?
    `;

    // Mostrar el popup
    document.getElementById('confirmacionReagendarPopup').style.display = 'block';

    // Inicializar el calendario dentro del popup
    inicializarCalendarioReagendar();
}


function inicializarCalendarioReagendar() {
    const calendarEl = document.getElementById('calendarioReagendar');
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'es',
        validRange: {
            start: new Date()
        },
        initialDate: new Date(),
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: ''
        },
        buttonText: {
            today: 'Hoy'
        },
        dateClick: (info) => {
            // Actualizar la fecha seleccionada globalmente
            nuevaFechaGlobal = info.dateStr;
            console.log(`Nueva fecha seleccionada para reagendar: ${nuevaFechaGlobal}`);
            
            // Mostrar los horarios disponibles para la nueva fecha seleccionada
            cargarHorariosDisponibles(nuevaFechaGlobal);
        },
        datesSet: async () => {
            await marcarDisponibilidadReagendar();
        }
    });
    calendar.render();
}

async function marcarDisponibilidadReagendar() {
    const year = new Date().getFullYear();
    try {
        const responseDisponibilidad = await fetch(`/perfil/disponibilidad-clases?year=${year}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        if (!responseDisponibilidad.ok) {
            throw new Error('Error en la solicitud al servidor para disponibilidad');
        }
        const disponibilidad = await responseDisponibilidad.json();

        const responseAgendadas = await fetch(`/perfil/clases-agendadas?year=${year}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        if (!responseAgendadas.ok) {
            throw new Error('Error en la solicitud al servidor para clases agendadas');
        }
        const agendadas = await responseAgendadas.json();

        const dias = document.querySelectorAll('#calendarioReagendar .fc-daygrid-day');
        dias.forEach(dia => {
            const dateStr = dia.getAttribute('data-date');
            const claseAgendada = agendadas.find(d => moment(d.fecha).format('YYYY-MM-DD') === dateStr);
            if (claseAgendada) {
                dia.classList.add('clase-agendada');
            } else {
                const fecha = disponibilidad.find(d => moment(d.fecha).format('YYYY-MM-DD') === dateStr);
                if (fecha) {
                    if (parseInt(fecha.cupos_disponibles) > 0) {
                        dia.classList.add('cupos-disponibles');
                    } else {
                        dia.classList.add('sin-actividades');
                    }
                } else {
                    dia.classList.add('sin-actividades');
                }
            }
        });
    } catch (error) {
        console.error('Error obteniendo disponibilidad de clases:', error);
    }
}

function cargarHorariosDisponibles(fecha) {
    fetchData(`/perfil/horarios?fecha=${fecha}`)
        .then(clases => {
            const horariosDisponiblesEl = document.getElementById('horariosDisponibles');
            if (!horariosDisponiblesEl) {
                console.error('No se pudo encontrar el contenedor de horarios disponibles.');
                return;
            }

            horariosDisponiblesEl.innerHTML = clases.map(clase => {
                const fechaClase = new Date(clase.fecha_hora);
                const diaSemana = fechaClase.toLocaleDateString('es-ES', { weekday: 'long' });
                const fechaFormateada = `${diaSemana} ${fechaClase.toLocaleDateString('es-ES')} ${fechaClase.toLocaleTimeString('es-ES')}`;
                return `
                    <div class="fecha-container">
                        <div>Fecha: <span class="fecha">${fechaFormateada}</span></div>
                        <div>Cupos disponibles: ${clase.cupos_disponibles}</div>
                        <button class="my-button-reservas" onclick="reagendarCupo(${clase.id}, '${fechaFormateada}')">Reagendar Horario</button>
                    </div>
                `;
            }).join('');
        })
        .catch(error => console.error('Error al cargar los horarios:', error));
}
function convertirFecha(fechaStr) {
    const partesFechaHora = fechaStr.split(' ');
    const partesFecha = partesFechaHora[1].split('/');
    const partesHora = partesFechaHora[2].split(':');
    const dia = parseInt(partesFecha[0], 10);
    const mes = parseInt(partesFecha[1], 10) - 1; // Meses en JavaScript van de 0 a 11
    const anio = parseInt(partesFecha[2], 10);
    const horas = parseInt(partesHora[0], 10);
    const minutos = parseInt(partesHora[1], 10);
    const segundos = partesHora.length === 3 ? parseInt(partesHora[2], 10) : 0;
    return new Date(anio, mes, dia, horas, minutos, segundos);
}
function mostrarExitoReagendarPopup() {
    const exitoReagendarPopup = document.getElementById('exitoReagendarPopup');
    if (exitoReagendarPopup) {
        exitoReagendarPopup.style.display = 'block';
    }

    // Event listener para el botón de cerrar (ícono de cerrar)
    const cerrarExitoReagendarPopup = document.getElementById('cerrarExitoReagendarPopup');
    if (cerrarExitoReagendarPopup) {
        cerrarExitoReagendarPopup.addEventListener('click', () => {
            exitoReagendarPopup.style.display = 'none';
            location.reload(); // Recargar la página
        });
    }

    // Event listener para el botón de cerrar (botón de cerrar)
    const cerrarExitoReagendarButton = document.getElementById('cerrarExitoReagendarButton');
    if (cerrarExitoReagendarButton) {
        cerrarExitoReagendarButton.addEventListener('click', () => {
            exitoReagendarPopup.style.display = 'none';
            location.reload(); // Recargar la página
        });
    }
}
function cerrarExitoReagendarPopup() {
    const exitoReagendarPopup = document.getElementById('exitoReagendarPopup');
    if (exitoReagendarPopup) {
        exitoReagendarPopup.style.display = 'none'; // Cerrar el popup
    }
    location.reload(); // Recargar la página
}
function reagendarCupo(nuevaClaseId, nuevaFecha) {
    const claseActualId = claseIdGlobal;

    if (!claseActualId || !nuevaClaseId || !nuevaFecha) {
        console.error('Datos incompletos para reagendar:', { claseActualId, nuevaClaseId, nuevaFecha });
        alert('Datos incompletos para reagendar. Por favor, inténtalo de nuevo.');
        return;
    }

    console.log(`Nueva fecha seleccionada para reagendar: ${nuevaFecha}`);

    // Convertir nuevaFecha a un objeto Date utilizando la función auxiliar
    const nuevaFechaObj = convertirFecha(nuevaFecha);
    if (isNaN(nuevaFechaObj.getTime())) {
        console.error('Fecha inválida:', nuevaFecha);
        alert('Fecha inválida. Por favor, inténtalo de nuevo.');
        return;
    }

    // Formatear la fecha al formato yyyy-mm-dd hh:mm:ss
    const year = nuevaFechaObj.getFullYear();
    const month = String(nuevaFechaObj.getMonth() + 1).padStart(2, '0');
    const day = String(nuevaFechaObj.getDate()).padStart(2, '0');
    const hours = String(nuevaFechaObj.getHours()).padStart(2, '0');
    const minutes = String(nuevaFechaObj.getMinutes()).padStart(2, '0');
    const seconds = String(nuevaFechaObj.getSeconds()).padStart(2, '0');
    const nuevaFechaFormatted = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

    console.log(`Fecha formateada para enviar: ${nuevaFechaFormatted}`);

    fetch('/perfil/reagendar', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        body: JSON.stringify({ claseId: claseActualId, nuevaClaseId, nuevaFecha: nuevaFechaFormatted })
    })
    .then(response => {
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('La ruta de reagendamiento no se encontró (404)');
            }
            return response.json().then(error => { throw new Error(error.message); });
        }
        return response.json();
    })
    .then(data => {
        console.log('Clase reagendada con éxito:', data);
        cerrarModal('confirmacionReagendarPopup');
        mostrarExitoReagendarPopup();
        cargarProximasClases(); // Recargar las próximas clases
        marcarDisponibilidad(); // Actualizar la disponibilidad en el calendario
    })
    .catch(error => {
        console.error('Error al reagendar la clase:', error);
        alert('Error al reagendar la clase: ' + error.message);
    });
}

// Inicializar los event listeners del popup de éxito solo una vez
document.addEventListener('DOMContentLoaded', () => {
    const cerrarExitoReagendarPopup = document.getElementById('cerrarExitoReagendarPopup');
    if (cerrarExitoReagendarPopup) {
        cerrarExitoReagendarPopup.addEventListener('click', () => {
            document.getElementById('exitoReagendarPopup').style.display = 'none';
            location.reload(); // Recargar la página
        });
    }

    const cerrarExitoReagendarButton = document.getElementById('cerrarExitoReagendarButton');
    if (cerrarExitoReagendarButton) {
        cerrarExitoReagendarButton.addEventListener('click', () => {
            document.getElementById('exitoReagendarPopup').style.display = 'none';
            location.reload(); // Recargar la página
        });
    }
});


function cerrarExitoReagendarPopupFunction() {
    const exitoReagendarPopup = document.getElementById('exitoReagendarPopup');
    if (exitoReagendarPopup) {
        exitoReagendarPopup.style.display = 'none';
    }
    location.reload(); // Recargar la página
}



function cerrarModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        modal.remove();
    }
}
