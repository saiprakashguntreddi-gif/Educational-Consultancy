export type Gender = 'MALE' | 'FEMALE' | 'NON_BINARY' | 'OTHER' | 'PREFER_NOT_TO_SAY';
export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

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
  verifiedAt: string | null;
  verifiedBy: string | null;
  verificationNotes: string | null;
  createdAt: string;
  updatedAt: string;
}
