// Importar dependencias
const express = require("express");
const check = require("../middlewares/auth");

// Cargar Router
const router = express.Router();

// Importar controlador
const userController = require("../controllers/user");

// Definir rutas
router.get("/prueba-user", userController.prueba);
router.post("/register", userController.register);
router.post("/login", userController.login);
router.get("/profile/:id?", check.auth,userController.profile);
router.put("/update", check.auth,userController.update);

// Exportar rutas
module.exports = router;