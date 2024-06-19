// reagendar.js

let claseIdGlobal;
let nuevaFechaGlobal;
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
            console.log('Fechas obtenidas del servidor:', fechas);

            const fechasReagendarDiv = document.getElementById('fechasReagendar');
            fechasReagendarDiv.innerHTML = '';

            // Filtrar las fechas para mostrar solo aquellas desde el día siguiente en adelante
            const fechaActual = new Date();
            fechaActual.setHours(0, 0, 0, 0); // Resetear las horas para comparar solo fechas

            const fechasFuturas = fechas.filter(fecha => {
                const fechaClase = new Date(fecha.fecha_hora);
                return fechaClase > fechaActual; // Solo fechas futuras, excluyendo el día actual
            });
            console.log('Fechas filtradas (futuras excluyendo el mismo día):', fechasFuturas);

            if (fechasFuturas.length === 0) {
                fechasReagendarDiv.innerHTML = '<p>No hay fechas disponibles para reagendar en este momento.</p>';
            } else {
                fechasFuturas.forEach(fecha => {
                    const fechaObj = new Date(fecha.fecha_hora);
                    const diaSemana = fechaObj.toLocaleDateString('es-ES', { weekday: 'long' });
                    const fechaFormateada = `${diaSemana} ${fechaObj.toLocaleDateString('es-ES')} ${fechaObj.toLocaleTimeString('es-ES')}`;
                    fechasReagendarDiv.innerHTML += `
                        <div class="fecha-container">
                            <div>Fecha: <span class="fecha">${fechaFormateada}</span></div>
                            <div>Cupos disponibles: ${fecha.cupos_disponibles}</div>
                            <button class="reservar-clase-button" onclick="mostrarConfirmacionReagendar(${claseId}, '${fecha.fecha_hora}')">Reagendar</button>
                        </div>
                    `;
                });
            }

            fetchData(`/perfil/clases-disponibles`)
                .then(data => {
                    const clasesDisponibles = data.clases_disponibles;
                    document.getElementById('clasesDisponibles').innerHTML = `Reservas disponibles: ${clasesDisponibles}`;
                })
                .catch(error => console.error('Error al obtener las reservas disponibles:', error));

            document.getElementById('reagendarPopup').style.display = 'block';
        })
        .catch(error => console.error('Error al obtener fechas para reagendar:', error));
}


function mostrarConfirmacionReagendar(claseId, nuevaFecha) {
    claseIdGlobal = claseId;
    nuevaFechaGlobal = nuevaFecha;

    fetchData(`/perfil/proximas-clases`)
        .then(clases => {
            const claseActual = clases.find(clase => clase.id === claseId);
            if (claseActual) {
                const fechaActual = new Date(claseActual.fecha_hora);
                const nuevaFechaObj = new Date(nuevaFecha);
                const fechaActualFormateada = `${fechaActual.toLocaleDateString('es-ES')} ${fechaActual.toLocaleTimeString('es-ES')}`;
                const nuevaFechaFormateada = `${nuevaFechaObj.toLocaleDateString('es-ES')} ${nuevaFechaObj.toLocaleTimeString('es-ES')}`;

                document.getElementById('confirmacionReagendarMensaje').innerHTML = `Tu clase actual es el <span class="fecha">${fechaActualFormateada}</span>. 
                ¿Quieres cambiarla al <span class="fecha">${nuevaFechaFormateada}</span>?`;

                document.getElementById('confirmacionReagendarPopup').style.display = 'block';
            }
        })
        .catch(error => console.error('Error al obtener la clase actual para confirmar:', error));
}

function confirmarReagendarDefinitivo() {
    const claseId = claseIdGlobal;
    const nuevaFecha = nuevaFechaGlobal;

    fetchData(`/perfil/proximas-clases`)
        .then(clases => {
            const nuevaFechaObj = new Date(nuevaFecha);
            const mismoDia = clases.some(clase => {
                const claseFechaObj = new Date(clase.fecha_hora);
                return claseFechaObj.toDateString() === nuevaFechaObj.toDateString() && clase.id !== claseId;
            });

            if (mismoDia) {
                alert('No puedes reagendar para el mismo día en que ya tienes otra clase.');
                return;
            }

            // Procede con la solicitud de reagendar si no hay clases el mismo día
            fetch('/perfil/reagendar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                },
                body: JSON.stringify({ claseId, nuevaFecha: nuevaFechaObj.toISOString() })
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(error => { throw new Error(error.message); });
                }
                return response.json();
            })
            .then(data => {
                cerrarConfirmacionReagendarPopup();
                mostrarExitoReagendarPopup();
                cargarProximasClases(); // Asegúrate de que esta función esté disponible globalmente o impórtala si es necesario.

                // Actualiza el número de reservas disponibles
                fetchData(`/perfil/clases-disponibles`)
                    .then(data => {
                        const clasesDisponibles = data.clases_disponibles;
                        document.getElementById('clasesDisponibles').innerHTML = `Reservas disponibles: ${clasesDisponibles}`;
                    })
                    .catch(error => console.error('Error al obtener las reservas disponibles:', error));
            })
            .catch(error => {
                console.error('Error al reagendar la clase:', error);
                alert('Error al reagendar la clase: ' + error.message);
            });
        })
        .catch(error => {
            console.error('Error al verificar las clases del mismo día:', error);
            alert('Error al verificar las clases del mismo día: ' + error.message);
        });
}

function cerrarReagendarPopup() {
    document.getElementById('reagendarPopup').style.display = 'none';
}

function cerrarConfirmacionReagendarPopup() {
    document.getElementById('confirmacionReagendarPopup').style.display = 'none';
}

function mostrarExitoReagendarPopup() {
    document.getElementById('exitoReagendarPopup').style.display = 'block';
}

function cerrarExitoReagendarPopup() {
    document.getElementById('exitoReagendarPopup').style.display = 'none';
    location.reload();
}
