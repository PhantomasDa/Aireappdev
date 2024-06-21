
 // Inicializar con el paquete "completo" preseleccionado
 document.addEventListener("DOMContentLoaded", function() {
    selectPackage('completo');
});


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
function submitForm6() {
    const form = document.getElementById('registerForm6Form');
    const formData = new FormData(form);
    const showBilling = document.getElementById('showBilling').checked;

    const paquete = document.getElementById('paquete').value;
    formData.append('paquete', paquete);

    if (showBilling) {
        const cedula_ruc = document.getElementById('cedula_ruc').value;
        const direccion1 = document.getElementById('direccion1').value;
        const direccion2 = document.getElementById('direccion2').value;
        const telefono = document.getElementById('telefono_billing').value;
        const nombre_completo = document.getElementById('nombre_completo').value;
        const razon_social = document.getElementById('razon_social').value;
        const otro_dato = document.getElementById('otro_dato').value;

        formData.append('cedula_ruc', cedula_ruc);
        formData.append('direccion1', direccion1);
        formData.append('direccion2', direccion2);
        formData.append('telefono', telefono);
        formData.append('nombre_completo', nombre_completo);
        formData.append('razon_social', razon_social);
        formData.append('otro_dato', otro_dato);
    }

    // Mostrar animación de carga y bloquear formulario
    document.getElementById('loading').style.display = 'flex';
    form.style.pointerEvents = 'none';

    const startTime = Date.now();

    fetch('/register/step6', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => { 
                console.log('Error del servidor:', err);
                throw new Error(err.message); 
            });
        }
        return response.json();
    })
    .then(data => {
        if (data.message !== 'Verificación de pago exitosa') {
            document.getElementById('comprobantePagoError').textContent = data.message;
        } else {
            document.getElementById('registerForm6').style.display = 'none';
            document.getElementById('successMessage').style.display = 'block';

            setTimeout(() => {
                window.location.href = '/login';
            }, 3000);
        }
    })
    .catch(error => {
        console.error('Error durante la verificación del pago:', error);
        document.getElementById('comprobantePagoError').textContent = 'Error durante la verificación del pago';
    })
    .finally(() => {
        const elapsedTime = Date.now() - startTime;
        const remainingTime = 2000 - elapsedTime;

        setTimeout(() => {
            // Ocultar animación de carga y desbloquear formulario
            document.getElementById('loading').style.display = 'none';
            form.style.pointerEvents = 'auto';
        }, remainingTime > 0 ? remainingTime : 0);
    });
}
