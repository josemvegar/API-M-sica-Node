// Importaciones
const validate = require("../helpers/validate");
const User = require("../models/Users");
const bcrypt = require("bcrypt");

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

// Exportar acciones
module.exports = {
  prueba,
  register,
};