// Importar dependencias
const jwt = require("jwt-simple");
const moment = require("moment");

// Definir clave secreta
const secret = "CLAVE_SECRETA_1563358435821535";

// Función para generar tokens
const createToken = (user) => {
    const payload = {
        id: user._id,
        name: user.name,
        surname: user.surname,
        nick: user.nick,
        email: user.email,
        role: user.role,
        image: user.image,
        iat: moment().unix(),
        exp: moment().add(30, "days").unix()
    }

    return jwt.encode(payload, secret);

};

// Exportar módulo
module.exports = {
    secret,
    createToken
};