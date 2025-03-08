const Albums = require("../models/Albums");
const Song = require("../models/Songs");
const fs = require("fs");
const path = require("path");

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

const update = async (req, res) => {

    // Regoger parametro de la url (ID)
    const albumId = req.params.id;

    // Body con los datos a actualizar
    const data = req.body;

    // Find y Update
    try{
        const albumUpdated = await Albums.findByIdAndUpdate(albumId, data, {new: true});
        //  Devolver resultado

        if(!albumUpdated){
            return res.status(404).send({
                status: "error",
                message: "El album ingresado no existe."
            })
        }

        return res.status(200).send({
            status: "success",
            message: "Actualizar.",
            albumUpdated
        })
    }catch(error){
        return res.status(500).send({
            status: "error",
            message: "Error al actualizar el album."
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
      const albumUpdated = await Albums.findOneAndUpdate({_id: req.params.id}, {image: req.file.filename}, {new: true}).exec();
  
      if(!albumUpdated){
          return res.status(404).send({
              status: "error",
              message: "El album no existe."
          });
      }
  
      // Enviar respuesta
      return res.status(200).send({
        status: "success",
        album: albumUpdated
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

  const albumImage = (req, res) =>{
  
    // Sacar el parámetro de la url
    const file= req.params.file;
  
    // Mostrar el path real de la imagen
    const filePath = path.join(__dirname, "../uploads/albums", file);
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

  const remove = async (req, res) =>{
  
      // Sacar el ID del artista de la url
      const id = req.params.id;
  
      // Consulta para buscar y eliminar
      try{
          albumtoRemove = await Albums.findByIdAndDelete(id);
          
          if(!albumtoRemove){
              return res.status(404).send({
                  status: "error",
                  message: "El album no existe."
              });
          }
  
          // Eliminar album
          // Encontrar y eliminar los álbumes del artista
          const songs = await Song.deleteMany({ album: id });
  
          // Eliminar canciones del artista
          //const songRemoved = await Song.find({album: albumRemoved._id}).remove();
  
          // Devolver resultado
          return res.status(200).send({
              status: "success",
              message: "Album eliminado.",
              album: albumtoRemove,
              songs
          });
      }catch(error){
          console.log(error);
          return res.status(500).send({
              status: "error",
              message: "Error al eliminar Album."
          });
      }
  }

// Exportar acciones
module.exports = {
    prueba,
    save,
    one,
    list,
    update,
    upload,
    albumImage,
    remove
}