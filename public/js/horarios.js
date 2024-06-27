// horarios.js

// Convertir fecha en formato español (dd/mm/yyyy) a objeto Date
function convertirFechaEspañol(fechaStr) {
    const partes = fechaStr.split('/');
    return new Date(partes[2], partes[1] - 1, partes[0]);
}

// Mostrar modal de error con un mensaje específico
function mostrarErrorFechaModal(mensaje) {
    const errorFechaModal = document.getElementById('errorFechaModal');
    const errorFechaText = document.getElementById('errorFechaText');
    errorFechaText.textContent = mensaje;
    errorFechaModal.style.display = 'block';
}

// Cargar horarios disponibles para una fecha específica
function cargarHorarios(fecha) {
    const estadoPaqueteElement = document.getElementById('estadodelpaquete');
    if (!estadoPaqueteElement) {
        mostrarErrorFechaModal('No se pudo encontrar el estado del paquete.');
        return;
    }

    const estadoPaquete = estadoPaqueteElement.textContent.trim();
    if (estadoPaquete !== 'Activo') {
        mostrarErrorFechaModal('Tu paquete no está activo. No puedes reservar ninguna clase.');
        return;
    }

    const fechaExpiracionPaqueteElement = document.getElementById('fechaExpiracionPaquete');
    if (!fechaExpiracionPaqueteElement) {
        mostrarErrorFechaModal('No se pudo encontrar la fecha de expiración del paquete.');
        return;
    }

    const clasesDisponiblesElement = document.getElementById('clases_disponibles');
    if (!clasesDisponiblesElement) {
        mostrarErrorFechaModal('No se pudo encontrar el número de clases disponibles.');
        return;
    }

    const clasesDisponibles = parseInt(clasesDisponiblesElement.textContent.trim(), 10);
    if (clasesDisponibles === 0) {
        mostrarErrorFechaModal('Lo sentimos, no tienes clases disponibles. Te recomendamos comprar otro paquete.');
        return;
    }

    const fechaExpiracionPaqueteStr = fechaExpiracionPaqueteElement.textContent.trim();
    const fechaExpiracionPaquete = convertirFechaEspañol(fechaExpiracionPaqueteStr);
    const fechaSolicitada = new Date(fecha);

    if (fechaSolicitada > fechaExpiracionPaquete) {
        mostrarErrorFechaModal(`No puedes reservar una clase después de la fecha de expiración de tu paquete (${fechaExpiracionPaquete.toLocaleDateString('es-ES')}).`);
        return;
    }

    fetchData(`/perfil/horarios?fecha=${fecha}`)
        .then(clases => {
            const horariosContenido = document.getElementById('horariosContenido');
            horariosContenido.innerHTML = clases.map(clase => {
                const fechaClase = new Date(clase.fecha_hora);
                const diaSemana = fechaClase.toLocaleDateString('es-ES', { weekday: 'long' });
                const fechaFormateada = `${diaSemana} ${fechaClase.toLocaleDateString('es-ES')} ${fechaClase.toLocaleTimeString('es-ES')}`;
                return `
                    <div class="fecha-container">
                        <div>Fecha: <span class="fecha">${fechaFormateada}</span></div>
                        <div>Cupos disponibles: ${clase.cupos_disponibles}</div>
                        <button class="my-button-reservas" onclick="reservarCupo(${clase.id}, '${fechaFormateada}')">Reservar Cupo</button>
                    </div>
                `;
            }).join('');
            document.getElementById('horariosPopup').classList.add('active');
        })
        .catch(error => console.error('Error al cargar los horarios:', error));
}


function cerrarHorariosPopup() {
    document.getElementById('horariosPopup').classList.remove('active');
}

function convertirFechaEspañol(fechaStr) {
    const meses = {
        'enero': '01',
        'febrero': '02',
        'marzo': '03',
        'abril': '04',
        'mayo': '05',
        'junio': '06',
        'julio': '07',
        'agosto': '08',
        'septiembre': '09',
        'octubre': '10',
        'noviembre': '11',
        'diciembre': '12'
    };

    const partes = fechaStr.toLowerCase().split(' de ');
    if (partes.length === 3) {
        const dia = partes[0];
        const mes = meses[partes[1]];
        const anio = partes[2];
        return new Date(`${anio}-${mes}-${dia}`);
    }
    return null;
}

function mostrarErrorFechaModal(mensaje) {
    const modal = document.getElementById('errorFechaModal');
    const errorText = document.getElementById('errorFechaText');
    errorText.textContent = mensaje;
    modal.style.display = 'block';
}

function cerrarErrorFechaModal() {
    const modal = document.getElementById('errorFechaModal');
    modal.style.display = 'none';
}
