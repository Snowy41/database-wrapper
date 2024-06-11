import { DatabaseService } from './DatabaseService';

describe('DatabaseService', () => {
  let service;

  // Ensure there is a DatabaseService object for each test
  beforeEach(() => {
    service = new DatabaseService();
  });

  it('Writing to database. (multiple elements)', async () => {
    // Create constants for used values
    const table = 'UserTest';
    const columns = ['name', 'test'];
    const values = ['Frank1', 'false'];

    // Write data to the database
    await service.writeToDatabase(table, columns, values);

    // Read data back from the database
    const result = await service.readFromDatabase(table);

    // Check that the data read from the database is the same as the data written
    expect(result).toEqual([ { name: 'Frank1', test: false }]);
  });

  it('Writing to database. (Single Element)', async () => {
    // Create constants for used values
    const table = 'testuser';
    const columns = ['name'];
    const values = ['Frank1'];

    // Write data to the database
    await service.writeToDatabase(table, columns, values);

    // Read data back from the database
    const result = await service.readFromDatabase(table);

    // Check that the data read from the database is the same as the data written
    expect(result).toEqual([{"name": "Frank1"}]);
  });

  it('Reading from database. (All Elements/All Columns in Table)', async () => {
    // Create constant for used value
    const table = 'testuser';

    // Read data from the database
    const result = await service.readFromDatabase(table);

    // Check that the data read from the database is the same as our data copied from there
    expect(result).toEqual([ { name: 'Frank2' }, { name: 'Frank1' } ]);

  });

  it('Reading from database. (All Elements in a Column)', async () => {
    // Create constant for used table and column
    const table = 'testuser';
    const column = 'name';

    // Read data from the database-column
    const result = await service.readFromDatabaseColumns(table, column);

    // Check that the data is right
    expect(result).toEqual([{ name: 'Frank2' }]);
  });

  it('Reading from database. (All Elements in a Column within Condition)', async () => {
    // Create constant for used value
    const table = 'usertest';
    const column = 'test';
    const operator = "=";
    const condition = false;

    // Read data from the database-column
    const result = await service.readFromDatabaseCondition(table, column,  operator, condition);

    // Check that the data is right
    expect(result).toEqual([{ name: 'Frank1', test: false }]);
  });

  it('Reading from database. (All Elements in a Column in Order)', async () => {
    // Create constant for used table and order
    const table = 'usertest';
    const order = 2;
    // Read data from the database-column
    const result = await service.readFromDatabaseOrder(table, order);

    // Check that read data is in the same as mock-up
    expect(result).toEqual([{ name: 'Frank1', test: false }, { name: 'frank2', test: true }]);
  });

  it('Deleting from database. (All Elements within Condition)', async () => {
    // Create constants for used table, column, operator and condition
    const table = 'usertest';
    const column = 'name';
    const operator = "=";
    const condition = 'Frank1';

    // Delete data from the database
    await service.deleteFromDatabaseCondition(table, column, operator, condition);
  });

  it('Deleting from database. (All Elements within Condition returning Values)', async () => {
    // Create constants for used table, column, operator, value and returning
    const table = 'usertest';
    const column = 'name';
    const operator = "=";
    const value = 'Frank1'
    const returning = null;

    // Deleting data from the database & returning the data
    const result = await service.deleteFromDatabaseConditionReturning(table, column, operator, value, returning);

    // Check that the data is deleted from the database and returned Data
    expect(result).toEqual({"affectedRows": 1, "count": 1, "rows": [{"name": "Frank1", "test": false}]});
  });

  it('Deleting from database. (All Elements within the Table)', async () => {
    // Create constant for used value
    const table = 'usertest';

    // delete data from the database
    await service.deleteFromDatabaseAll(table);

  });
});