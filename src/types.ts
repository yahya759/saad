export type ProductCategory = 'مواد غذائية' | 'لحوم' | 'خضار وفواكه' | 'مواد تنظيف' | 'تشغيل وطاقة';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  quantity: number;
  unit: string;
  lowStockAlertLimit: number;
  kitchenId?: string;
}

export interface Kitchen {
  id: string;
  name: string;
  location: string;
  manager: string;
  employeeCount: number;
  dailyMealsGoal: number;
  currentMealsToday: number;
}

export type RequestStatus = 'قيد المراجعة' | 'مقبول' | 'مرفوض';

export interface MaterialRequest {
  id: string;
  kitchenId: string;
  kitchenName: string;
  items: {
    productId: string;
    name: string;
    quantity: number;
    unit: string;
  }[];
  status: RequestStatus;
  date: string;
}

export interface MealDistribution {
  id: string;
  kitchenId: string;
  kitchenName: string;
  mealsDistributed: number;
  targetArea: string;
  date: string;
  driverName: string;
}

export type EmployeeRole = 'مدير النظام' | 'مسؤول مخزن' | 'مسؤول تكية' | 'موظف توزيع' | 'سائق' | 'طباخ';

export interface EmployeeNote {
  id: string;
  text: string;
  date: string;
}

export interface Employee {
  id: string;
  name: string;
  role: EmployeeRole;
  phone: string;
  email: string;
  avatarSeed: string;
  notes?: EmployeeNote[];
}

export interface RolePermission {
  role: EmployeeRole;
  canManageStock: boolean;
  canManageKitchens: boolean;
  canApproveRequests: boolean;
  canRegisterDistribution: boolean;
  canManageUsers: boolean;
}

export interface InventoryLog {
  id: string;
  productId: string;
  productName: string;
  type: 'إضافة' | 'صرف' | 'تحويل';
  quantity: number;
  unit: string;
  destination?: string;
  date: string;
  user: string;
}

export interface SideExpense {
  id: string;
  amount: number;
  reason: string;
  date: string;
  category?: string;
}

export type InternalRequestType = 'طلب مستلزمات' | 'طلب صيانة' | 'طلب نقل' | 'طلب خدمة' | 'طلب إجازة' | 'أخرى';
export type InternalRequestPriority = 'عاجل' | 'عادي' | 'منخفض';
export type InternalRequestStatus = 'قيد المراجعة' | 'مقبول' | 'مرفوض';

export interface InternalRequest {
  id: string;
  requesterName: string;
  requesterDepartment: string;
  requestType: InternalRequestType;
  description: string;
  priority: InternalRequestPriority;
  status: InternalRequestStatus;
  rejectionReason?: string;
  createdAt: string;
}

