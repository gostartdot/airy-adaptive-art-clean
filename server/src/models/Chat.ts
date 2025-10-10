import mongoose, { Schema, Document } from 'mongoose';

export interface IChat extends Document {
  matchId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId | string; // Can be AI persona
  receiverId: mongoose.Types.ObjectId | string; // Can be AI persona
  content: string;
  type: 'text' | 'system';
  isRead: boolean;
  readAt?: Date;
}

const ChatSchema = new Schema<IChat>(
  {
    matchId: { type: Schema.Types.ObjectId, ref: 'Match', required: true },
    senderId: { type: Schema.Types.Mixed, required: true }, // Mixed for AI personas
    receiverId: { type: Schema.Types.Mixed, required: true }, // Mixed for AI personas
    content: { type: String, required: true },
    type: { 
      type: String, 
      enum: ['text', 'system'],
      default: 'text'
    },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date }
  },
  {
    timestamps: true
  }
);

// Indexes for faster queries
ChatSchema.index({ matchId: 1, createdAt: -1 });
ChatSchema.index({ senderId: 1 });
ChatSchema.index({ receiverId: 1, isRead: 1 });

export default mongoose.model<IChat>('Chat', ChatSchema);

