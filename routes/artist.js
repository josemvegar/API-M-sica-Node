// Importar dependencias
const express = require("express");
const artistController = require("../controllers/artist");
const check = require("../middlewares/auth");

// Cargar Router
const router = express.Router();

// Importar controlador
const artistsController = require("../controllers/artist");

// Configuración de subida
const multer = require("multer");
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads/artists/");
    },
    filename: (req, file, cb) => {
        cb(null, "artist-"+Date.now()+"-"+file.originalname);
    }
});

const uploads = multer({storage});

// Definir rutas
router.get("/prueba-artist", artistsController.prueba);
router.post("/save", check.auth, artistController.save);
router.get("/one/:id", check.auth, artistController.one);
router.get("/list/:page?", check.auth, artistController.list);
router.put("/update/:id", check.auth, artistController.update);
router.delete("/remove/:id", check.auth, artistController.remove);
router.put("/upload/:id", [check.auth, uploads.single("file0")], artistController.upload);
router.get("/image/:file", artistsController.artistImage);

// Exportar rutas
module.exports = router;