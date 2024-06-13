import {inject} from '@loopback/core';
import {authenticate} from '../decorators/authenticate.decorator';

import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  put,
  del,
  requestBody,
  response,
} from '@loopback/rest';
import {Money} from '../models';
import {MoneyRepository} from '../repositories';
import {DonationService} from '../services';
import {SecurityBindings, UserProfile} from '@loopback/security';

@authenticate('jwt')
export class MoneyController {
  constructor(
    @inject(SecurityBindings.USER)
    private currentUser: UserProfile,
    @repository(MoneyRepository)
    public foodRepository: MoneyRepository,
    @inject('services.DonationService')
    public donationService: DonationService,
  ) {}

  @post('/monies')
  @response(200, {
    description: 'Money model instance',
    content: {'application/json': {schema: getModelSchemaRef(Money)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Money, {
            title: 'NewMoney',
            exclude: ['id'],
          }),
        },
      },
    })
    money: Omit<Money, 'id'>,
  ): Promise<Money> {
    // Call the createMoneyDonation method from the service
    return this.donationService.createMoneyDonation(
      money.amount,
      money.currency,
    );
  }

  @get('/monies')
  @response(200, {
    description: 'Array of Money model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Money, {includeRelations: true}),
        },
      },
    },
  })
  async find(@param.filter(Money) filter?: Filter<Money>): Promise<Money[]> {
    return this.donationService.getMoneyDonations();
  }

  @patch('/monies')
  @response(200, {
    description: 'Money PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Money, {partial: true}),
        },
      },
    })
    money: Money,
    @param.where(Money) where?: Where<Money>,
  ): Promise<Count> {
    const count = await this.donationService.updateAllMoney(money, where);
    return {count};
  }

  @get('/monies/{id}')
  @response(200, {
    description: 'Money model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Money, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Money, {exclude: 'where'})
    filter?: FilterExcludingWhere<Money>,
  ): Promise<Money> {
    return this.donationService.findByIdMoney(id, filter);
  }

  @patch('/monies/{id}')
  @response(204, {
    description: 'Money PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Money, {partial: true}),
        },
      },
    })
    money: Money,
  ): Promise<void> {
    this.donationService.updateByIdMoney(id, money);
  }

  @put('/monies/{id}')
  @response(204, {
    description: 'Money PUT success',
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() money: Money,
  ): Promise<void> {
    this.donationService.replaceByIdMoney(id, money);
  }

  @del('/monies/{id}')
  @response(204, {
    description: 'Money DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    this.donationService.deleteByIdMoney(id);
  }
}
