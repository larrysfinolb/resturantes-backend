import Joi from 'joi';

const id = Joi.string().regex(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/);
const name = Joi.string().regex(/^[\w\s\-_,.()À-ÿ]{1,50}$/);

const schemaParams = Joi.object({
  bankId: id.required(),
});

const schemaBodyCreate = Joi.object({
  name: name.required(),
});

const schemaBodyUpdate = Joi.object({
  name,
});

export default { schemaParams, schemaBodyCreate, schemaBodyUpdate };
