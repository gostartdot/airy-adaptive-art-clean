export interface IUserDocument {
  _id: string;
  googleId: string;
  email: string;
  name: string;
  dateOfBirth: Date;
  age: number;
  gender: 'woman' | 'man' | 'non-binary' | 'other';
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
  lastActive: Date;
}

