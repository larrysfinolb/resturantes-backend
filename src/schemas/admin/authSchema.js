import Joi from 'joi';

const username = Joi.string().regex(/^[a-zA-Z0-9_]{3,16}$/);
const password = Joi.string().regex(/^[\s\S]{8,}$/);

const login = Joi.object({
  username: username.required(),
  password: password.required(),
});

const changeUsernamePassword = Joi.object({
  username,
  password,
});

export default { login, changeUsernamePassword };
