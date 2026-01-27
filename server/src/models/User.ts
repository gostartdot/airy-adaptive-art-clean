import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  googleId?: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  password?: string;
  role?: string;
  isEmailVerified?: boolean;
  dateOfBirth?: Date;
  age?: number;
  gender?: 'woman' | 'man' | 'non-binary' | 'other';
  genderCustom?: string;
  showGender?: boolean;
  city?: string;
  cityOther?: string;
  photos?: string[];
  heightFeet?: string;
  heightInches?: string;
  religion?: string;
  bio?: string;
  simplePleasures?: string;
  goCrazyFor?: string;
  interests?: string[];
  preferences?: {
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
  skippedUsers?: Array<mongoose.Types.ObjectId | string>; // Can be ObjectId or AI persona string ID
  matchedUsers?: Array<mongoose.Types.ObjectId | string>; // Can be ObjectId or AI persona string ID
  // Verification fields
  isWorkingProfessional?: boolean;
  companyName?: string;
  position?: string;
  workingSince?: string;
  salaryProofImages?: string[];
  verificationStatus?: 'pending' | 'approved' | 'rejected';
  verifiedBy?: mongoose.Types.ObjectId;
  verifiedAt?: Date;
  rejectionReason?: string;
}

const UserSchema = new Schema<IUser>(
  {
    googleId: { type: String, unique: true, sparse: true },
    email: { type: String, required: true, unique: true },
    name: { type: String },
    firstName: { type: String },
    lastName: { type: String },
    password: { type: String },
    role: { type: String, default: 'User' },
    isEmailVerified: { type: Boolean, default: false },
    dateOfBirth: { type: Date },
    age: { type: Number },
    gender: { 
      type: String, 
      enum: ['woman', 'man', 'non-binary', 'other']
    },
    genderCustom: { type: String },
    showGender: { type: Boolean, default: true },
    city: { type: String },
    cityOther: { type: String },
    photos: [{ type: String }],
    heightFeet: { type: String },
    heightInches: { type: String },
    religion: { type: String },
    bio: { type: String, maxlength: 150 },
    simplePleasures: { type: String },
    goCrazyFor: { type: String },
    interests: [{ type: String }],
    preferences: {
      showMe: [{ type: String }],
      ageRange: {
        min: { type: Number, default: 18 },
        max: { type: Number, default: 50 }
      },
      maxDistance: { type: Number, default: 20 }
    },
    credits: { type: Number, default: 5 },
    lastCreditRefresh: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    lastActive: { type: Date, default: Date.now },
    skippedUsers: [{ type: Schema.Types.Mixed }], // Mixed to support both ObjectId and AI persona string IDs
    matchedUsers: [{ type: Schema.Types.Mixed }], // Mixed to support both ObjectId and AI persona string IDs
    // Verification fields
    isWorkingProfessional: { type: Boolean },
    companyName: { type: String },
    position: { type: String },
    workingSince: { type: String },
    salaryProofImages: [{ type: String }],
    verificationStatus: { 
      type: String, 
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    verifiedAt: { type: Date },
    rejectionReason: { type: String }
  },
  {
    timestamps: true
  }
);

// Indexes for faster queries
UserSchema.index({ googleId: 1 }, { sparse: true });
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ city: 1, gender: 1 }, { sparse: true });
UserSchema.index({ lastActive: 1 });

export default mongoose.model<IUser>('User', UserSchema);

