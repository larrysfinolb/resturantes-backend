import Joi from 'joi';

const id = Joi.string().regex(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/);
const voucherUrl = Joi.string().regex(/^(http(s?):\/\/)?(([\w-]+\.)+[\w-]+)(\/[\w- ;,./?%&=]*)?$/);
const reference = Joi.string();
const dni = Joi.string().regex(/^[0-9]{7,}$/);
const status = Joi.equal('pending', 'approved', 'rejected');

const schemaParams = Joi.object({
  paymentId: id.required(),
});

const schemaBodyCreate = Joi.object({
  orderId: id.required(),
  voucherUrl: voucherUrl.required(),
  reference: reference.required(),
  dni: dni.required(),
});

const schemaBodyUpdate = Joi.object({
  status: status.required(),
});

export default { schemaParams, schemaBodyCreate, schemaBodyUpdate };
