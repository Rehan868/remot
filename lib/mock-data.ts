// Mock data store for the entire application
// This replaces all Supabase database connections

// Types
export type User = {
  id: string
  name: string
  email: string
  role: string
  avatar_url?: string
  created_at?: string
  updated_at?: string
  last_active?: string
  user_type?: string
}

export type Room = {
  id: string
  number: string
  name?: string
  property: string
  property_id: string
  type: string
  capacity: number
  rate: number
  status: "available" | "occupied" | "maintenance" | "cleaning"
  description?: string
  amenities?: string[]
  owner?: string
  images?: string[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export type Booking = {
  id: string
  guest_name: string
  guest_email: string
  guest_phone?: string
  room_id: string
  room_number: string
  property: string
  check_in: string
  check_out: string
  status: "confirmed" | "checked-in" | "checked-out" | "cancelled" | "pending"
  total_amount: number
  amount_paid?: number
  payment_status: "paid" | "pending" | "partial" | "refunded"
  special_requests?: string
  created_at: string
  updated_at: string
  adults: number
  children: number
  booking_number?: string
}

export type Owner = {
  id: string
  name: string
  email: string
  phone?: string
  avatar?: string
  properties: number
  revenue: number
  occupancy: number
  joinedDate: string
  paymentDetails?: {
    bank: string
    accountNumber: string
  }
}

export type Property = {
  id: string
  name: string
  address: string
  city: string
  state: string
  country: string
  rooms: number
  owner_id?: string
}

export type Expense = {
  id: string
  description: string
  amount: number
  date: string
  category: string
  property: string
  vendor?: string
  payment_method?: string
  notes?: string
  created_at?: string
  updated_at?: string
}

export type CleaningStatus = "Clean" | "Dirty" | "In Progress"

export type RoomCleaning = {
  id: string
  roomNumber: string
  property: string
  status: CleaningStatus
  lastCleaned?: string
  nextCheckIn?: string
}

export type Role = {
  id: string
  name: string
  description: string
  permissions: string[]
  created_at: string
  updated_at: string
}

export type AuditLog = {
  id: string
  user: string
  action: string
  resource: string
  resource_id: string
  details: string
  timestamp: string
  ip_address: string
  type: string
}

export type DashboardStats = {
  availableRooms: number
  totalRooms: number
  todayCheckIns: number
  todayCheckOuts: number
  occupancyRate: number
  weeklyOccupancyTrend: string
  revenueToday: number
  revenueTrend: string
  pendingPayments: number
  pendingPaymentsAmount: number
}

// Update the users array in the mock-data.ts file

// Mock Users
export const users = [
  {
    id: "user-1",
    name: "John Admin",
    email: "admin@example.com",
    role: "Administrator",
    avatar_url: "/avatars/01.png",
    created_at: "2023-01-15T08:30:00Z",
    updated_at: "2023-06-20T14:45:00Z",
    last_active: "2023-07-01T09:15:00Z",
  },
  {
    id: "user-2",
    name: "Sarah Manager",
    email: "staff@example.com",
    role: "Manager",
    created_at: "2023-02-10T10:15:00Z",
    updated_at: "2023-06-18T11:30:00Z",
    last_active: "2023-06-30T16:45:00Z",
  },
  {
    id: "user-3",
    name: "Mike Desk",
    email: "desk@example.com",
    role: "Front Desk",
    created_at: "2023-03-05T09:45:00Z",
    updated_at: "2023-06-15T13:20:00Z",
    last_active: "2023-06-29T14:30:00Z",
  },
  {
    id: "user-4",
    name: "Lisa Cleaning",
    email: "cleaning@example.com",
    role: "Cleaning Staff",
    created_at: "2023-03-20T11:30:00Z",
    updated_at: "2023-06-10T10:15:00Z",
    last_active: "2023-06-28T08:45:00Z",
  },
  {
    id: "user-5",
    name: "James Wilson",
    email: "owner@example.com",
    role: "Owner",
    avatar_url: "/avatars/03.png",
    created_at: "2023-01-20T10:00:00Z",
    updated_at: "2023-06-25T11:30:00Z",
    last_active: "2023-07-02T14:15:00Z",
  },
]

// Mock Properties
export const properties: Property[] = [
  {
    id: "prop-1",
    name: "Marina Tower",
    address: "123 Marina Blvd",
    city: "San Francisco",
    state: "CA",
    country: "USA",
    rooms: 24,
    owner_id: "owner-1",
  },
  {
    id: "prop-2",
    name: "Downtown Heights",
    address: "456 Main St",
    city: "New York",
    state: "NY",
    country: "USA",
    rooms: 18,
    owner_id: "owner-2",
  },
]

// Mock Rooms
export const rooms: Room[] = [
  {
    id: "room-1",
    number: "101",
    name: "Ocean View Suite",
    property: "Marina Tower",
    property_id: "prop-1",
    type: "Suite",
    capacity: 4,
    rate: 299,
    status: "available",
    description: "Luxurious suite with ocean views",
    amenities: ["King Bed", "Balcony", "Mini Bar", "Free WiFi"],
    owner: "owner-1",
    images: ["/luxurious-city-suite.png"],
    is_active: true,
    created_at: "2023-01-10T08:00:00Z",
    updated_at: "2023-06-15T14:30:00Z",
  },
  {
    id: "room-2",
    number: "102",
    name: "City View Room",
    property: "Marina Tower",
    property_id: "prop-1",
    type: "Standard",
    capacity: 2,
    rate: 199,
    status: "occupied",
    description: "Comfortable room with city views",
    amenities: ["Queen Bed", "Work Desk", "Free WiFi"],
    owner: "owner-1",
    images: ["/comfortable-hotel-stay.png"],
    is_active: true,
    created_at: "2023-01-10T08:15:00Z",
    updated_at: "2023-06-16T10:45:00Z",
  },
  {
    id: "room-3",
    number: "201",
    name: "Executive Suite",
    property: "Downtown Heights",
    property_id: "prop-2",
    type: "Executive",
    capacity: 3,
    rate: 349,
    status: "available",
    description: "Spacious executive suite with premium amenities",
    amenities: ["King Bed", "Jacuzzi", "Mini Bar", "Free WiFi", "Room Service"],
    owner: "owner-2",
    images: ["/modern-corporate-office.png"],
    is_active: true,
    created_at: "2023-01-12T09:30:00Z",
    updated_at: "2023-06-17T11:20:00Z",
  },
  {
    id: "room-4",
    number: "202",
    name: "Family Room",
    property: "Downtown Heights",
    property_id: "prop-2",
    type: "Family",
    capacity: 6,
    rate: 399,
    status: "maintenance",
    description: "Spacious room perfect for families",
    amenities: ["2 Queen Beds", "Sofa Bed", "Kitchenette", "Free WiFi"],
    owner: "owner-2",
    images: ["/cozy-hotel-corner.png"],
    is_active: true,
    created_at: "2023-01-12T09:45:00Z",
    updated_at: "2023-06-18T15:10:00Z",
  },
]

// Mock Bookings
export const bookings: Booking[] = [
  {
    id: "booking-1",
    guest_name: "Alice Johnson",
    guest_email: "alice@example.com",
    guest_phone: "+1 555-123-4567",
    room_id: "room-1",
    room_number: "101",
    property: "Marina Tower",
    check_in: "2023-07-10T15:00:00Z",
    check_out: "2023-07-15T11:00:00Z",
    status: "confirmed",
    total_amount: 1495,
    amount_paid: 1495,
    payment_status: "paid",
    special_requests: "High floor if possible",
    created_at: "2023-06-20T14:30:00Z",
    updated_at: "2023-06-20T14:30:00Z",
    adults: 2,
    children: 0,
    booking_number: "BK-10001",
  },
  {
    id: "booking-2",
    guest_name: "Bob Smith",
    guest_email: "bob@example.com",
    guest_phone: "+1 555-987-6543",
    room_id: "room-2",
    room_number: "102",
    property: "Marina Tower",
    check_in: "2023-07-05T15:00:00Z",
    check_out: "2023-07-08T11:00:00Z",
    status: "checked-in",
    total_amount: 597,
    amount_paid: 300,
    payment_status: "partial",
    created_at: "2023-06-15T10:45:00Z",
    updated_at: "2023-07-05T15:30:00Z",
    adults: 1,
    children: 0,
    booking_number: "BK-10002",
  },
  {
    id: "booking-3",
    guest_name: "Charlie Davis",
    guest_email: "charlie@example.com",
    guest_phone: "+1 555-456-7890",
    room_id: "room-3",
    room_number: "201",
    property: "Downtown Heights",
    check_in: "2023-07-15T15:00:00Z",
    check_out: "2023-07-20T11:00:00Z",
    status: "pending",
    total_amount: 1745,
    amount_paid: 0,
    payment_status: "pending",
    special_requests: "Extra pillows and quiet room",
    created_at: "2023-06-25T09:15:00Z",
    updated_at: "2023-06-25T09:15:00Z",
    adults: 2,
    children: 1,
    booking_number: "BK-10003",
  },
  {
    id: "booking-4",
    guest_name: "Diana Evans",
    guest_email: "diana@example.com",
    guest_phone: "+1 555-789-0123",
    room_id: "room-4",
    room_number: "202",
    property: "Downtown Heights",
    check_in: "2023-07-08T15:00:00Z",
    check_out: "2023-07-12T11:00:00Z",
    status: "cancelled",
    total_amount: 1596,
    amount_paid: 1596,
    payment_status: "refunded",
    created_at: "2023-06-10T16:20:00Z",
    updated_at: "2023-06-18T11:45:00Z",
    adults: 2,
    children: 2,
    booking_number: "BK-10004",
  },
]

// Mock Owners
export const owners: Owner[] = [
  {
    id: "owner-1",
    name: "James Wilson",
    email: "james@example.com",
    phone: "+1 555-111-2222",
    avatar: "/avatars/01.png",
    properties: 12,
    revenue: 45000,
    occupancy: 78,
    joinedDate: "2022-03-15",
    paymentDetails: {
      bank: "Chase Bank",
      accountNumber: "XXXX-XXXX-1234",
    },
  },
  {
    id: "owner-2",
    name: "Emily Brown",
    email: "emily@example.com",
    phone: "+1 555-333-4444",
    properties: 8,
    revenue: 32000,
    occupancy: 65,
    joinedDate: "2022-05-20",
    paymentDetails: {
      bank: "Bank of America",
      accountNumber: "XXXX-XXXX-5678",
    },
  },
  {
    id: "owner-3",
    name: "Michael Garcia",
    email: "michael@example.com",
    phone: "+1 555-555-6666",
    properties: 5,
    revenue: 18000,
    occupancy: 82,
    joinedDate: "2022-08-10",
    paymentDetails: {
      bank: "Wells Fargo",
      accountNumber: "XXXX-XXXX-9012",
    },
  },
]

// Mock Expenses
export const expenses: Expense[] = [
  {
    id: "expense-1",
    description: "Plumbing Repairs",
    amount: 450,
    date: "2023-06-15",
    category: "Maintenance",
    property: "Marina Tower",
    vendor: "City Plumbers Inc.",
    payment_method: "Credit Card",
    notes: "Emergency repair for room 101",
    created_at: "2023-06-15T14:30:00Z",
    updated_at: "2023-06-15T14:30:00Z",
  },
  {
    id: "expense-2",
    description: "Electricity Bill - June",
    amount: 1250,
    date: "2023-06-30",
    category: "Utilities",
    property: "Marina Tower",
    payment_method: "Auto-Payment",
    created_at: "2023-06-30T09:15:00Z",
    updated_at: "2023-06-30T09:15:00Z",
  },
  {
    id: "expense-3",
    description: "Cleaning Supplies",
    amount: 320,
    date: "2023-06-20",
    category: "Supplies",
    property: "Downtown Heights",
    vendor: "CleanPro Supplies",
    payment_method: "Credit Card",
    created_at: "2023-06-20T11:45:00Z",
    updated_at: "2023-06-20T11:45:00Z",
  },
  {
    id: "expense-4",
    description: "Staff Salaries - June",
    amount: 8500,
    date: "2023-06-30",
    category: "Personnel",
    property: "All Properties",
    payment_method: "Bank Transfer",
    notes: "Monthly salaries for all staff",
    created_at: "2023-06-30T15:00:00Z",
    updated_at: "2023-06-30T15:00:00Z",
  },
]

// Mock Room Cleaning Status
export const roomCleaningStatus: RoomCleaning[] = [
  {
    id: "cleaning-1",
    roomNumber: "101",
    property: "Marina Tower",
    status: "Clean",
    lastCleaned: "2023-07-01T10:30:00Z",
    nextCheckIn: "2023-07-10T15:00:00Z",
  },
  {
    id: "cleaning-2",
    roomNumber: "102",
    property: "Marina Tower",
    status: "Dirty",
    lastCleaned: "2023-07-05T11:15:00Z",
    nextCheckIn: "2023-07-08T15:00:00Z",
  },
  {
    id: "cleaning-3",
    roomNumber: "201",
    property: "Downtown Heights",
    status: "Clean",
    lastCleaned: "2023-07-02T09:45:00Z",
    nextCheckIn: "2023-07-15T15:00:00Z",
  },
  {
    id: "cleaning-4",
    roomNumber: "202",
    property: "Downtown Heights",
    status: "In Progress",
    lastCleaned: "2023-06-30T14:20:00Z",
  },
]

// Mock Roles
export const roles: Role[] = [
  {
    id: "role-1",
    name: "Administrator",
    description: "Full access to all system features",
    permissions: ["all"],
    created_at: "2022-12-01T08:00:00Z",
    updated_at: "2022-12-01T08:00:00Z",
  },
  {
    id: "role-2",
    name: "Manager",
    description: "Can manage properties, bookings, and view reports",
    permissions: ["manage_bookings", "manage_rooms", "view_reports", "manage_staff"],
    created_at: "2022-12-01T08:15:00Z",
    updated_at: "2022-12-01T08:15:00Z",
  },
  {
    id: "role-3",
    name: "Front Desk",
    description: "Can manage bookings and check-ins/outs",
    permissions: ["manage_bookings", "view_rooms"],
    created_at: "2022-12-01T08:30:00Z",
    updated_at: "2022-12-01T08:30:00Z",
  },
  {
    id: "role-4",
    name: "Cleaning Staff",
    description: "Can update room cleaning status",
    permissions: ["update_cleaning_status", "view_rooms"],
    created_at: "2022-12-01T08:45:00Z",
    updated_at: "2022-12-01T08:45:00Z",
  },
]

// Mock Audit Logs
export const auditLogs: AuditLog[] = [
  {
    id: "log-1",
    user: "John Admin",
    action: "CREATE",
    resource: "booking",
    resource_id: "booking-1",
    details: "Created new booking for Alice Johnson",
    timestamp: "2023-06-20T14:30:00Z",
    ip_address: "192.168.1.1",
    type: "booking",
  },
  {
    id: "log-2",
    user: "Sarah Manager",
    action: "UPDATE",
    resource: "room",
    resource_id: "room-2",
    details: "Updated room status to occupied",
    timestamp: "2023-07-05T15:30:00Z",
    ip_address: "192.168.1.2",
    type: "system",
  },
  {
    id: "log-3",
    user: "John Admin",
    action: "DELETE",
    resource: "expense",
    resource_id: "expense-old-1",
    details: "Deleted duplicate expense record",
    timestamp: "2023-06-25T11:45:00Z",
    ip_address: "192.168.1.1",
    type: "system",
  },
  {
    id: "log-4",
    user: "Mike Desk",
    action: "UPDATE",
    resource: "booking",
    resource_id: "booking-2",
    details: "Updated booking status to checked-in",
    timestamp: "2023-07-05T15:30:00Z",
    ip_address: "192.168.1.3",
    type: "booking",
  },
  {
    id: "log-5",
    user: "John Admin",
    action: "LOGIN",
    resource: "user",
    resource_id: "user-1",
    details: "User logged in successfully",
    timestamp: "2023-07-06T08:15:00Z",
    ip_address: "192.168.1.1",
    type: "authentication",
  },
  {
    id: "log-6",
    user: "Sarah Manager",
    action: "CREATE",
    resource: "user",
    resource_id: "user-6",
    details: "Created new user account",
    timestamp: "2023-07-04T10:30:00Z",
    ip_address: "192.168.1.2",
    type: "user",
  },
  {
    id: "log-7",
    user: "System",
    action: "UPDATE",
    resource: "settings",
    resource_id: "settings-1",
    details: "Updated system settings",
    timestamp: "2023-07-03T14:45:00Z",
    ip_address: "192.168.1.10",
    type: "settings",
  },
]

// Mock Dashboard Stats
export const dashboardStats: DashboardStats = {
  availableRooms: 15,
  totalRooms: 42,
  todayCheckIns: 8,
  todayCheckOuts: 6,
  occupancyRate: 72,
  weeklyOccupancyTrend: "+5%",
  revenueToday: 2450,
  revenueTrend: "+12%",
  pendingPayments: 4,
  pendingPaymentsAmount: 3750,
}

// Helper function to simulate async API calls
export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
