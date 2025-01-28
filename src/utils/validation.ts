import Joi from 'joi';

export const registrationSchema = Joi.object({
  name: Joi.string().alphanum().min(3).max(20).required().messages({
    'string.empty': 'Name cannot be empty.',
    'string.alphanum': 'Name can only contain alphanumeric characters.',
    'string.min': 'Name must be at least 3 characters long.',
    'string.max': 'Name must be at most 20 characters long.',
    'any.required': 'Name is required.',
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Email must be a valid email address.',
    'any.required': 'Email is required.',
  }),
  password: Joi.string().min(8).required().messages({
    'string.empty': 'Password cannot be empty.',
    'string.min': 'Password must be at least 8 characters long.',
    'any.required': 'Password is required.',
  }),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
    'any.only': 'Passwords do not match.',
    'any.required': 'Confirm password is required.',
  }),
});
