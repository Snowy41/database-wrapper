import {injectable, BindingScope, MetadataInspector} from '@loopback/core';
import {
  Count,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {HttpErrors, SchemaObject} from '@loopback/rest';
import {compare} from 'bcryptjs';
import {
  AuthorizationMetadata,
  AUTHORIZATION_METADATA_KEY,
} from '../decorators/authorize.decorator';
import {UserRole} from '../enums/userrole.enum';
import {User, UserCredentials, UserWithRelations} from '../models';
import {MyUserRepository, UserCredentialsRepository} from '../repositories';
import {UserProfile, securityId} from '../types';
import {UserService} from './user.service-interface';
import {hash, genSalt} from 'bcryptjs';

/**
 * A pre-defined type for user credentials. It assumes a user logs in
 * using the email and password. You can modify it if your app has different credential fields
 */

export type Credentials = {
  username: string;
  password: string;
};

@injectable({scope: BindingScope.SINGLETON})
export class MyUserService implements UserService<User, Credentials> {
  constructor(
    @repository(MyUserRepository) public userRepository: MyUserRepository,
    @repository(UserCredentialsRepository)
    public userCredentialsRepository: UserCredentialsRepository,
  ) {}

  async verifyCredentials(credentials: Credentials): Promise<User> {
    const invalidCredentialsError = 'Invalid username or password.';

    const foundUser = await this.userRepository.findOne({
      where: {userName: credentials.username},
    });
    if (!foundUser) {
      throw new HttpErrors.Unauthorized(invalidCredentialsError);
    }

    const credentialsFound = await this.userRepository.findCredentials(
      foundUser.id,
    );
    if (!credentialsFound) {
      throw new HttpErrors.Unauthorized(invalidCredentialsError);
    }

    const passwordMatched = await compare(
      credentials.password,
      credentialsFound.password,
    );

    if (!passwordMatched) {
      throw new HttpErrors.Unauthorized(invalidCredentialsError);
    }

    return foundUser;
  }

  async checkAuthorization(
    user: UserProfile,
    methodName: string,
    target: Object,
  ): Promise<void> {
    const metadata: AuthorizationMetadata | undefined =
      MetadataInspector.getMethodMetadata<AuthorizationMetadata>(
        AUTHORIZATION_METADATA_KEY,
        target,
        methodName,
      );

    if (metadata) {
      const allowedRoles = metadata.allowedRoles;
      const userRole = await this.getUserRole(user[securityId]);

      if (!allowedRoles.includes(userRole as UserRole)) {
        throw new HttpErrors.Forbidden(
          'User does not have permission to perform this action.',
        );
      }
    }
  }

  private async getUserRole(userId: string): Promise<UserRole> {
    const user = await this.findUserById(userId);
    return user.role as UserRole;
  }

  convertToUserProfile(user: User): UserProfile {
    return {
      [securityId]: user.id?.toString() || '',
      id: user.id,
      roles: [user.role],
      firstname: user.firstName,
      lastname: user.lastName,
      username: user.userName,
      phonenumber: user.phoneNumber,
    };
  }

  async findUserById(id: string): Promise<User & UserWithRelations> {
    const idNr = parseInt(id);
    const userNotfound = 'invalid User';
    const foundUser = await this.userRepository.findOne({
      where: {id: idNr},
    });

    if (!foundUser) {
      throw new HttpErrors.Unauthorized(userNotfound);
    }
    return foundUser;
  }
  // Validate and create user logic
  async validateAndCreateUser(newUserRequest: Omit<User, 'id'>): Promise<User> {
    // Validation logic for first name and last name
    const namePattern = /^[a-zA-Z\s-]+$/;

    if (!namePattern.test(newUserRequest.firstName)) {
      throw new HttpErrors.BadRequest(
        'First name should not contain any special characters.',
      );
    }

    if (!namePattern.test(newUserRequest.lastName)) {
      throw new HttpErrors.BadRequest(
        'Last name should not contain any special characters.',
      );
    }

    if (newUserRequest.firstName.length > 10) {
      throw new HttpErrors.BadRequest(
        'First name should have a maximum of 10 characters.',
      );
    }

    if (newUserRequest.lastName.length > 10) {
      throw new HttpErrors.BadRequest(
        'Last name should have a maximum of 10 characters.',
      );
    }

    // Validation logic for phone number
    const phoneNumberPattern = /^\d{10}$/;
    if (!phoneNumberPattern.test(newUserRequest.phoneNumber)) {
      throw new HttpErrors.BadRequest(
        'Phone number must be exactly 10 digits and contain no special characters.',
      );
    }

    // Validation logic for email
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(newUserRequest.email)) {
      throw new HttpErrors.BadRequest('Invalid email format.');
    }

    // Validation logic for username and password
    const usernamePattern = /^[a-zA-Z0-9]+$/;
    if (
      typeof newUserRequest.userName !== 'string' ||
      !usernamePattern.test(newUserRequest.userName)
    ) {
      throw new HttpErrors.BadRequest(
        'Username must not contain special characters.',
      );
    }
    const existingUsername = await this.userRepository.findOne({
      where: {userName: newUserRequest.userName},
    });
    if (existingUsername) {
      throw new HttpErrors.BadRequest('Username is already in use.');
    }

    if (
      typeof newUserRequest.password !== 'string' ||
      newUserRequest.password.length < 8
    ) {
      throw new HttpErrors.BadRequest(
        'Password must be at least 8 characters long.',
      );
    }

    // Check if email is already in use
    const existingUser = await this.userRepository.findOne({
      where: {email: newUserRequest.email},
    });
    if (existingUser) {
      throw new HttpErrors.BadRequest('Email is already in use.');
    }

    // Hash the password before saving
    const hashedPassword = await hash(newUserRequest.password, await genSalt());
    newUserRequest.password = hashedPassword;

    // Create the user and associated credentials
    const createdUser = await this.userRepository.create(newUserRequest);

    const userCredentials = new UserCredentials({
      username: createdUser.userName,
      userId: createdUser.id,
      password: hashedPassword, // or other relevant data
    });
    await this.userCredentialsRepository.create(userCredentials);

    return createdUser;
  }
  async getUsers(): Promise<User[]> {
    try {
      const users = await this.userRepository.find();
      return users;
    } catch (error) {
      // Handle any errors that occur during the process
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  async updateAll(user: User, where?: any): Promise<number> {
    const countResult = await this.userRepository.updateAll(user, where);
    return countResult.count;
  }

  countUsers(where?: Where<User>): Promise<Count> {
    return this.userRepository.count(where);
  }

  findById(id: number, filter?: FilterExcludingWhere<User>): Promise<User> {
    return this.userRepository.findById(id, filter);
  }
  updateById(id: number, user: User): void {
    this.userRepository.updateById(id, user);
  }

  replaceById(id: number, user: User): void {
    this.userRepository.replaceById(id, user);
  }

  deleteById(id: number): void {
    this.userRepository.deleteById(id);
  }
}
