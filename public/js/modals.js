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

