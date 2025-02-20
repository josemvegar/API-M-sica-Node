// Importar dependencias
const express = require("express");

// Cargar Router
const router = express.Router();

// Importar controlador
const albumController = require("../controllers/album");

// Definir rutas
router.get("/prueba-album", albumController.prueba)

// Exportar rutas
module.exports = router;