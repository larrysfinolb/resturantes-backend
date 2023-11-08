import Joi from 'joi';

const id = Joi.string().regex(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/);
const fullName = Joi.string().regex(/^[A-Za-zÀ-ÿ\s']+$/);
const dni = Joi.string().regex(/^[0-9]{7,8}$/);
const phone = Joi.string().regex(/^\+?\d{1,3}[-.\s]?\(?\d{1,3}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}$/);
const active = Joi.boolean();

const schemaParams = Joi.object({
  customerId: id.required(),
});

const schemaUpdate = Joi.object({
  fullName,
  dni,
  phone,
  active,
});

export default { schemaParams, schemaUpdate };
