const Song = require("../models/Songs");

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

// Exportar acciones
module.exports = {
    prueba,
    save,
    upload,
    one,
    listPerAlbum
}