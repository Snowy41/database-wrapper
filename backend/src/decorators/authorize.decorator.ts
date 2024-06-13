import {MethodDecoratorFactory} from '@loopback/core';
import {UserRole} from '../enums/userrole.enum';

// Define an interface to represent authorization metadata
export interface AuthorizationMetadata {
  allowedRoles: UserRole[]; // Array of allowed users
}

// Unique identify authorization metadata
export const AUTHORIZATION_METADATA_KEY = 'authorization.metadata';

// Define a method decorator in order to attach authorization metadata to methods/class
export function authorize(allowedRoles: UserRole[]): MethodDecorator {
  return MethodDecoratorFactory.createDecorator<AuthorizationMetadata>(
    AUTHORIZATION_METADATA_KEY,
    {allowedRoles},
  );
}
