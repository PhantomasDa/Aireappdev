// sendform5.js
function submitForm5() {
    const form = document.getElementById('registerForm');
    console.log('Formulario obtenido:', form);

    if (!(form instanceof HTMLFormElement)) {
        console.error('El formulario no es un HTMLFormElement');
        return;
    }

    const formData = new FormData(form);

    const modalidad = formData.get('modalidad');

    if (!modalidad) {
        document.getElementById('modalidadError').textContent = 'Por favor, seleccione una modalidad.';
        return;
    }

    const formDataObject = {
        modalidad
    };
    localStorage.setItem('step5Data', JSON.stringify(formDataObject));

    document.getElementById('registerForm5').style.display = 'none';
    document.getElementById('registerForm6').style.display = 'block';
    updateProgressBar(5);
}

