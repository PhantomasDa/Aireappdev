

function sendConfirmationEmail(userId) {
    fetch('/send-confirmation-email', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId })
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => { 
                console.log('Error al enviar el correo de confirmación:', err);
                throw new Error(err.message); 
            });
        }
        return response.json();
    })
    .then(data => {
        console.log('Correo de confirmación enviado:', data.message);
    })
    .catch(error => {
        console.error('Error al enviar el correo de confirmación:', error);
    });
}
