import { supabase } from './supabaseClient';
import { Product, Kitchen, MaterialRequest, SideExpense, Employee, InventoryLog } from '../types';

// ==================== PRODUCTS ====================
export const fetchProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
  if (error) { console.error('fetchProducts:', error); return []; }
  return data.map(d => ({
    id: d.id, name: d.name, category: d.category, quantity: d.quantity,
    unit: d.unit, lowStockAlertLimit: d.low_stock_alert_limit, kitchenId: d.kitchen_id ?? undefined,
  }));
};

export const insertProduct = async (p: Omit<Product, 'id'>): Promise<Product | null> => {
  const { data, error } = await supabase.from('products').insert({
    name: p.name, category: p.category, quantity: p.quantity,
    unit: p.unit, low_stock_alert_limit: p.lowStockAlertLimit, kitchen_id: p.kitchenId ?? null,
  }).select().single();
  if (error) { console.error('insertProduct:', error); return null; }
  return { id: data.id, name: data.name, category: data.category, quantity: data.quantity,
    unit: data.unit, lowStockAlertLimit: data.low_stock_alert_limit, kitchenId: data.kitchen_id ?? undefined };
};

export const updateProduct = async (p: Product): Promise<void> => {
  const { error } = await supabase.from('products').update({
    name: p.name, category: p.category, quantity: p.quantity,
    unit: p.unit, low_stock_alert_limit: p.lowStockAlertLimit, kitchen_id: p.kitchenId ?? null,
  }).eq('id', p.id);
  if (error) console.error('updateProduct:', error);
};

export const deleteProduct = async (id: string): Promise<boolean> => {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) {
    console.error('deleteProduct:', error);
    alert(`خطأ في حذف المنتج: ${error.message}`);
    return false;
  }
  return true;
};

// ==================== KITCHENS ====================
export const fetchKitchens = async (): Promise<Kitchen[]> => {
  const { data, error } = await supabase.from('kitchens').select('*').order('created_at', { ascending: false });
  if (error) { console.error('fetchKitchens:', error); return []; }
  return data.map(d => ({
    id: d.id, name: d.name, location: d.location, manager: d.manager,
    employeeCount: d.employee_count, dailyMealsGoal: d.daily_meals_goal, currentMealsToday: d.current_meals_today,
  }));
};

export const insertKitchen = async (k: Omit<Kitchen, 'id' | 'currentMealsToday'>): Promise<Kitchen | null> => {
  const { data, error } = await supabase.from('kitchens').insert({
    name: k.name, location: k.location, manager: k.manager,
    employee_count: k.employeeCount, daily_meals_goal: k.dailyMealsGoal, current_meals_today: 0,
  }).select().single();
  if (error) { console.error('insertKitchen:', error); return null; }
  return { id: data.id, name: data.name, location: data.location, manager: data.manager,
    employeeCount: data.employee_count, dailyMealsGoal: data.daily_meals_goal, currentMealsToday: data.current_meals_today };
};

export const updateKitchen = async (k: Kitchen): Promise<void> => {
  const { error } = await supabase.from('kitchens').update({
    name: k.name, location: k.location, manager: k.manager,
    employee_count: k.employeeCount, daily_meals_goal: k.dailyMealsGoal, current_meals_today: k.currentMealsToday,
  }).eq('id', k.id);
  if (error) console.error('updateKitchen:', error);
};

export const deleteKitchen = async (id: string): Promise<boolean> => {
  const { error } = await supabase.from('kitchens').delete().eq('id', id);
  if (error) {
    console.error('deleteKitchen:', error);
    alert(`خطأ في حذف التكية: ${error.message}`);
    return false;
  }
  return true;
};

// ==================== EMPLOYEES ====================
export const fetchEmployees = async (): Promise<Employee[]> => {
  const { data, error } = await supabase.from('employees').select('*, employee_notes(*)').order('created_at', { ascending: false });
  if (error) { console.error('fetchEmployees:', error); return []; }
  return data.map(d => ({
    id: d.id, name: d.name, role: d.role, phone: d.phone, email: d.email ?? undefined,
    avatarSeed: d.avatar_seed,
    notes: (d.employee_notes || []).map((n: any) => ({ id: n.id, text: n.text, date: n.date })),
  }));
};

export const insertEmployee = async (e: Omit<Employee, 'id'>): Promise<Employee | null> => {
  const { data, error } = await supabase.from('employees').insert({
    name: e.name, role: e.role, phone: e.phone, email: e.email ?? null, avatar_seed: e.avatarSeed,
  }).select().single();
  if (error) { console.error('insertEmployee:', error); return null; }
  return { id: data.id, name: data.name, role: data.role, phone: data.phone,
    email: data.email ?? undefined, avatarSeed: data.avatar_seed, notes: [] };
};

export const deleteEmployee = async (id: string): Promise<boolean> => {
  const { error } = await supabase.from('employees').delete().eq('id', id);
  if (error) {
    console.error('deleteEmployee:', error);
    alert(`خطأ في حذف الموظف: ${error.message}`);
    return false;
  }
  return true;
};

export const upsertEmployeeNote = async (employeeId: string, noteId: string, text: string, date: string): Promise<void> => {
  const { error } = await supabase.from('employee_notes').upsert({ id: noteId, employee_id: employeeId, text, date });
  if (error) console.error('upsertEmployeeNote:', error);
};

export const deleteEmployeeNote = async (noteId: string): Promise<void> => {
  const { error } = await supabase.from('employee_notes').delete().eq('id', noteId);
  if (error) console.error('deleteEmployeeNote:', error);
};

// ==================== MATERIAL REQUESTS ====================
export const fetchMaterialRequests = async (kitchens: Kitchen[]): Promise<MaterialRequest[]> => {
  const { data, error } = await supabase
    .from('material_requests')
    .select('*, material_request_items(*, products(name, unit))')
    .order('created_at', { ascending: false });
  if (error) { console.error('fetchMaterialRequests:', error); return []; }
  return data.map(d => {
    const kitchen = kitchens.find(k => k.id === d.kitchen_id);
    return {
      id: d.id,
      kitchenId: d.kitchen_id,
      kitchenName: kitchen?.name ?? 'تكية غير معروفة',
      status: d.status,
      date: d.date,
      items: (d.material_request_items || []).map((item: any) => ({
        productId: item.product_id,
        name: item.products?.name ?? '',
        quantity: item.quantity,
        unit: item.unit,
      })),
    };
  });
};

export const insertMaterialRequest = async (req: Omit<MaterialRequest, 'id' | 'status' | 'date'>): Promise<string | null> => {
  const date = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase.from('material_requests').insert({
    kitchen_id: req.kitchenId, status: 'قيد المراجعة', date,
  }).select().single();
  if (error) { console.error('insertMaterialRequest:', error); return null; }

  const itemsToInsert = req.items.map(item => ({
    request_id: data.id, product_id: item.productId, quantity: item.quantity, unit: item.unit,
  }));
  const { error: itemError } = await supabase.from('material_request_items').insert(itemsToInsert);
  if (itemError) console.error('insertMaterialRequestItems:', itemError);

  return data.id;
};

export const updateMaterialRequestStatus = async (id: string, status: string): Promise<void> => {
  const { error } = await supabase.from('material_requests').update({ status }).eq('id', id);
  if (error) console.error('updateMaterialRequestStatus:', error);
};

// ==================== INVENTORY LOGS ====================
export const fetchInventoryLogs = async (): Promise<InventoryLog[]> => {
  const { data, error } = await supabase.from('inventory_logs').select('*').order('created_at', { ascending: false });
  if (error) { console.error('fetchInventoryLogs:', error); return []; }
  return data.map(d => ({
    id: d.id, productId: d.product_id ?? '', productName: d.product_name,
    type: d.type, quantity: d.quantity, unit: d.unit,
    destination: d.destination ?? undefined, date: d.date, user: d.user_name,
  }));
};

export const insertInventoryLog = async (log: Omit<InventoryLog, 'id'>): Promise<void> => {
  const { error } = await supabase.from('inventory_logs').insert({
    product_id: log.productId || null, product_name: log.productName,
    type: log.type, quantity: log.quantity, unit: log.unit,
    destination: log.destination ?? null, date: log.date, user_name: log.user,
  });
  if (error) console.error('insertInventoryLog:', error);
};

// ==================== INTERNAL REQUESTS ====================
import { InternalRequest } from '../types';

export const fetchInternalRequests = async (): Promise<InternalRequest[]> => {
  const { data, error } = await supabase.from('internal_requests').select('*').order('created_at', { ascending: false });
  if (error) { console.error('fetchInternalRequests:', error); return []; }
  return data.map(d => ({
    id: d.id, requesterName: d.requester_name, requesterDepartment: d.requester_department,
    requestType: d.request_type, description: d.description, priority: d.priority,
    status: d.status, rejectionReason: d.rejection_reason ?? undefined, createdAt: d.created_at,
  }));
};

export const insertInternalRequest = async (r: Omit<InternalRequest, 'id' | 'status' | 'createdAt' | 'rejectionReason'>): Promise<InternalRequest | null> => {
  const { data, error } = await supabase.from('internal_requests').insert({
    requester_name: r.requesterName, requester_department: r.requesterDepartment,
    request_type: r.requestType, description: r.description, priority: r.priority,
    status: 'قيد المراجعة',
  }).select().single();
  if (error) { console.error('insertInternalRequest:', error); alert(`خطأ: ${error.message}`); return null; }
  return { id: data.id, requesterName: data.requester_name, requesterDepartment: data.requester_department,
    requestType: data.request_type, description: data.description, priority: data.priority,
    status: data.status, createdAt: data.created_at };
};

export const updateInternalRequestStatus = async (id: string, status: InternalRequest['status'], rejectionReason?: string): Promise<boolean> => {
  const { error } = await supabase.from('internal_requests').update({
    status, rejection_reason: rejectionReason ?? null,
  }).eq('id', id);
  if (error) { console.error('updateInternalRequestStatus:', error); alert(`خطأ: ${error.message}`); return false; }
  return true;
};

export const deleteInternalRequest = async (id: string): Promise<boolean> => {
  const { error } = await supabase.from('internal_requests').delete().eq('id', id);
  if (error) { console.error('deleteInternalRequest:', error); alert(`خطأ في الحذف: ${error.message}`); return false; }
  return true;
};
export const fetchSideExpenses = async (): Promise<SideExpense[]> => {
  const { data, error } = await supabase.from('side_expenses').select('*').order('created_at', { ascending: false });
  if (error) { console.error('fetchSideExpenses:', error); return []; }
  return data.map(d => ({
    id: d.id, amount: d.amount, reason: d.reason, category: d.category, date: d.date,
  }));
};

export const insertSideExpense = async (exp: Omit<SideExpense, 'id'>): Promise<SideExpense | null> => {
  const { data, error } = await supabase.from('side_expenses').insert({
    amount: exp.amount, reason: exp.reason, category: exp.category, date: exp.date,
  }).select().single();
  if (error) { console.error('insertSideExpense:', error); return null; }
  return { id: data.id, amount: data.amount, reason: data.reason, category: data.category, date: data.date };
};

export const deleteSideExpense = async (id: string): Promise<boolean> => {
  const { error } = await supabase.from('side_expenses').delete().eq('id', id);
  if (error) {
    console.error('deleteSideExpense:', error);
    alert(`خطأ في حذف المصروف: ${error.message}`);
    return false;
  }
  return true;
};
