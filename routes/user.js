// Importar dependencias
const express = require("express");
const check = require("../middlewares/auth");

// Cargar Router
const router = express.Router();

// Importar controlador
const userController = require("../controllers/user");

// Configuración de subida
const multer = require("multer");
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads/avatars/");
    },
    filename: (req, file, cb) => {
        cb(null, "avatar-"+Date.now()+"-"+file.originalname);
    }
});

const uploads = multer({storage});

// Definir rutas
router.get("/prueba-user", userController.prueba);
router.post("/register", userController.register);
router.post("/login", userController.login);
router.get("/profile/:id?", check.auth,userController.profile);
router.put("/update", check.auth,userController.update);
router.post("/upload", [check.auth, uploads.single("avatar")], userController.upload);
router.get("/avatar/:file", userController.avatar);

// Exportar rutas
module.exports = router;