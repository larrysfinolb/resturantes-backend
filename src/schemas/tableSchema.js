import Joi from 'joi';

const id = Joi.string().regex(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/);
const description = Joi.string().regex(/^[\w\s\-_,.()À-ÿ]{1,50}$/);

const schemaParams = Joi.object({
  tableId: id.required(),
});

const schemaBody = Joi.object({
  description: description.required(),
});

export default { schemaParams, schemaBody };
