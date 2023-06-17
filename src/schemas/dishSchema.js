import Joi from 'joi';

const id = Joi.string().regex(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/);
const name = Joi.string().regex(/^[\w\s\-_,.()À-ÿ]{1,50}$/);
const price = Joi.number().min(0).max(9999.99);
const imageUrl = Joi.string().regex(/^[\w\s\-_,.()À-ÿ]{1,50}$/);

const schemaParams = Joi.object({
  dishId: id.required(),
});

const schemaBodyCreate = Joi.object({
  name: name.required(),
  price: price.required(),
  imageUrl,
});

const schemaBodyUpdate = Joi.object({
  name,
  price,
  imageUrl,
});

export default { schemaParams, schemaBodyCreate, schemaBodyUpdate };
