import Joi from 'joi';

const id = Joi.string().regex(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/);
const reference = Joi.string();
const dni = Joi.string().regex(/^[0-9]{7,}$/);
const status = Joi.equal('pending', 'approved', 'rejected');
const type = Joi.equal('cash', 'card', 'transfer');
const amount = Joi.number().min(0);
const message = Joi.string().allow(null, '');

const schemaParams = Joi.object({
  paymentId: id.required(),
});

const schemaBodyCreate = Joi.object({
  orderId: id.required(),
  reference,
  dni: dni.required(),
  type: type.required(),
  amount: amount.required(),
  bankId: id,
});

const schemaBodyUpdate = Joi.object({
  status: status.required(),
  message,
});

export default { schemaParams, schemaBodyCreate, schemaBodyUpdate };
