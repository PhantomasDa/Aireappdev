// horarios.js

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
