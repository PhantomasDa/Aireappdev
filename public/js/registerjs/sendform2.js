function submitForm2() {
    const form = document.getElementById('registerForm'); // Referencia al formulario principal
    console.log('Formulario obtenido:', form); // Depuración

    if (!(form instanceof HTMLFormElement)) {
        console.error('El formulario no es un HTMLFormElement');
        return;
    }

    const formData = new FormData(form);

    // Realiza validaciones aquí...
    const fotoPerfil = document.getElementById('foto_perfil').files[0];

    if (!fotoPerfil) {
        document.getElementById('fotoPerfilError').textContent = 'Por favor, sube una foto de perfil.';
        return;
    }

    // Añadir la foto de perfil al FormData sin renombrar
    formData.append('foto_perfil', fotoPerfil);

    // Avanzar al siguiente paso
    document.getElementById('registerForm2').style.display = 'none';
    document.getElementById('registerForm3').style.display = 'block';
    updateProgressBar(3);

    // Enviar el FormData al servidor
    fetch('/register/complete', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        console.log('Registro completado:', data);
    })
    .catch(error => {
        console.error('Error al enviar el formulario:', error);
    });

    // Imprimir el nombre del archivo para depuración
    console.log('Archivo de foto de perfil enviado:', fotoPerfil.name);
}
