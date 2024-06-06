// reagendar.js

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
            const fechasReagendarDiv = document.getElementById('fechasReagendar');
            fechasReagendarDiv.innerHTML = '';

            fechas.forEach(fecha => {
                const fechaObj = new Date(fecha.fecha_hora);
                const diaSemana = fechaObj.toLocaleDateString('es-ES', { weekday: 'long' });
                const fechaFormateada = `${diaSemana} ${fechaObj.toLocaleDateString('es-ES')} ${fechaObj.toLocaleTimeString('es-ES')}`;
                fechasReagendarDiv.innerHTML += `
                    <div class="fecha-container">
                        <div>Fecha: <span class="fecha">${fechaFormateada}</span></div>
                        <div>Cupos disponibles: ${fecha.cupos_disponibles}</div>
                        <button onclick="confirmarReagendar(${claseId}, '${fecha.fecha_hora}')">Reagendar</button>
                    </div>
                `;
            });
            document.getElementById('reagendarPopup').style.display = 'block';
        })
        .catch(error => console.error('Error al obtener fechas para reagendar:', error));
}

function confirmarReagendar(claseId, nuevaFecha) {
    fetchData(`/perfil/proximas-clases`)
        .then(clases => {
            const nuevaFechaObj = new Date(nuevaFecha);
            const mismoDia = clases.some(clase => {
                const claseFechaObj = new Date(clase.fecha_hora);
                return claseFechaObj.toDateString() === nuevaFechaObj.toDateString();
            });

            if (mismoDia) {
                alert('No puedes reagendar para el mismo día en que ya tienes una clase.');
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
                alert(data.message);
                cerrarReagendarPopup();
                cargarProximasClases(); // Asegúrate de que esta función esté disponible globalmente o impórtala si es necesario.
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
}function confirmarReagendar(claseId, nuevaFecha) {
    fetchData(`/perfil/proximas-clases`)
        .then(clases => {
            const nuevaFechaObj = new Date(nuevaFecha);
            const mismoDia = clases.some(clase => {
                const claseFechaObj = new Date(clase.fecha_hora);
                return claseFechaObj.toDateString() === nuevaFechaObj.toDateString();
            });

            if (mismoDia) {
                alert('No puedes reagendar para el mismo día en que ya tienes una clase.');
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
                alert(data.message);
                cerrarReagendarPopup();
                cargarProximasClases(); // Asegúrate de que esta función esté disponible globalmente o impórtala si es necesario.
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


