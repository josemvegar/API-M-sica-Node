// Acción de prueba
const prueba = (req, res) => {
    res.status(200).send({
        status: "success",
        message: "Mensaje enviado desde el controlador de Artistas."
    });
}

// Exportar acciones
module.exports = {
    prueba
}