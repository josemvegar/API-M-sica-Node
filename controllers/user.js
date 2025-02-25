// Importaciones
const validate = require("../helpers/validate");
const User = require("../models/Users");
const bcrypt = require("bcrypt");
const jwt = require("../helpers/jwt");
const fs = require("fs");
const path = require("path");

// Acción de prueba
const prueba = (req, res) => {
  res.status(200).send({
    status: "success",
    message: "Mensaje enviado desde el controlador de Usuarios.",
  });
};

// Registro
const register = async (req, res) => {
  // Recoger los datos de la petición
  let params = req.body;

  // Comprobar que llegan bien
  if (!params.name || !params.nick || !params.email || !params.password) {
    res.status(400).send({
      status: "error",
      message: "Faltan datos por enviar.",
    });
  }

  // Validar datos
  let validateResponse= validate(params);
  if(validateResponse.status=="error"){
    return res.status(400).send(validateResponse)
  }

  // Controlar usuarios duplicados
  let userDuplicated = await User.find({
    $or: [
      { email: params.email.toLowerCase() },
      { nick: params.nick},
    ],
  }).exec();

  if (userDuplicated.length > 0) {
    return res.status(400).json({
      status: "error",
      message: "El usuario ya está registrado.",
    });
  }

  // Cifrar la contraseña
  let pwd = await bcrypt.hash(params.password, 10);
  params.password = pwd;

  // Crear el objeto del usuario
  let userToSave = new User(params);

  try {
    // Guardar usuario en la BD
    let userStored = await userToSave.save();

    // Limpiar el objeto a devolver
    let userCreated = userStored.toObject();
    delete userCreated.password;
    delete userCreated.role;

    // Devolver resultado
    res.status(200).send({
      status: "success",
      message: "Usuario guardado correctamente.",
      userCreated,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error al guardar el usuario." + error,
    });
  }
};

const login = async (req, res) => {

  // Recoger los parámetros de la petición
  let params = req.body;

  // Comprobar datos
  if (!params.login || !params.password){
    return res.status(400).send({
      status: "error",
      message: "Faltan datos."
    });
  }
  try{
    // Buscar en la bd si existe el email o usuario
    let userToFind = await User.findOne({
      $or: [
        {email: params.login},
        {nick: params.login}
      ]
    }).select("+password +role");

    if(!userToFind){
      return res.status(404).send({
        status: "error",
        message: "El usuario no existe."
      });
    }

    //Comparar su contraseña
    let pwd = bcrypt.compareSync(params.password, userToFind.password);
    if (!pwd){
      return res.status(400).send({
        status: "error",
        message: "Login incorrecto."
      });
    }

    // Conseguir token JWT
    const token = jwt.createToken(userToFind);

    // Devolver datos de usuario y Token
    let userLogged = userToFind.toObject();
    delete userLogged.password;
    delete userLogged.role;

    res.status(200).send({
      status: "success",
      message: "Inicio de sesión exitoso.",
      user: userLogged,
      token
    });
  }catch(error){
    return res.status(500).send({
      status: "error",
      message: "Error al iniciar sesión."
    });
  }
};

const profile = async (req, res) => {

  // Recoger id de usuario de la url
  let id = req.params.id;
  if(!id){
    id = req.user.id;
  }

  // Consulta para sacar los datos del perfil
  try{
    let user = await User.findById(id);
    if(!user){
      return res.status(404).send({
        status: "error",
        message: "Usuario no encontrado."
      });
    }
  
    // Devolver resultado
  
    return res.status(200).send({
      status: "success",
      user
    });
  }catch(error){
    return res.status(500).send({
      status: "error",
      message: "Error al mostrar usuario."
    });
  }
  
};

const update = async (req, res) => {

  // Recoger datos del usuario identificado
  let userIdentity = req.user;

  // Recoger datos a actualizar
  let userToUpdate = req.body;

  // Validar datos
  let validateResponse= validate(userToUpdate);
  if(validateResponse.status=="error"){
    return res.status(400).send(validateResponse)
  }

  // Comprobar si el usuario existe
  let issetUser;
  try{
    issetUser= await User.find({
      $or : [
        {email: userToUpdate.email.toLowerCase()},
        {nick: userToUpdate.nick.toLowerCase()}
      ]
    }).exec();
  }catch(error){
    return res.status(500).send({
      status: "error",
      message: "Error buscando el usuario."
    });
  }

  // Comprobar si el usuario existe y no soy yo
  issetUser.forEach(user => {
    if(userIdentity.id != user._id){
      // Si ya existe, devuelvo una respuesta
      return res.status(400).send({
        status: "error",
        message: "Los datos ya pertenecen a otro usuario existente."
      });
    }
  });

  // Volver a cifrar contraseña si llega
  if(userToUpdate.password){
    let pwd = await bcrypt.hash(userToUpdate.password, 10);
    userToUpdate.password = pwd;
  }

  // Buscar y actualizar
  try{
    let userUpdated = await User.findByIdAndUpdate({_id: userIdentity.id}, userToUpdate, {new: true});

    // Devolver respuesta
    if (!userUpdated){
      return res.status(400).send({
        status: "error",
        message: "Error actualizando el usuario."
      });
    }
    return res.status(200).send({
      status: "success",
      message: "Usuario actualizado.",
      userUpdated
    });
  }catch(error){
    console.log(error);
    return res.status(500).send({
      status: "error",
      message: "Error actualizando el usuario.",
    });
  }
}

const upload = async (req, res) => {
  // Configuración de subida (Multer)

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
    const avatarUpdated = await User.findOneAndUpdate({_id: req.user.id}, {image: req.file.filename}, {new: true}).exec();

    // Enviar respuesta
  
    return res.status(200).send({
      status: "success",
      user: avatarUpdated
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

const avatar = (req, res) =>{

  // Sacar el parámetro de la url
  const file= req.params.file;
  console.log(file);

  // Mostrar el path real de la imagen
  const filePath = path.join(__dirname, "../uploads/avatars", file);
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
  register,
  login,
  profile,
  update,
  upload,
  avatar
};