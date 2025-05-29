const jwt = require("jsonwebtoken");

module.exports = { // Exporta un objeto con las funciones validate y logged
    validateRegister: (req, res, next) => {
        // Validar que el email exista y tenga formato válido
        const email = req.body.email; //Obtiene el campo
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) { //Valida el email con el formato
            return res.status(400).send({
                message: 'Ingrese una correo electrónico válido', // Si no, regresa un error
            });
        }
        // Contraseña de 6 caracteres mínimo
        if (!req.body.password || req.body.password.length < 6) { // Exista y que tenga al menos 6 caracteres
            return res.status(400).send({
                message: 'Ingrese una contraseña de mínimo 6 caracteres',
            });
        }
        // Coincidencia entre la contraseña y su repetición (que exista y sea igual)
        if (!req.body.password_repeat || req.body.password != req.body.password_repeat) {
            return res.status(400).send({
                message: 'Las contraseñas deben coincidir',
            });
        }
        next(); // Si todo está bien, continúa con el siguiente paso 
    },
    // Verifica si el usuario está logueado
    isLoggedIn: (req, res, next) => {
        if (!req.headers.authorization) { // Si no hay un token
            return res.status(400).send({ // Regresa un error
                message: 'La sesión no es válida!',
            });
        }
        try {
            const authHeader = req.headers.authorization; // Extrae el token
            const token = authHeader.split(' ')[1];
            const decoded = jwt.verify(token, 'SECRETKEY'); // Verifica que sea válido
            req.userData = decoded; // Guarda la información
            next(); // Continúa con el siguiente paso
        } catch (err) {
            return res.status(400).send({ // Si hay un error en el token
                message: 'La sesión no es válida!',
            });
        }
    }
};