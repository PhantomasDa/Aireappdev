function generateUniqueFilename(originalFilename) {
    const uniqueSuffix = Date.now();
    const extension = originalFilename.split('.').pop(); // Obtener la extensión del archivo
    return `${uniqueSuffix}.${extension}`;
}

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

    // Generar un nombre único para la foto de perfil
    const uniqueFilename = generateUniqueFilename(fotoPerfil.name);

    // Guardar datos localmente
    const formDataObject = {
        foto_perfil: uniqueFilename
    };
    localStorage.setItem('step2Data', JSON.stringify(formDataObject));

    // Avanzar al siguiente paso
    document.getElementById('registerForm2').style.display = 'none';
    document.getElementById('registerForm3').style.display = 'block';
    updateProgressBar(3);

    // Imprimir el nombre del archivo para depuración
    console.log('Nombre del archivo de foto de perfil:', uniqueFilename);
}
