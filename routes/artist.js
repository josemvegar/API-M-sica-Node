// Importar dependencias
const express = require("express");
const artistController = require("../controllers/artist");
const check = require("../middlewares/auth");

// Cargar Router
const router = express.Router();

// Importar controlador
const artistsController = require("../controllers/artist");

// Definir rutas
router.get("/prueba-artist", artistsController.prueba);
router.post("/save", check.auth, artistController.save);
router.get("/one/:id", check.auth, artistController.one);
router.get("/list/:page?", check.auth, artistController.list);

// Exportar rutas
module.exports = router;