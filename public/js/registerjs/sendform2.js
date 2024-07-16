// sendform2.js
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

    // Guardar datos localmente
    const formDataObject = {
        foto_perfil: fotoPerfil.name
    };
    localStorage.setItem('step2Data', JSON.stringify(formDataObject));

    // Avanzar al siguiente paso
    document.getElementById('registerForm2').style.display = 'none';
    document.getElementById('registerForm3').style.display = 'block';
    updateProgressBar(3);
}
