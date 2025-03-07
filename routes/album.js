// Importar dependencias
const express = require("express");
const check = require("../middlewares/auth");

// Cargar Router
const router = express.Router();

// Importar controlador
const albumController = require("../controllers/album");

// Configuración de subida
const multer = require("multer");
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads/albums/");
    },
    filename: (req, file, cb) => {
        cb(null, "album-"+Date.now()+"-"+file.originalname);
    }
});

const uploads = multer({storage});

// Definir rutas
router.get("/prueba-album", albumController.prueba);
router.post("/save", check.auth, albumController.save);
router.get("/one/:id", check.auth, albumController.one);
router.get("/list/:artistid", check.auth, albumController.list);
router.put("/update/:id", check.auth, albumController.update);
router.put("/upload/:id", [check.auth, uploads.single("file0")], albumController.upload);
router.get("/image/:file", albumController.albumImage);

// Exportar rutas
module.exports = router;