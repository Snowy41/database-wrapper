// Copyright IBM Corp. and LoopBack contributors 2018,2020. All Rights Reserved.
// Node module: @loopback/authentication
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  addExtension,
  Binding,
  BindingTemplate,
  Constructor,
  Context,
  extensionFor,
} from '@loopback/core';
import {RedirectRoute, Request} from '@loopback/rest';
import {AuthenticationBindings} from './keys';
import {securityId} from '@loopback/security';

// ---- beginning security key import

/**
 * A symbol for stringified id of security related objects
 *
 *
 */

/**
 * Represent a user, an application, or a device
 */
export interface Principal {
  /**
   * Name/id
   */
  [securityId]: string;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [attribute: string]: any;
}

export class TypedPrincipal implements Principal {
  constructor(
    public readonly principal: Principal,
    public readonly type: string,
  ) {}
  get [securityId]() {
    return `${this.type}:${this.principal[securityId]}`;
  }
}

/**
 * The minimum set of attributes that describe a user.
 */
export interface UserProfile extends Principal {
  // `email` and `name` are added to be identical with the
  // `UserProfile` that previously was exported by `@loopback/authentication`
  //changed email to username

  username?: string;
  name?: string;
}

export interface Organization extends Principal {}

export interface Team extends Principal {}

export interface ClientApplication extends Principal {}

export interface Role extends Principal {
  name: string;
}

/**
 * Security attributes used to authenticate the subject. Such credentials
 * include passwords, Kerberos tickets, and public key certificates.
 */
export interface Credential {}

/**
 * `Permission` defines an action/access against a protected resource. It's
 * the `what` for security.
 *
 * There are three levels of permissions
 *
 * - Resource level (Order, User)
 * - Instance level (Order-0001, User-1001)
 * - Property level (User-0001.email)
 *
 * @example
 * - create a user (action: create, resource type: user)
 * - read email of a user (action: read, resource property: user.email)
 * - change email of a user (action: update, resource property: user.email)
 * - cancel an order (action: delete, resource type: order)
 */
export class Permission {
  /**
   * Action or access of a protected resources, such as `read`, `create`,
   * `update`, or `delete`
   */
  action: string;

  /**
   * Type of protected resource, such as `Order` or `Customer`
   */
  resourceType: string;
  /**
   * Property of a protected resource type/instance, such as `email`
   */
  resourceProperty?: string;
  /**
   * Identity of a protected resource instance, such as `order-0001` or
   * `customer-101`
   */
  resourceId?: string;

  get [securityId]() {
    const resIds: string[] = [];
    resIds.push(this.resourceType);
    if (this.resourceProperty) {
      resIds.push(this.resourceProperty);
    }
    const inst = this.resourceId ? `:${this.resourceId}` : '';

    return `${resIds.join('.')}:${this.action}${inst}`;
  }
}

/**
 * oAuth 2.0 scope
 */
export interface Scope extends Permission {
  name: string;
}

/**
 * `Subject` represents both security state and operations for a single
 * request. It's the `who` for security.
 *
 * Such operations include:
 * - authentication (login)
 * - authorization (access control)
 * - session access
 * - logout
 *
 */
export interface Subject {
  /**
   * An array of principals. It can include information about the current user,
   * the client application, and granted authorities.
   *
   * `Subject` represents both security state and operations for a single
   * application user.
   *
   * Such operations include:
   * - authentication (login)
   * - authorization (access control)
   * - session access
   * - logout
   */
  principals: Set<TypedPrincipal>;

  /**
   * An array of credentials, such as password, access token, or private/public
   * keys.
   */
  credentials: Set<Credential>;

  /**
   * An array of authorities granted by the user to the client application. One
   * example is {@link https://tools.ietf.org/html/rfc6749#section-3.3 | oAuth2 scopes).
   */
  authorities: Set<Permission>;
}

/**
 * Default implementation of `Subject`
 */
export class DefaultSubject implements Subject {
  readonly principals = new Set<TypedPrincipal>();
  readonly authorities = new Set<Permission>();
  readonly credentials = new Set<Credential>();

  addUser(...users: UserProfile[]) {
    for (const user of users) {
      this.principals.add(new TypedPrincipal(user, 'USER'));
    }
  }

  addApplication(app: ClientApplication) {
    this.principals.add(new TypedPrincipal(app, 'APPLICATION'));
  }

  addAuthority(...authorities: Permission[]) {
    for (const authority of authorities) {
      this.authorities.add(authority);
    }
  }

  addCredential(...credentials: Credential[]) {
    for (const credential of credentials) {
      this.credentials.add(credential);
    }
  }

  getPrincipal(type: string) {
    let principal: Principal | undefined;
    for (const p of this.principals) {
      if (p.type === type) {
        principal = p.principal;
        break;
      }
    }
    return principal;
  }

  get user() {
    return this.getPrincipal('USER') as UserProfile | undefined;
  }
}
//------ end security  import

// ---- authentication import

// Copyright IBM Corp. and LoopBack contributors 2018,2020. All Rights Reserved.
// Node module: @loopback/authentication
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/**
 * Authentication metadata stored via Reflection API
 */
export interface AuthenticationMetadata {
  /**
   * Name of the authentication strategy
   */
  strategy: string;
  /**
   * Options for the authentication strategy
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options?: {[name: string]: any};
  /**
   * A flag to skip authentication
   */
  skip?: boolean;
}

/**
 * interface definition of a factory function which
 * accepts a user definition and returns the user profile
 */
export interface UserProfileFactory<U> {
  (user: U): UserProfile;
}

/**
 * interface definition of a function which accepts a request
 * and returns an authenticated user
 */
export interface AuthenticateFn {
  (request: Request): Promise<UserProfile | undefined>;
}

/**
 * Options for authentication component
 */
export interface AuthenticationOptions {
  /**
   * Default authentication metadata if a method or class is not decorated with
   * `@authenticate`. If not set, no default authentication will be enforced for
   * those methods without authentication metadata.
   */
  defaultMetadata?: AuthenticationMetadata[];

  /**
   * This flag allows an authentication strategy to abort the authentication by
   * throwing an error if `failOnError` is set to `true`. By default, the
   * authentication process continues to the next one even when a strategy
   * throws an error. If one of other strategies succeed, the error will be
   * discarded.
   */
  failOnError?: boolean;
}

/**
 * An interface that describes the common authentication strategy.
 *
 * An authentication strategy is a class with an
 * 'authenticate' method that verifies a user's credentials and
 * returns the corresponding user profile.
 *
 */
export interface AuthenticationStrategy {
  /**
   * The 'name' property is a unique identifier for the
   * authentication strategy ( for example : 'basic', 'jwt', etc)
   */
  name: string;

  /**
   * The 'authenticate' method takes in a given request and returns a user profile
   * which is an instance of 'UserProfile'.
   * (A user profile is a minimal subset of a user object)
   * If the user credentials are valid, this method should return a 'UserProfile' instance.
   * If the user credentials are invalid, this method should throw an error
   * If the user credentials are missing, this method should throw an error, or return 'undefined'
   * and let the authentication action deal with it.
   *
   * @param request - Express request object
   */
  authenticate(
    request: Request,
  ): Promise<UserProfile | RedirectRoute | undefined>;
}

export const AUTHENTICATION_STRATEGY_NOT_FOUND =
  'AUTHENTICATION_STRATEGY_NOT_FOUND';

export const USER_PROFILE_NOT_FOUND = 'USER_PROFILE_NOT_FOUND';

/**
 * Registers an authentication strategy as an extension of the
 * AuthenticationBindings.AUTHENTICATION_STRATEGY_EXTENSION_POINT_NAME extension
 * point.
 *
 * @param context - Context object
 * @param strategyClass - Class for the authentication strategy
 */
export function registerAuthenticationStrategy(
  context: Context,
  strategyClass: Constructor<AuthenticationStrategy>,
): Binding<unknown> {
  return addExtension(
    context,
    AuthenticationBindings.AUTHENTICATION_STRATEGY_EXTENSION_POINT_NAME,
    strategyClass,
    {
      namespace:
        AuthenticationBindings.AUTHENTICATION_STRATEGY_EXTENSION_POINT_NAME,
    },
  );
}

/**
 * A binding template for auth strategy contributor extensions
 */
export const asAuthStrategy: BindingTemplate = binding => {
  extensionFor(
    AuthenticationBindings.AUTHENTICATION_STRATEGY_EXTENSION_POINT_NAME,
  )(binding);
  binding.tag({
    namespace:
      AuthenticationBindings.AUTHENTICATION_STRATEGY_EXTENSION_POINT_NAME,
  });
};

/**
 * Get the authentication metadata object for the specified strategy.
 *
 * @param metadata - Array of authentication metadata objects
 * @param strategyName - Name of the authentication strategy
 */
export function getAuthenticationMetadataForStrategy(
  metadata: AuthenticationMetadata[],
  strategyName: string,
): AuthenticationMetadata | undefined {
  return metadata.find(data => data.strategy === strategyName);
}
//// ---- end authentication import

/// ---- start jwt authentication import
// Copyright IBM Corp. and LoopBack contributors 2020. All Rights Reserved.
// Node module: @loopback/authentication-jwt
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/**
 * Describes the token object that returned by the refresh token service functions.
 */
export type TokenObject = {
  accessToken: string;
  expiresIn?: string | undefined;
  refreshToken?: string | undefined;
};

/**
 * The token refresh service. An access token expires in limited time. Therefore
 * token refresh service is needed to keep replacing the old access token with
 * a new one periodically.
 */
export interface RefreshTokenService {
  /**
   * Generate a refresh token, bind it with the given user profile + access
   * token, then store them in backend.
   */
  generateToken(userProfile: UserProfile, token: string): Promise<TokenObject>;

  /**
   * Refresh the access token bound with the given refresh token.
   */
  refreshToken(refreshToken: string): Promise<TokenObject>;
}
export {securityId};
