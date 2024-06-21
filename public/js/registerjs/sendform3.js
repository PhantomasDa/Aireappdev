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
        document.getElementById('cuestionarioError').textContent = 'Por favor, responda todas las preguntas.';
        return;
    }

    // Mostrar animación de carga y bloquear formulario
    document.getElementById('loading').style.display = 'flex';
    document.getElementById('registerForm3Form').style.pointerEvents = 'none';

    const startTime = Date.now();

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
    })
    .finally(() => {
        const elapsedTime = Date.now() - startTime;
        const remainingTime = 2000 - elapsedTime;

        setTimeout(() => {
            // Ocultar animación de carga y desbloquear formulario
            document.getElementById('loading').style.display = 'none';
            document.getElementById('registerForm3Form').style.pointerEvents = 'auto';
        }, remainingTime > 0 ? remainingTime : 0);
    });
}
