
export interface User {
  _id: string;
  name?: string;
  email: string;
  verificationStatus?: "pending" | "approved" | "rejected";
  salaryProofImages?: string[];
  isActive?: boolean;
  createdAt?: string;
  rejectionReason?: string;
  verifiedAt?: string;
  dateOfBirth?: string;
  age?: number;
  gender?: string;
  genderCustom?: string;
  city?: string;
  role?: string;
  isWorkingProfessional?: boolean;
  companyName?: string;
  position?: string;
  workingSince?: string;
  bio?: string;
  interests?: string[];
  preferences?: {
    showMe?: string[];
    ageRange?: {
      min?: number;
      max?: number;
    };
    maxDistance?: number;
  };
  photos?: string[];
  credits?: number;
  lastActive?: string;
  firstName?: string;
  lastName?: string;
  matchedUsers?: any[];
}
