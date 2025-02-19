// Importar Mongoose
const mongoose = require("mongoose");

// Método de conexión
const conection = async () =>{
    try{

        await mongoose.connect("mongodb+srv://josevega199916:yukrWGDoHrpIKAp6@cluster0.rz9qw.mongodb.net/app_musica");
        console.log("Conectado correctamente a la Base de Datos app_musica");

    }catch(error){
        console.log(error);
        throw new Error("No se ha podido conectar a la Base de datos.");
    }
}

// Exportar conexión
module.exports = conection;