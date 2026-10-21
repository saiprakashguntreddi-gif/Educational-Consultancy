export interface DepartmentPreferencePair {
  department: string;
  subDepartment: string;
}

export interface StudentPreferenceInput {
  countries: string[];
  countriesNotFinalized?: boolean;
  primaryCountry?: string;
  department?: string;
  subDepartment?: string;
  coursesNotFinalized?: boolean;
  departmentPreferences?: DepartmentPreferencePair[];
}

export interface StudentPreferenceRecord {
  id: string;
  studentProfileId: string;
  countries: string[];
  countriesNotFinalized: boolean;
  primaryCountry: string | null;
  department: string;
  subDepartment: string;
  coursesNotFinalized: boolean;
  departmentPreferences: DepartmentPreferencePair[];
  createdAt: string;
  updatedAt: string;
}
