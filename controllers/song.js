const Song = require("../models/Songs");
const fs = require("fs");
const path = require("path");

// Acción de prueba
const prueba = (req, res) => {
    res.status(200).send({
        status: "success",
        message: "Mensaje enviado desde el controlador de Canciones."
    });
}

const save = async (req, res) => {

    // Recoger datos del body
    const params = req.body;

    // Crear objeto con el modelo
    let song = new Song(params);

    // Guardar y enviar respuesta
    try{
        
        const songStored = await song.save();
        return res.status(200).send({
            status: "success",
            message: "Canción guardada.",
            song: songStored
        })

    }catch(error){
        return res.status(500).send({
            status: "error",
            message: "Error al guardar la canción."
        })
    }

}

const upload = async (req, res) => {

  // Recoger fichero de imagen y comprobar si existe
  if(!req.file){
    return res.status(404).send({
      status: "error",
      message: "La petición no incluye el audio."
    });
  }

  // Conseguir el nombre del archivo
  const song = req.file.originalname;

  // Sacar info de la imagen
  const songSplit = song.split("\.");
  const extension = songSplit[1];

  // Comprobar si la extención es válida
  if(extension!="mp3" && extension!="ogg"){
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
    const songUpdated = await Song.findOneAndUpdate({_id: req.params.id}, {file: req.file.filename}, {new: true}).exec();

    if(!songUpdated){
        return res.status(404).send({
            status: "error",
            message: "La canción no existe."
        });
    }

    // Enviar respuesta
    return res.status(200).send({
      status: "success",
      song: songUpdated
    });
  }catch(error){
    console.log(error);
    fs.unlinkSync(req.file.path);
    return res.status(500).send({
      status: "error",
      message: "Error en la subida de la canción."
    });
  }
  
}

const audio = (req, res) =>{

  // Sacar el parámetro de la url
  const file= req.params.file;

  // Mostrar el path real de la imagen
  const filePath = path.join(__dirname, "../uploads/songs", file);

  // Comprobar que existe el fichero
  fs.stat(filePath, (error, exists)=>{
    
    if(error || !exists){
      return res.status(404).send({
        status: "error",
        message: "El audio no existe."
      });
    }

    // Devolver el fichero
    return res.status(200).sendFile(filePath);

  });

}

const one = async (req, res) => {

  // Recoger el id de la canción
  const id = req.params.id;

  try{
    
    // find y devolver respuesta
    const song = await Song.findById(id).populate("album").exec();

    if(!song){
      return res.status(404).send({
        status: "error",
        message: "La canción no existe."
      });
    }

    return res.status(200).send({
      status: "success",
      song
    });
    
  }catch(error){
    console.log(error);
    return res.status(500).send({
      status: "error",
      message: "Error buscar la canción."
    });
  }

}

const listPerAlbum = async (req, res) => {

  // Recoger Id del album
  const id = req.params.id;

  try{
    // Hacer consulta
    const listSongs = await Song.find({album: id}).sort("track").populate({
      path: "album",
      populate: {
        path: "artist",
        model: "Artist"
      }

    }).exec();

    // Devolver resultado
    if(!listSongs || listSongs.length < 1){
      return res.status(404).send({
        status: "error",
        message: "Este album no tiene canciones."
      });
    }

    return res.status(200).send({
      status: "success",
      sons: listSongs
    });

  }catch(error){
    return res.status(500).send({
      status: "error",
      message: "Error buscar las canciones."
    });
  }
}

const update = async (req, res) => {

  // Recoger parametro de la url
  const id = req.params.id;

  // Recoger datos para actualizar
  const data = req.body;

  // Búsqueda y actualización
  try{

    const songUpdated = await Song.findByIdAndUpdate(id, data, {new:true});

    if(!songUpdated){
      return res.status(404).send({
        status: "error",
        message: "No existe la canción indicada."
      });
    }

    // Enviar respuesta
    return res.status(200).send({
      status: "success",
      song: songUpdated
    });

  }catch(error){
    console.log(error);
    return res.status(500).send({
      status: "error",
      message: "Error al actualizar la canción."
    });
  }

}

const remove = async (req, res) => {

  // recoger parametro por la url
  const id= req.params.id;

  // Hacer el remove
  try{

    const songRemoved = await Song.findByIdAndDelete(id);
    if(!songRemoved){
      return res.status(404).send({
        status: "error",
        message: "La canción enviada no existe."
      });
    }

    return res.status(200).send({
      status: "success",
      song: songRemoved
    });

  }catch(error){
    console.log(error);
    return res.status(500).send({
      status: "error",
      message: "Error al eliminar la canción."
    });
  }

  // Enviar respuesta

}

// Exportar acciones
module.exports = {
    prueba,
    save,
    upload,
    one,
    listPerAlbum,
    update,
    remove,
    audio
}