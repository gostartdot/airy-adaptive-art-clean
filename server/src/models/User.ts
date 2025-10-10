import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  googleId: string;
  email: string;
  name: string;
  dateOfBirth: Date;
  age: number;
  gender: 'woman' | 'man' | 'non-binary' | 'other';
  genderCustom?: string;
  showGender: boolean;
  city: string;
  photos: string[];
  bio?: string;
  interests: string[];
  preferences: {
    showMe: string[];
    ageRange: {
      min: number;
      max: number;
    };
    maxDistance: number;
  };
  credits: number;
  lastCreditRefresh: Date;
  isActive: boolean;
  isVerified: boolean;
  lastActive: Date;
  skippedUsers: Array<mongoose.Types.ObjectId | string>; // Can be ObjectId or AI persona string ID
  matchedUsers: Array<mongoose.Types.ObjectId | string>; // Can be ObjectId or AI persona string ID
}

const UserSchema = new Schema<IUser>(
  {
    googleId: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    age: { type: Number, required: true },
    gender: { 
      type: String, 
      enum: ['woman', 'man', 'non-binary', 'other'],
      required: true 
    },
    genderCustom: { type: String },
    showGender: { type: Boolean, default: true },
    city: { type: String, required: true },
    photos: [{ type: String }],
    bio: { type: String, maxlength: 150 },
    interests: [{ type: String }],
    preferences: {
      showMe: [{ type: String }],
      ageRange: {
        min: { type: Number, required: true, default: 18 },
        max: { type: Number, required: true, default: 50 }
      },
      maxDistance: { type: Number, required: true, default: 20 }
    },
    credits: { type: Number, default: 5 },
    lastCreditRefresh: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    lastActive: { type: Date, default: Date.now },
    skippedUsers: [{ type: Schema.Types.Mixed }], // Mixed to support both ObjectId and AI persona string IDs
    matchedUsers: [{ type: Schema.Types.Mixed }] // Mixed to support both ObjectId and AI persona string IDs
  },
  {
    timestamps: true
  }
);

// Indexes for faster queries
UserSchema.index({ googleId: 1 });
UserSchema.index({ email: 1 });
UserSchema.index({ city: 1, gender: 1 });
UserSchema.index({ lastActive: 1 });

export default mongoose.model<IUser>('User', UserSchema);

