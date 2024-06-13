import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {Donation, DonationRelations} from '../models';

export class DonationRepository extends DefaultCrudRepository<
  Donation,
  typeof Donation.prototype.id,
  DonationRelations
> {
  constructor(@inject('datasources.db') dataSource: DbDataSource) {
    super(Donation, dataSource);
  }
}
