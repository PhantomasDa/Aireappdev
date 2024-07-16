// sendform5.js
function submitForm5() {
    const form = document.getElementById('registerForm'); // Referencia al formulario principal
    console.log('Formulario obtenido:', form); // Depuración

    if (!(form instanceof HTMLFormElement)) {
        console.error('El formulario no es un HTMLFormElement');
        return;
    }

    const formData = new FormData(form);

    // Realiza validaciones aquí...
    const modalidad = formData.get('modalidad');

    if (!modalidad) {
        document.getElementById('modalidadError').textContent = 'Por favor, seleccione una modalidad.';
        return;
    }

    // Guardar datos localmente
    const formDataObject = {
        modalidad
    };
    localStorage.setItem('step5Data', JSON.stringify(formDataObject));

    // Avanzar al siguiente paso
    document.getElementById('registerForm5').style.display = 'none';
    document.getElementById('registerForm6').style.display = 'block';
    updateProgressBar(5);
}

function selectOption(modalidad) {
    document.getElementById('modalidad').value = modalidad;

    const options = document.querySelectorAll('.option');
    options.forEach(option => option.classList.remove('selected'));

    const selectedOption = document.getElementById(`option-${modalidad}`);
    selectedOption.classList.add('selected');
}
