import {Entity, model, property} from '@loopback/repository';

@model()
export class Money extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'number',
    required: true,
  })
  donatorId?: number;

  @property({
    type: 'number',
    required: true,
  })
  amount: number;

  @property({
    type: 'string',
    required: true,
  })
  currency: string;

  constructor(data?: Partial<Money>) {
    super(data);
  }
}

export interface MoneyRelations {
  // describe navigational properties here
}

export type MoneyWithRelations = Money & MoneyRelations;
