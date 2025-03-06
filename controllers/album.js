const Albums = require("../models/Albums");

// Acción de prueba
const prueba = (req, res) => {
    res.status(200).send({
        status: "success",
        message: "Mensaje enviado desde el controlador de Album."
    });
}

const save = async (req, res) =>{

    // Sacar datos enviados en el body
    let params = req.body;

    // Crear el objeto
    const album = new Albums(params);

    // Guardar el objeto y enviar respuesta
    try{

        const albumStored = await album.save();

        res.status(200).send({
            status: "success",
            message: "Album guardado con éxito.",
            album: albumStored
        });
    }catch(error){
        res.status(500).send({
            status: "error",
            message: "Error al guardar el album.",
        });
    }
};

const one = async (req, res) => {
    // Sacar el id del album
    const id = req.params.id;

    try{

        // Hacer find y popular al artista
        const albumInfo = await Albums.findById(id).populate({path: "artist"}).exec();

        if(!albumInfo){
            return res.status(404).send({
                status: "error",
                message: "Album no encontrado."
            });
        }


        // Devolver respuesta
        return res.status(200).send({
            status: "success",
            album: albumInfo
        });
    }catch(error){
        return res.status(500).send({
            status: "error",
            message: "Error al buscar el album."
        });
    }
};

const list = async (req, res) =>{

    // Sacar el id del artista de la url
    const artistId = req.params.artistid;

    // Sacar todos los albums del artista
    try{

        const albums = await Albums.find({artist: artistId}).populate("artist").exec();
        if(!albums || albums.length < 1){
            return res.status(404).send({
                status: "error",
                message: "Artista no encontrado."
            })
        }

        return res.status(200).send({
            status: "success",
            albums
        })

    }catch(error){
        return res.status(500).send({
            status: "error",
            message: "Error buscando los álbunes del artista."
        })
    }

    // popular info del artista

    // Devolver resultado
}

// Exportar acciones
module.exports = {
    prueba,
    save,
    one,
    list
}