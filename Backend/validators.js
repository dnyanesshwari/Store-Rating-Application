const Joi = require('joi');

// Validation schemas
const nameSchema = Joi.string().min(2).max(60).required()
    .messages({
        'string.min': 'Name must be at least 2 characters',
        'string.max': 'Name cannot exceed 60 characters',
        'any.required': 'Name is required'
    });

const addressSchema = Joi.string().max(400).allow('', null);

const passwordSchema = Joi.string()
    .min(8)
    .max(16)
    .pattern(/^(?=.*[A-Z])(?=.*[!@#$%^&*])/)
    .required()
    .messages({
        'string.min': 'Password must be at least 8 characters',
        'string.max': 'Password cannot exceed 16 characters',
        'string.pattern.base': 'Password must contain at least one uppercase letter and one special character',
        'any.required': 'Password is required'
    });

const emailSchema = Joi.string().email().required()
    .messages({
        'string.email': 'Please enter a valid email address',
        'any.required': 'Email is required'
    });

module.exports = {
    validateSignup: (data) => {
        const schema = Joi.object({
            name: nameSchema,
            email: emailSchema,
            password: passwordSchema,
            address: addressSchema
        });
        return schema.validate(data);
    },

    validateLogin: (data) => {
        const schema = Joi.object({
            email: emailSchema,
            password: Joi.string().required()
        });
        return schema.validate(data);
    },

    validatePasswordUpdate: (data) => {
        const schema = Joi.object({
            currentPassword: Joi.string().required(),
            newPassword: passwordSchema
        });
        return schema.validate(data);
    },

    validateStore: (data) => {
        const schema = Joi.object({
            name: Joi.string().min(3).max(100).required(),
            email: emailSchema,
            address: addressSchema.required(),
            ownerId: Joi.number().integer().positive().allow('', null)
        });
        return schema.validate(data);
    },

    validateUserCreate: (data) => {
        const schema = Joi.object({
            name: nameSchema,
            email: emailSchema,
            password: passwordSchema,
            address: addressSchema,
            role: Joi.string().valid('admin', 'user', 'owner').required()
        });
        return schema.validate(data);
    },

    validateRating: (data) => {
        const schema = Joi.object({
            storeId: Joi.number().integer().positive().required(),
            rating: Joi.number().integer().min(1).max(5).required()
        });
        return schema.validate(data);
    },

    validateSearch: (data) => {
        const schema = Joi.object({
            query: Joi.string().min(1).max(100).allow(''),
            search: Joi.string().min(1).max(100).allow(''),
            name: Joi.string().max(100).allow(''),
            email: Joi.string().email().allow(''),
            address: Joi.string().max(100).allow(''),
            role: Joi.string().valid('admin', 'user', 'owner').allow(''),
            sortField: Joi.string().valid('name', 'email', 'address', 'role', 'created_at', 'owner_id').allow(''),
            sortBy: Joi.string().valid('name', 'email', 'address', 'created_at').allow(''),
            sortDirection: Joi.string().valid('asc', 'desc').allow(''),
            page: Joi.number().integer().min(1),
            limit: Joi.number().integer().min(1).max(100)
        });
        return schema.validate(data);
    }
};
