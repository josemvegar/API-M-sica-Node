// Importar dependencias
const express = require("express");
const check = require("../middlewares/auth");

// Cargar Router
const router = express.Router();

// Importar controlador
const albumController = require("../controllers/album");

// Definir rutas
router.get("/prueba-album", albumController.prueba);
router.post("/save", check.auth, albumController.save);
router.get("/one/:id", check.auth, albumController.one);
router.get("/list/:artistid", check.auth, albumController.list);

// Exportar rutas
module.exports = router;