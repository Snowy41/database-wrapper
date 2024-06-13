import {belongsTo, Entity, model, property} from '@loopback/repository';
import {User} from './user.model';

@model()
export class Donation extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'number',
  })
  userId: number;

  @belongsTo(() => User)
  donatedByUser: number;

  @property({
    type: 'number',
  })
  itemId: number;

  constructor(data?: Partial<Donation>) {
    super(data);
  }
}

export interface DonationRelations {
  // describe navigational properties here
}

export type DonationWithRelations = Donation & DonationRelations;
