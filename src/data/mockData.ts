import { Child, Parent, AttendanceRecord } from '../types';
import { format, subDays, addHours } from 'date-fns';

export const mockChildren: Child[] = [
  {
    id: '1',
    firstName: 'Emma',
    lastName: 'Smith',
    dateOfBirth: '2018-03-15',
    parentIds: ['1'],
    allergies: ['Peanuts'],
    emergencyContact: '+1-555-0101',
    photoUrl: 'https://images.pexels.com/photos/1236678/pexels-photo-1236678.jpeg?auto=compress&cs=tinysrgb&w=150'
  },
  {
    id: '2',
    firstName: 'Liam',
    lastName: 'Johnson',
    dateOfBirth: '2019-07-22',
    parentIds: ['2'],
    emergencyContact: '+1-555-0102',
    photoUrl: 'https://images.pexels.com/photos/1123972/pexels-photo-1123972.jpeg?auto=compress&cs=tinysrgb&w=150'
  },
  {
    id: '3',
    firstName: 'Olivia',
    lastName: 'Brown',
    dateOfBirth: '2017-11-08',
    parentIds: ['3'],
    medicalNotes: 'Asthma inhaler required',
    emergencyContact: '+1-555-0103',
    photoUrl: 'https://images.pexels.com/photos/1379636/pexels-photo-1379636.jpeg?auto=compress&cs=tinysrgb&w=150'
  },
  {
    id: '4',
    firstName: 'Noah',
    lastName: 'Davis',
    dateOfBirth: '2020-01-12',
    parentIds: ['4'],
    allergies: ['Dairy'],
    emergencyContact: '+1-555-0104',
    photoUrl: 'https://images.pexels.com/photos/1257110/pexels-photo-1257110.jpeg?auto=compress&cs=tinysrgb&w=150'
  },
  {
    id: '5',
    firstName: 'Sophia',
    lastName: 'Wilson',
    dateOfBirth: '2018-09-30',
    parentIds: ['5'],
    emergencyContact: '+1-555-0105',
    photoUrl: 'https://images.pexels.com/photos/1416736/pexels-photo-1416736.jpeg?auto=compress&cs=tinysrgb&w=150'
  }
];

export const mockParents: Parent[] = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@email.com',
    phone: '+1-555-0101',
    qrCode: 'QR_PARENT_001',
    childIds: ['1']
  },
  {
    id: '2',
    firstName: 'Lisa',
    lastName: 'Johnson',
    email: 'lisa.johnson@email.com',
    phone: '+1-555-0102',
    qrCode: 'QR_PARENT_002',
    childIds: ['2']
  },
  {
    id: '3',
    firstName: 'Michael',
    lastName: 'Brown',
    email: 'michael.brown@email.com',
    phone: '+1-555-0103',
    qrCode: 'QR_PARENT_003',
    childIds: ['3']
  },
  {
    id: '4',
    firstName: 'Jennifer',
    lastName: 'Davis',
    email: 'jennifer.davis@email.com',
    phone: '+1-555-0104',
    qrCode: 'QR_PARENT_004',
    childIds: ['4']
  },
  {
    id: '5',
    firstName: 'David',
    lastName: 'Wilson',
    email: 'david.wilson@email.com',
    phone: '+1-555-0105',
    qrCode: 'QR_PARENT_005',
    childIds: ['5']
  }
];

export const mockAttendanceRecords: AttendanceRecord[] = [
  {
    id: '1',
    childId: '1',
    parentId: '1',
    checkInTime: addHours(new Date(), -2),
    checkInStaffId: '1',
    date: format(new Date(), 'yyyy-MM-dd'),
    notes: 'Happy and energetic today'
  },
  {
    id: '2',
    childId: '2',
    parentId: '2',
    checkInTime: addHours(new Date(), -1.5),
    checkOutTime: addHours(new Date(), -0.5),
    checkInStaffId: '2',
    checkOutStaffId: '1',
    date: format(new Date(), 'yyyy-MM-dd')
  },
  {
    id: '3',
    childId: '3',
    parentId: '3',
    checkInTime: addHours(new Date(), -3),
    checkInStaffId: '1',
    date: format(new Date(), 'yyyy-MM-dd')
  },
  {
    id: '4',
    childId: '4',
    parentId: '4',
    checkInTime: subDays(new Date(), 1),
    checkOutTime: subDays(addHours(new Date(), 2), 1),
    checkInStaffId: '2',
    checkOutStaffId: '2',
    date: format(subDays(new Date(), 1), 'yyyy-MM-dd')
  }
];