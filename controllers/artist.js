// Importaciones
const Artist = require("../models/Artists");
const mongoosePagination = require("mongoose-pagination");
const fs = require("fs");
const path = require("path");
const Album = require("../models/Albums");
const Song = require("../models/Songs");

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
            artist: artistToFind,
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

const update = async (req, res) =>{

    // Recoger Id del artista
    const id = req.params.id;

    // Recoger datos body
    const data = req.body;

    // Buscar y actualizar artista
    try {
        const artistToUpdate = await Artist.findByIdAndUpdate(id, data, {new: true});
        if(!artistToUpdate){
            return res.status(404).send({
                status: "error",
                message: "El artista no existe."
            });
        }

    
        return res.status(200).send({
            status: "success",
            message: "Artista actualizado.",
            artist: artistToUpdate
        });
    } catch (error) {
        return res.status(500).send({
            status: "error",
            message: "Error actualizando el artista."
        });
    }    
}

// BORRAR ARTISTA A MEDIAS, PORQUE POR AHORA FALTA
const remove = async (req, res) =>{

    // Sacar el ID del artista de la url
    const id = req.params.id;

    // Consulta para buscar y eliminar
    try{
        const artistToRemove = await Artist.findByIdAndDelete(id);
        if(!artistToRemove){
            return res.status(404).send({
                status: "error",
                message: "El artista no existe."
            });
        }

        // Eliminar album
        const albumRemoved = await Album.find({artist: id}).remove();

        // Eliminar canciones del artista
        const songRemoved = await Song.find({album: albumRemoved._id}).remove();

        // Devolver resultado
        return res.status(200).send({
            status: "success",
            message: "Artista eliminado.",
            artistToRemove,
            albumRemoved,
            songRemoved
        });
    }catch(error){
        return res.status(500).send({
            status: "error",
            message: "Error al eliminar artista."
        });
    }
}

const upload = async (req, res) => {

  // Recoger fichero de imagen y comprobar si existe
  if(!req.file){
    return res.status(404).send({
      status: "error",
      message: "La petición no incluye la imagen."
    });
  }

  // Conseguir el nombre del archivo
  const image = req.file.originalname;

  // Sacar info de la imagen
  const imageSplit = image.split("\.");
  const extension = imageSplit[1];

  // Comprobar si la extención es válida
  if(extension!="png" && extension!="jpg" && extension!="jpeg" && extension!="gif"){
    // Borrar archivo y devolver respuesta.
    const filePath = req.file.path;
    const fileDeleted = fs.unlinkSync(filePath);
    return res.status(400).send({
      status: "error",
      message: "La extención no es válida."
    });
  }

  // Si todo es correcto, se guarda la imagen en disco duro y bd
  try{
    const artistUpdated = await Artist.findOneAndUpdate({_id: req.params.id}, {image: req.file.filename}, {new: true}).exec();

    if(!artistUpdated){
        return res.status(404).send({
            status: "error",
            message: "El artista no existe."
        });
    }

    // Enviar respuesta
    return res.status(200).send({
      status: "success",
      user: artistUpdated
    });
  }catch(error){
    console.log(error);
    fs.unlinkSync(req.file.path);
    return res.status(500).send({
      status: "error",
      message: "Error en la subida de la imagen."
    });
  }
  
}

const artistImage = (req, res) =>{

  // Sacar el parámetro de la url
  const file= req.params.file;
  console.log(file);

  // Mostrar el path real de la imagen
  const filePath = path.join(__dirname, "../uploads/artists", file);
  console.log(filePath);

  // Comprobar que existe el fichero
  fs.stat(filePath, (error, exists)=>{
    
    if(error || !exists){
      return res.status(404).send({
        status: "error",
        message: "La imagen no existe."
      });
    }

    // Devolver el fichero
    return res.status(200).sendFile(filePath);

  });

}

// Exportar acciones
module.exports = {
    prueba,
    save,
    one,
    list,
    update,
    remove,
    upload,
    artistImage
}