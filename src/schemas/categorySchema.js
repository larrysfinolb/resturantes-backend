import Joi from 'joi';

const id = Joi.string().regex(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/);
const name = Joi.string().regex(/^[\w\s\-_,.()À-ÿ]{1,50}$/);
const description = Joi.string().regex(/^[\w\s\-_,.()À-ÿ]{1,50}$/);

const schemaParams = Joi.object({
  categoryId: id.required(),
});

const schemaBodyCreate = Joi.object({
  name: name.required(),
  description,
});

const schemaBodyUpdate = Joi.object({
  name,
  description,
});

export default { schemaParams, schemaBodyCreate, schemaBodyUpdate };
