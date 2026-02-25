import type { UserDocument, IUserCreateInput } from "./user.interface.js";
import UserModel from "./user.model.js";

export interface IUserRepository {
	createUser(data: IUserCreateInput): Promise<UserDocument>;
	findByEmail(email: string): Promise<UserDocument | null>;
	findById(id: string): Promise<UserDocument | null>;
}

export class UserRepository implements IUserRepository {
	async createUser(data: IUserCreateInput): Promise<UserDocument> {
		return UserModel.create(data);
	}

	async findByEmail(email: string): Promise<UserDocument | null> {
		return UserModel.findOne({ email }).exec();
	}

	async findById(id: string): Promise<UserDocument | null> {
		return UserModel.findById(id).exec();
	}
}
