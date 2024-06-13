import {BindingKey, MetadataAccessor} from '@loopback/core';
import {Middleware} from '@loopback/rest';
import {
  AuthenticateFn,
  AuthenticationMetadata,
  AuthenticationStrategy,
  RefreshTokenService,
  Subject,
  UserProfile,
  UserProfileFactory,
} from './types';

import {Credentials, TokenService, UserService} from './services';
import {User} from './models';

export namespace SecurityBindings {
  export const SUBJECT = BindingKey.create<Subject>('security.subject');
  export const USER = BindingKey.create<UserProfile>('security.user');
}

export namespace AuthenticationBindings {
  export const USER_PROFILE_FACTORY = BindingKey.create<
    UserProfileFactory<any>
  >('authentication.userProfileFactory');

  export const STRATEGY = BindingKey.create<
    AuthenticationStrategy | AuthenticationStrategy[] | undefined
  >('authentication.strategy');

  export const AUTH_ACTION = BindingKey.create<AuthenticateFn>(
    'authentication.actions.authenticate',
  );

  export const AUTHENTICATION_MIDDLEWARE = BindingKey.create<Middleware>(
    'middleware.authentication',
  );

  export const METADATA = BindingKey.create<
    AuthenticationMetadata[] | undefined
  >('authentication.operationMetadata');

  export const AUTHENTICATION_STRATEGY_EXTENSION_POINT_NAME =
    'authentication.strategies';

  export const CURRENT_USER: BindingKey<UserProfile> = SecurityBindings.USER;

  export const AUTHENTICATION_REDIRECT_URL = BindingKey.create<string>(
    'authentication.redirect.url',
  );

  export const AUTHENTICATION_REDIRECT_STATUS = BindingKey.create<number>(
    'authentication.redirect.status',
  );
}

export const AUTHENTICATION_METADATA_METHOD_KEY = MetadataAccessor.create<
  AuthenticationMetadata,
  MethodDecorator
>('authentication:method');

export const AUTHENTICATION_METADATA_KEY = AUTHENTICATION_METADATA_METHOD_KEY;

export const AUTHENTICATION_METADATA_CLASS_KEY = MetadataAccessor.create<
  AuthenticationMetadata,
  ClassDecorator
>('authentication:class');

export namespace TokenServiceConstants {
  export const TOKEN_SECRET_VALUE = 'myjwts3cr3t';
  export const TOKEN_EXPIRES_IN_VALUE = '21600';
}

export namespace TokenServiceBindings {
  export const TOKEN_SECRET = BindingKey.create<string>(
    'authentication.jwt.secret',
  );
  export const TOKEN_EXPIRES_IN = BindingKey.create<string>(
    'authentication.jwt.expires.in.seconds',
  );
  export const TOKEN_SERVICE = BindingKey.create<TokenService>(
    'services.authentication.jwt.tokenservice',
  );
}

export namespace UserServiceBindings {
  export const USER_SERVICE = BindingKey.create<UserService<User, Credentials>>(
    'services.user.service',
  );

  export const DATASOURCE_NAME = 'jwtdb';
  export const USER_REPOSITORY = 'repositories.UserRepository';
  export const USER_CREDENTIALS_REPOSITORY =
    'repositories.UserCredentialsRepository';
}

export namespace RefreshTokenConstants {
  export const REFRESH_SECRET_VALUE = 'r3fr35htok3n';
  export const REFRESH_EXPIRES_IN_VALUE = '216000';
  export const REFRESH_ISSUER_VALUE = 'loopback4';
}

export namespace RefreshTokenServiceBindings {
  export const REFRESH_TOKEN_SERVICE = BindingKey.create<RefreshTokenService>(
    'services.authentication.jwt.refresh.tokenservice',
  );
  export const REFRESH_SECRET = BindingKey.create<string>(
    'authentication.jwt.refresh.secret',
  );
  export const REFRESH_EXPIRES_IN = BindingKey.create<string>(
    'authentication.jwt.refresh.expires.in.seconds',
  );
  export const REFRESH_ISSUER = BindingKey.create<string>(
    'authentication.jwt.refresh.issuer',
  );
  export const DATASOURCE_NAME = 'refreshdb';
  export const REFRESH_REPOSITORY = 'repositories.RefreshTokenRepository';
}
