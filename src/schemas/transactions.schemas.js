import joi from "joi"

export const schemaTransation = joi.object({
    value: joi.number().greater(0).precision(2).required(),
    description: joi.string().required(),
    type: joi.string().valid("in", "out").required()
})