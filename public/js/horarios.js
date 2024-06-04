// horarios.js

function cargarHorarios(fecha) {
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
