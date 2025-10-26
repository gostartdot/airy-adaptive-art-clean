# S.T.A.R.T. Dating App - Complete Documentation

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Backend API Documentation](#backend-api-documentation)
6. [Frontend Components](#frontend-components)
7. [Database Schema](#database-schema)
8. [User Flows](#user-flows)
9. [AI Personas System](#ai-personas-system)
10. [Real-time Features](#real-time-features)
11. [Credit System](#credit-system)
12. [Security & Authentication](#security--authentication)
13. [Deployment](#deployment)
14. [Development Roadmap](#development-roadmap)

---

## 🎯 Project Overview

**S.T.A.R.T. Dating App** is a modern, AI-enhanced dating platform that combines real user matching with intelligent AI personas to ensure users always have engaging conversations. The app features a credit-based system, real-time chat, and sophisticated matching algorithms.

### Key Features
- **AI-Powered Matching**: Intelligent matching with both real users and AI personas
- **Real-time Chat**: WebSocket-based instant messaging
- **Credit System**: Gamified interaction with daily credit refresh
- **Profile Management**: Photo uploads, bio editing, preference settings
- **Reveal System**: Credit-based profile revelation mechanism
- **Notification System**: Real-time notifications for matches and messages

---

## 🏗️ Architecture

### System Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend      │    │   Database     │
│   (React/Vite)  │◄──►│   (Node.js)    │◄──►│   (MongoDB)    │
│                 │    │                 │    │                 │
│ • React Router  │    │ • Express.js    │    │ • User Model   │
│ • State Mgmt    │    │ • Socket.IO     │    │ • Match Model  │
│ • UI Components │    │ • JWT Auth      │    │ • Chat Model   │
│ • Services      │    │ • AI Integration│    │ • Credit Model │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│   Cloudinary    │    │   Gemini AI     │
│   (Image CDN)   │    │   (AI Responses)│
└─────────────────┘    └─────────────────┘
```

---

## 🛠️ Technology Stack

### Frontend
- **React 19.1.1** - UI Framework
- **TypeScript** - Type Safety
- **Vite** - Build Tool
- **React Router DOM** - Client-side Routing
- **Tailwind CSS** - Styling
- **Socket.IO Client** - Real-time Communication
- **Axios** - HTTP Client
- **Google OAuth** - Authentication

### Backend
- **Node.js** - Runtime Environment
- **Express.js** - Web Framework
- **TypeScript** - Type Safety
- **MongoDB** - Database
- **Mongoose** - ODM
- **Socket.IO** - Real-time Communication
- **JWT** - Authentication
- **Google Generative AI** - AI Integration
- **Cloudinary** - Image Management

### Infrastructure
- **MongoDB Atlas** - Cloud Database
- **Cloudinary** - Image CDN
- **DigitalOcean** - Hosting
- **Vercel** - Frontend Deployment

---

## 📁 Project Structure

```
airy-adaptive-art-clean/
├── client/                          # Frontend React Application
│   ├── src/
│   │   ├── components/              # Reusable UI Components
│   │   │   ├── chat/              # Chat-specific components
│   │   │   ├── common/             # Shared components
│   │   │   ├── match/              # Match-related components
│   │   │   ├── notifications/     # Notification components
│   │   │   ├── profile/            # Profile components
│   │   │   ├── reveal/             # Reveal system components
│   │   │   └── ui/                 # Base UI components
│   │   ├── context/                # React Context Providers
│   │   │   ├── AuthContext.tsx     # Authentication context
│   │   │   └── ThemeContext.tsx    # Theme management
│   │   ├── hooks/                  # Custom React Hooks
│   │   │   ├── useAuth.ts          # Authentication hook
│   │   │   ├── useCredits.ts       # Credit management hook
│   │   │   ├── useNotifications.ts # Notification hook
│   │   │   └── useSocket.ts        # Socket connection hook
│   │   ├── layouts/                # Page Layouts
│   │   │   ├── AppLayout.tsx       # Main app layout
│   │   │   └── AuthLayout.tsx      # Authentication layout
│   │   ├── pages/                  # Page Components
│   │   │   ├── Landing.tsx         # Landing page
│   │   │   ├── Onboarding.tsx     # User onboarding
│   │   │   ├── Home.tsx            # Main matching interface
│   │   │   ├── Chat.tsx            # Chat interface
│   │   │   ├── Profile.tsx         # User profile
│   │   │   ├── Notifications.tsx   # Notifications page
│   │   │   ├── Credits.tsx         # Credits management
│   │   │   ├── Terms.tsx           # Terms of service
│   │   │   └── Privacy.tsx         # Privacy policy
│   │   ├── routes/                 # Routing Configuration
│   │   │   ├── index.tsx           # Main router
│   │   │   └── ProtectedRoute.tsx  # Route protection
│   │   ├── services/               # API Services
│   │   │   ├── api.ts              # Base API client
│   │   │   ├── authService.ts      # Authentication service
│   │   │   ├── chatService.ts      # Chat service
│   │   │   ├── creditService.ts    # Credit service
│   │   │   ├── matchService.ts     # Match service
│   │   │   ├── notificationService.ts # Notification service
│   │   │   └── userService.ts      # User service
│   │   ├── socket/                 # Socket.IO Client
│   │   │   └── socket.ts           # Socket connection management
│   │   ├── store/                  # State Management
│   │   │   ├── authSlice.ts        # Authentication state
│   │   │   ├── chatSlice.ts        # Chat state
│   │   │   ├── creditSlice.ts      # Credit state
│   │   │   ├── matchSlice.ts       # Match state
│   │   │   ├── index.ts            # Store configuration
│   │   │   └── useAuthStore.ts     # Auth store hook
│   │   ├── styles/                 # Styling
│   │   │   └── theme.ts            # Theme configuration
│   │   ├── types/                  # TypeScript Types
│   │   │   ├── chat.ts             # Chat types
│   │   │   ├── credit.ts           # Credit types
│   │   │   ├── match.ts            # Match types
│   │   │   ├── notification.ts     # Notification types
│   │   │   └── index.ts            # Shared types
│   │   └── utils/                  # Utility Functions
│   │       ├── calculateCredits.ts  # Credit calculations
│   │       ├── constants.ts         # App constants
│   │       └── formatDate.ts       # Date formatting
│   ├── public/                     # Static Assets
│   ├── dist/                       # Build Output
│   ├── package.json                # Dependencies
│   ├── vite.config.ts              # Vite configuration
│   └── tsconfig.json               # TypeScript config
│
├── server/                         # Backend Node.js Application
│   ├── src/
│   │   ├── config/                 # Configuration
│   │   │   ├── aiPersonas.ts       # AI persona definitions
│   │   │   ├── cloudinary.ts       # Cloudinary config
│   │   │   └── db.ts               # Database connection
│   │   ├── controllers/             # Route Controllers
│   │   │   ├── authController.ts   # Authentication logic
│   │   │   ├── chatController.ts   # Chat logic
│   │   │   ├── creditController.ts # Credit logic
│   │   │   ├── matchController.ts  # Match logic
│   │   │   ├── notificationController.ts # Notification logic
│   │   │   └── userController.ts   # User logic
│   │   ├── middlewares/            # Express Middleware
│   │   │   ├── authMiddleware.ts   # JWT authentication
│   │   │   ├── errorHandler.ts     # Error handling
│   │   │   └── validateRequest.ts  # Request validation
│   │   ├── models/                 # Database Models
│   │   │   ├── User.ts             # User schema
│   │   │   ├── Match.ts             # Match schema
│   │   │   ├── Chat.ts              # Chat schema
│   │   │   ├── Credit.ts            # Credit schema
│   │   │   └── Notification.ts     # Notification schema
│   │   ├── routes/                 # API Routes
│   │   │   ├── authRoutes.ts        # Authentication routes
│   │   │   ├── userRoutes.ts       # User routes
│   │   │   ├── matchRoutes.ts      # Match routes
│   │   │   ├── chatRoutes.ts       # Chat routes
│   │   │   ├── creditRoutes.ts     # Credit routes
│   │   │   └── notificationRoutes.ts # Notification routes
│   │   ├── services/               # Business Logic
│   │   │   └── geminiService.ts    # AI service integration
│   │   ├── sockets/                # Socket.IO Handlers
│   │   │   ├── index.ts            # Socket initialization
│   │   │   ├── chatSocket.ts       # Chat socket handlers
│   │   │   ├── matchSocket.ts      # Match socket handlers
│   │   │   └── notificationSocket.ts # Notification handlers
│   │   ├── types/                  # TypeScript Types
│   │   │   ├── index.ts            # Shared types
│   │   │   ├── socket.ts           # Socket types
│   │   │   └── user.ts             # User types
│   │   ├── utils/                  # Utility Functions
│   │   │   ├── generateToken.ts    # JWT token generation
│   │   │   ├── imageTransform.ts   # Image processing
│   │   │   ├── logger.ts            # Logging utility
│   │   │   └── responseHelper.ts   # API response helpers
│   │   ├── app.ts                  # Express app configuration
│   │   └── index.ts                # Server entry point
│   ├── dist/                       # Compiled JavaScript
│   ├── package.json                # Dependencies
│   └── tsconfig.json               # TypeScript config
│
└── Documentation Files
    ├── README.md
    ├── PRODUCTION_SETUP.md
    ├── QUICK_TEST_GUIDE.md
    └── Various fix documentation files
```

---

## 🔌 Backend API Documentation

### Base URL
```
Development: http://localhost:5000/api
Production: https://your-backend-url.com/api
```

### Authentication Endpoints

#### `POST /api/auth/google`
**Google OAuth Authentication**
```typescript
// Request Body
{
  "credential": "string" // Google OAuth credential
}

// Response
{
  "success": true,
  "data": {
    "token": "jwt_token",
    "user": {
      "_id": "user_id",
      "email": "user@example.com",
      "name": "User Name",
      "isOnboarded": false
    }
  }
}
```

#### `POST /api/auth/signup`
**Complete User Onboarding**
```typescript
// Request Body
{
  "googleId": "string",
  "email": "string",
  "name": "string",
  "dateOfBirth": "string",
  "gender": "man" | "woman" | "non-binary" | "other",
  "genderCustom": "string?",
  "showGender": boolean,
  "city": "string",
  "photos": ["string"],
  "bio": "string",
  "interests": ["string"],
  "preferences": {
    "showMe": ["string"],
    "ageRange": { "min": number, "max": number },
    "maxDistance": number
  }
}

// Response
{
  "success": true,
  "data": {
    "token": "jwt_token",
    "user": { /* User object */ }
  }
}
```

#### `GET /api/auth/me`
**Get Current User**
```typescript
// Headers: Authorization: Bearer <token>

// Response
{
  "success": true,
  "data": {
    "_id": "user_id",
    "email": "user@example.com",
    "name": "User Name",
    "credits": 5,
    "isOnboarded": true,
    // ... other user fields
  }
}
```

### User Management Endpoints

#### `GET /api/users/profile`
**Get User Profile**
```typescript
// Headers: Authorization: Bearer <token>

// Response
{
  "success": true,
  "data": {
    "_id": "user_id",
    "name": "string",
    "age": number,
    "gender": "string",
    "city": "string",
    "photos": ["string"],
    "bio": "string",
    "interests": ["string"],
    "preferences": { /* preferences object */ },
    "credits": number,
    "lastActive": "date"
  }
}
```

#### `PUT /api/users/profile`
**Update User Profile**
```typescript
// Request Body
{
  "name": "string",
  "bio": "string",
  "interests": ["string"],
  "preferences": {
    "showMe": ["string"],
    "ageRange": { "min": number, "max": number },
    "maxDistance": number
  }
}
```

#### `POST /api/users/upload-photo`
**Upload Profile Photo**
```typescript
// FormData with 'photo' field

// Response
{
  "success": true,
  "data": {
    "url": "cloudinary_url",
    "publicId": "cloudinary_public_id"
  }
}
```

#### `DELETE /api/users/photo/:index`
**Delete Profile Photo**
```typescript
// Response
{
  "success": true,
  "message": "Photo deleted successfully"
}
```

### Matching Endpoints

#### `POST /api/matches/find`
**Find New Match**
```typescript
// Headers: Authorization: Bearer <token>

// Response
{
  "success": true,
  "data": {
    "match": {
      "_id": "match_id",
      "user1Id": "current_user_id",
      "user2Id": "matched_user_id" | "ai_persona_id",
      "status": "active",
      "revealStatus": {
        "user1Requested": false,
        "user2Requested": false,
        "isRevealed": false
      }
    },
    "matchedUser": {
      "_id": "user_id" | "ai_persona_id",
      "name": "string",
      "age": number,
      "gender": "string",
      "city": "string",
      "photos": ["string"],
      "bio": "string",
      "interests": ["string"],
      "isAIPersona": boolean
    }
  }
}
```

#### `GET /api/matches`
**Get All Matches**
```typescript
// Response
{
  "success": true,
  "data": [
    {
      "_id": "match_id",
      "user1Id": "user_id",
      "user2Id": "user_id" | "ai_persona_id",
      "status": "active" | "revealed" | "skipped" | "unmatched",
      "revealStatus": { /* reveal status object */ },
      "lastMessageAt": "date",
      "matchedUser": { /* user object */ }
    }
  ]
}
```

#### `GET /api/matches/:matchId`
**Get Specific Match**
```typescript
// Response
{
  "success": true,
  "data": {
    "_id": "match_id",
    "user1Id": "user_id",
    "user2Id": "user_id" | "ai_persona_id",
    "status": "string",
    "revealStatus": { /* reveal status object */ },
    "matchedUser": { /* user object */ }
  }
}
```

#### `POST /api/matches/:matchId/skip`
**Skip Match**
```typescript
// Response
{
  "success": true,
  "message": "Match skipped successfully"
}
```

#### `POST /api/matches/:matchId/reveal-request`
**Request Profile Reveal**
```typescript
// Response
{
  "success": true,
  "data": {
    "revealRequested": true,
    "creditsDeducted": 1,
    "remainingCredits": number
  }
}
```

#### `POST /api/matches/:matchId/reveal-accept`
**Accept Profile Reveal**
```typescript
// Response
{
  "success": true,
  "data": {
    "revealAccepted": true,
    "creditsDeducted": 1,
    "remainingCredits": number,
    "revealedProfile": { /* full user profile */ }
  }
}
```

### Chat Endpoints

#### `GET /api/chats/conversations`
**Get All Conversations**
```typescript
// Response
{
  "success": true,
  "data": [
    {
      "matchId": "match_id",
      "lastMessage": {
        "content": "string",
        "senderId": "user_id",
        "createdAt": "date"
      },
      "unreadCount": number,
      "matchedUser": { /* user object */ }
    }
  ]
}
```

#### `GET /api/chats/match/:matchId`
**Get Messages for Match**
```typescript
// Query Parameters
// ?limit=50&skip=0

// Response
{
  "success": true,
  "data": {
    "messages": [
      {
        "_id": "message_id",
        "content": "string",
        "senderId": "user_id" | "ai_persona_id",
        "receiverId": "user_id" | "ai_persona_id",
        "type": "text" | "system",
        "isRead": boolean,
        "createdAt": "date"
      }
    ],
    "hasMore": boolean,
    "totalCount": number
  }
}
```

#### `POST /api/chats/match/:matchId`
**Send Message**
```typescript
// Request Body
{
  "content": "string"
}

// Response
{
  "success": true,
  "data": {
    "message": {
      "_id": "message_id",
      "content": "string",
      "senderId": "user_id",
      "receiverId": "user_id" | "ai_persona_id",
      "type": "text",
      "isRead": false,
      "createdAt": "date"
    }
  }
}
```

#### `PUT /api/chats/:chatId/read`
**Mark Message as Read**
```typescript
// Response
{
  "success": true,
  "message": "Message marked as read"
}
```

### Credit System Endpoints

#### `GET /api/credits/balance`
**Get Credit Balance**
```typescript
// Response
{
  "success": true,
  "data": {
    "credits": number,
    "lastRefresh": "date",
    "nextRefresh": "date"
  }
}
```

#### `GET /api/credits/history`
**Get Credit History**
```typescript
// Query Parameters
// ?limit=20

// Response
{
  "success": true,
  "data": {
    "history": [
      {
        "_id": "credit_id",
        "action": "daily_refresh" | "find_match" | "skip_match" | "request_reveal" | "accept_reveal",
        "amount": number,
        "balanceAfter": number,
        "createdAt": "date"
      }
    ],
    "hasMore": boolean
  }
}
```

#### `POST /api/credits/refresh`
**Refresh Daily Credits**
```typescript
// Response
{
  "success": true,
  "data": {
    "creditsAdded": 5,
    "newBalance": number,
    "nextRefresh": "date"
  }
}
```

### Notification Endpoints

#### `GET /api/notifications`
**Get Notifications**
```typescript
// Query Parameters
// ?limit=20

// Response
{
  "success": true,
  "data": {
    "notifications": [
      {
        "_id": "notification_id",
        "type": "new_match" | "new_message" | "reveal_request" | "reveal_accepted" | "reveal_declined" | "credits_refreshed",
        "title": "string",
        "message": "string",
        "relatedUserId": "user_id",
        "relatedMatchId": "match_id",
        "isRead": boolean,
        "createdAt": "date"
      }
    ],
    "unreadCount": number
  }
}
```

#### `PUT /api/notifications/:notificationId/read`
**Mark Notification as Read**
```typescript
// Response
{
  "success": true,
  "message": "Notification marked as read"
}
```

#### `PUT /api/notifications/read-all`
**Mark All Notifications as Read**
```typescript
// Response
{
  "success": true,
  "message": "All notifications marked as read"
}
```

---

## 🎨 Frontend Components

### Core Components

#### Authentication Components
- **Landing Page**: Google OAuth integration, app introduction
- **Onboarding**: Multi-step user profile creation
- **Protected Routes**: Route protection with authentication

#### Main Application Components
- **Home Page**: Card-based matching interface with swipe functionality
- **Chat Interface**: Real-time messaging with AI persona support
- **Profile Management**: Photo uploads, bio editing, preference settings
- **Notifications**: Real-time notification system
- **Credits Management**: Credit balance and history display

#### UI Components
- **Header**: Navigation and user status
- **Bottom Navigation**: Main app navigation
- **Message Bubbles**: Chat message display
- **Match Cards**: User profile cards for matching
- **Modal Components**: Various popup interfaces

### State Management

#### Authentication Store (`useAuthStore`)
```typescript
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
}
```

#### Socket Connection Management
```typescript
// Socket events handled:
- 'connect' / 'disconnect'
- 'receive-message'
- 'new-match'
- 'notification'
- 'join-room' / 'leave-room'
```

---

## 🗄️ Database Schema

### User Model
```typescript
interface IUser {
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
    ageRange: { min: number; max: number };
    maxDistance: number;
  };
  credits: number;
  lastCreditRefresh: Date;
  isActive: boolean;
  isVerified: boolean;
  lastActive: Date;
  skippedUsers: Array<ObjectId | string>; // Mixed for AI personas
  matchedUsers: Array<ObjectId | string>; // Mixed for AI personas
}
```

### Match Model
```typescript
interface IMatch {
  user1Id: ObjectId;
  user2Id: ObjectId | string; // Can be AI persona
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
```

### Chat Model
```typescript
interface IChat {
  matchId: ObjectId;
  senderId: ObjectId | string; // Can be AI persona
  receiverId: ObjectId | string; // Can be AI persona
  content: string;
  type: 'text' | 'system';
  isRead: boolean;
  readAt?: Date;
}
```

### Credit Model
```typescript
interface ICredit {
  userId: ObjectId;
  action: 'daily_refresh' | 'find_match' | 'skip_match' | 'request_reveal' | 'accept_reveal' | 'cancel_reveal_request';
  amount: number;
  balanceAfter: number;
  relatedMatchId?: ObjectId;
}
```

### Notification Model
```typescript
interface INotification {
  userId: ObjectId;
  type: 'new_match' | 'new_message' | 'reveal_request' | 'reveal_accepted' | 'reveal_declined' | 'credits_refreshed';
  title: string;
  message: string;
  relatedUserId?: ObjectId;
  relatedMatchId?: ObjectId;
  isRead: boolean;
  readAt?: Date;
}
```

---

## 🔄 User Flows & API Interactions

### 1. Authentication Flow
```
Landing Page → Google OAuth → Token Generation → 
Check Onboarding Status → Onboarding (if needed) → Home Page
```

#### Authentication Flow Diagram
```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant G as Google OAuth
    participant D as Database

    U->>F: Click "Sign in with Google"
    F->>G: Request OAuth credential
    G->>F: Return credential token
    F->>B: POST /api/auth/google
    Note over F,B: { credential: "google_token" }
    B->>G: Verify credential
    G->>B: Return user info
    B->>D: Check if user exists
    alt User exists
        D->>B: Return user data
    else New user
        D->>B: Create new user
    end
    B->>B: Generate JWT token
    B->>F: Return { token, user, isOnboarded }
    F->>F: Store token in localStorage
    F->>F: Set auth state
    alt isOnboarded = false
        F->>F: Navigate to /onboarding
    else isOnboarded = true
        F->>F: Navigate to /home
    end
```

### 2. Onboarding Flow
```
Google Auth → Personal Info → Photos → Bio & Interests → 
Preferences → Complete Profile → Home Page
```

#### Onboarding Flow Diagram
```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant C as Cloudinary
    participant D as Database

    U->>F: Fill onboarding form
    F->>F: Validate form data
    
    loop For each photo
        U->>F: Upload photo
        F->>B: POST /api/users/upload-photo
        B->>C: Upload to Cloudinary
        C->>B: Return photo URL
        B->>F: Return { url, publicId }
        F->>F: Add to photos array
    end
    
    U->>F: Submit complete profile
    F->>B: POST /api/auth/signup
    Note over F,B: { googleId, email, name, dateOfBirth, gender, city, photos, bio, interests, preferences }
    B->>B: Validate request data
    B->>D: Update user profile
    D->>B: Return updated user
    B->>B: Generate new JWT token
    B->>F: Return { token, user }
    F->>F: Update auth state
    F->>F: Navigate to /home
```

### 3. Matching Flow
```
Home Page → Find Match → View Profile Card → 
Swipe Right/Left → Match/No Match → Chat (if matched)
```

#### Matching Flow Diagram
```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant D as Database
    participant A as AI Service

    U->>F: Click "Find Match"
    F->>B: POST /api/matches/find
    Note over F,B: Authorization: Bearer token
    B->>B: Check user credits
    alt Credits >= 1
        B->>D: Find potential matches
        alt Real users available
            D->>B: Return real user match
        else No real users
            B->>A: Get AI persona
            A->>B: Return AI persona data
        end
        B->>D: Create match record
        B->>D: Deduct 1 credit
        B->>F: Return { match, matchedUser }
        F->>F: Display match card
    else No credits
        B->>F: Return { error: "Insufficient credits" }
        F->>F: Show "Out of credits" modal
    end
    
    alt User swipes right
        U->>F: Swipe right
        F->>B: POST /api/matches/:matchId/reveal-request
        B->>D: Update match reveal status
        B->>D: Deduct 1 credit
        B->>F: Return { revealRequested: true }
        F->>F: Show "Reveal requested" message
    else User swipes left
        U->>F: Swipe left
        F->>B: POST /api/matches/:matchId/skip
        B->>D: Update match status to "skipped"
        B->>F: Return { success: true }
        F->>F: Show next match
    end
```

### 4. Chat Flow
```
Match → Enter Chat → Send Message → 
AI Response (if AI persona) → Real-time Updates
```

#### Chat Flow Diagram
```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant S as Socket.IO
    participant D as Database
    participant A as AI Service

    U->>F: Enter chat room
    F->>B: GET /api/chats/match/:matchId
    B->>D: Fetch chat messages
    D->>B: Return messages
    B->>F: Return { messages }
    F->>F: Display messages
    F->>S: Join room (matchId)
    S->>B: User joined room
    B->>S: Confirm room join
    
    loop Real-time messaging
        U->>F: Type message
        U->>F: Send message
        F->>B: POST /api/chats/match/:matchId
        Note over F,B: { content: "message text" }
        B->>D: Save message
        D->>B: Return saved message
        B->>F: Return { message }
        F->>F: Display sent message
        B->>S: Emit to room
        S->>F: Receive message event
        
        alt AI Persona match
            B->>A: Generate AI response
            A->>B: Return AI response
            B->>D: Save AI message
            B->>S: Emit AI response
            S->>F: Receive AI message
            F->>F: Display AI message
        else Real user match
            B->>S: Emit to other user
            S->>F: Other user receives message
        end
    end
    
    U->>F: Leave chat
    F->>S: Leave room
    S->>B: User left room
```

### 5. Reveal Flow
```
Chat → Request Reveal (costs credit) → 
Other user accepts → Full profile revealed
```

#### Reveal Flow Diagram
```mermaid
sequenceDiagram
    participant U1 as User 1
    participant F1 as Frontend 1
    participant B as Backend
    participant S as Socket.IO
    participant D as Database
    participant F2 as Frontend 2
    participant U2 as User 2

    U1->>F1: Click "Request Reveal"
    F1->>B: POST /api/matches/:matchId/reveal-request
    B->>B: Check user credits
    alt Credits >= 1
        B->>D: Update match reveal status
        B->>D: Deduct 1 credit
        B->>F1: Return { revealRequested: true }
        F1->>F1: Show "Reveal requested"
        
        B->>S: Emit reveal request
        S->>F2: Notify User 2
        F2->>F2: Show reveal request notification
        
        alt User 2 accepts
            U2->>F2: Click "Accept Reveal"
            F2->>B: POST /api/matches/:matchId/reveal-accept
            B->>D: Update reveal status
            B->>D: Deduct 1 credit from User 2
            B->>D: Fetch full profiles
            B->>F2: Return { revealedProfile }
            F2->>F2: Display full profile
            B->>S: Emit reveal accepted
            S->>F1: Notify User 1
            F1->>F1: Show "Reveal accepted"
        else User 2 declines
            U2->>F2: Click "Decline"
            F2->>B: POST /api/matches/:matchId/reveal-decline
            B->>D: Update reveal status
            B->>F2: Return { success: true }
            B->>S: Emit reveal declined
            S->>F1: Notify User 1
            F1->>F1: Show "Reveal declined"
        end
    else No credits
        B->>F1: Return { error: "Insufficient credits" }
        F1->>F1: Show "Out of credits" message
    end
```

### 6. Credit Management Flow
```
Daily Refresh → Use Credits → View History → 
Purchase More (future feature)
```

#### Credit Management Flow Diagram
```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant D as Database
    participant S as Socket.IO

    U->>F: Open credits page
    F->>B: GET /api/credits/balance
    B->>D: Fetch user credits
    D->>B: Return credit data
    B->>F: Return { credits, lastRefresh, nextRefresh }
    F->>F: Display credit balance
    
    U->>F: View credit history
    F->>B: GET /api/credits/history
    B->>D: Fetch credit transactions
    D->>B: Return transaction history
    B->>F: Return { history }
    F->>F: Display transaction list
    
    alt Daily refresh available
        U->>F: Click "Refresh Credits"
        F->>B: POST /api/credits/refresh
        B->>B: Check if 24h passed since last refresh
        alt Can refresh
            B->>D: Add 5 credits
            B->>D: Update lastRefresh timestamp
            B->>F: Return { creditsAdded: 5, newBalance }
            F->>F: Update credit display
            B->>S: Emit credits updated
            S->>F: Update real-time balance
        else Cannot refresh yet
            B->>F: Return { error: "Refresh not available" }
            F->>F: Show "Wait for next refresh" message
        end
    end
```

### 7. Notification Flow
```
System Events → Generate Notifications → 
Real-time Delivery → User Interaction
```

#### Notification Flow Diagram
```mermaid
sequenceDiagram
    participant S as System
    participant B as Backend
    participant D as Database
    participant SIO as Socket.IO
    participant F as Frontend
    participant U as User

    Note over S: System Events (New Match, Message, etc.)
    S->>B: Trigger notification event
    B->>D: Create notification record
    D->>B: Return notification
    B->>SIO: Emit notification to user
    SIO->>F: Receive notification
    F->>F: Show notification badge
    F->>F: Display notification popup
    
    U->>F: Click notification
    F->>B: PUT /api/notifications/:id/read
    B->>D: Mark notification as read
    D->>B: Return updated notification
    B->>F: Return { success: true }
    F->>F: Remove notification badge
    F->>F: Navigate to relevant page
    
    alt Mark all as read
        U->>F: Click "Mark all as read"
        F->>B: PUT /api/notifications/read-all
        B->>D: Mark all notifications as read
        B->>F: Return { success: true }
        F->>F: Clear all notification badges
    end
```

### 8. Profile Management Flow
```
Profile Page → Edit Profile → Upload Photos → 
Update Preferences → Save Changes
```

#### Profile Management Flow Diagram
```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant C as Cloudinary
    participant D as Database

    U->>F: Open profile page
    F->>B: GET /api/users/profile
    B->>D: Fetch user profile
    D->>B: Return profile data
    B->>F: Return { profile }
    F->>F: Display profile form
    
    alt Upload new photo
        U->>F: Select photo file
        F->>B: POST /api/users/upload-photo
        Note over F,B: FormData with photo file
        B->>C: Upload to Cloudinary
        C->>B: Return { url, publicId }
        B->>F: Return { url, publicId }
        F->>F: Add photo to gallery
    end
    
    alt Delete photo
        U->>F: Click delete photo
        F->>B: DELETE /api/users/photo/:index
        B->>C: Delete from Cloudinary
        C->>B: Return success
        B->>D: Remove photo from user profile
        B->>F: Return { success: true }
        F->>F: Remove photo from gallery
    end
    
    U->>F: Update profile info
    F->>B: PUT /api/users/profile
    Note over F,B: { name, bio, interests, preferences }
    B->>B: Validate request data
    B->>D: Update user profile
    D->>B: Return updated profile
    B->>F: Return { success: true, profile }
    F->>F: Update profile display
    F->>F: Show success message
```

### 9. Real-time Socket Events Flow
```
Socket Connection → Event Handling → 
Room Management → Message Broadcasting
```

#### Socket Events Flow Diagram
```mermaid
sequenceDiagram
    participant F as Frontend
    participant S as Socket.IO
    participant B as Backend
    participant D as Database
    participant A as AI Service

    F->>S: Connect with JWT token
    S->>B: Authenticate socket connection
    B->>B: Verify JWT token
    B->>S: Connection authorized
    S->>F: Connection established
    
    F->>S: Join room (matchId)
    S->>B: User joined room
    B->>B: Add user to room
    B->>S: Room join confirmed
    S->>F: Joined room successfully
    
    loop Real-time events
        alt New message
            F->>S: Send message
            S->>B: Process message
            B->>D: Save message
            B->>S: Broadcast to room
            S->>F: Message received
        end
        
        alt AI persona response
            B->>A: Generate AI response
            A->>B: Return AI message
            B->>D: Save AI message
            B->>S: Broadcast AI response
            S->>F: AI message received
        end
        
        alt New match
            B->>S: Emit new match
            S->>F: Match notification
            F->>F: Show match popup
        end
        
        alt Credits updated
            B->>S: Emit credits update
            S->>F: Credits notification
            F->>F: Update credit display
        end
    end
    
    F->>S: Leave room
    S->>B: User left room
    B->>B: Remove user from room
    F->>S: Disconnect
    S->>B: Connection closed
```

### 10. Error Handling Flow
```
API Error → Error Interception → 
User Notification → Recovery Actions
```

#### Error Handling Flow Diagram
```mermaid
sequenceDiagram
    participant F as Frontend
    participant B as Backend
    participant U as User

    F->>B: API Request
    B->>B: Process request
    
    alt Success
        B->>F: Return success response
        F->>F: Update UI with data
    else Error occurs
        B->>F: Return error response
        F->>F: Intercept error
        
        alt 401 Unauthorized
            F->>F: Clear localStorage
            F->>F: Redirect to login
        else 403 Forbidden
            F->>F: Show "Access denied" message
        else 404 Not Found
            F->>F: Show "Not found" message
        else 500 Server Error
            F->>F: Show "Server error" message
        else Network Error
            F->>F: Show "Connection error" message
        end
        
        F->>U: Display error notification
        U->>F: User acknowledges error
        F->>F: Clear error state
    end
```

---

## 🤖 AI Personas System

### AI Persona Configuration
The app includes 10 pre-configured AI personas (5 male, 5 female) with unique personalities:

#### Female Personas
1. **Priya** (26, Mumbai) - Adventure seeker, digital marketer
2. **Aisha** (24, Delhi) - Bookworm, Netflix enthusiast
3. **Meera** (27, Bangalore) - Yoga instructor, coder
4. **Ananya** (28, Pune) - Fashion designer, sustainable living
5. **Rhea** (25, Hyderabad) - Startup founder, meme queen

#### Male Personas
1. **Arjun** (28, Mumbai) - Software engineer, traveler
2. **Kabir** (30, Bangalore) - Product manager, guitarist
3. **Rohan** (29, Delhi) - Investment banker, cricket fan
4. **Vikram** (27, Pune) - Architect, history buff
5. **Aditya** (26, Hyderabad) - Digital marketer, comedian

### AI Response Generation
- **Gemini AI Integration**: Uses Google's Gemini 2.5 Flash model
- **Personality-based Responses**: Each persona has unique conversation styles
- **Context Awareness**: Maintains conversation history
- **Deflection Responses**: Handles AI detection questions naturally
- **Response Timing**: Realistic delays between messages

### AI Persona Features
```typescript
interface AIPersona {
  id: string;
  name: string;
  age: number;
  gender: 'man' | 'woman';
  city: string;
  bio: string;
  interests: string[];
  photos: string[];
  personality: {
    traits: string[];
    conversationStyle: string;
    flirtStyle: string;
    responsePatterns: string[];
    deflectionResponses?: string[];
  };
  responseDelay: { min: number; max: number };
  preferences: {
    showMe: string[];
    ageRange: { min: number; max: number };
  };
  backstory?: string;
}
```

---

## ⚡ Real-time Features

### WebSocket Events

#### Client → Server Events
```typescript
// Chat Events
'join-room' → { matchId: string }
'leave-room' → { matchId: string }
'send-message' → { matchId: string, content: string }

// Match Events
'request-reveal' → { matchId: string }
'accept-reveal' → { matchId: string }
```

#### Server → Client Events
```typescript
// Chat Events
'receive-message' → { message: ChatMessage }
'message-sent' → { message: ChatMessage }

// Match Events
'new-match' → { match: Match, user: User }
'reveal-request' → { matchId: string, fromUserId: string }
'reveal-accepted' → { matchId: string, revealedProfile: User }

// Notification Events
'notification' → { notification: Notification }
'credits-updated' → { credits: number }
```

### Real-time Features
- **Instant Messaging**: Real-time chat with typing indicators
- **Live Notifications**: Push notifications for matches and messages
- **Credit Updates**: Real-time credit balance updates
- **Match Status**: Live match status updates
- **Online Status**: User online/offline status

---

## 💰 Credit System

### Credit Costs
```typescript
const CREDIT_COSTS = {
  FIND_MATCH: 1,        // Finding a new match
  SKIP_MATCH: 0,         // Skipping a match (free)
  REQUEST_REVEAL: 1,     // Requesting profile reveal
  ACCEPT_REVEAL: 1,      // Accepting reveal request
  CANCEL_REVEAL: 0       // Canceling reveal request (free)
};
```

### Credit Management
- **Daily Refresh**: 5 credits added daily at midnight
- **Credit History**: Track all credit transactions
- **Balance Validation**: Check credits before actions
- **Automatic Deduction**: Credits deducted on successful actions

### Credit Flow
```
User Action → Check Credits → Deduct Credits → 
Update Balance → Log Transaction → Notify User
```

---

## 🔐 Security & Authentication

### Authentication Flow
1. **Google OAuth**: Secure Google authentication
2. **JWT Tokens**: Stateless authentication with JWT
3. **Token Validation**: Middleware validates all protected routes
4. **Session Management**: Automatic token refresh and logout

### Security Features
- **CORS Configuration**: Restricted origins for production
- **Input Validation**: Request validation middleware
- **Error Handling**: Centralized error handling
- **Rate Limiting**: (Future implementation)
- **Image Security**: Cloudinary integration with secure URLs

### Protected Routes
All API endpoints except authentication require valid JWT token:
```typescript
// Middleware: authMiddleware.ts
const protect = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ success: false, message: 'No token' });
  
  const decoded = verifyToken(token);
  if (!decoded) return res.status(401).json({ success: false, message: 'Invalid token' });
  
  req.user = decoded;
  next();
};
```

---

## 🚀 Deployment

### Frontend Deployment (Vercel)
```bash
# Build command
npm run build

# Output directory
dist

# Environment variables
VITE_API_URL=https://your-backend-url.com/api
```

### Backend Deployment (DigitalOcean)
```bash
# Build command
npm run build

# Start command
npm start

# Environment variables
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-jwt-secret
GEMINI_API_KEY=your-gemini-key
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Environment Configuration
```typescript
// Required Environment Variables
MONGODB_URI: string;           // MongoDB connection string
JWT_SECRET: string;            // JWT signing secret
GEMINI_API_KEY: string;        // Google AI API key
CLOUDINARY_CLOUD_NAME: string; // Cloudinary cloud name
CLOUDINARY_API_KEY: string;    // Cloudinary API key
CLOUDINARY_API_SECRET: string; // Cloudinary API secret
CLIENT_URL: string;            // Frontend URL for CORS
PORT: number;                  // Server port (default: 5000)
```

---

## 🗺️ Development Roadmap

### Phase 1: Core Features ✅
- [x] User authentication with Google OAuth
- [x] User onboarding and profile creation
- [x] Basic matching system
- [x] Real-time chat functionality
- [x] AI persona integration
- [x] Credit system implementation
- [x] Profile reveal mechanism

### Phase 2: Enhanced Features 🚧
- [ ] Advanced matching algorithms
- [ ] Photo verification system
- [ ] Video call integration
- [ ] Advanced AI persona customization
- [ ] Push notifications
- [ ] Offline message support

### Phase 3: Premium Features 📋
- [ ] Premium subscription model
- [ ] Advanced search filters
- [ ] Super likes and boosts
- [ ] Analytics dashboard
- [ ] Admin panel
- [ ] Content moderation

### Phase 4: Scale & Optimize 📋
- [ ] Performance optimization
- [ ] Database optimization
- [ ] CDN implementation
- [ ] Advanced caching
- [ ] Monitoring and analytics
- [ ] A/B testing framework

### Future Enhancements 💡
- [ ] Voice messages
- [ ] Location-based matching
- [ ] Event-based matching
- [ ] Group chat features
- [ ] Video profiles
- [ ] AI-powered compatibility scoring

---

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Google Cloud Console account
- Cloudinary account
- Git

### Local Development

#### Backend Setup
```bash
cd server
npm install
cp .env.example .env
# Configure environment variables
npm run dev
```

#### Frontend Setup
```bash
cd client
npm install
cp .env.example .env
# Configure environment variables
npm run dev
```

### Environment Variables
```bash
# Backend (.env)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
JWT_SECRET=your-super-secret-jwt-key
GEMINI_API_KEY=your-gemini-api-key
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CLIENT_URL=http://localhost:5174
PORT=5000

# Frontend (.env)
VITE_API_URL=http://localhost:5000/api
```

---

## 📊 Performance Considerations

### Database Optimization
- **Indexes**: Optimized indexes on frequently queried fields
- **Aggregation**: Efficient aggregation pipelines for complex queries
- **Connection Pooling**: MongoDB connection pooling for better performance

### Frontend Optimization
- **Code Splitting**: Route-based code splitting
- **Lazy Loading**: Component lazy loading
- **Image Optimization**: Cloudinary automatic optimization
- **Caching**: Service worker for offline support (future)

### Real-time Optimization
- **Socket Rooms**: Efficient room management
- **Message Queuing**: Message queuing for high load
- **Connection Management**: Proper socket connection cleanup

---

## 🐛 Troubleshooting

### Common Issues

#### Socket Connection Issues
```typescript
// Check CORS configuration
// Verify token authentication
// Check network connectivity
// Validate socket URL configuration
```

#### AI Response Issues
```typescript
// Verify Gemini API key
// Check API quotas
// Validate persona configuration
// Monitor response times
```

#### Image Upload Issues
```typescript
// Verify Cloudinary configuration
// Check file size limits
// Validate image formats
// Monitor upload quotas
```

### Debug Mode
```bash
# Enable debug logging
DEBUG=socket.io:* npm run dev

# Check environment variables
console.log(process.env)

# Monitor database queries
# Enable MongoDB query logging
```

---

## 📈 Monitoring & Analytics

### Key Metrics to Track
- **User Engagement**: Daily/Monthly active users
- **Match Success Rate**: Matches per user
- **Chat Activity**: Messages per match
- **Credit Usage**: Credits consumed per user
- **AI Persona Performance**: Response quality and engagement

### Logging Strategy
- **Error Logging**: Centralized error tracking
- **Performance Monitoring**: Response time tracking
- **User Analytics**: User behavior tracking
- **System Health**: Server and database monitoring

---

## 🤝 Contributing

### Code Standards
- **TypeScript**: Strict type checking
- **ESLint**: Code quality enforcement
- **Prettier**: Code formatting
- **Git Hooks**: Pre-commit validation

### Development Workflow
1. **Feature Branch**: Create feature branch from main
2. **Development**: Implement feature with tests
3. **Code Review**: Submit pull request for review
4. **Testing**: Run full test suite
5. **Deployment**: Deploy to staging for testing
6. **Production**: Merge to main and deploy

---

## 📞 Support & Contact

### Technical Support
- **Documentation**: This comprehensive guide
- **Issues**: GitHub issues for bug reports
- **Discussions**: GitHub discussions for questions
- **Email**: Support email for urgent issues

### Development Team
- **Backend**: Node.js/Express.js development
- **Frontend**: React/TypeScript development
- **DevOps**: Deployment and infrastructure
- **AI/ML**: AI persona and matching algorithms

---

*This documentation is maintained and updated regularly. For the latest version, please check the project repository.*

**Last Updated**: December 2024
**Version**: 1.0.0
**Status**: Production Ready
