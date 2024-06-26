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
        } else {
            console.error('No se pudo obtener el ID del usuario');
        }
    })
    .catch(error => {
        console.error('Error obteniendo el ID del usuario:', error);
    });
}

function submitRenovacionPaquete() {
    const form = document.getElementById('registerForm6Form');
    const formData = new FormData(form);

    const paquete = document.getElementById('paquete').value;
    const userId = document.getElementById('userId').value;

    // Log de valores para depuración
    console.log('Valores del formulario:', { paquete, userId });

    formData.append('paquete', paquete);
    formData.append('userId', userId);

    // Verificar el contenido de formData
    for (let pair of formData.entries()) {
        console.log(`${pair[0]}: ${pair[1]}`);
    }

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
        if (data.message !== 'Renovación de paquete exitosa') {
            document.getElementById('comprobantePagoError').textContent = data.message;
        } else {
            document.getElementById('registerForm6').style.display = 'none';
            document.getElementById('successMessage').style.display = 'block';

            setTimeout(() => {
                window.location.href = '/profile';
            }, 3000);
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


