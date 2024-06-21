function submitForm5() {
    const modalidad = document.getElementById('modalidad').value;
    const userId = document.getElementById('userId5').value;

    if (!modalidad) {
        document.getElementById('modalidadError').textContent = 'Por favor, seleccione una modalidad.';
        return;
    }

    console.log({ userId, modalidad });

    // Mostrar animación de carga y bloquear formulario
    document.getElementById('loading').style.display = 'flex';
    document.getElementById('registerForm5Form').style.pointerEvents = 'none';

    const startTime = Date.now();

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
    })
    .finally(() => {
        const elapsedTime = Date.now() - startTime;
        const remainingTime = 2000 - elapsedTime;

        setTimeout(() => {
            // Ocultar animación de carga y desbloquear formulario
            document.getElementById('loading').style.display = 'none';
            document.getElementById('registerForm5Form').style.pointerEvents = 'auto';
        }, remainingTime > 0 ? remainingTime : 0);
    });
}



function selectOption(modalidad) {
    document.getElementById('modalidad').value = modalidad;

    const options = document.querySelectorAll('.option');
    options.forEach(option => option.classList.remove('selected'));

    const selectedOption = document.getElementById(`option-${modalidad}`);
    selectedOption.classList.add('selected');
}
