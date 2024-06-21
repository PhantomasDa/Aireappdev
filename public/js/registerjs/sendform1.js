function submitForm() {
    const nombre = document.getElementById('nombre').value;
    const email = document.getElementById('email').value;
    const telefono = document.getElementById('telefono').value;
    const password = document.getElementById('password').value;
    const confirm_password = document.getElementById('confirm_password').value;
    const fecha_nacimiento = document.getElementById('fecha_nacimiento').value;
    const genero = document.getElementById('genero').value;

    if (nombre.length < 3) {
        document.getElementById('nombreError').textContent = 'El nombre debe tener al menos 3 caracteres.';
        return;
    }

    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailPattern.test(email)) {
        document.getElementById('emailError').textContent = 'Por favor, ingrese un email válido.';
        return;
    }

    if (telefono.length < 8) {
        document.getElementById('telefonoError').textContent = 'Por favor, ingrese un teléfono válido.';
        return;
    }

    if (password.length < 6) {
        document.getElementById('passwordError').textContent = 'La contraseña debe tener al menos 6 caracteres.';
        return;
    }

    if (password !== confirm_password) {
        document.getElementById('confirmPasswordError').textContent = 'Las contraseñas no coinciden.';
        return;
    }

    if (!fecha_nacimiento) {
        document.getElementById('fechaNacimientoError').textContent = 'Por favor, ingrese una fecha de nacimiento.';
        return;
    }

    if (!genero) {
        document.getElementById('generoError').textContent = 'Por favor, seleccione un género.';
        return;
    }

    // Mostrar animación de carga y bloquear formulario
    document.getElementById('loading').style.display = 'flex';
    document.getElementById('registerForm1Form').style.pointerEvents = 'none';

    const startTime = Date.now();

    fetch('/register/step1', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nombre, email, telefono, password, fecha_nacimiento, genero })
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => { throw new Error(err.message); });
        }
        return response.json();
    })
    .then(data => {
        if (data.message !== 'Datos principales guardados exitosamente') {
            document.getElementById('nombreError').textContent = data.message;
        } else {
            // Avanzar al siguiente paso
            document.getElementById('registerForm1').style.display = 'none';
            document.getElementById('registerForm2').style.display = 'block';
            document.getElementById('userId2').value = data.userId; // Asignar el userId al segundo formulario

            
            // Actualizar barra de progreso
            updateProgressBar(2); // Cambiar a 2 para el segundo paso
            scrollToTop();
        }
    })
    .catch(error => {
        console.error('Error durante el registro:', error);
        document.getElementById('nombreError').textContent = 'Error durante el registro';
    })
    .finally(() => {
        const elapsedTime = Date.now() - startTime;
        const remainingTime = 2000 - elapsedTime;

        setTimeout(() => {
            // Ocultar animación de carga y desbloquear formulario
            document.getElementById('loading').style.display = 'none';
            document.getElementById('registerForm1Form').style.pointerEvents = 'auto';
        }, remainingTime > 0 ? remainingTime : 0);
    });
}
