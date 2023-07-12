import Joi from 'joi';

const id = Joi.string().regex(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/);
const quantity = Joi.number().min(1).max(99);
const details = Joi.string().regex(/^[\w\s\-_,.()À-ÿ]{1,500}$/);

const schemaParams = Joi.object({
  orderId: id.required(),
});

const schemaBodyCreate = Joi.object({
  tableId: id.required(),
  dishes: Joi.array()
    .items(
      Joi.object({
        id: id.required(),
        quantity: quantity.required(),
        details,
      })
    )
    .min(1)
    .required(),
});

export default { schemaParams, schemaBodyCreate };
