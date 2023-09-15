import Joi from 'joi';

const fullName = Joi.string().regex(/^[A-Za-zÀ-ÿ\s']+$/);
const email = Joi.string().regex(/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/);
const dni = Joi.string().regex(/^[0-9]{7,8}$/);
const phone = Joi.string().regex(/^\+?\d{1,3}[-.\s]?\(?\d{1,3}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}$/);
const password = Joi.string().regex(/^[\s\S]{8,}$/);
const tableId = Joi.string().regex(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/);

const signup = Joi.object({
  fullName: fullName.required(),
  email: email.required(),
  dni: dni.required(),
  phone: phone.required(),
  password: password.required(),
  tableId: tableId.required(),
});

const login = Joi.object({
  email: email.required(),
  password: password.required(),
});

const recoverPassword = Joi.object({
  email: email.required(),
});

const changePassword = Joi.object({
  password: password.required(),
});

export default { signup, login, recoverPassword, changePassword };
