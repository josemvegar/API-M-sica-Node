// Importaciones
const validate = require("../helpers/validate");
const User = require("../models/Users");
const bcrypt = require("bcrypt");
const jwt = require("../helpers/jwt");

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

// Exportar acciones
module.exports = {
  prueba,
  register,
  login,
  profile
};