const puppeteer = require('puppeteer');

describe('Reagendar Clase', () => {
    let browser;
    let page;

    beforeAll(async () => {
        browser = await puppeteer.launch({ headless: false });
        page = await browser.newPage();

        // Simula un dispositivo móvil (iPhone 12 Pro)
        await page.setViewport({ width: 390, height: 844, isMobile: true });

        // Navega a la página de login
        await page.goto('http://localhost:3000/login.html');

        // Realiza la autenticación
        await page.type('input[name="email"]', 'juanito@gmail.com');
        await page.type('input[name="password"]', '093493049304');
        await page.click('button[type="submit"]');

        // Espera a que la página de perfil se cargue
        await page.waitForNavigation({ waitUntil: 'networkidle0' });

        // Verifica que la URL sea la correcta
        expect(page.url()).toBe('http://localhost:3000/profile');
    });

    afterAll(async () => {
        await browser.close();
    });

    it('debería reservar una clase', async () => {
        // Simula el clic en el botón de reservar clase (ajusta el selector según tu HTML)
        await page.click('#fechasReagendar'); // Asegúrate de que este selector coincida con el botón de reserva de tu página

        // Espera a que el popup de reserva se muestre
        await page.waitForSelector('#reservaPopup', { visible: true });

        // Simula la confirmación de la reserva
        await page.click('#confirmarReservaBtn');

        // Espera a que el popup de confirmación de la reserva se muestre
        await page.waitForSelector('#confirmationModal', { visible: true });

        // Verifica que el popup de confirmación contiene el mensaje correcto
        const confirmacionMensaje = await page.$eval('#confirmationText', el => el.textContent);
        expect(confirmacionMensaje).toContain('Felicitaciones! Tu clase ha sido reservada');

        // Cierra el popup de confirmación de la reserva
        await page.click('#confirmationModal button');

        // Verifica que la página se ha recargado
        await page.waitForNavigation({ waitUntil: 'networkidle0' });

        // Verifica que la URL sea la correcta después de la recarga
        expect(page.url()).toBe('http://localhost:3000/profile');
    }, 30000); // Aumenta el tiempo de espera a 30 segundos

    it('debería mostrar el popup de reagendar al hacer clic en el botón', async () => {
        // Simula que el usuario hace clic en el botón de reagendar para una clase específica
        await page.evaluate(() => {
            reagendarClase(1); // Aquí 1 es un ejemplo de ID de clase, asegúrate de usar un ID válido en tu entorno
        });

        // Espera a que el popup se muestre
        await page.waitForSelector('#reagendarPopup', { visible: true });

        // Verifica que el popup contiene la información correcta
        const claseActualMensaje = await page.$eval('#claseActualMensaje', el => el.textContent);
        expect(claseActualMensaje).toContain('Vas a reagendar tu clase del');
    }, 10000); // Aumenta el tiempo de espera a 10 segundos

    it('debería mostrar las fechas disponibles para reagendar', async () => {
        // Verifica que las fechas disponibles se muestren correctamente
        const fechasReagendar = await page.$$eval('#fechasReagendar .fecha-container', elements => elements.length);
        expect(fechasReagendar).toBeGreaterThan(0);
    });

    it('debería permitir confirmar el reagendamiento', async () => {
        // Simula el clic en una fecha disponible para confirmar el reagendamiento
        await page.click('#fechasReagendar .fecha-container button');

        // Espera a que el popup de confirmación se muestre
        await page.waitForSelector('#confirmarReagendarPopup', { visible: true });

        // Verifica que el popup de confirmación contiene la información correcta
        const confirmarReagendarMensaje = await page.$eval('#confirmarReagendarMensaje', el => el.textContent);
        expect(confirmarReagendarMensaje).toContain('Vas a cambiar tu clase del');

        // Simula el clic en el botón de confirmar reagendamiento
        await page.click('#confirmarReagendarMensaje button');

        // Espera a que el popup de éxito se muestre
        await page.waitForSelector('#exitoReagendarPopup', { visible: true });

        // Verifica que el popup de éxito contiene el mensaje correcto
        const exitoMensaje = await page.$eval('#exitoReagendarPopup p', el => el.textContent);
        expect(exitoMensaje).toContain('Haz reagendado con éxito.');

        // Cierra el popup de éxito
        await page.click('#exitoReagendarPopup button');

        // Verifica que la página se ha recargado
        await page.waitForNavigation({ waitUntil: 'networkidle0' });

        // Verifica que la URL sea la correcta después de la recarga
        expect(page.url()).toBe('http://localhost:3000/profile');
    }, 30000); // Aumenta el tiempo de espera a 30 segundos
});
