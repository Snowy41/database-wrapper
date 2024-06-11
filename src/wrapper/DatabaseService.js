// eslint-disable-next-line no-unused-vars
import {juggler} from '@loopback/repository';

// eslint-disable-next-line no-unused-vars
export class DatabaseService {

  // DataSource for the DatabaseService
  dsConfig = {
    name: 'dbs_postgres',
    connector: 'postgresql',
    url: '',
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: '123',
    database: 'postgres',
  };

  // Constructor for DatabaseService (initializes the dataSource)
  constructor() {
    global.TextEncoder = require('util').TextEncoder;
    this.dataSource = new juggler.DataSource(this.dsConfig);
  }

  /**
   * Writes to VALUES to TABLE in COLUMN
   *
   * @param table The name of the table to write to
   * @param columns The name of the columns to write to (in the same order as the values)
   * @param values The values to write to the columns (in the same order as the columns)
   */
  async writeToDatabase(table, columns, values) {
    // Check if the table exists and if the columns and values are the same length
    if(table == null || columns.length !== values.length) return;

    // Convert arrays to strings
    if(columns.size < 1) {
      columns = columns.join(', ');
    }
    const valuesStr = values.map(value => `'${value}'`).join(', ');

    // Execute the SQL query
    await this.dataSource.execute(`INSERT INTO ${table} (${columns}) VALUES (${valuesStr})`);
  }

  /**
   * Reads all values from the COLUMN(S) in TABLE where CONDITION is true
   *
   * @param table The name of the table to read from
   * @param columns The name of the columns read from
   * @param condition The Condition to read to check the value of each column to
   * @param operator The operator to used in the condition
   */
  async readFromDatabaseCondition(table, columns,  operator, condition) {
    if (columns == null || condition == null) return;
    if(columns.size < 1) {
      columns = columns.join(', ');
    }
    return await this.dataSource.execute(`SELECT * FROM ${table} WHERE ${columns} ${operator} '${condition}'`);
  }

  /**
   * Reads all values from the COLUMN(S) in TABLE ordered by ORDER
   *
   * @param table The name of the table to read from
   * @param order The name of the columns read from
   */

  async readFromDatabaseOrder(table, order) {
    if (order == null) return;
    console.log(`SELECT * FROM ${table} ORDER BY ${order}`)
    return await this.dataSource.execute(`SELECT * FROM ${table} ORDER BY ${order}`);
  }

  /**
   * Reads all values from the COLUMN(S) in TABLE
   *
   * @param table The name of the table to read from
   * @param columns The name of the columns read from
   */
  async readFromDatabaseColumns(table, columns) {
    if (columns == null) {
      await this.dataSource.execute(`SELECT * FROM ${table}`);
    } else {
      if(columns.size < 1) {
        columns = columns.join(', ');
      }
      return await this.dataSource.execute(`SELECT ${columns} FROM ${table}`);
    }
  }


  /**
   * Reads all values from TABLE
   *
   * @param table The name of the table to read from
   */
  async readFromDatabase(table) {
    return await this.dataSource.execute(`SELECT * FROM ${table}`);
  }

  /**
   * Deletes VALUES from TABLE in COLUMN where CONDITION is true
   *
   * @param table The name of the table to delete from
   * @param column The name of the columns to check before deleting
   * @param operator The operator to use when checking the column
   * @param value The value to use when checking the column
   */
  async deleteFromDatabaseCondition(table, column, operator, value) {
    if(table == null || column == null || operator == null || value == null) return;

    // Execute the SQL query
    await this.dataSource.execute(`DELETE FROM ${table} WHERE ${column} ${operator} '${value}'`);
  }

  /**
   * Deletes VALUES from TABLE in COLUMN where CONDITION is true and returns RETURNING
   *
   * @param table The name of the table to delete from
   * @param column The name of the columns to check before deleting
   * @param operator The operator to use when checking the column
   * @param value The value to use when checking the column
   * @param returning Value which should be returned after deletion
   */
  async deleteFromDatabaseConditionReturning(table, column, operator, value, returning) {
    if(table == null || column == null || operator == null || value == null) return;
    if(returning == null || returning.equals("")) returning = '*';
    if(returning.size > 1) returning = returning.join(', ');

    // Execute the SQL query and get the result
    const result = await this.dataSource.execute(`DELETE FROM ${table} WHERE ${column} ${operator} '${value}' RETURNING ${returning}`);

    // Return the result
    return result;
  }

  /**
   * Deletes all VALUES from TABLE
   *
   * @param table The name of the table to delete from
   */
  async deleteFromDatabaseAll(table) {
    if(table == null) return;

    // Execute the SQL query
    await this.dataSource.execute(`DELETE FROM ${table}`);
  }

}