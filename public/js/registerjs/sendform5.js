
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
        packageCost.textContent = "Valor: $50";
        break;
    case 'Paquete completo':
        packageDetails.innerHTML = `
            <li>8 clases por mes</li>
            <li>Duración de un mes</li>
            <li>Acceso a contenido exclusivo online</li>
            <li>Soporte personalizado</li>
        `;
        packageCost.textContent = "Valor: $75";
        break;
    case 'Paquete premium':
        packageDetails.innerHTML = `
            <li>12 clases por mes</li>
            <li>Duración de un mes</li>
            <li>Acceso a contenido exclusivo online</li>
            <li>Soporte personalizado</li>
            <li>Sesiones adicionales de coaching</li>
        `;
        packageCost.textContent = "Valor: $100";
        break;
    default:
        packageDetails.innerHTML = '';
        packageCost.textContent = '';
}
}
function submitForm6() {
    const form = document.getElementById('registerForm'); // Referencia al formulario principal
    console.log('Formulario obtenido:', form); // Depuración

    if (!(form instanceof HTMLFormElement)) {
        console.error('El formulario no es un HTMLFormElement');
        return;
    }

    const formData = new FormData(form);
    
    // Obtener valores de los campos
    const paquete = formData.get('paquete');
    const comprobantePago = document.getElementById('comprobante_pago').files[0];

    // Variable para controlar si hay errores
    let hasError = false;

    // Verificar existencia de elementos de error
    const comprobantePagoErrorElement = document.getElementById('comprobantePagoError');
    const paqueteErrorElement = document.getElementById('paqueteError');

    // Limpiar mensajes de error anteriores
    if (comprobantePagoErrorElement) comprobantePagoErrorElement.textContent = '';
    if (paqueteErrorElement) paqueteErrorElement.textContent = '';

    // Validar el campo 'paquete'
    if (!paquete) {
        if (paqueteErrorElement) paqueteErrorElement.textContent = 'Por favor, seleccione un paquete.';
        hasError = true;
    }

    // Validar el campo 'comprobante_pago'
    if (!comprobantePago) {
        if (comprobantePagoErrorElement) comprobantePagoErrorElement.textContent = 'Por favor, sube una foto o screenshot de tu pago.';
        hasError = true;
    }

    // Si hay errores, no continuar
    if (hasError) {
        return;
    }

    // Guardar datos localmente
    const formDataObject = {
        paquete,
        comprobante_pago: comprobantePago.name
    };
    localStorage.setItem('step6Data', JSON.stringify(formDataObject));

    // Imprimir datos guardados en localStorage para depuración
    console.log('Datos de step6Data:', formDataObject);

    // Enviar todos los datos al servidor
    submitFinalForm();
}


function submitFinalForm() {
    const step1Data = JSON.parse(localStorage.getItem('step1Data'));
    const step2Data = JSON.parse(localStorage.getItem('step2Data'));
    const step3Data = JSON.parse(localStorage.getItem('step3Data'));
    const step5Data = JSON.parse(localStorage.getItem('step5Data'));
    const step6Data = JSON.parse(localStorage.getItem('step6Data'));

    console.log('Datos de step1Data:', step1Data);
    console.log('Datos de step2Data:', step2Data);
    console.log('Datos de step3Data:', step3Data);
    console.log('Datos de step5Data:', step5Data);
    console.log('Datos de step6Data:', step6Data);

    // Convertir fecha_nacimiento al formato ISO 8601
    if (step1Data.fecha_nacimiento) {
        const [day, month, year] = step1Data.fecha_nacimiento.split('/');
        step1Data.fecha_nacimiento = `${year}-${month}-${day}`;
    }

    const allData = {
        ...step1Data,
        ...step2Data,
        ...step3Data,
        ...step5Data,
        ...step6Data,
    };

    console.log('Datos enviados al servidor:', allData); // Depuración

    const formData = new FormData();

    for (const key in allData) {
        if (allData.hasOwnProperty(key)) {
            formData.append(key, allData[key]);
        }
    }

    const comprobantePagoFile = document.getElementById('comprobante_pago').files[0];
    if (comprobantePagoFile) {
        formData.append('comprobante_pago', comprobantePagoFile);
    }

    fetch('/register/complete', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => { throw new Error(err.message); });
        }
        return response.json();
    })
    .then(data => {
        if (data.message !== 'Registro completado exitosamente') {
            const errorFinalElement = document.getElementById('errorFinal');
            if (errorFinalElement) {
                errorFinalElement.textContent = data.message;
            } else {
                console.error('El elemento errorFinal no existe en el HTML');
            }
        } else {
            // Redirigir al usuario a la página de login
            window.location.href = '/login';
        }
    })
    .catch(error => {
        const errorFinalElement = document.getElementById('errorFinal');
        if (errorFinalElement) {
            errorFinalElement.textContent = `Error: ${error.message}`;
        } else {
            console.error('El elemento errorFinal no existe en el HTML');
        }
    });
}


