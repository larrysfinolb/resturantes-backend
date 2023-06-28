import Joi from 'joi';

const id = Joi.string().regex(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/);
const name = Joi.string().regex(/^[\w\s\-_,.()À-ÿ]{1,50}$/);
const description = Joi.string().regex(/^[\w\s\-_,.()À-ÿ]{1,50}$/);
const imageUrl = Joi.string().regex(/^(http(s?):\/\/)?(([\w-]+\.)+[\w-]+)(\/[\w- ;,./?%&=]*)?$/);

const schemaParams = Joi.object({
  categoryId: id.required(),
});

const schemaBodyCreate = Joi.object({
  name: name.required(),
  description,
  imageUrl,
});

const schemaBodyUpdate = Joi.object({
  name,
  description,
  imageUrl,
});

export default { schemaParams, schemaBodyCreate, schemaBodyUpdate };
