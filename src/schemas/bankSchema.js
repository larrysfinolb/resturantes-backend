import Joi from 'joi';

const id = Joi.string().regex(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/);
const name = Joi.string().regex(/^[\w\s\-_,.()À-ÿ]{1,50}$/);
const number = Joi.string().regex(/^[0-9]{20}$/);
const dni = Joi.string().regex(/^J{0,1}[0-9]{7,10}$/);

const schemaParams = Joi.object({
  bankId: id.required(),
});

const schemaBodyCreate = Joi.object({
  name: name.required(),
  number: number.required(),
  dni: dni.required(),
});

const schemaBodyUpdate = Joi.object({
  name,
  number,
  dni,
});

export default { schemaParams, schemaBodyCreate, schemaBodyUpdate };
