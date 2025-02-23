const validator = require("validator");

const validate = (params) => {

    let name =  !validator.isEmpty(params.name) &&
                validator.isLength(params.name, {min: 3, max: undefined}) &&
                validator.isAlpha(params.name, "es-ES");

    let nick =  !validator.isEmpty(params.nick) &&
                validator.isLength(params.nick, {min: 2, max: 60});

    let email =  !validator.isEmpty(params.email) &&
                validator.isEmail(params.email);

    if(params.surname){
        let surname =  !validator.isEmpty(params.surname) &&
                        validator.isLength(params.surname, {min: 3, max: undefined}) &&
                        validator.isAlpha(params.surname, "es-ES");

        if(!surname){
            return {
                status: "error",
                message: "Validación de apellido no pasada."
            };
        }
    }

    if(!params.password){
        if(!name || !nick || !email){
            return {
                status: "error",
                message: "Validación no pasada."
            };
        }
        return {status: "success"};
    }

    let password =  !validator.isEmpty(params.password) &&
                validator.isLength(params.password, {min: 8, max: undefined});

    

    if(!name || !nick || !email || !password){
        return {
            status: "error",
            message: "Validación no pasada."
        };
    }

    return {status: "success"};
};

module.exports = validate;