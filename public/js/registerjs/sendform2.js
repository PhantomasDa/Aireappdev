function submitForm2() {
    const form = document.getElementById('registerForm2Form');
    const formData = new FormData(form);

    // Mostrar animación de carga y bloquear formulario
    document.getElementById('loading').style.display = 'flex';
    form.style.pointerEvents = 'none';

    const startTime = Date.now();

    fetch('/register/step2', {
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
        if (data.message !== 'Foto de perfil actualizada exitosamente') {
            document.getElementById('fotoPerfilError').textContent = data.message;
        } else {
            // Avanzar al siguiente paso
            document.getElementById('registerForm2').style.display = 'none';
            document.getElementById('registerForm3').style.display = 'block';
            document.getElementById('userId3').value = document.getElementById('userId2').value; // Asignar el userId al tercer formulario
           
            // Actualizar barra de progreso
            updateProgressBar(3); // Cambiar a 3 para el tercer paso
        }
    })
    .catch(error => {
        console.error('Error durante la subida de la foto de perfil:', error);
        document.getElementById('fotoPerfilError').textContent = 'Error durante la subida de la foto de perfil';
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
