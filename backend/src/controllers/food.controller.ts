import {authenticate} from '@loopback/authentication';
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
  param,
  patch,
  post,
  put,
  Request,
  requestBody,
  response,
  Response,
  RestBindings,
} from '@loopback/rest';
import {SecurityBindings, UserProfile} from '@loopback/security';
import multer from 'multer';
import {Food} from '../models';
import {FoodRepository} from '../repositories';
import {DonationService} from '../services';

const storage = multer.memoryStorage();
const upload = multer({storage});

@authenticate('jwt')
export class FoodController {
  constructor(
    @inject(SecurityBindings.USER)
    private currentUser: UserProfile,
    @repository(FoodRepository)
    public foodRepository: FoodRepository,
    @inject('services.DonationService')
    public donationService: DonationService,
  ) {}

  @post('/foodDonation', {
    responses: {
      200: {
        description: 'Food model instance',
        content: {
          'application/json': {schema: {'x-ts-type': Food}},
        },
      },
    },
  })
  async create(
    @requestBody.file() request: Request,
    @inject(RestBindings.Http.RESPONSE) response: Response,
  ): Promise<Food> {
    return new Promise<Food>((resolve, reject) => {
      upload.single('picture')(request, response, async (err: any) => {
        if (err) {
          reject(err);
        } else {
          try {
            const picture = request.file?.buffer;
            const {quantity, quantityType, message, friendUsername} =
              request.body;

            const savedFood = await this.donationService.createFoodDonation(
              picture!,
              quantity,
              quantityType,
              message,
              friendUsername,
            );
            resolve(savedFood);
          } catch (err) {
            reject(err);
          }
        }
      });
    });
  }

  @get('/foods/count')
  @response(200, {
    description: 'Food model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(@param.where(Food) where?: Where<Food>): Promise<Count> {
    const count = await this.donationService.count(where);
    return {count};
  }

  @get('/foods')
  @response(200, {
    description: 'Array of Food model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Food, {includeRelations: true}),
        },
      },
    },
  })
  async find(@param.filter(Food) filter?: Filter<Food>): Promise<Food[]> {
    return this.donationService.getDonations();
  }

  @patch('/foods')
  @response(200, {
    description: 'Food PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Food, {partial: true}),
        },
      },
    })
    food: Food,
    @param.where(Food) where?: Where<Food>,
  ): Promise<Count> {
    const count = await this.donationService.updateAllFood(food, where);
    return {count};
  }

  @get('/foods/{id}')
  @response(200, {
    description: 'Food model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Food, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Food, {exclude: 'where'}) filter?: FilterExcludingWhere<Food>,
  ): Promise<Food> {
    return this.donationService.findByIdFood(id, filter);
  }

  @patch('/foods/{id}')
  @response(204, {
    description: 'Food PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Food, {partial: true}),
        },
      },
    })
    food: Food,
  ): Promise<void> {
    await this.donationService.updateByIdFood(id, food);
  }

  @put('/foods/{id}')
  @response(204, {
    description: 'Food PUT success',
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() food: Food,
  ): Promise<void> {
    await this.donationService.replaceByIdFood(id, food);
  }

  @del('/foods/{id}')
  @response(204, {
    description: 'Food DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    this.donationService.deleteByIdFood(id);
  }
}
