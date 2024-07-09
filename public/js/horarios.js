// horarios.js

// Mostrar modal de error con un mensaje específico
function mostrarErrorFechaModal(mensaje) {
    const errorFechaModal = document.getElementById('errorFechaModal');
    const errorFechaText = document.getElementById('errorFechaText');
    errorFechaText.textContent = mensaje;
    errorFechaModal.style.display = 'block';
}

function cargarHorarios(fecha) {
    if (!validarFechaSeleccionada(fecha)) {
        console.log('Fecha seleccionada no válida.');
        return;
    }

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

    fetchData(`/perfil/horarios?fecha=${fecha}`)
        .then(clases => {
            const horariosContenido = document.getElementById('horariosContenido');
            if (!horariosContenido) {
                console.error('No se pudo encontrar el contenedor de horarios.');
                return;
            }

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

function convertirFechaTextoEspañol(fechaStr) {
    const meses = {
        'enero': 0,
        'febrero': 1,
        'marzo': 2,
        'abril': 3,
        'mayo': 4,
        'junio': 5,
        'julio': 6,
        'agosto': 7,
        'septiembre': 8,
        'octubre': 9,
        'noviembre': 10,
        'diciembre': 11
    };

    const [dia, mesTexto, anio] = fechaStr.split(' de ');
    const mes = meses[mesTexto.toLowerCase()];
    return new Date(parseInt(anio, 10), mes, parseInt(dia, 10));
}

function cerrarErrorFechaModal() {
    const modal = document.getElementById('errorFechaModal');
    modal.style.display = 'none';
}

function convertirFechaEspañol(fechaStr) {
    const [dia, mes, anio] = fechaStr.split('/').map(part => parseInt(part, 10));
    return new Date(anio, mes - 1, dia);
}

function formatearFecha(fecha) {
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const anio = fecha.getFullYear();
    return `${dia}/${mes}/${anio}`;
}

function validarFechaSeleccionada(fechaSeleccionadaStr) {
    const fechaExpiracionPaqueteStr = document.getElementById('fechaExpiracionPaquete').textContent.trim();

    console.log(`Fecha de expiración del paquete (raw): ${fechaExpiracionPaqueteStr}`);
    console.log(`Fecha seleccionada (raw): ${fechaSeleccionadaStr}`);

    const fechaExpiracionPaquete = convertirFechaTextoEspañol(fechaExpiracionPaqueteStr);
    const fechaSeleccionada = new Date(fechaSeleccionadaStr);

    console.log(`Fecha de expiración del paquete: ${fechaExpiracionPaquete}`);
    console.log(`Fecha seleccionada: ${fechaSeleccionada}`);

    if (fechaSeleccionada > fechaExpiracionPaquete) {
        mostrarErrorFechaModal(`No puedes reservar una clase después de la fecha de expiración de tu paquete (${fechaExpiracionPaquete.toLocaleDateString('es-ES')}).`);
        return false;
    }

    return true;
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('botonValidarFecha').addEventListener('click', () => {
        const fechaSeleccionadaStr = document.getElementById('fechaSeleccionada').value;
        const esValida = validarFechaSeleccionada(fechaSeleccionadaStr);
        console.log(`¿Fecha válida?: ${esValida}`);
    });
});
