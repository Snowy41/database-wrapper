import {SchemaObject} from '@loopback/rest';

// Define the credentials schema
export const CredentialsSchema: SchemaObject = {
  type: 'object',
  required: ['username', 'password'],
  properties: {
    username: {
      type: 'string',
      maxLength: 10,
    },
    password: {
      type: 'string',
      minLength: 8,
    },
  },
};
