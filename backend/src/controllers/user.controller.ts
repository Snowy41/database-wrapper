import {authenticate} from '../decorators/authenticate.decorator';
import {inject} from '@loopback/core';
import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  HttpErrors,
  param,
  patch,
  post,
  put,
  requestBody,
  response,
} from '@loopback/rest';
import {securityId, UserProfile} from '@loopback/security';
import {authorize} from '../decorators';
import {UserRole} from '../enums/userrole.enum';

import {
  SecurityBindings,
  TokenServiceBindings,
  UserServiceBindings,
} from '../keys';
import {User} from '../models';
import {Credentials, MyUserRepository} from '../repositories';
import {MyUserService, TokenService} from '../services';
import {use} from 'should';

@authenticate('jwt') // Apply the @authenticate decorator at the class level
export class UserController {
  constructor(
    @inject(UserServiceBindings.USER_SERVICE)
    public userService: MyUserService,
    @inject(TokenServiceBindings.TOKEN_SERVICE)
    public jwtService: TokenService,
    @inject(SecurityBindings.USER, {optional: true})
    public user: UserProfile,
    @inject('services.AuthorizationService')
    public authorizationService: MyUserService,
    @repository(MyUserRepository)
    protected userRepository: MyUserRepository,
  ) {}

  @authenticate.skip() // Skip authentincation process for login
  @post('/users/login', {
    // Login
    responses: {
      '200': {
        description: 'Token',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                token: {
                  type: 'string',
                },
              },
            },
          },
        },
      },
    },
  })
  async login(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['username', 'password'],
            properties: {
              username: {type: 'string'},
              password: {type: 'string'},
            },
          },
        },
      },
    })
    credentials: Credentials,
  ): Promise<{token: string}> {
    // Verify the credentials
    const user = await this.userService.verifyCredentials(credentials);
    if (!user) {
      throw new HttpErrors.Unauthorized('Invalid username or password');
    }

    // Convert user to user profile
    const userProfile = this.userService.convertToUserProfile(user);

    // Generate a JWT token
    const token = await this.jwtService.generateToken(userProfile);

    // Return the token
    return {token};
  }

  @authenticate.skip() // Skip authentincation process for signup
  @post('/signup') // SignUp
  async signUp(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, {
            title: 'NewUser',
            exclude: ['id'],
          }),
        },
      },
    })
    newUserRequest: Omit<User, 'id'>,
  ): Promise<User> {
    // Validates the credentials and proceed with the signup process
    return this.userService.validateAndCreateUser(newUserRequest);
  }

  @get('/whoAmI', {
    // Gets the authenticated user
    responses: {
      '200': {
        description: 'Return current user',
        content: {
          'application/json': {
            schema: {
              type: 'string',
            },
          },
        },
      },
    },
  })
  async whoAmI(
    @inject(SecurityBindings.USER)
    currentUserProfile: UserProfile,
  ): Promise<string> {
    return currentUserProfile[securityId];
  }

  @get('/users/count')
  @response(200, {
    description: 'User model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(@param.where(User) where?: Where<User>): Promise<Count> {
    return this.userService.countUsers(where);
  }

  @get('/users')
  @authorize([UserRole.Admin]) // Only admin can make a call to this endpoint
  @response(200, {
    description: 'Array of User model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(User, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @inject(SecurityBindings.USER) currentUser: UserProfile, // Inject current user profile
    @param.filter(User) filter?: Filter<User>,
  ): Promise<User[]> {
    await this.authorizationService.checkAuthorization(
      currentUser,
      'find',
      this,
    );
    return this.userService.getUsers();
  }

  @patch('/users')
  @authorize([UserRole.Admin]) // Only admin can make a call to this enpoint
  @response(200, {
    description: 'User PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, {partial: true}),
        },
      },
    })
    user: User,
    @param.where(User) where?: Where<User>,
  ): Promise<Count> {
    const count = await this.userService.updateAll(user, where);
    return {count};
  }

  @get('/users/{id}')
  @authorize([UserRole.Company])
  @response(200, {
    description: 'User model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(User, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(User, {exclude: 'where'}) filter?: FilterExcludingWhere<User>,
  ): Promise<User> {
    return this.userService.findById(id, filter);
  }

  @patch('/users/{id}')
  @response(204, {
    description: 'User PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, {partial: true}),
        },
      },
    })
    user: User,
  ): Promise<void> {
    this.userService.updateById(id, user);
  }
  @put('/users/{id}')
  @response(204, {
    description: 'User PUT success',
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() user: User,
  ): Promise<void> {
    this.userService.replaceById(id, user);
  }

  @del('/users/{id}')
  @response(204, {
    description: 'User DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    this.userService.deleteById(id);
  }
}
