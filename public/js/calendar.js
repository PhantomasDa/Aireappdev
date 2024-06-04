document.addEventListener('DOMContentLoaded', () => {
    initPage();
});

function initPage() {
    actualizarClasesDisponibles();
    cargarProximasClases();
    cargarNombreUsuario();
    inicializarCalendario();
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
            cargarHorarios(info.dateStr);
            document.querySelectorAll('.fc-daygrid-day.selected-date').forEach(date => date.classList.remove('selected-date'));
            info.dayEl.classList.add('selected-date');
        },
        datesSet: async (info) => {
            await marcarDisponibilidad(info.start, info.end);
        }
    });
    calendar.render();
}

async function marcarDisponibilidad(start, end) {
    const month = start.getMonth() + 1;
    const year = start.getFullYear();
    try {
        const response = await fetch(`/disponibilidad-clases?month=${month}&year=${year}`, {
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
