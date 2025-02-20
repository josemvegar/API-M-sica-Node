// Importar dependencias
const express = require("express");

// Cargar Router
const router = express.Router();

// Importar controlador
const artistsController = require("../controllers/artist");

// Definir rutas
router.get("/prueba-artist", artistsController.prueba)

// Exportar rutas
module.exports = router;