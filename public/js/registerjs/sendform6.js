   
function submitForm6() {
    const form = document.getElementById('registerForm6Form');
    const formData = new FormData(form);
    const showBilling = document.getElementById('showBilling').checked;

    const paquete = document.getElementById('paquete').value;
    formData.append('paquete', paquete);

    if (showBilling) {
        const cedula_ruc = document.getElementById('cedula_ruc').value;
        const direccion1 = document.getElementById('direccion1').value;
        const direccion2 = document.getElementById('direccion2').value;
        const telefono = document.getElementById('telefono_billing').value;
        const nombre_completo = document.getElementById('nombre_completo').value;
        const razon_social = document.getElementById('razon_social').value;
        const otro_dato = document.getElementById('otro_dato').value;

        formData.append('cedula_ruc', cedula_ruc);
        formData.append('direccion1', direccion1);
        formData.append('direccion2', direccion2);
        formData.append('telefono', telefono);
        formData.append('nombre_completo', nombre_completo);
        formData.append('razon_social', razon_social);
        formData.append('otro_dato', otro_dato);
    }

    fetch('/register/step6', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => { 
                console.log('Error del servidor:', err);
                throw new Error(err.message); 
            });
        }
        return response.json();
    })
    .then(data => {
        if (data.message !== 'Verificación de pago exitosa') {
            document.getElementById('comprobantePagoError').textContent = data.message;
        } else {
            document.getElementById('registerForm6').style.display = 'none';
            document.getElementById('successMessage').style.display = 'block';

            setTimeout(() => {
                window.location.href = '/login';
            }, 5000);
        }
    })
    .catch(error => {
        console.error('Error durante la verificación del pago:', error);
        document.getElementById('comprobantePagoError').textContent = 'Error durante la verificación del pago';
    });
}