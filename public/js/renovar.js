document.addEventListener('DOMContentLoaded', function() {
    verificarClasesDisponibles();
});

function verificarClasesDisponibles() {
    fetch('/profile/clases-disponibles', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}` // O el método que uses para almacenar el token
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.clases_disponibles !== undefined) {
            const clasesDisponibles = data.clases_disponibles;
            const botonRenovar = document.getElementById('reservaPaqueteBtn');
            if (clasesDisponibles < 3) {
                botonRenovar.style.display = 'block';
            } else {
                botonRenovar.style.display = 'none';
            }
        } else {
            console.error('No se pudo obtener el número de clases disponibles');
        }
    })
    .catch(error => {
        console.error('Error obteniendo el número de clases disponibles:', error);
    });
}
