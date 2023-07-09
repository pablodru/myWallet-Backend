import joi from "joi";

export const schemaRegister = joi.object({
    name: joi.string().required(),
    email: joi.string().email().required(),
    password: joi.string().min(3).required()
});

export const schemaLogin = joi.object({
    email: joi.string().email().required(),
    password: joi.string().required()
});