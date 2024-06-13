// modals.js

function mostrarModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
}

function cerrarModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function cerrarYRecargar() {
    cerrarModal('confirmationModal');
    location.reload(); // Recargar la página
}

function cerrarErrorModal() {
    cerrarModal('errorModal');
}

function cerrarSameDayErrorModal() {
    cerrarModal('sameDayErrorModal');
}

function cerrarDateErrorModal() {
    cerrarModal('dateErrorModal');
}

function cerrarPopup() {
    document.getElementById('reservaPopup').style.display = 'none';
}

function cerrarHorariosPopup() {
    document.getElementById('horariosPopup').style.display = 'none';
}

function cerrarReagendarPopup() {
    cerrarModal('reagendarPopup');
}

function togglePackageInfo() {
    const packageInfo = document.getElementById('packageInfo');
    const toggleHeader = document.querySelector('.toggle-header');
    if (packageInfo.classList.contains('active')) {
        packageInfo.classList.remove('active');
        toggleHeader.textContent = 'Mostrar información de paquete';
    } else {
        packageInfo.classList.add('active');
        toggleHeader.textContent = 'Ocultar información de paquete';
    }
}