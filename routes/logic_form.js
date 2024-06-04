function submitForm() {
    const nombre = document.getElementById('nombre').value;
    const email = document.getElementById('email').value;
    const telefono = document.getElementById('telefono').value;
    const password = document.getElementById('password').value;
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

    if (telefono.length < 10) {
        document.getElementById('telefonoError').textContent = 'Por favor, ingrese un teléfono válido.';
        return;
    }

    if (password.length < 6) {
        document.getElementById('passwordError').textContent = 'La contraseña debe tener al menos 6 caracteres.';
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
        }
    })
    .catch(error => {
        console.error('Error durante el registro:', error);
        document.getElementById('nombreError').textContent = 'Error durante el registro';
    });
}

function submitForm2() {
    const form = document.getElementById('registerForm2Form');
    const formData = new FormData(form);

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
        }
    })
    .catch(error => {
        console.error('Error durante la subida de la foto de perfil:', error);
        document.getElementById('fotoPerfilError').textContent = 'Error durante la subida de la foto de perfil';
    });
}

function submitForm3() {
    const userId = document.getElementById('userId3').value;
    const pregunta1 = document.getElementById('pregunta1').value;
    const pregunta2 = document.getElementById('pregunta2').value;
    const pregunta3 = document.getElementById('pregunta3').value;
    const pregunta4 = document.getElementById('pregunta4').value;

    if (!pregunta1 || !pregunta2 || !pregunta3 || !pregunta4) {
        // Asegúrate de que todas las preguntas sean respondidas
        return;
    }

    fetch('/register/step3', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, pregunta1, pregunta2, pregunta3, pregunta4 })
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => { throw new Error(err.message); });
        }
        return response.json();
    })
    .then(data => {
        if (data.message !== 'Cuestionario guardado exitosamente') {
            document.getElementById('cuestionarioError').textContent = data.message;
        } else {
            // Avanzar al siguiente paso
            document.getElementById('registerForm3').style.display = 'none';
            document.getElementById('registerForm4').style.display = 'block';
            document.getElementById('userId4').value = document.getElementById('userId3').value; // Asignar el userId al cuarto formulario
        }
    })
    .catch(error => {
        console.error('Error durante el cuestionario:', error);
        document.getElementById('cuestionarioError').textContent = 'Error durante el cuestionario';
    });
}

function submitForm4() {
    const userId = document.getElementById('userId4').value;
    const lesiones = document.getElementById('lesiones').value;
    const motivacion = document.getElementById('motivacion').value;

    fetch('/register/step4', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, lesiones, motivacion })
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => { throw new Error(err.message); });
        }
        return response.json();
    })
    .then(data => {
        if (data.message !== 'Registro completado exitosamente') {
            document.getElementById('finalError').textContent = data.message;
        } else {
            // Avanzar al siguiente paso
            document.getElementById('registerForm4').style.display = 'none';
            document.getElementById('registerForm5').style.display = 'block';
            document.getElementById('userId5').value = document.getElementById('userId4').value; // Asignar el userId al quinto formulario
        }
    })
    .catch(error => {
        console.error('Error durante la finalización del registro:', error);
        document.getElementById('finalError').textContent = 'Error durante la finalización del registro';
    });
}

function selectPackage(paquete) {
    document.getElementById('paquete').value = paquete;
    const packageOptions = document.querySelectorAll('.package-option');
    packageOptions.forEach(option => option.classList.remove('selected'));
    document.querySelector(`[onclick="selectPackage('${paquete}')"]`).classList.add('selected');
}

function submitForm5() {
    const form = document.getElementById('registerForm5Form');
    const formData = new FormData(form);

    fetch('/register/step5', {
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
        if (data.message !== 'Verificación de pago exitosa') {
            document.getElementById('comprobantePagoError').textContent = data.message;
        } else {
            // Redirigir al usuario a la página de inicio de sesión
            window.location.href = '/login';
            alert('Registro completado. Por favor, ingresa con tu usuario y clave.');
        }
    })
    .catch(error => {
        console.error('Error durante la verificación del pago:', error);
        document.getElementById('comprobantePagoError').textContent = 'Error durante la verificación del pago';
    });
}

function loadComponent(id, url) {
    fetch(url)
        .then(response => response.text())
        .then(data => {
            document.getElementById(id).innerHTML = data;
        })
        .catch(error => console.error('Error loading component:', error));
}

loadComponent('menu', 'menu.html');
loadComponent('footer', 'footer.html');
loadComponent('sidebar-container', 'sidebar.html');

document.addEventListener("DOMContentLoaded", function() {
    const toggleButton = document.getElementById('navbar-toggle');
    const navbarLinks = document.getElementById('navbar-links');

    toggleButton.addEventListener('click', () => {
        for (let i = 0; i < navbarLinks.children.length; i++) {
            navbarLinks.children[i].style.display = navbarLinks.children[i].style.display === 'block' ? 'none' : 'block';
        }
    });
});