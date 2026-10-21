import { Gender, VerificationStatus } from '../../config/constants';

export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface StudentProfileIntakeInput {
  fullName: string;
  gender: Gender;
  grade: string;
  contactEmail: string;
  phone: string;
  address: Address;
  board: string;
  citizenship: string;
  passingOutYear: number;
}

export interface StudentProfileRecord extends StudentProfileIntakeInput {
  id: string;
  userId: string;
  verificationStatus: VerificationStatus;
  verifiedAt: Date | null;
  verifiedBy: string | null;
  verificationNotes: string | null;
  createdAt: Date;
  updatedAt: Date;
}
