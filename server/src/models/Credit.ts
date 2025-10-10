import mongoose, { Schema, Document } from 'mongoose';

export type CreditActionType = 
  | 'daily_refresh'
  | 'find_match'
  | 'skip_match'
  | 'request_reveal'
  | 'accept_reveal'
  | 'cancel_reveal_request';

export interface ICredit extends Document {
  userId: mongoose.Types.ObjectId;
  action: CreditActionType;
  amount: number;
  balanceAfter: number;
  relatedMatchId?: mongoose.Types.ObjectId;
}

const CreditSchema = new Schema<ICredit>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { 
      type: String, 
      enum: ['daily_refresh', 'find_match', 'skip_match', 'request_reveal', 'accept_reveal', 'cancel_reveal_request'],
      required: true
    },
    amount: { type: Number, required: true },
    balanceAfter: { type: Number, required: true },
    relatedMatchId: { type: Schema.Types.ObjectId, ref: 'Match' }
  },
  {
    timestamps: true
  }
);

// Indexes for faster queries
CreditSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model<ICredit>('Credit', CreditSchema);

