import Joi from 'joi';

const idParamStr = Joi.string().pattern(/^\d+$/).required().messages({
  'string.pattern.base': 'ID must be a positive integer string.',
  'any.required': 'ID is required.',
});

const idParamNumber = Joi.number().integer().required().messages({
  'number.integer': 'ID must be a positive integer.',
  'any.required': 'ID is required.',
});

const registrationSchema = Joi.object({
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

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Email must be a valid email address.',
    'any.required': 'Email is required.',
  }),
  password: Joi.string().required().messages({
    'string.empty': 'Password cannot be empty.',
    'any.required': 'Password is required.',
  }),
});

const updateAccessSchema = Joi.object({
  refreshToken: Joi.string()
    .required()
    .pattern(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/)
    .messages({
      'string.pattern.base': 'Refresh token must be a valid JWT.',
      'string.empty': 'Refresh token cannot be empty.',
      'any.required': 'Refresh token is required.',
    }),
});

export const getDeveloperTimeSchema = {
  params: Joi.object({
    devId: idParamStr,
  }),

  query: Joi.object({
    timeFilter: Joi.string().valid('week', 'month', 'hour').optional().messages({
      'any.only': 'timeFilter must be one of: week, month, hour.',
    }),

    projectIds: Joi.string()
      .pattern(/^\d+(,\d+)*$/)
      .optional()
      .messages({
        'string.pattern.base': 'projectIds must be a comma-separated list of numbers.',
      }),
  }),
};

const projectSchema = Joi.object({
  title: Joi.string().min(3).max(100).required().messages({
    'string.empty': 'Title cannot be empty.',
    'string.min': 'Title must be at least 3 characters long.',
    'string.max': 'Title must be at most 20 characters long.',
    'any.required': 'Title is required.',
  }),
  description: Joi.string().max(1000).messages({
    'string.max': 'Description must be at most 1000 characters long.',
  }),
});

const projectTimeSchema = Joi.object({
  projectId: idParamStr,
  timeFilter: Joi.string().valid('week', 'month', 'hour').required().messages({
    'any.only': 'timeFilter must be one of: week, month, hour.',
  }),
});

const addUserToProjectSchema = Joi.object({
  projectId: idParamStr,
  addedUserId: idParamNumber,
});

const removeUserFromProjectSchema = Joi.object({
  projectId: idParamStr,
  removedUserId: idParamNumber,
});

const deleteProjectSchema = Joi.object({
  projectId: idParamStr,
});

const taskSchema = Joi.object({
  title: Joi.string().min(3).max(200).required().messages({
    'string.empty': 'Title cannot be empty.',
    'string.min': 'Title must be at least 3 characters long.',
    'string.max': 'Title must be at most 20 characters long.',
    'any.required': 'Title is required.',
  }),
  description: Joi.string().max(1000).messages({
    'string.max': 'Description must be at most 1000 characters long.',
  }),
  deadline: Joi.date().required().messages({
    'string.empty': 'Deadline cannot be empty.',
    'any.required': 'Deadline is required.',
  }),
  projectId: idParamStr,
});

const assignTaskSchema = Joi.object({
  taskId: idParamStr,
  projectId: idParamStr,
  performerId: idParamNumber,
});

const changeTaskStatusSchema = Joi.object({
  taskId: idParamStr,
  projectId: idParamStr,
  status: Joi.string().valid('CREATED', 'IN_PROGRESS', 'DONE').required().messages({
    'any.only': 'Status must be one of: CREATED, IN_PROGRESS, DONE.',
    'any.required': 'Status is required.',
  }),
});

const deleteTaskSchema = Joi.object({
  taskId: idParamStr,
  projectId: idParamStr,
});

export {
  registrationSchema,
  loginSchema,
  updateAccessSchema,
  projectSchema,
  projectTimeSchema,
  deleteProjectSchema,
  addUserToProjectSchema,
  removeUserFromProjectSchema,
  taskSchema,
  assignTaskSchema,
  changeTaskStatusSchema,
  deleteTaskSchema,
};
