// sendform3.js
function submitForm3() {
    const form = document.getElementById('registerForm'); // Referencia al formulario principal
    console.log('Formulario obtenido:', form); // Depuración

    if (!(form instanceof HTMLFormElement)) {
        console.error('El formulario no es un HTMLFormElement');
        return;
    }

    const formData = new FormData(form);
    
    // Realiza validaciones aquí...
    const pregunta1 = formData.get('pregunta1');
    const pregunta2 = formData.get('pregunta2');
    const pregunta3 = formData.get('pregunta3');
    const pregunta4 = formData.get('pregunta4');
    const lesiones = formData.get('lesiones') || ''; // Asegurar que lesiones esté presente
    const motivacion = formData.get('motivacion') || ''; // Asegurar que motivacion esté presente

    if (!pregunta1 || !pregunta2 || !pregunta3 || !pregunta4) {
        document.getElementById('cuestionarioError').textContent = 'Por favor, responda todas las preguntas.';
        return;
    }

    // Guardar datos localmente
    const formDataObject = {
        pregunta1,
        pregunta2,
        pregunta3,
        pregunta4,
        lesiones,
        motivacion
    };
    localStorage.setItem('step3Data', JSON.stringify(formDataObject));

    // Avanzar al siguiente paso
    document.getElementById('registerForm3').style.display = 'none';
    document.getElementById('registerForm5').style.display = 'block';
    updateProgressBar(4);
}
