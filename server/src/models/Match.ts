import mongoose, { Schema, Document } from 'mongoose';

export interface IMatch extends Document {
  user1Id: mongoose.Types.ObjectId;
  user2Id: mongoose.Types.ObjectId | string; // Can be ObjectId (real user) or string (AI persona)
  status: 'active' | 'revealed' | 'skipped' | 'unmatched';
  revealStatus: {
    user1Requested: boolean;
    user2Requested: boolean;
    user1RequestedAt?: Date;
    user2RequestedAt?: Date;
    isRevealed: boolean;
    revealedAt?: Date;
  };
  lastMessageAt?: Date;
}

const MatchSchema = new Schema<IMatch>(
  {
    user1Id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    user2Id: { type: Schema.Types.Mixed, required: true }, // Mixed type for AI personas
    status: { 
      type: String, 
      enum: ['active', 'revealed', 'skipped', 'unmatched'],
      default: 'active'
    },
    revealStatus: {
      user1Requested: { type: Boolean, default: false },
      user2Requested: { type: Boolean, default: false },
      user1RequestedAt: { type: Date },
      user2RequestedAt: { type: Date },
      isRevealed: { type: Boolean, default: false },
      revealedAt: { type: Date }
    },
    lastMessageAt: { type: Date }
  },
  {
    timestamps: true
  }
);

// Indexes for faster queries
MatchSchema.index({ user1Id: 1, user2Id: 1 }, { unique: true }); // Prevent duplicates
MatchSchema.index({ status: 1 });
MatchSchema.index({ 'revealStatus.isRevealed': 1 });

export default mongoose.model<IMatch>('Match', MatchSchema);

