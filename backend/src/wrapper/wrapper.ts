import {inject} from '@loopback/core';
import {MyUserRepository, DonationRepository, FoodRepository} from '../repositories';
import {Entity, ModelDefinition} from "@loopback/repository";
import {Donation, Food, User} from "../models";

export class DatabaseWrapper {
    constructor(
        @inject('repositories.UserRepository') private userRepo: MyUserRepository,
        @inject('repositories.DonationRepository') private donationRepo: DonationRepository,
        @inject('repositories.FoodRepository') private foodRepo: FoodRepository,
    ) {}

    /**
     * Reads values from User where FIELD is FIELD and if wanted ordered by ORDER
     *
     * @param where The Statement to check before reading
     * @param order The order in which to sort the results (if enabled)
     */
    async readFromUserDatabase(where?: object, order?: string[]) {
        try {
            if (where) {
                for (const field in where) {
                    if (!this.fieldExistsInModel(field, User)) {
                        console.error(`Field ${field} does not exist in User model.`);
                        return;
                    }
                }
            }
            if(this.userRepo !== undefined)
                return await this.userRepo.find({where, order});
        } catch (error) {
            console.error(`Error reading from User database: ${error}`);
        }
    }
    /**
     * Writes a new value (data) to User
     *
     * @param data The data which will be written to User (creating a new One)
     */
    async writeToUserDatabase(data: Partial<User>) {
        try {
            this.validateData(User, data);
            const existingUser = await this.userRepo.findOne({where: {email: data.email}});
            if (existingUser) {
                console.error('Email is already existing. Please use another email.');
                return;
            }
            if(this.userRepo !== undefined)
                return await this.userRepo.create(data);
        } catch (error) {
            console.error(`Error writing to User database: ${error}`);
        }
    }
    /**
     * Deleting a User where the id is ID
     *
     * @param id The id, of the User which will be deleted
     */
    async deleteUserById(id: typeof User.prototype.id) {
        try {
            if(this.userRepo !== undefined)
                if(await this.userRepo.findOne({where: {id: id}}))
                    await this.userRepo.deleteById(id);
        } catch (error) {
            console.error(`Error deleting from User database: ${error}`);
        }
    }
    /**
     * Updates a User (data) where the id is ID
     * @param id The id of the User which will be updated
     * @param data The data which will be updated given User
     */
    async updateUserById(id: typeof User.prototype.id, data: Partial<User>) {
        try {
            await this.isUserExisting(id);
            if(this.userRepo !== undefined)
                if(await this.userRepo.findOne({where: {id: id}}))
                    await this.userRepo.updateById(id, data);
        } catch (error) {
            console.error(`Error updating User database: ${error}`);
        }
    }
    /**
     * Finds a User (data) where the field is FIELDNAME and the value is VALUE
     * @param fieldName The name of the field which will be searched (e.g. email)
     * @param value The value of the field which will be searched (e.g. test123@email.com)
     */
    async findUserByField(fieldName: string, value: string | number) {
        if (!this.fieldExistsInModel(fieldName, User)) {
            console.error(`Field ${fieldName} does not exist in User-model.`);
            return;
        }
        return this.userRepo.find({where: {[fieldName]: value}});
    }
    /**
     * Reads values from User where FIELD is FIELD and if wanted ordered by ORDER
     *
     * @param where The Statement to check before reading
     * @param order The order in which to sort the results (if enabled)
     */


    async readFromDonationDatabase(where?: object, order?: string[]) {
        try {
            if (where) {
                for (const field in where) {
                    if (!this.fieldExistsInModel(field, Donation)) {
                        console.error(`Field ${field} does not exist in Donation model.`);
                        return;
                    }
                }
            }
            if(this.donationRepo !== undefined)
                return await this.donationRepo.find({where, order});
        } catch (error) {
            console.error(`Error reading from Donation database: ${error}`);
        }
    }
    /**
     * Writes a new values to Donation where the data is DATA
     *
     * @param data The Donation-Data which will be written to the database
     */
    async writeToDonationDatabase(data: Partial<Donation>) {
        try {
            this.validateData(Donation, data);
            if(this.donationRepo !== undefined)
                return await this.donationRepo.create(data);
        } catch (error) {
            console.error(`Error writing to Donation database: ${error}`);
        }
    }
    /**
     * Deletes a values from Donation where the id is ID
     *
     * @param id The id of the Donation which will be deleted
     */
    async deleteDonationById(id: typeof Donation.prototype.id) {
        try {
            if(this.donationRepo !== undefined)
                if(await this.donationRepo.findOne({where: {id: id}}))
                    await this.donationRepo.deleteById(id);
        } catch (error) {
            console.error(`Error deleting from Donation database: ${error}`);
        }
    }
    /**
     * Updates data from Donation where id is ID
     *
     * @param id The id of the updated Donation
     * @param data The data which will be updated
     */
    async updateDonationById(id: typeof Donation.prototype.id, data: Partial<Donation>) {
        try {
            await this.isDonationExisting(id);
            if(await this.donationRepo.findOne({where: {id: id}}))
                if(this.donationRepo !== undefined)
                    await this.donationRepo.updateById(id, data);
        } catch (error) {
            console.error(`Error updating Donation database: ${error}`);
        }
    }
    /**
     * Finds a Donation where filed is FIELDNAME and value is VALUE
     *
     * @param fieldName The Fieldname which will be searched
     * @param value The value of the field which will be searched
     */
    async findDonationByField(fieldName: string, value: string | number) {
        if (!this.fieldExistsInModel(fieldName, Donation)) {
            console.error(`Field ${fieldName} does not exist in Donation-model.`);
            return;
        }
        return this.donationRepo.find({where: {[fieldName]: value}});
    }
    /**
     * Reads values from Food where FIELD is FIELD and if wanted ordered by ORDER
     *
     * @param where The Statement to check before reading
     * @param order The order in which to sort the results (if enabled)
     */

    async readFromFoodDatabase(where?: object, order?: string[]) {
        try {
            if (where) {
                for (const field in where) {
                    if (!this.fieldExistsInModel(field, Food)) {
                        console.error(`Field ${field} does not exist in Food model.`);
                        return;
                    }
                }
            }
            if(this.foodRepo !== undefined)
                return await this.foodRepo.find({where, order});
        } catch (error) {
            console.error(`Error reading from Food database: ${error}`);
        }
    }
    /**
     * Creates a new Food with the data
     *
     * @param data The Data of the Food which will be created
     */
    async writeToFoodDatabase(data: Partial<Food>) {
        try {
            this.validateData(Food, data);
            if(this.foodRepo !== undefined)
                return await this.foodRepo.create(data);
        } catch (error) {
            console.error(`Error writing to Food database: ${error}`);
        }
    }
    /**
     * Deletes Food where the id is ID
     *
     * @param id The id of the Food which will be deleted
     */
    async deleteFoodById(id: typeof Food.prototype.id) {
        try {
            if(await this.foodRepo.findOne({where: {id: id}}))
                if(this.foodRepo !== undefined)
                    await this.foodRepo.deleteById(id);
        } catch (error) {
            console.error(`Error deleting from Food database: ${error}`);
        }
    }
    /**
     * Updated a Food where the id is ID by data
     *
     * @param id The id of the Food which will be updated
     * @param data The data which will be updated
     */
    async updateFoodById(id: typeof Food.prototype.id, data: Partial<Food>) {
        try {
            await this.isFoodExisting(id);
            if(this.foodRepo !== undefined)
                if(await this.foodRepo.findOne({where: {id: id}}))
                    await this.foodRepo.updateById(id, data);
        } catch (error) {
            console.error(`Error updating Food database: ${error}`);
        }
    }
    /**
     * Finds a Food where fieldname is value
     *
     * @param fieldName The Fieldname of the Food which will be searched
     * @param value The Value of the Field which will be searched
     */
    async findFoodByField(fieldName: string, value: string | number) {
        if (!this.fieldExistsInModel(fieldName, Food)) {
            console.error(`Field ${fieldName} does not exist in Food-model.`);
            return;
        }
        return this.foodRepo.find({where: {[fieldName]: value}});
    }

    /**
     * Checks if a field exists in a model
     *
     * @param fieldName The name of the field to check
     * @param model The Model.Type in which to check
     */
    private fieldExistsInModel(fieldName: string, model: typeof Entity) {
        const modelDefinition = new ModelDefinition(model.definition);
        return Object.prototype.hasOwnProperty.call(modelDefinition.properties, fieldName);
    }
    /**
     * Validates Data before creating (Business Logic)
     *
     * @param model The Model in which the data will be written
     * @param data The Data which will be written into the Model
     */
    private validateData(model: typeof Entity, data: object) {
        const modelDefinition = new ModelDefinition(model.definition);
        for (const [key, value] of Object.entries(data)) {
            if (!Object.prototype.hasOwnProperty.call(modelDefinition.properties, key)) {
                throw new Error(`Invalid field ${key}`);
            }
            const expectedType = modelDefinition.properties[key].type;
            if (typeof value !== expectedType) {
                throw new Error(`Invalid type for field ${key}. Expected ${expectedType}, got ${typeof value}`);
            }
            if (String(value).length > 32) {
                throw new Error(`Value for field ${key} is too long. Maximum length is 32 characters.`);
            }
        }
    }
    /**
     * Checks if a User exists with id
     *
     * @param id The ID of the User which will be checked
     */
    async isUserExisting(id: typeof User.prototype.id): Promise<boolean> {
        try {
            const user = await this.userRepo.findById(id);
            return !!user;
        } catch (error) {
            return false;
        }
    }
    /**
     * Checks if a Donation exists with id
     *
     * @param id The ID of the Donation which will be checked
     */
    async isDonationExisting(id: typeof Donation.prototype.id): Promise<boolean> {
        try {
            const donation = await this.donationRepo.findById(id);
            return !!donation;
        } catch (error) {
            return false;
        }
    }
    /**
     * Checks if a Donation exists with id
     *
     * @param id The ID of the Donation which will be checked
     */
    async isFoodExisting(id: typeof Food.prototype.id): Promise<boolean> {
        try {
            const food = await this.foodRepo.findById(id);
            return !!food;
        } catch (error) {
            return false;
        }
    }
}