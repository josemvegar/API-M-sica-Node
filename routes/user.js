// Importar dependencias
const express = require("express");

// Cargar Router
const router = express.Router();

// Importar controlador
const userController = require("../controllers/user");

// Definir rutas
router.get("/prueba-user", userController.prueba);
router.post("/register", userController.register);

// Exportar rutas
module.exports = router;