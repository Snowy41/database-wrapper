import {inject, injectable} from '@loopback/core';
import {FilterExcludingWhere, repository} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import {securityId, UserProfile} from '@loopback/security';
import {AuthenticationBindings} from '../keys';
import {Food, Money} from '../models';
import {
  DonationRepository,
  FoodRepository,
  MoneyRepository,
  MyUserRepository,
} from '../repositories';

@injectable()
export class DonationService {
  constructor(
    @repository(MyUserRepository)
    public userRepository: MyUserRepository,
    @repository(FoodRepository)
    public foodRepository: FoodRepository,
    @repository(MoneyRepository)
    public moneyRepository: MoneyRepository,
    @repository(DonationRepository)
    public donationRepository: DonationRepository,
    @inject(AuthenticationBindings.CURRENT_USER)
    private currentUserProfile: UserProfile,
  ) {}

  //Food donations
  async createFoodDonation(
    fileBuffer: Buffer,
    quantity: number,
    quantityType: string,
    message: string,
    friendUsername: string,
  ): Promise<Food> {
    // Check if fileBuffer is provided
    if (!fileBuffer) {
      throw new HttpErrors.BadRequest('Picture is required');
    }

    // Validate quantity
    if (quantity <= 0 || quantity > 1000) {
      throw new HttpErrors.BadRequest('Quantity must be greater than 0');
    }

    // Validate quantityType
    const allowedQuantityTypes = ['kg', 'g', 'lb', 'oz']; // Define allowed quantity types
    if (!allowedQuantityTypes.includes(quantityType)) {
      throw new HttpErrors.BadRequest('Invalid quantity type');
    }

    // Fetch the user ID of the authenticated user
    const donatorId = parseInt(this.currentUserProfile[securityId]);

    // Create Food instance
    const foodData = {
      donatorId: donatorId,
      picture: fileBuffer,
      quantity,
      quantityType,
      message,
      friendUsername,
    };
    const createdFood = await this.foodRepository.create(foodData);

    await this.donationRepository.create({
      userId: donatorId,
      itemId: createdFood.id,
    });

    return createdFood;
  }

  async getDonations(): Promise<Food[]> {
    try {
      const donations = await this.foodRepository.find();
      return donations;
    } catch (error) {
      // Handle any errors that occur during the process
      console.error('Error fetching donations:', error);
      throw error;
    }
  }

  async count(where?: any): Promise<number> {
    const count = await this.foodRepository.count(where);
    return count.count;
  }
  async updateAllFood(food: Food, where?: any): Promise<number> {
    const countResult = await this.foodRepository.updateAll(food, where);
    return countResult.count;
  }

  findByIdFood(id: number, filter?: FilterExcludingWhere<Food>): Promise<Food> {
    return this.foodRepository.findById(id, filter);
  }

  updateByIdFood(id: number, food: Food): void {
    this.foodRepository.updateById(id, food);
  }

  replaceByIdFood(id: number, food: Food): void {
    this.foodRepository.replaceById(id, food);
  }

  deleteByIdFood(id: number): void {
    this.foodRepository.deleteById(id);
  }

  // Money donations//

  async createMoneyDonation(amount: number, currency: string): Promise<Money> {
    // Validate amount
    if (amount <= 0 || amount > 1000) {
      throw new HttpErrors.BadRequest('The amount value is not correct');
    }
    // Validate currency
    if (!currency) {
      throw new HttpErrors.BadRequest('You have to choose a currency');
    }
    // Extract authenticated user's ID from profile
    const donatorId = this.currentUserProfile[securityId];

    // Create and return the Money object
    const moneyData = {
      donatorId: parseInt(donatorId),
      amount: amount,
      currency: currency,
    };
    const createdMoneyDonation = await this.moneyRepository.create(moneyData);

    // Create a record in the donation table
    await this.donationRepository.create({
      userId: parseInt(donatorId),
      itemId: createdMoneyDonation.id,
    });

    return createdMoneyDonation;
  }

  async getMoneyDonations(): Promise<Money[]> {
    try {
      const moneyDonations = await this.moneyRepository.find();
      return moneyDonations;
    } catch (error) {
      // Handle any errors that occur during the process
      console.error('Error fetching donations:', error);
      throw error;
    }
  }

  findByIdMoney(
    id: number,
    filter?: FilterExcludingWhere<Money>,
  ): Promise<Money> {
    return this.moneyRepository.findById(id, filter);
  }

  updateByIdMoney(id: number, money: Money): void {
    this.moneyRepository.updateById(id, money);
  }
  async updateAllMoney(money: Money, where?: any): Promise<number> {
    const countResult = await this.foodRepository.updateAll(money, where);
    return countResult.count;
  }

  replaceByIdMoney(id: number, money: Money): void {
    this.moneyRepository.replaceById(id, money);
  }

  deleteByIdMoney(id: number): void {
    this.moneyRepository.deleteById(id);
  }
}
