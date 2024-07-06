document.addEventListener("DOMContentLoaded", function() {
    selectPackage('Paquete completo');
    obtenerUserId();
});

function abrirReservaPaquetePopup() {
    document.getElementById('reservaPaquetePopup').style.display = 'block';
}

function cerrarReservaPaquetePopup() {
    document.getElementById('reservaPaquetePopup').style.display = 'none';
}

function abrirPopup(message) {
    const popup = document.getElementById('popup');
    document.getElementById('popupMessage').innerText = message;
    popup.style.display = 'block';
    popup.style.left = '50%';
    popup.style.top = '50%';
    popup.style.transform = 'translate(-50%, -50%)';
}

function cerrarPopup() {
    document.getElementById('popup').style.display = 'none';
    window.location.reload(); // Recargar la página
}

function obtenerUserId() {
    fetch('/profile/user-id', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.userId) {
            document.getElementById('userId').value = data.userId;
            console.log('ID del usuario:', data.userId);

            // Ocultar el botón de renovación si hay una renovación activa
            if (data.renovacionActiva) {
                document.getElementById('renovarPaqueteBtn').style.display = 'none';
            }
        } else {
            console.error('No se pudo obtener el ID del usuario');
        }
    })
    .catch(error => {
        console.error('Error obteniendo el ID del usuario:', error);
    });
}

function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}


function submitRenovacionPaquete() {
    const form = document.getElementById('registerForm6Form');
    const formData = new FormData(form);

    const paquete = document.getElementById('paquete').value;
    const userId = document.getElementById('userId').value;

    const fechaCompra = new Date();
    const fechaActivacion = new Date(fechaCompra);
    fechaActivacion.setDate(fechaActivacion.getDate() + 1);
    const fechaExpiracion = new Date(fechaActivacion);
    fechaExpiracion.setMonth(fechaExpiracion.getMonth() + 1);

    formData.append('paquete', paquete);
    formData.append('userId', userId);
    formData.append('fechaActivacion', formatDate(fechaActivacion));
    formData.append('fechaExpiracion', formatDate(fechaExpiracion));

    // Log de valores para depuración
    console.log('Valores del formulario:', { paquete, userId, fechaActivacion: formatDate(fechaActivacion), fechaExpiracion: formatDate(fechaExpiracion) });

    fetch('/profile/renovacion-paquete', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        console.log('Estado de la respuesta:', response.status, response.statusText);
        return response.json().then(data => {
            if (!response.ok) {
                console.log('Error del servidor:', data);
                throw new Error(data.message);
            }
            return data;
        });
    })
    .then(data => {
        console.log('Respuesta del servidor:', data);
        if (data.message !== 'Renovación de paquete registrada exitosamente') {
            document.getElementById('comprobantePagoError').textContent = data.message;
        } else {
            document.getElementById('registerForm6').style.display = 'none';

            const message = `Felicidades, has solicitado tu paquete desde ${formatDate(fechaActivacion)} hasta ${formatDate(fechaExpiracion)}`;
            abrirPopup(message);

            // Guardar el indicador de paquete renovado en localStorage
            localStorage.setItem('lastPurchaseTime', new Date().getTime());

            // Deshabilitar el botón de renovación
            const botonRenovar = document.getElementById('reservaPaqueteBtn');
            botonRenovar.disabled = true;
            setTimeout(() => {
                botonRenovar.disabled = false;
            }, 5 * 60 * 1000);
        }
    })
    .catch(error => {
        console.error('Error durante la renovación del paquete:', error);
        document.getElementById('comprobantePagoError').textContent = 'Error durante la renovación del paquete';
    });
}


function selectPackage(paquete) {
    const paqueteInput = document.getElementById('paquete');
    const selectedOption = document.getElementById(`option-${paquete}`);

    // Verificar si los elementos existen
    if (!paqueteInput) {
        console.error('No se encontró el input hidden para el paquete.');
        return;
    }

    if (!selectedOption) {
        console.error(`No se encontró el elemento para el paquete: ${paquete}`);
        return;
    }

    paqueteInput.value = paquete;

    const options = document.querySelectorAll('.option');
    options.forEach(option => option.classList.remove('selected'));

    selectedOption.classList.add('selected');

    const packageDetails = document.getElementById('packageDetails');
    const packageCost = document.getElementById('packageCost');

    switch(paquete) {
        case 'Paquete básico':
            packageDetails.innerHTML = `
                <li>4 clases por mes</li>
                <li>Duración de un mes</li>
                <li>Acceso a contenido exclusivo online</li>
            `;
            packageCost.textContent = "Valor: $30";
            break;
        case 'Paquete completo':
            packageDetails.innerHTML = `
                <li>8 clases por mes</li>
                <li>Duración de un mes</li>
                <li>Acceso a contenido exclusivo online</li>
                <li>Soporte personalizado</li>
            `;
            packageCost.textContent = "Valor: $50";
            break;
        case 'Paquete premium':
            packageDetails.innerHTML = `
                <li>12 clases por mes</li>
                <li>Duración de un mes</li>
                <li>Acceso a contenido exclusivo online</li>
                <li>Soporte personalizado</li>
                <li>Sesiones adicionales de coaching</li>
            `;
            packageCost.textContent = "Valor: $70";
            break;
        default:
            packageDetails.innerHTML = '';
            packageCost.textContent = '';
    }
}
