import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Role, UserStatus } from '../../common/enums/index.js';

export type UserDocument = User & Document;

@Schema({ timestamps: true, collection: 'users' })
export class User {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true, select: false })
  passwordHash: string;

  @Prop({ type: String, required: true, enum: Object.values(Role), default: Role.CUSTOMER, index: true })
  role: Role;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Restaurant' }], default: [], index: true })
  restaurantAssignments: Types.ObjectId[];

  @Prop({ type: [String], default: [] })
  permissions: string[];

  @Prop({ type: String, enum: Object.values(UserStatus), default: UserStatus.ACTIVE, index: true })
  accountStatus: UserStatus;

  @Prop({ type: String, select: false })
  refreshTokenHash?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ role: 1, accountStatus: 1 });
