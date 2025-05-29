const jwt = require("jsonwebtoken"); //Librería JSON

module.exports = {
    isAdmin: (req, res, next) => {
        if (!req.headers.authorization) { // Verifica si está el token
            return res.status(401).send({
                message: 'Token no proporcionado',
            });
        }

        try {
            const token = req.headers.authorization.split(' ')[1]; // Extrae el token del encabezado
            const decoded = jwt.verify(token, 'SECRETKEY'); // Usa SECRETKEY para verificar el el token es verdadero

            // Verifica si el token tiene el campo es_admin
            if (!decoded.es_admin) {
                return res.status(403).send({ // Si no, lo rechaza
                    message: 'Acceso restringido a administradores',
                });
            }

            req.userData = decoded; // Guarda los datos del usuario decodificados
            next();
        } catch (err) { // Si el token es inválido o ya expiró se rechaza
            return res.status(401).send({
                message: 'Token inválido',
            });
        }
    }
}; // Exporta la función isAdmin
