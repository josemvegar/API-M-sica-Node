// Importar Conexión a BD
const conection = require("./database/conection");

// Importar Dependencias
const express = require("express");
const cors = require("cors");

// Mensaje de Bienvenida
console.log("Api Rest con Node para la app de música, arrancada.")

// Ejecutar conexión a la BD
conection();

// Conexión de NODE
const app = express();
const port = 3910;

// Configuración de cors
app.use(cors());

// Convertir datos del body a js
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Cargar configuración de rutas
const userRutes = require("./routes/user");
const artistsRoutes = require("./routes/artist");
const albumRutes = require("./routes/album");
const songRutes = require("./routes/song");

app.use("/api/user", userRutes);
app.use("/api/artist", artistsRoutes);
app.use("/api/album", albumRutes);
app.use("/api/song", songRutes);

// Ruta de prueba
app.get("/test", (req, res)=>{
    return res.status(200).send({
        status: "Sucess",
        message: "Ruta de Prueba."
    });
});

// Colocar el servidor a escuchar peticiones http
app.listen(port, () => {
    console.log("App arriba, escuchando peticiones en el puerto:" + port + ".");
})