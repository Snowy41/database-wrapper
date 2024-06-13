import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {Money, MoneyRelations} from '../models';

export class MoneyRepository extends DefaultCrudRepository<
  Money,
  typeof Money.prototype.id,
  MoneyRelations
> {
  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
  ) {
    super(Money, dataSource);
  }
}
