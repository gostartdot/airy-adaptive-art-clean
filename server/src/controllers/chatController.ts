import { Response } from 'express';
import { Server } from 'socket.io';
import Chat from '../models/Chat';
import Match from '../models/Match';
import User from '../models/User';
import { AuthRequest } from '../middlewares/authMiddleware';
import { sendSuccess, sendError, sendServerError } from '../utils/responseHelper';
import { generatePersonaResponse, isAIPersona } from '../services/geminiService';
import { getPersonaById, isAIPersonaId } from '../config/aiPersonas';

// Helper function to generate AI response
async function generateAIResponse(
  matchId: string,
  aiUser: any,
  humanUserId: string,
  humanMessage: string,
  io: Server
) {
  try {
    // Get AI user ID (handle both _id and id)
    const aiUserId = aiUser._id || aiUser.id;
    const aiUserIdStr = typeof aiUserId === 'string' ? aiUserId : aiUserId?.toString();
    
    // Get conversation history (excluding the message we just received)
    const recentMessages = await Chat.find({ matchId })
      .sort({ createdAt: -1 })
      .limit(11); // Fetch 11 to account for the just-sent message

    // Build conversation history for AI, excluding the current human message
    const conversationHistory = recentMessages
      .reverse()
      .filter(msg => msg.content !== humanMessage) // Exclude the just-sent message
      .slice(-10) // Keep last 10 messages
      .map(msg => {
        const senderId = msg.senderId.toString();
        return {
          role: (senderId === aiUserIdStr ? 'model' : 'user') as 'model' | 'user',
          parts: msg.content
        };
      });

    // Generate AI response (pass persona ID if it's an AI persona)
    const personaId = aiUserIdStr;
    
    const aiResponse = await generatePersonaResponse(
      {
        name: aiUser.name,
        age: aiUser.age,
        gender: aiUser.gender,
        bio: aiUser.bio,
        interests: aiUser.interests,
        city: aiUser.city
      },
      conversationHistory,
      humanMessage,
      personaId // Pass the persona ID for detailed prompts
    );

    console.log(`✅ Generated response: "${aiResponse}"`);

    // Save AI response to database
    const aiMessage = await Chat.create({
      matchId,
      senderId: aiUserId,
      receiverId: humanUserId,
      content: aiResponse,
      type: 'text'
    });

    // Update match's lastMessageAt
    await Match.findByIdAndUpdate(matchId, {
      lastMessageAt: new Date()
    });

    // Build message object with user data (handle AI personas)
    const messageToEmit = {
      ...aiMessage.toObject(),
      senderId: {
        _id: aiUserId,
        name: aiUser.name,
        photos: aiUser.photos || []
      },
      receiverId: {
        _id: humanUserId,
        name: 'User', // We don't need full user data here
        photos: []
      }
    };

    // Emit AI response via socket
    io.to(`match:${matchId}`).emit('receive-message', messageToEmit);
    
    console.log(`🤖 AI Response from ${aiUser.name}: "${aiResponse}"`);
  } catch (error) {
    console.error('Error in generateAIResponse:', error);
  }
}

// @desc    Get messages for a match
// @route   GET /api/chats/match/:matchId
// @access  Private
export const getMessages = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { matchId } = req.params;
    const { limit = 50, skip = 0 } = req.query;

    // Verify user is part of this match
    const match = await Match.findById(matchId);
    if (!match) {
      return sendError(res, 'Match not found', 404);
    }

    if (match.user1Id.toString() !== userId && match.user2Id.toString() !== userId) {
      return sendError(res, 'Unauthorized', 403);
    }

    const messages = await Chat.find({ matchId })
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(Number(skip));

    // Manually populate user data (handle AI personas)
    const populatedMessages = await Promise.all(
      messages.map(async (msg) => {
        const msgObj: any = msg.toObject();
        
        // Get sender data
        const senderId = msg.senderId.toString();
        if (isAIPersonaId(senderId)) {
          const persona = getPersonaById(senderId);
          msgObj.senderId = persona ? {
            _id: persona.id,
            name: persona.name,
            photos: persona.photos
          } : { _id: senderId, name: 'Unknown', photos: [] };
        } else {
          const sender = await User.findById(senderId, 'name photos');
          msgObj.senderId = sender || { _id: senderId, name: 'Unknown', photos: [] };
        }
        
        // Get receiver data
        const receiverId = msg.receiverId.toString();
        if (isAIPersonaId(receiverId)) {
          const persona = getPersonaById(receiverId);
          msgObj.receiverId = persona ? {
            _id: persona.id,
            name: persona.name,
            photos: persona.photos
          } : { _id: receiverId, name: 'Unknown', photos: [] };
        } else {
          const receiver = await User.findById(receiverId, 'name photos');
          msgObj.receiverId = receiver || { _id: receiverId, name: 'Unknown', photos: [] };
        }
        
        return msgObj;
      })
    );

    return sendSuccess(res, populatedMessages.reverse());
  } catch (error) {
    return sendServerError(res, error);
  }
};

// @desc    Send a message
// @route   POST /api/chats/match/:matchId
// @access  Private
export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { matchId } = req.params;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return sendError(res, 'Message content required');
    }

    // Verify user is part of this match
    const match = await Match.findById(matchId);
    if (!match) {
      return sendError(res, 'Match not found', 404);
    }

    if (match.user1Id.toString() !== userId && match.user2Id.toString() !== userId) {
      return sendError(res, 'Unauthorized', 403);
    }

    const receiverId = match.user1Id.toString() === userId ? match.user2Id : match.user1Id;

    const message = await Chat.create({
      matchId,
      senderId: userId,
      receiverId,
      content: content.trim(),
      type: 'text'
    });

    // Update match's lastMessageAt
    match.lastMessageAt = new Date();
    await match.save();

    // Manually populate message (handle AI personas)
    const msgObj: any = message.toObject();
    
    // Get sender (always real user in this case)
    const sender = await User.findById(userId, 'name photos');
    msgObj.senderId = sender || { _id: userId, name: 'User', photos: [] };
    
    // Get receiver data
    const receiverIdStr = receiverId.toString();
    if (isAIPersonaId(receiverIdStr)) {
      const persona = getPersonaById(receiverIdStr);
      msgObj.receiverId = persona ? {
        _id: persona.id,
        name: persona.name,
        photos: persona.photos
      } : { _id: receiverIdStr, name: 'Unknown', photos: [] };
    } else {
      const receiverUser = await User.findById(receiverId, 'name photos');
      msgObj.receiverId = receiverUser || { _id: receiverId, name: 'Unknown', photos: [] };
    }

    // Emit socket event to notify all users in the room
    const io: Server = req.app.get('io');
    if (io) {
      const roomSize = io.sockets.adapter.rooms.get(`match:${matchId}`)?.size || 0;
      console.log(`Sending to match:${matchId} (${roomSize} users)`);
      io.to(`match:${matchId}`).emit('receive-message', msgObj);
    }

    // Check if receiver is AI persona and generate response
    if (isAIPersonaId(receiverIdStr)) {
      // Receiver is an AI persona
      const aiPersona = getPersonaById(receiverIdStr);
      
      if (aiPersona) {
        // Use persona-specific response delay, or default to 3-5 minutes
        const minDelay = aiPersona.responseDelay?.min || 180000; // Default 3 minutes
        const maxDelay = aiPersona.responseDelay?.max || 300000; // Default 5 minutes
        const randomDelay = minDelay + Math.random() * (maxDelay - minDelay);
        
        console.log(`⏱️  ${aiPersona.name} will respond in ${Math.round(randomDelay / 1000)} seconds (${Math.round(randomDelay / 60000)} minutes)`);
        
        // Generate AI response asynchronously (don't wait)
        setTimeout(async () => {
          try {
            await generateAIResponse(matchId, aiPersona, userId, content.trim(), io);
          } catch (error) {
            console.error('Error generating AI response:', error);
          }
        }, randomDelay);
      }
    } else {
      // Receiver is a real user - check if they have AI responses enabled (future feature)
      const receiver = await User.findById(receiverId);
      if (receiver && isAIPersona(receiverIdStr)) {
        const randomDelay = 180000 + Math.random() * 120000; // 3-5 minutes for regular users
        setTimeout(async () => {
          try {
            await generateAIResponse(matchId, receiver, userId, content.trim(), io);
          } catch (error) {
            console.error('Error generating AI response:', error);
          }
        }, randomDelay);
      }
    }

    return sendSuccess(res, msgObj, 'Message sent', 201);
  } catch (error) {
    return sendServerError(res, error);
  }
};

// @desc    Mark message as read
// @route   PUT /api/chats/:chatId/read
// @access  Private
export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { chatId } = req.params;

    const message = await Chat.findById(chatId);
    if (!message) {
      return sendError(res, 'Message not found', 404);
    }

    if (message.receiverId.toString() !== userId) {
      return sendError(res, 'Unauthorized', 403);
    }

    message.isRead = true;
    message.readAt = new Date();
    await message.save();

    return sendSuccess(res, message, 'Message marked as read');
  } catch (error) {
    return sendServerError(res, error);
  }
};

// @desc    Get all conversations
// @route   GET /api/chats/conversations
// @access  Private
export const getConversations = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    const matches = await Match.find({
      $or: [{ user1Id: userId }, { user2Id: userId }],
      status: { $ne: 'skipped' }
    })
    .sort({ lastMessageAt: -1 });

    console.log(`User ${userId} has ${matches.length} matches:`, matches.map(m => ({
      matchId: m._id,
      user1: m.user1Id,
      user2: m.user2Id,
      status: m.status
    })));

    const conversations = await Promise.all(
      matches.map(async (match) => {
        const isUser1 = match.user1Id.toString() === userId;
        const otherUserId = isUser1 ? match.user2Id : match.user1Id;
        
        // Get other user data (AI persona or real user)
        let otherUser: any;
        const otherUserIdStr = otherUserId.toString();
        
        if (isAIPersonaId(otherUserIdStr)) {
          const persona = getPersonaById(otherUserIdStr);
          if (persona) {
            otherUser = {
              _id: persona.id,
              name: persona.name,
              photos: persona.photos,
              age: persona.age
            };
          }
        } else {
          otherUser = await User.findById(otherUserId);
        }

        if (!otherUser) return null;
        
        // Get last message
        const lastMessage = await Chat.findOne({ matchId: match._id })
          .sort({ createdAt: -1 });

        // Get unread count
        const unreadCount = await Chat.countDocuments({
          matchId: match._id,
          receiverId: userId,
          isRead: false
        });

        return {
          matchId: match._id,
          otherUser: match.revealStatus.isRevealed ? otherUser : {
            _id: otherUser._id || otherUser.id,
            name: otherUser.name[0] + '***' + otherUser.name[otherUser.name.length - 1],
            photos: otherUser.photos,
            age: otherUser.age
          },
          lastMessage,
          unreadCount,
          isAnonymous: !match.revealStatus.isRevealed,
          lastMessageAt: match.lastMessageAt
        };
      })
    );

    const validConversations = conversations.filter(c => c !== null);

    return sendSuccess(res, validConversations);
  } catch (error) {
    return sendServerError(res, error);
  }
};

