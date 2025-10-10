import mongoose, { Schema, Document } from 'mongoose';

export type NotificationType =
  | 'new_match'
  | 'new_message'
  | 'reveal_request'
  | 'reveal_accepted'
  | 'reveal_declined'
  | 'credits_refreshed';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  relatedUserId?: mongoose.Types.ObjectId;
  relatedMatchId?: mongoose.Types.ObjectId;
  isRead: boolean;
  readAt?: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { 
      type: String, 
      enum: ['new_match', 'new_message', 'reveal_request', 'reveal_accepted', 'reveal_declined', 'credits_refreshed'],
      required: true
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    relatedUserId: { type: Schema.Types.ObjectId, ref: 'User' },
    relatedMatchId: { type: Schema.Types.ObjectId, ref: 'Match' },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date }
  },
  {
    timestamps: true
  }
);

// Indexes for faster queries
NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ isRead: 1 });

export default mongoose.model<INotification>('Notification', NotificationSchema);

