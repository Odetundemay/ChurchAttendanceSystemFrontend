export interface Child {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  parentIds: string[];
  allergies?: string;
  emergencyContact?: string;
  medicalNotes?: string;
  photoUrl: string;
}

export interface Parent {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  qrCode: string;
  childIds: string[];
}

export interface AttendanceRecord {
  id: string;
  childId: string;
  parentId: string;
  checkInTime: string;
  checkOutTime?: string;
  checkInStaffId: string;
  checkOutStaffId?: string;
  notes?: string;
  date: string;
}

export interface Staff {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive: boolean;
}

export interface AttendanceStats {
  totalCheckedIn: number;
  totalChildren: number;
  avgAttendance: number;
  weeklyGrowth: number;
}