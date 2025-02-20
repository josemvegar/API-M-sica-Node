// Importar dependencias
const express = require("express");

// Cargar Router
const router = express.Router();

// Importar controlador
const songController = require("../controllers/song");

// Definir rutas
router.get("/prueba-song", songController.prueba)

// Exportar rutas
module.exports = router;