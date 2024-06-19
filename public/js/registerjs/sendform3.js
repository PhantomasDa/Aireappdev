
function submitForm3() {
    const userId = document.getElementById('userId3').value;
    const pregunta1 = document.getElementById('pregunta1').value;
    const pregunta2 = document.getElementById('pregunta2').value;
    const pregunta3 = document.getElementById('pregunta3').value;
    const pregunta4 = document.getElementById('pregunta4').value;
    const lesiones = document.getElementById('lesiones').value;
    const motivacion = document.getElementById('motivacion').value;

    if (!pregunta1 || !pregunta2 || !pregunta3 || !pregunta4) {
        // Asegúrate de que todas las preguntas sean respondidas
        return;
    }

    fetch('/register/step3', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, pregunta1, pregunta2, pregunta3, pregunta4, lesiones, motivacion })
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => { throw new Error(err.message); });
        }
        return response.json();
    })
    .then(data => {
        if (data.message !== 'Cuestionario y datos relevantes guardados exitosamente') {
            document.getElementById('cuestionarioError').textContent = data.message;
        } else {
            // Avanzar al siguiente paso
            document.getElementById('registerForm3').style.display = 'none';
            document.getElementById('registerForm5').style.display = 'block';
            document.getElementById('userId5').value = document.getElementById('userId3').value; // Asignar el userId al quinto formulario

            // Actualizar barra de progreso
            updateProgressBar(5); // Cambiar a 5 para el quinto paso
            scrollToTop();
        }
    })
    .catch(error => {
        console.error('Error durante el cuestionario:', error);
        document.getElementById('cuestionarioError').textContent = 'Error durante el cuestionario';
    });
}

function selectOption(modalidad) {
    document.getElementById('modalidad').value = modalidad;
    
    const options = document.querySelectorAll('.option');
    options.forEach(option => option.classList.remove('selected'));

    const selectedOption = document.getElementById(`option-${modalidad}`);
    selectedOption.classList.add('selected');
}

function submitForm5() {
    const modalidad = document.getElementById('modalidad').value;
    const userId = document.getElementById('userId5').value;

    if (!modalidad) {
        document.getElementById('modalidadError').textContent = 'Por favor, seleccione una modalidad.';
        return;
    }

    fetch('/register/step5', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, modalidad })
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => { throw new Error(err.message); });
        }
        return response.json();
    })
    .then(data => {
        if (data.message !== 'Modalidad guardada exitosamente') {
            document.getElementById('modalidadError').textContent = data.message;
        } else {
            document.getElementById('registerForm5').style.display = 'none';
            document.getElementById('registerForm6').style.display = 'block';
            document.getElementById('userId6').value = document.getElementById('userId5').value;

            // Actualizar barra de progreso
            updateProgressBar(6); // Cambiar a 6 para el sexto paso
            scrollToTop();
        }
    })
    .catch(error => {
        console.error('Error durante la selección de modalidad:', error);
        document.getElementById('modalidadError').textContent = 'Error durante la selección de modalidad';
    });
}
