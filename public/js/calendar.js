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
        // Solicitud para obtener disponibilidad de clases
        const responseDisponibilidad = await fetch(`/profile/disponibilidad-clases?year=${year}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        if (!responseDisponibilidad.ok) {
            throw new Error('Error en la solicitud al servidor para disponibilidad');
        }
        const disponibilidad = await responseDisponibilidad.json();
        // console.log("Disponibilidad obtenida:", disponibilidad);

        // Solicitud para obtener clases agendadas
        // console.log("Obteniendo clases agendadas...");
        const responseAgendadas = await fetch(`/profile/clases-agendadas?year=${year}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        if (!responseAgendadas.ok) {
            throw new Error('Error en la solicitud al servidor para clases agendadas');
        }
        const agendadas = await responseAgendadas.json();
        // console.log("Clases agendadas obtenidas:", agendadas);

        const dias = document.querySelectorAll('.fc-daygrid-day');
        dias.forEach(dia => {
            const dateStr = dia.getAttribute('data-date');
            // console.log("Procesando día:", dateStr);

            // Marcar clases agendadas en azul claro
            const claseAgendada = agendadas.find(d => moment(d.fecha).format('YYYY-MM-DD') === dateStr);
            if (claseAgendada) {
                dia.classList.add('clase-agendada');
                // console.log(`Clase agendada encontrada para ${dateStr}`);
            } else {
                const fecha = disponibilidad.find(d => moment(d.fecha).format('YYYY-MM-DD') === dateStr);
                if (fecha) {
                    if (parseInt(fecha.cupos_disponibles) > 0) {
                        dia.classList.add('cupos-disponibles');
                        // console.log(`Cupos disponibles para ${dateStr}`);
                    } else {
                        dia.classList.add('sin-actividades');
                        // console.log(`Sin cupos disponibles para ${dateStr}`);
                    }
                } else {
                    dia.classList.add('sin-actividades');
                    // console.log(`Sin actividades para ${dateStr}`);
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
            console.log("Fecha seleccionada:", info.dateStr);
            cargarHorarios(info.dateStr);
            document.querySelectorAll('.fc-daygrid-day.selected-date').forEach(date => date.classList.remove('selected-date'));
            info.dayEl.classList.add('selected-date');
        },
        datesSet: async () => {
            console.log("Fechas establecidas en el calendario");
            await marcarDisponibilidad();
        }
    });
    calendar.render();
    // console.log("Calendario inicializado");
}
