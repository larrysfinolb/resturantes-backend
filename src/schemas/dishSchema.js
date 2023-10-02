import Joi from 'joi';

const id = Joi.string().regex(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/);
const name = Joi.string().regex(/^[\w\s\-_,.()À-ÿ]{1,50}$/);
const description = Joi.string().regex(/^[\w\s\-_,.()À-ÿ]{1,255}$/);
const price = Joi.number().min(0).max(9999.99);
const active = Joi.boolean();

const schemaParams = Joi.object({
  dishId: id.required(),
});

const schemaBodyCreate = Joi.object({
  categoryId: id,
  name: name.required(),
  description,
  price: price.required(),
});

const schemaBodyUpdate = Joi.object({
  categoryId: id,
  name,
  description,
  price,
  active,
});

export default { schemaParams, schemaBodyCreate, schemaBodyUpdate };
