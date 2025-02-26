// Importaciones
const Artist = require("../models/Artists");
const mongoosePagination = require("mongoose-pagination");

// Acción de prueba
const prueba = (req, res) => {
    return res.status(200).send({
        status: "success",
        message: "Mensaje enviado desde el controlador de Artistas."
    });
}

// Acción Guardar Artista
const save = async (req, res) =>{

    // Recoger datos del body
    let params = req.body;

    // Crear el objeto a guardar
    const artist = new Artist(params);

    // Guardar y enviar respuesta
    try{
        let artistStored = await artist.save();
        console.log(artistStored);
        return res.status(200).send({
            status: "success",
            message: "Artista guardado.",
            artistStored
        });

    }catch(error){
        return res.status(500).send({
            status: "Error",
            message: "Error al guardar el artista."
        });
    }
};

const one = async (req, res) =>{

    // Sacar id de la url
    const id= req.params.id;

    // Hacer find y devolver respuesta
    try{
        let artist = await Artist.findById(id);

        if(!artist){
            return res.status(404).send({
                status: "error",
                message: "Artista no encontrado."
            });
        }

        return res.status(200).send({
            status: "success",
            artist
        });
    }catch(error){
        return res.status(500).send({
            status: "error",
            message: "Error buscando el artista."
        });
    }
}

const list = async (req, res) =>{

    // Sacar la posible página
    let page = 1;
    if(req.params.page){
        page= req.params.page;
    }

    // Definir cuantos elementos por página
    const itemsPerPage = 2;

    // Find, ordenarlo y paginarlo
    try{
        let artistToFind = await Artist.find().sort("name").paginate(page, itemsPerPage);
        const total = await Artist.countDocuments();
    
        return res.status(200).send({
            status: "success",
            artistToFind,
            page,
            itemsPerPage,
            total
        });
    }catch(error){
        return res.status(500).send({
            status: "success",
            message: "Error al listar artistas."
        });
    }
}

// Exportar acciones
module.exports = {
    prueba,
    save,
    one,
    list
}