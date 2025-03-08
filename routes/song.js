// Importar dependencias
const express = require("express");
const check = require("../middlewares/auth");

// Cargar Router
const router = express.Router();

// Importar controlador
const songController = require("../controllers/song");

// Configuración de subida
const multer = require("multer");
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads/songs/");
    },
    filename: (req, file, cb) => {
        cb(null, "song-"+Date.now()+"-"+file.originalname);
    }
});

const uploads = multer({storage});

// Definir rutas
router.get("/prueba-song", songController.prueba);
router.post("/save", check.auth, songController.save);
router.get("/one/:id", check.auth, songController.one);
router.get("/listperalbum/:id", check.auth, songController.listPerAlbum);
router.put("/update/:id", check.auth, songController.update);
router.delete("/remove/:id", check.auth, songController.remove);
router.put("/upload/:id", [check.auth, uploads.single("file0")], songController.upload);
router.get("/song/:file", check.auth, songController.audio);

// Exportar rutas
module.exports = router;