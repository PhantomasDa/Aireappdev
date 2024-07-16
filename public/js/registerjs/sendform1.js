// sendform1.js
function submitForm1() {
    const form = document.getElementById('registerForm'); // Referencia al formulario principal
    console.log('Formulario obtenido:', form); // Depuración

    if (!(form instanceof HTMLFormElement)) {
        console.error('El formulario no es un HTMLFormElement');
        return;
    }

    const formData = new FormData(form);
    
    // Realiza validaciones aquí...
    const nombre = formData.get('nombre');
    const email = formData.get('email');
    const telefono = formData.get('telefono');
    const password = formData.get('password');
    const confirm_password = formData.get('confirm_password');
    const fecha_nacimiento = formData.get('fecha_nacimiento');
    const genero = formData.get('genero');

    // Variable para controlar si hay errores
    let hasError = false;

    // Limpiar mensajes de error anteriores
    document.getElementById('nombreError').textContent = '';
    document.getElementById('emailError').textContent = '';
    document.getElementById('telefonoError').textContent = '';
    document.getElementById('passwordError').textContent = '';
    document.getElementById('confirmPasswordError').textContent = '';
    document.getElementById('fechaNacimientoError').textContent = '';
    document.getElementById('generoError').textContent = '';

    if (nombre.length < 3) {
        document.getElementById('nombreError').textContent = 'El nombre debe tener al menos 3 caracteres.';
        hasError = true;
    }

    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailPattern.test(email)) {
        document.getElementById('emailError').textContent = 'Por favor, ingrese un email válido.';
        hasError = true;
    }

    if (telefono.length < 8) {
        document.getElementById('telefonoError').textContent = 'Por favor, ingrese un teléfono válido.';
        hasError = true;
    }

    if (password.length < 6) {
        document.getElementById('passwordError').textContent = 'La contraseña debe tener al menos 6 caracteres.';
        hasError = true;
    }

    if (password !== confirm_password) {
        document.getElementById('confirmPasswordError').textContent = 'Las contraseñas no coinciden.';
        hasError = true;
    }

    if (!fecha_nacimiento) {
        document.getElementById('fechaNacimientoError').textContent = 'Por favor, ingrese una fecha de nacimiento.';
        hasError = true;
    }

    const fechaPattern = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!fechaPattern.test(fecha_nacimiento)) {
        document.getElementById('fechaNacimientoError').textContent = 'Por favor, ingrese una fecha de nacimiento válida (dd/mm/yyyy).';
        hasError = true;
    }

    if (!genero) {
        document.getElementById('generoError').textContent = 'Por favor, seleccione un género.';
        hasError = true;
    }

    // Si hay errores, no continuar
    if (hasError) {
        return;
    }

    // Guardar datos localmente
    const formDataObject = {
        nombre,
        email,
        telefono,
        password,
        fecha_nacimiento,
        genero
    };
    localStorage.setItem('step1Data', JSON.stringify(formDataObject));

    // Avanzar al siguiente paso
    document.getElementById('registerForm1').style.display = 'none';
    document.getElementById('registerForm2').style.display = 'block';
    updateProgressBar(2);
}
