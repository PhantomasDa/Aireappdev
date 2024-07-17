
 // Inicializar con el paquete "completo" preseleccionado
 document.addEventListener("DOMContentLoaded", function() {
    selectPackage('completo');
});

function selectOption(modalidad) {
    document.getElementById('modalidad').value = modalidad;

    const options = document.querySelectorAll('.option-container .option');
    options.forEach(option => option.classList.remove('selected'));

    const selectedOption = document.getElementById(`option-${modalidad}`);
    selectedOption.classList.add('selected');

    updatePackageOptions(modalidad);
}
function updatePackageOptions(modalidad) {
    const presencialOptions = document.getElementById('presencialOptions');
    const onlineOptions = document.getElementById('onlineOptions');
    const paqueteTitle = document.getElementById('paqueteTitle');
    
    if (modalidad === 'online') {
        presencialOptions.style.display = 'none';
        onlineOptions.style.display = 'block';
        paqueteTitle.textContent = 'Modalidad Online: Paquete Completo Online';
        selectPackage('Paquete online');
    } else {
        presencialOptions.style.display = 'flex';
        onlineOptions.style.display = 'none';
        paqueteTitle.textContent = 'Selección de Paquete';
        selectPackage('Paquete completo');
    }
}function selectPackage(paquete) {
    document.getElementById('paquete').value = paquete;

    const options = document.querySelectorAll('.option-container .option');
    options.forEach(option => option.classList.remove('selected'));

    const selectedOption = document.getElementById(`option-${paquete}`);
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
        case 'Paquete online':
            packageDetails.innerHTML = `
                <li>8 clases por mes</li>
                <li>Duración de un mes</li>
                <li>Acceso a todas las clases online</li>
            `;
            packageCost.textContent = "Valor: $50";
            break;
        default:
            packageDetails.innerHTML = '';
            packageCost.textContent = '';
    }
}
function submitForm6() {
    const form = document.getElementById('registerForm');
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

    // Convertir la fecha de nacimiento al formato yyyy-mm-dd
    let fechaNacimiento = formData.get('fecha_nacimiento');
    if (fechaNacimiento) {
        const [day, month, year] = fechaNacimiento.split('/');
        fechaNacimiento = `${year}-${month}-${day}`;
        formData.set('fecha_nacimiento', fechaNacimiento);
    }
    console.log('Fecha de nacimiento formateada:', fechaNacimiento); // Depuración

    // Guardar datos localmente
    const formDataObject = {
        paquete,
        comprobante_pago: comprobantePago.name
    };
    localStorage.setItem('step6Data', JSON.stringify(formDataObject));

    // Imprimir datos guardados en localStorage para depuración
    console.log('Datos de step6Data:', formDataObject);

    // Asegurarse de que todos los datos están siendo capturados correctamente
    const step1Data = JSON.parse(localStorage.getItem('step1Data'));
    const step2Data = JSON.parse(localStorage.getItem('step2Data'));
    const step3Data = JSON.parse(localStorage.getItem('step3Data'));
    const step5Data = JSON.parse(localStorage.getItem('step5Data'));

    const allData = {
        ...step1Data,
        ...step2Data,
        ...step3Data,
        ...step5Data,
        ...formDataObject,
    };

    // Asegúrate de convertir la fecha de nuevo antes de enviar al servidor
    if (allData.fecha_nacimiento) {
        const [day, month, year] = allData.fecha_nacimiento.split('/');
        allData.fecha_nacimiento = `${year}-${month}-${day}`;
    }

    const completeFormData = new FormData();
    for (const key in allData) {
        if (allData.hasOwnProperty(key)) {
            completeFormData.append(key, allData[key]);
        }
    }

    if (comprobantePago) {
        completeFormData.append('comprobante_pago', comprobantePago);
    }

    if (step2Data && step2Data.foto_perfil) {
        completeFormData.append('foto_perfil_nombre', step2Data.foto_perfil);
    }

    // Detener la ejecución aquí para inspección
    console.log('Datos a enviar:', allData);


    fetch('/register/complete', {
        method: 'POST',
        body: completeFormData
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
