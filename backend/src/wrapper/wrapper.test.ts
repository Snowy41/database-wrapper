import {Getter} from '@loopback/core';
import {DatabaseWrapper} from './wrapper';
import {MyUserRepository} from '../repositories/user.repository';
import {DbDataSource} from '../datasources/db.datasource';
import {DonationRepository, FoodRepository, UserCredentialsRepository} from "../repositories";
import {UserRole} from "../enums/userrole.enum";
import test from "node:test";

// Mock the UserRepository
jest.mock('../repositories/user.repository');

describe('DatabaseWrapper', () => {
  let databaseWrapper: DatabaseWrapper;
  let userRepo: jest.Mocked<MyUserRepository>;
  let donationRepo: jest.Mocked<DonationRepository>;
  let foodRepo: jest.Mocked<FoodRepository>;


  let dataSource: DbDataSource;
  let getterFunction: Getter<UserCredentialsRepository>;

  beforeEach(() => {
      dataSource = new DbDataSource();
      getterFunction = jest.fn();
      userRepo = new MyUserRepository(dataSource, getterFunction) as jest.Mocked<MyUserRepository>;

      databaseWrapper = new DatabaseWrapper(userRepo, donationRepo, foodRepo);
  });

  test('readFromUserDatabase returns data from the User database', async () => {
      const mockData = [{
          firstName: 'John',
          lastName: 'Doe',
          userName: 'john_doe',
          phoneNumber: '1234567890',
          password: 'password',
          email: 'test@mail.com',
          userRole: UserRole.NormalUser,
          role: "User",
          userCredentials: {},
      }];
      userRepo.find.mockResolvedValue(mockData);

    const data = await databaseWrapper.readFromUserDatabase({where: {userName: 'john_doe'}}).catch(error => console.error(`Error: ${error}`));
    expect(data).toEqual(mockData);
  });

  test('readFromDonationDatabase returns data from the Donation database', async () => {
      const mockData = [{
            id: 2,
            userId: 2,
            itemId: 2,
            donatedByUser: 2,
      }];
      userRepo.find.mockResolvedValue(mockData);

      const data = await databaseWrapper.readFromUserDatabase({where: {userId: 2}}).catch(error => console.error(`Error: ${error}`));
      expect(data).toEqual(mockData);
  });

  test('readFromFoodDatabase returns data from the Food database', async () => {
      const mockData = [{
          id: 2,
          donatorId: 2,
          picture: Buffer.from('test'),
          quantity: 2,
          quantityType: "Test",
          message: "Test",
          friendUsername: "Test",
      }];
      userRepo.find.mockResolvedValue(mockData);

      const data = await databaseWrapper.readFromUserDatabase({where: {quantity: 2}}).catch(error => console.error(`Error: ${error}`));
      expect(data).toEqual(mockData);
  });

  test('writeToUserDatabase writes data to the User database', async () => {
    const mockData = [{
        id: 2,
        firstName: 'John',
        lastName: 'Doe',
        userName: 'john_doe',
        phoneNumber: '1234567890',
        password: 'password',
        email: 'test@mail.com',
        userRole: UserRole.NormalUser,
    }];
    userRepo.create.mockResolvedValue(mockData);

    const data = await databaseWrapper.writeToUserDatabase({
        firstName: 'John',
        lastName: 'Doe',
        userName: 'john_doe',
        phoneNumber: '1234567890',
        password: 'password',
        email: 'test123@gmail.com',
    }).catch(error => console.error(`Error: ${error}`));

    expect(data).toEqual(mockData);
  });

  test('writeToDonationDatabase writes data to the Donation database', async () => {
      const mockData = {
          id: 1,
          userId: 1,
          itemId: 1,
          donatedByUser: 1,
      };
      donationRepo.create.mockResolvedValue(mockData);

        const data = await databaseWrapper.writeToDonationDatabase({
            userId: 2,
            itemId: 2,
            donatedByUser: 2,
        });
        expect(data).toEqual(mockData);
    });

  test('writeToFoodDatabase writes data to the Food database', async () => {
      const mockData = [{
          id: 2,
          donatorId: 2,
          picture: Buffer.from('test'),
          quantity: 2,
          quantityType: "Test",
          message: "Test",
          friendUsername: "Test",
      }];
      donationRepo.create.mockResolvedValue(mockData);

      const data = await databaseWrapper.writeToFoodDatabase({
          donatorId: 2,
          picture: Buffer.from('test'),
          quantity: 2,
          quantityType: "Test",
          message: "Test",
          friendUsername: "Test",
      }).catch(error => console.error(`Error: ${error}`));
      expect(data).toEqual(mockData);
  });

  test('deleteFromUserDatabase deletes data from the User database', async () => {
      const mockData = [{
          id: 2,
          firstName: 'John',
          lastName: 'Doe',
          userName: 'john_doe',
          phoneNumber: '1234567890',
          password: 'password',
          email: '',
          userRole: UserRole.NormalUser,
      }];

      userRepo.delete.mockResolvedValue(mockData);
      const data = await databaseWrapper.deleteUserById(2).catch(error => console.error(`Error: ${error}`));
      expect(data).toEqual(mockData);
  });

  test("updateUserById updates data in the User database", () => {
      const mockData = [{
          id: 2,
          firstName: 'John',
          lastName: 'Doe',
          userName: 'john_doe',
          phoneNumber: '1234567890',
          password: 'password',
          email: '',
          userRole: UserRole.NormalUser,
      }];

      userRepo.updateById.mockResolvedValue(mockData);
      const data = databaseWrapper.updateUserById(2, {
          firstName: 'John',
          lastName: 'Doe',
          userName: 'john_doe',
          phoneNumber: '1234567890',
          password: 'password',
          email: '',
      }).catch(error => console.error(`Error: ${error}`));

      expect(data).toEqual(mockData);
  });

});