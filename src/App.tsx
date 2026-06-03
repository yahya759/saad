import React, { useState, useEffect, useCallback } from 'react';
import {
  fetchProducts, insertProduct, updateProduct,
  fetchKitchens, insertKitchen, updateKitchen, deleteKitchen,
  fetchEmployees, insertEmployee, deleteEmployee, upsertEmployeeNote, deleteEmployeeNote,
  fetchMaterialRequests, insertMaterialRequest, updateMaterialRequestStatus,
  fetchInventoryLogs, insertInventoryLog,
  fetchSideExpenses, insertSideExpense, deleteSideExpense,
} from './lib/supabaseService';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { MetricCards } from './components/MetricCards';
import { ChartsAndReminders } from './components/ChartsAndReminders';
import { BottomGrid } from './components/BottomGrid';
import { RightPanel } from './components/RightPanel';
import { 
  AddProductModal, 
  EditProductModal,
  AddKitchenModal, 
  EditKitchenModal,
  AddEmployeeModal, 
  CreateRequestModal,
  EmployeeDetailsNoteModal
} from './components/Modals';
import { 
  Product, 
  Kitchen, 
  MaterialRequest, 
  SideExpense, 
  Employee, 
  EmployeeRole, 
  InventoryLog 
} from './types';
import { 
  Package, 
  CookingPot, 
  ClipboardList, 
  UserSquare, 
  MapPin, 
  Plus, 
  Trash2, 
  Check, 
  X as XIcon, 
  TrendingUp, 
  ShieldAlert, 
  Download, 
  RefreshCw,
  Info,
  Beef,
  Flame,
  ShoppingBag,
  Boxes,
  PenLine,
  Search,
  Share2,
  Minus,
  Coins,
  Link
} from 'lucide-react';

const INITIAL_PRODUCTS: Product[] = [
  { id: 'p1', name: 'أرز بسمتي ذهبي كلاسيك', category: 'مواد غذائية', quantity: 12500, unit: 'كغ', lowStockAlertLimit: 1500 },
  { id: 'p2', name: 'لحم ضأن طازج', category: 'لحوم', quantity: 380, unit: 'كغ', lowStockAlertLimit: 200 },
  { id: 'p3', name: 'دجاج مبرد صحي', category: 'لحوم', quantity: 4500, unit: 'كغ', lowStockAlertLimit: 800 },
  { id: 'p4', name: 'زيت طهي ممتاز', category: 'مواد غذائية', quantity: 2400, unit: 'لتر', lowStockAlertLimit: 400 },
  { id: 'p5', name: 'غاز طهي صناعي مسال', category: 'تشغيل وطاقة', quantity: 85, unit: 'إسـطوانة', lowStockAlertLimit: 15 },
  { id: 'p6', name: 'صلصة طماطم معبأة', category: 'مواد غذائية', quantity: 1800, unit: 'كرتونة', lowStockAlertLimit: 250 },
  { id: 'p7', name: 'دقيق قمح أبيض فاخر', category: 'مواد غذائية', quantity: 18500, unit: 'كغ', lowStockAlertLimit: 3000 },
];

const INITIAL_KITCHENS: Kitchen[] = [
  { id: 'k1', name: 'تكية غزة البلد المركزية', location: 'حي الشجاعية، غزة', manager: 'الشيخ أبو أحمد', employeeCount: 8, dailyMealsGoal: 4000, currentMealsToday: 1850 },
  { id: 'k2', name: 'تكية جباليا الشعبية النموذجية', location: 'وسط المخيم، جباليا', manager: 'المعلم مصطفى الأحد', employeeCount: 5, dailyMealsGoal: 2000, currentMealsToday: 950 },
  { id: 'k3', name: 'تكية رفح الكبرى للإغاثة', location: 'حي السلطان، رفح', manager: 'أم محمد رئيساً', employeeCount: 9, dailyMealsGoal: 3500, currentMealsToday: 1300 },
];

const INITIAL_REQUESTS: MaterialRequest[] = [
  {
    id: 'req1',
    kitchenId: 'k1',
    kitchenName: 'تكية غزة البلد المركزية',
    items: [{ productId: 'p1', name: 'أرز بسمتي ذهبي كلاسيك', quantity: 800, unit: 'كغ' }],
    status: 'قيد المراجعة',
    date: '2026-06-03'
  },
  {
    id: 'req2',
    kitchenId: 'k3',
    kitchenName: 'تكية رفح الكبرى للإغاثة',
    items: [{ productId: 'p3', name: 'دجاج مبرد صحي', quantity: 350, unit: 'كغ' }],
    status: 'قيد المراجعة',
    date: '2026-06-03'
  },
];

const INITIAL_MEMBERS: Employee[] = [
  { id: 'e1', name: 'الشيخ أبو أحمد', role: 'مسؤول تكية', phone: '٠٥٩-٩٢٤-٨٧٦٥', email: 'abuahmad@donezocharity.org', avatarSeed: 'abu-ahmad' },
  { id: 'e2', name: 'خالد عبد الرحمن', role: 'مسؤول مخزن', phone: '٠٥٩-٩١١-٩٠٢١', email: 'khaled@donezocharity.org', avatarSeed: 'khaled' },
  { id: 'e3', name: 'أم محمد الغزاوية', role: 'طباخ', phone: '٠٥٩-٩٣٣-٨٩١٠', email: 'ommohammad@donezocharity.org', avatarSeed: 'om-mohammad' },
  { id: 'e4', name: 'يوسف العتيبي الميداني', role: 'موظف توزيع', phone: '٠٥٩-٨٨٨-٣٢٢١', email: 'yousef@donezocharity.org', avatarSeed: 'yousef' },
];

const INITIAL_LOGS: InventoryLog[] = [
  { id: 'l1', productId: 'p1', productName: 'أرز بسمتي ذهبي كلاسيك', type: 'إضافة', quantity: 5000, unit: 'كغ', date: '2026-06-02', user: 'خالد عبد الرحمن' },
  { id: 'l2', productId: 'p4', productName: 'زيت طهي ممتاز', type: 'صرف', quantity: 180, unit: 'لتر', destination: 'تكية جباليا الشعبية النموذجية', date: '2026-06-03', user: 'خالد عبد الرحمن' },
  { id: 'l3', productId: 'p5', productName: 'غاز طهي صناعي مسال', type: 'صرف', quantity: 8, unit: 'إسـطوانة', destination: 'تكية رفح الكبرى للإغاثة', date: '2026-06-03', user: 'ياسمين الحربي' },
];

const getArabicMonthYear = (dateStr: string) => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length < 2) return dateStr;
  const year = parts[0];
  const monthNum = parseInt(parts[1], 10);
  
  const arabicMonths = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];
  const monthName = arabicMonths[monthNum - 1] || '';
  return `${monthName} ${year}`;
};

const INITIAL_EXPENSES: SideExpense[] = [
  { id: 'exp-1', amount: 150, reason: 'شراء شوادر نايلون لتغطية خيام النازحين في ساحة التكية', date: '2026-06-02', category: 'تشغيل وتشييد' },
  { id: 'exp-2', amount: 45, reason: 'صيانة وتصليح صنبور المياه الرئيسي لخط غسيل الخضروات الكبيرة', date: '2026-06-03', category: 'صيانة وإصلاح' },
  { id: 'exp-3', amount: 80, reason: 'أجرة نقل عاجل لشحنة حطب التدفئة والطهي للتكية كبديل للغاز', date: '2026-06-03', category: 'أجور ونقل' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Primary Role Simulator key
  const [currentRole, setCurrentRole] = useState<EmployeeRole>('مدير النظام');

  // Database state - loaded from Supabase
  const [products, setProducts] = useState<Product[]>([]);
  const [kitchens, setKitchens] = useState<Kitchen[]>([]);
  const [requests, setRequests] = useState<MaterialRequest[]>([]);
  const [members, setMembers] = useState<Employee[]>([]);
  const [logs, setLogs] = useState<InventoryLog[]>([]);
  const [expenses, setExpenses] = useState<SideExpense[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load all data from Supabase on mount
  const loadAllData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [prods, kits, emps, invLogs, exps] = await Promise.all([
        fetchProducts(),
        fetchKitchens(),
        fetchEmployees(),
        fetchInventoryLogs(),
        fetchSideExpenses(),
      ]);
      setProducts(prods);
      setKitchens(kits);
      setMembers(emps);
      setLogs(invLogs);
      setExpenses(exps);
      // Load requests after kitchens are ready
      const reqs = await fetchMaterialRequests(kits);
      setRequests(reqs);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Modal open/close hooks
  const [isStandaloneShare, setIsStandaloneShare] = useState<boolean>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('view') === 'shared-inventory';
  });
  const [isKitchenStandaloneShare, setIsKitchenStandaloneShare] = useState<boolean>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('view') === 'shared-kitchen';
  });
  const [sharedKitchenId, setSharedKitchenId] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('kitchenId');
  });
  const [isOwnerMode, setIsOwnerMode] = useState<boolean>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('role') === 'owner' || params.get('view') === 'shared-inventory' || localStorage.getItem('isOwnerMode') === 'true';
  });
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isEditProductModalOpen, setIsEditProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isKitchenModalOpen, setIsKitchenModalOpen] = useState(false);
  const [isEditKitchenModalOpen, setIsEditKitchenModalOpen] = useState(false);
  const [editingKitchen, setEditingKitchen] = useState<Kitchen | null>(null);
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

  // States for employee details, notes modal and search
  const [employeeSearchQuery, setEmployeeSearchQuery] = useState<string>('');
  const [selectedEmployeeForNotes, setSelectedEmployeeForNotes] = useState<Employee | null>(null);
  const [isEmployeeNotesModalOpen, setIsEmployeeNotesModalOpen] = useState(false);

  const handleUpdateEmployee = async (updatedEmployee: Employee) => {
    // Sync notes to Supabase
    if (updatedEmployee.notes) {
      for (const note of updatedEmployee.notes) {
        await upsertEmployeeNote(updatedEmployee.id, note.id, note.text, note.date);
      }
    }
    const updatedMembers = members.map(m => m.id === updatedEmployee.id ? updatedEmployee : m);
    setMembers(updatedMembers);
    setSelectedEmployeeForNotes(updatedEmployee);
  };

  // States for Side Expenses input form
  const [newExpenseAmount, setNewExpenseAmount] = useState<string>('');
  const [newExpenseReason, setNewExpenseReason] = useState<string>('');
  const [newExpenseCategory, setNewExpenseCategory] = useState<string>('صيانة وإصلاح');
  const [selectedExpenseMonth, setSelectedExpenseMonth] = useState<string>('all');
  const [selectedExpenseCategory, setSelectedExpenseCategory] = useState<string>('all');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  // Sync back database state changes to secure client local limits
  useEffect(() => {
    localStorage.setItem('isOwnerMode', isOwnerMode ? 'true' : 'false');
  }, [isOwnerMode]);

  useEffect(() => {
    if (isKitchenStandaloneShare && sharedKitchenId) {
      const hasKitchenProducts = products.some(p => p.kitchenId === sharedKitchenId);
      if (!hasKitchenProducts) {
        const defaultSeeds: Product[] = [
          { id: `pk-${sharedKitchenId}-1`, name: 'خلطة بهارات وتوابل التكية الميدانية', category: 'مواد غذائية', quantity: 85, unit: 'كغ', lowStockAlertLimit: 15, kitchenId: sharedKitchenId },
          { id: `pk-${sharedKitchenId}-2`, name: 'عدس مجروش أحمر للتسوية الكثيفة', category: 'مواد غذائية', quantity: 950, unit: 'كغ', lowStockAlertLimit: 120, kitchenId: sharedKitchenId },
          { id: `pk-${sharedKitchenId}-3`, name: 'زيت زيتون بكر مضغوط', category: 'مواد غذائية', quantity: 180, unit: 'لتر', lowStockAlertLimit: 40, kitchenId: sharedKitchenId },
          { id: `pk-${sharedKitchenId}-4`, name: 'غاز طهي لزوم قدور الطبخ', category: 'تشغيل وطاقة', quantity: 12, unit: 'إسـطوانة', lowStockAlertLimit: 3, kitchenId: sharedKitchenId },
        ];
        setProducts(prev => {
          if (prev.some(p => p.kitchenId === sharedKitchenId)) {
            return prev;
          }
          const next = [...prev, ...defaultSeeds];
          localStorage.setItem('erp_charity_products', JSON.stringify(next));
          return next;
        });
      }
    }
  }, [isKitchenStandaloneShare, sharedKitchenId]);


  // Helper definitions for role permissions validation
  const getPermission = (role: EmployeeRole) => {
    return {
      canManageStock: role === 'مدير النظام' || role === 'مسؤول مخزن',
      canManageKitchens: role === 'مدير النظام',
      canApproveRequests: role === 'مدير النظام' || role === 'مسؤول مخزن',
      canRegisterDistribution: role === 'مدير النظام' || role === 'موظف توزيع' || role === 'مسؤول تكية',
      canManageUsers: role === 'مدير النظام',
    };
  };

  const perms = getPermission(currentRole);

  // Core functions to interact with Supabase database
  const handleAddProduct = async (newProd: Omit<Product, 'id'>) => {
    if (!perms.canManageStock && !isOwnerMode && !isKitchenStandaloneShare) {
      alert("عذراً، لا تمتلك الصلاحية الكافية لإضافة منتجات.");
      return;
    }
    const prodToInsert = {
      ...newProd,
      ...(isKitchenStandaloneShare && sharedKitchenId ? { kitchenId: sharedKitchenId } : {})
    };
    const fullProd = await insertProduct(prodToInsert);
    if (!fullProd) return;
    setProducts(prev => [fullProd, ...prev]);

    const userName = currentRole === 'مدير النظام' ? 'ياسمين الحربي' : 'خالد عبد الرحمن';
    await insertInventoryLog({
      productId: fullProd.id, productName: fullProd.name, type: 'إضافة',
      quantity: fullProd.quantity, unit: fullProd.unit,
      date: new Date().toISOString().split('T')[0], user: userName
    });
    const newLogs = await fetchInventoryLogs();
    setLogs(newLogs);
  };

  const handleAddKitchen = async (newKit: Omit<Kitchen, 'id' | 'currentMealsToday'>) => {
    if (!perms.canManageKitchens) {
      alert("عذراً، تسجيل تكية طعام جديدة يتطلب صلاحية 'مدير النظام'.");
      return;
    }
    const fullKit = await insertKitchen(newKit);
    if (!fullKit) return;
    setKitchens(prev => [fullKit, ...prev]);
  };

  const handleRemoveKitchen = async (id: string) => {
    if (!perms.canManageKitchens) {
      alert("صلاحيات دورك الحالي تمنع حذف التكيات.");
      return;
    }
    await deleteKitchen(id);
    setKitchens(prev => prev.filter(k => k.id !== id));
  };

  const handleUpdateKitchen = async (updatedKit: Kitchen) => {
    await updateKitchen(updatedKit);
    setKitchens(prev => prev.map(k => k.id === updatedKit.id ? updatedKit : k));
  };

  const handleUpdateProduct = async (updatedProd: Product) => {
    await updateProduct(updatedProd);
    setProducts(prev => prev.map(p => p.id === updatedProd.id ? updatedProd : p));
  };

  const handleAddEmployee = async (newEmp: Omit<Employee, 'id'>) => {
    if (!perms.canManageUsers) {
      alert("صلاحيات 'مدير النظام' مطلوبة لتسجيل كادر موظفين.");
      return;
    }
    const fullEmp = await insertEmployee(newEmp);
    if (!fullEmp) return;
    setMembers(prev => [fullEmp, ...prev]);
  };

  const handleRemoveEmployee = async (id: string) => {
    if (!perms.canManageUsers) {
      alert("فقط 'مدير النظام' بإمكانه سحب ترخيص كادر.");
      return;
    }
    await deleteEmployee(id);
    setMembers(prev => prev.filter(e => e.id !== id));
  };

  // Auto deductive material request system
  const handleAcceptRequest = async (reqId: string) => {
    if (!perms.canApproveRequests) {
      alert("لا تملك الصلاحية للموافقة على طلبات تموين المواد.");
      return;
    }

    const request = requests.find(r => r.id === reqId);
    if (!request) return;
    if (request.status !== 'قيد المراجعة') { alert("هذا الطلب معالَج مسبقاً."); return; }

    // Verify stock availability
    let inventoryUnavailable = false;
    const nextProducts = products.map(p => {
      const matchItem = request.items.find(item => item.productId === p.id);
      if (matchItem) {
        if (p.quantity < matchItem.quantity) { inventoryUnavailable = true; return p; }
        return { ...p, quantity: p.quantity - matchItem.quantity };
      }
      return p;
    });

    if (inventoryUnavailable) {
      alert("تحذير تمويني: رصيد المادة في المخزن المركزي غير كافٍ للموافقة!");
      return;
    }

    // Update Supabase - the DB trigger handles inventory deduction automatically
    await updateMaterialRequestStatus(reqId, 'مقبول');

    // Update local state
    setProducts(nextProducts);
    setRequests(prev => prev.map(r => r.id === reqId ? { ...r, status: 'مقبول' } : r));

    // Refresh logs from DB (trigger may have inserted logs)
    const newLogs = await fetchInventoryLogs();
    setLogs(newLogs);

    // Boost kitchen meals
    const firstItem = request.items[0];
    const updatedKitchen = kitchens.find(k => k.id === request.kitchenId);
    if (updatedKitchen) {
      const newMeals = Math.min(updatedKitchen.dailyMealsGoal, updatedKitchen.currentMealsToday + Math.round(firstItem.quantity * 2.2));
      const updated = { ...updatedKitchen, currentMealsToday: newMeals };
      await updateKitchen(updated);
      setKitchens(prev => prev.map(k => k.id === updated.id ? updated : k));
    }

    alert(`تمت الموافقة بنجاح وصرف الحصة للمطبخ الميداني.`);
  };

  const handleDenyRequest = async (reqId: string) => {
    if (!perms.canApproveRequests) { alert("لا تملك الصلاحية لرفض الطلبات."); return; }
    await updateMaterialRequestStatus(reqId, 'مرفوض');
    setRequests(prev => prev.map(r => r.id === reqId ? { ...r, status: 'مرفوض' } : r));
    alert("تم رفض طلب التموين المحدد وتنبيه التكية المانحة.");
  };

  const handleCreateRequest = async (newReq: Omit<MaterialRequest, 'id' | 'status' | 'date'>) => {
    const newId = await insertMaterialRequest(newReq);
    if (!newId) return;
    const updatedRequests = await fetchMaterialRequests(kitchens);
    setRequests(updatedRequests);
    alert("تم تقديم طلب التموين بنجاح. أرسل الإخطار لأمين المستودع المركزي.");
  };

  // Register side expense
  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = Number(newExpenseAmount);
    if (!amountNum || amountNum <= 0) { alert("يرجى كتابة مبلغ مصروف صحيح أكبر من صفر."); return; }
    if (!newExpenseReason.trim()) { alert("يرجى كتابة ملاحظة أو تفاصيل صرف هذا المبلغ."); return; }

    const newExp = await insertSideExpense({
      amount: amountNum, reason: newExpenseReason.trim(),
      date: new Date().toISOString().split('T')[0], category: newExpenseCategory,
    });
    if (!newExp) return;
    setExpenses(prev => [newExp, ...prev]);
    setNewExpenseAmount('');
    setNewExpenseReason('');
    alert("تم تسجيل المصروفات الجانبية بنجاح في سجل الحسابات النثرية.");
  };

  const handleDeleteExpense = async (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذا البند المصروف؟")) {
      await deleteSideExpense(id);
      setExpenses(prev => prev.filter(e => e.id !== id));
    }
  };

  // Quick Manual Log Adjustment trigger
  const handleAddLogTrigger = async () => {
    const prName = prompt("أدخل اسم المادة المراد تعديل رصيدها:");
    if (!prName) return;
    const prQty = prompt("أدخل كمية التعديل (مثال: 500 أو -300):");
    if (!prQty) return;

    const numQty = Number(prQty);
    if (isNaN(numQty)) return alert("الكمية يجب أن تكون رقماً.");

    const pType = numQty >= 0 ? 'إضافة' : 'صرف';
    const absoluteQty = Math.abs(numQty);
    const pExist = products.find(p => p.name.includes(prName)) || products[0];

    await insertInventoryLog({
      productId: pExist?.id ?? '', productName: pExist?.name ?? prName,
      type: pType, quantity: absoluteQty, unit: pExist?.unit ?? '',
      date: new Date().toISOString().split('T')[0],
      user: currentRole === 'مدير النظام' ? 'ياسمين الحربي' : 'خالد عبد الرحمن'
    });
    const newLogs = await fetchInventoryLogs();
    setLogs(newLogs);

    // Sync product qty locally
    if (pExist) {
      const updatedProd = { ...pExist, quantity: Math.max(0, pExist.quantity + numQty) };
      await updateProduct(updatedProd);
      setProducts(prev => prev.map(p => p.id === pExist.id ? updatedProd : p));
    }

    alert("تم تسجيل حركة التعديل المخزني وتدقيق رصيد المادة.");
  };

  // Derive global counters for stats
  const totalInStockKg = products.filter(p => p.category !== 'تشغيل وطاقة').reduce((sum, p) => sum + p.quantity, 0);
  const pendingCount = requests.filter(r => r.status === 'قيد المراجعة').length;
  const mealsSumToday = kitchens.reduce((sum, k) => sum + k.currentMealsToday, 0);
  const lowStockQuantity = products.filter(p => p.quantity <= p.lowStockAlertLimit).length;

  // Search logic for materials central tab or similar
  const filteredProducts = products.filter(p => {
    const term = searchQuery.trim().toLowerCase();
    if (!term) return true;
    return p.name.includes(term) || p.category.includes(term);
  });

  const filteredMembers = members.filter(member => {
    const query = employeeSearchQuery.trim().toLowerCase();
    if (!query) return true;
    return (
      member.name.toLowerCase().includes(query) ||
      member.role.toLowerCase().includes(query) ||
      member.phone.toLowerCase().includes(query)
    );
  });

  if (isKitchenStandaloneShare) {
    const currentKitchen = kitchens.find(k => k.id === sharedKitchenId) || kitchens[0] || { id: 'k1', name: 'التكية الميدانية', location: 'ميداني', manager: 'المشرف المسؤول', employeeCount: 0, dailyMealsGoal: 2000 };
    const filteredKitchenProducts = products.filter(p => {
      if (p.kitchenId !== currentKitchen.id) return false;
      const term = searchQuery.trim().toLowerCase();
      if (!term) return true;
      return p.name.includes(term) || p.category.includes(term);
    });

    return (
      <div id="erp-charity-kitchen-share-portal" dir="rtl" className="min-h-screen bg-slate-100 p-4 md:p-8 font-sans antialiased text-right select-none">
        <div className="max-w-6xl mx-auto space-y-6">
          
          {/* Standalone Kitchen Brand Header */}
          <div className="bg-white rounded-[24px] p-6 md:p-7 border border-slate-200/85 shadow-sm flex flex-col md:flex-row items-center justify-between gap-5 col-span-full">
            <div className="space-y-1 text-center md:text-right">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[10.5px] font-black border border-emerald-100 mb-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-650 animate-pulse" />
                لوحة تحكم شريك الطهو: {currentKitchen.name} 🌾 (صلاحية كاملة)
              </span>
              <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">إدارة وجرد أصناف مواد التكية</h1>
              <p className="text-slate-400 font-bold text-[11.5px]">تنظيم المخزون ومواد الطبخ المسؤول عنها المشرف {currentKitchen.manager} في {currentKitchen.location}.</p>
            </div>

            <div className="flex items-center gap-3.5 flex-wrap justify-center font-sans">
              <button
                onClick={() => setIsRequestModalOpen(true)}
                className="bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs py-2.5 px-4.5 rounded-xl cursor-pointer flex items-center gap-1.5 shadow-sm transition-all hover:scale-[1.01]"
              >
                <ClipboardList className="w-4 h-4" />
                <span>تقديم طلب تمويل 📦</span>
              </button>

              <button
                onClick={() => setIsProductModalOpen(true)}
                className="bg-emerald-800 hover:bg-emerald-950 text-white font-extrabold text-xs py-2.5 px-4.5 rounded-xl cursor-pointer flex items-center gap-1.5 shadow-sm transition-all hover:scale-[1.01]"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة صنف جديد +</span>
              </button>
            </div>
          </div>

          {/* Quick Realtime Search & Total counts */}
          <div className="bg-white rounded-2xl p-4 md:p-5 border border-slate-200 shadow-3xs flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:max-w-md">
              <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="ابحث باسم المادة الغذائية للطبخ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-200 rounded-xl py-2.5 pr-9 pl-8 text-xs font-bold text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-600 transition-all font-sans text-right"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 font-extrabold text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex items-center gap-3.5 flex-wrap font-bold text-[11px] text-slate-500 shrink-0">
              <span className="bg-emerald-50 text-emerald-850 px-3/5 py-1.5 rounded-xl border border-emerald-100">
                إجمالي الأصناف بالمطبخ الميداني: <strong className="text-emerald-950 font-sans text-xs">{filteredKitchenProducts.length}</strong>
              </span>
              <span className="bg-amber-50 text-amber-850 px-3/5 py-1.5 rounded-xl border border-amber-100">
                الهدف اليومي للتكية: <strong className="text-amber-950 font-sans text-xs">{currentKitchen.dailyMealsGoal.toLocaleString('ar-EG')} وجبة</strong>
              </span>
            </div>
          </div>

          {/* Grid display to exactly match second image theme and spacing */}
          {filteredKitchenProducts.length === 0 ? (
            <div className="bg-white rounded-[24px] p-16 text-center text-slate-400 font-bold text-xs border border-slate-200 shadow-3xs">
              لا توجد أي أصناف مسجلة في مستودع التكية الميداني حالياً. اضغط على "إضافة صنف جديد +" لتسجيل أصناف.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredKitchenProducts.map(p => {
                const isLow = p.quantity <= p.lowStockAlertLimit;

                let iconElement = <Boxes className="w-5.5 h-5.5" />;
                let bgClass = "bg-purple-50 text-purple-600";
                if (p.category === 'لحوم') {
                  iconElement = <Beef className="w-5.5 h-5.5" />;
                  bgClass = "bg-rose-50 text-rose-600";
                } else if (p.category === 'مواد غذائية') {
                  iconElement = <CookingPot className="w-5.5 h-5.5" />;
                  bgClass = "bg-sky-50 text-sky-600";
                } else if (p.category === 'تشغيل وطاقة') {
                  iconElement = <Flame className="w-5.5 h-5.5" />;
                  bgClass = "bg-amber-50 text-amber-600";
                }

                return (
                  <div 
                    key={p.id} 
                    onClick={() => {
                      setEditingProduct(p);
                      setIsEditProductModalOpen(true);
                    }}
                    className="bg-white rounded-[24px] p-5.5 border border-slate-150/85 shadow-3xs flex flex-col justify-between h-[255px] relative transition-all duration-300 hover:shadow-md hover:border-emerald-250/70 hover:-translate-y-1 group cursor-pointer"
                  >
                    {/* Corner category & Actions */}
                    <div className="flex items-center justify-between w-full">
                      <div className={`w-10 h-10 rounded-[14px] flex items-center justify-center shadow-3xs ${bgClass}`}>
                        {iconElement}
                      </div>

                      <div className="flex items-center gap-1.5 pb-1">
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingProduct(p);
                            setIsEditProductModalOpen(true);
                          }}
                          className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-400 flex items-center justify-center transition-all cursor-pointer shadow-3xs"
                          title="تعديل تفاصيل الصنف"
                        >
                          <PenLine className="w-3.5 h-3.5" />
                        </div>

                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`هل ترغب في شطب صنف "${p.name}" نهائياً من مستودع التكية الميداني؟`)) {
                              setProducts(products.filter(item => item.id !== p.id));
                            }
                          }}
                          className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 hover:border-rose-105 hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-all cursor-pointer shadow-3xs"
                          title="مسح الصنف"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>

                    {/* Middle Detail Panel */}
                    <div className="text-right">
                      <span className="text-[9px] font-black uppercase text-emerald-850 bg-emerald-50 px-2 py-0.5 rounded-md mb-1.5 inline-block">
                        {p.category}
                      </span>
                      
                      <h3 className="font-extrabold text-[14px] text-slate-805 leading-tight group-hover:text-emerald-800 duration-200">
                        {p.name}
                      </h3>

                      {/* Directly editable adjustments */}
                      <div className="mt-3 space-y-1.5 text-right font-bold text-xs" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 font-medium text-[11px]">الرصيد المتاح:</span>
                          
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const step = p.unit === 'طن' ? 1 : p.unit === 'كرتونة' ? 5 : 50;
                                const newQty = Math.max(0, p.quantity - step);
                                handleUpdateProduct({ ...p, quantity: newQty });
                              }}
                              className="w-6.5 h-6.5 rounded-lg bg-slate-55 hover:bg-rose-50 text-slate-500 hover:text-rose-600 font-black flex items-center justify-center border border-slate-200 hover:border-rose-100 transition-all text-[11px] cursor-pointer shadow-3xs"
                              title={`طرح ${p.unit === 'طن' ? 1 : p.unit === 'كرتونة' ? 5 : 50}`}
                            >
                              <Minus className="w-3 h-3" />
                            </button>

                            <span className={`font-mono text-[13px] font-black min-w-[70px] text-center px-1 rounded bg-slate-50 border border-slate-100 py-0.5 ${isLow ? 'text-rose-600 font-extrabold bg-rose-50/40' : 'text-slate-800'}`}>
                              {p.quantity.toLocaleString('ar-EG')} {p.unit}
                            </span>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const step = p.unit === 'طن' ? 1 : p.unit === 'كرتونة' ? 5 : 50;
                                const newQty = p.quantity + step;
                                handleUpdateProduct({ ...p, quantity: newQty });
                              }}
                              className="w-6.5 h-6.5 rounded-lg bg-slate-55 hover:bg-emerald-50 text-slate-500 hover:text-emerald-700 font-black flex items-center justify-center border border-slate-200 hover:border-emerald-100 transition-all text-[11px] cursor-pointer shadow-3xs"
                              title={`إضافة ${p.unit === 'طن' ? 1 : p.unit === 'كرتونة' ? 5 : 50}`}
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-[11px] px-1">
                          <span className="text-slate-400 font-medium">حد الأمان للتنبيه:</span>
                          <span className="font-mono text-slate-500 font-semibold">
                            {p.lowStockAlertLimit.toLocaleString('ar-EG')} {p.unit}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Prompt */}
                    <div className="w-full mt-3 pt-2.5 border-t border-slate-50 flex items-center justify-between text-[10px] font-bold text-slate-400 group-hover:text-emerald-700 transition-colors">
                      <span>انقر لتعديل تفاصيل المادة...</span>
                      <span className={isLow ? "text-rose-600 animate-pulse" : "text-emerald-600"}>
                        {isLow ? "⚠️ رصيد منخفض" : "✓ رصيد مستقر"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Global Modals */}
        <AddProductModal 
          isOpen={isProductModalOpen} 
          onClose={() => setIsProductModalOpen(false)} 
          onAdd={handleAddProduct} 
        />

        <EditProductModal 
          isOpen={isEditProductModalOpen} 
          onClose={() => {
            setIsEditProductModalOpen(false);
            setEditingProduct(null);
          }}
          product={editingProduct}
          onUpdate={handleUpdateProduct}
        />

        <CreateRequestModal 
          isOpen={isRequestModalOpen} 
          onClose={() => setIsRequestModalOpen(false)} 
          kitchens={kitchens} 
          products={products} 
          onCreate={handleCreateRequest} 
        />
      </div>
    );
  }

  if (isStandaloneShare) {
    return (
      <div id="erp-charity-share-portal" dir="rtl" className="min-h-screen bg-slate-100 p-4 md:p-8 font-sans antialiased text-right select-none">
        <div className="max-w-6xl mx-auto space-y-6">
          
          {/* Standalone Brand Header */}
          <div className="bg-white rounded-[24px] p-6 md:p-7 border border-slate-200/85 shadow-sm flex flex-col md:flex-row items-center justify-between gap-5">
            <div className="space-y-1 text-center md:text-right">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[10.5px] font-black border border-emerald-100 mb-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-650 animate-pulse" />
                لوحة تحكم شريك الإمداد وأمين المستودع 🔑 (صلاحية كاملة)
              </span>
              <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">إدارة وجرد أصناف المواد بالجمعية</h1>
              <p className="text-slate-400 font-bold text-[11px]">أضف أصنافك مباشرة، عدل أسماء المنتجات وحصص الأمان، أو اضغط على الأزرار لتعديل كمية الرصيد المقيد.</p>
            </div>

            <div className="flex items-center gap-3.5 flex-wrap justify-center font-sans">
              <button
                onClick={() => setIsProductModalOpen(true)}
                className="bg-emerald-800 hover:bg-emerald-950 text-white font-extrabold text-xs py-2.5 px-4.5 rounded-xl cursor-pointer flex items-center gap-1.5 shadow-sm transition-all hover:scale-[1.01]"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة صنف جديد +</span>
              </button>
            </div>
          </div>

          {/* Quick Realtime Search & Total counts */}
          <div className="bg-white rounded-2xl p-4 md:p-5 border border-slate-200 shadow-3xs flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:max-w-md">
              <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="ابحث باسم المادة الغذائية أو تصنيفها..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-200 rounded-xl py-2.5 pr-9 pl-8 text-xs font-bold text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-600 transition-all font-sans text-right"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 font-extrabold text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex items-center gap-3.5 flex-wrap font-bold text-[11px] text-slate-500 shrink-0">
              <span className="bg-emerald-50 text-emerald-850 px-3/5 py-1.5 rounded-xl border border-emerald-100">
                إجمالي الأصناف: <strong className="text-emerald-950 font-sans text-xs">{filteredProducts.length}</strong>
              </span>
              <span className="bg-sky-50 text-sky-850 px-3/5 py-1.5 rounded-xl border border-sky-100">
                مجموع الرصيد الغذائي: <strong className="text-sky-950 font-sans text-xs">{(products.filter(p => p.category !== 'تشغيل وطاقة').reduce((sum, p) => sum + p.quantity, 0)).toLocaleString('ar-EG')}</strong> كغ/لتر
              </span>
            </div>
          </div>

          {/* Grid display to exactly match second image theme and spacing */}
          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-[24px] p-16 text-center text-slate-400 font-bold text-xs border border-slate-200 shadow-3xs">
              لا توجد أي أصناف في المستودع تطابق شروط بحثك حالياً.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map(p => {
                const isLow = p.quantity <= p.lowStockAlertLimit;

                let iconElement = <Boxes className="w-5.5 h-5.5" />;
                let bgClass = "bg-purple-50 text-purple-600";
                if (p.category === 'لحوم') {
                  iconElement = <Beef className="w-5.5 h-5.5" />;
                  bgClass = "bg-rose-50 text-rose-600";
                } else if (p.category === 'مواد غذائية') {
                  iconElement = <CookingPot className="w-5.5 h-5.5" />;
                  bgClass = "bg-sky-50 text-sky-600";
                } else if (p.category === 'تشغيل وطاقة') {
                  iconElement = <Flame className="w-5.5 h-5.5" />;
                  bgClass = "bg-amber-50 text-amber-600";
                }

                return (
                  <div 
                    key={p.id} 
                    onClick={() => {
                      setEditingProduct(p);
                      setIsEditProductModalOpen(true);
                    }}
                    className="bg-white rounded-[24px] p-5.5 border border-slate-150/85 shadow-3xs flex flex-col justify-between h-[255px] relative transition-all duration-300 hover:shadow-md hover:border-emerald-250/70 hover:-translate-y-1 group cursor-pointer"
                  >
                    {/* Corner category & Actions */}
                    <div className="flex items-center justify-between w-full">
                      <div className={`w-10 h-10 rounded-[14px] flex items-center justify-center shadow-3xs ${bgClass}`}>
                        {iconElement}
                      </div>

                      <div className="flex items-center gap-1.5 pb-1">
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingProduct(p);
                            setIsEditProductModalOpen(true);
                          }}
                          className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-400 flex items-center justify-center transition-all cursor-pointer shadow-3xs"
                          title="تعديل المادة الغذائية"
                        >
                          <PenLine className="w-3.5 h-3.5" />
                        </div>

                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`هل ترغب في شطب صنف "${p.name}" نهائياً من مستودعاتنا؟`)) {
                              setProducts(products.filter(item => item.id !== p.id));
                            }
                          }}
                          className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 hover:border-rose-105 hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-all cursor-pointer shadow-3xs"
                          title="مسح الصنف"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>

                    {/* Middle Detail Panel */}
                    <div className="text-right">
                      <span className="text-[9px] font-black uppercase text-emerald-850 bg-emerald-50 px-2 py-0.5 rounded-md mb-1.5 inline-block">
                        {p.category}
                      </span>
                      
                      <h3 className="font-extrabold text-[14px] text-slate-800 leading-tight group-hover:text-emerald-805 duration-200">
                        {p.name}
                      </h3>

                      {/* Directly editable adjustments */}
                      <div className="mt-3 space-y-1.5 text-right font-bold text-xs" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 font-medium text-[11px]">الرصيد المتاح:</span>
                          
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const step = p.unit === 'طن' ? 1 : p.unit === 'كرتونة' ? 5 : 50;
                                const newQty = Math.max(0, p.quantity - step);
                                handleUpdateProduct({ ...p, quantity: newQty });
                              }}
                              className="w-6.5 h-6.5 rounded-lg bg-slate-55 hover:bg-rose-50 text-slate-500 hover:text-rose-600 font-black flex items-center justify-center border border-slate-200 hover:border-rose-100 transition-all text-[11px] cursor-pointer shadow-3xs"
                              title={`طرح ${p.unit === 'طن' ? 1 : p.unit === 'كرتونة' ? 5 : 50}`}
                            >
                              <Minus className="w-3 h-3" />
                            </button>

                            <span className={`font-mono text-[13px] font-black min-w-[70px] text-center px-1 rounded bg-slate-50 border border-slate-100 py-0.5 ${isLow ? 'text-rose-600 font-extrabold bg-rose-50/40' : 'text-slate-800'}`}>
                              {p.quantity.toLocaleString('ar-EG')} {p.unit}
                            </span>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const step = p.unit === 'طن' ? 1 : p.unit === 'كرتونة' ? 5 : 50;
                                const newQty = p.quantity + step;
                                handleUpdateProduct({ ...p, quantity: newQty });
                              }}
                              className="w-6.5 h-6.5 rounded-lg bg-slate-55 hover:bg-emerald-50 text-slate-500 hover:text-emerald-700 font-black flex items-center justify-center border border-slate-200 hover:border-emerald-100 transition-all text-[11px] cursor-pointer shadow-3xs"
                              title={`إضافة ${p.unit === 'طن' ? 1 : p.unit === 'كرتونة' ? 5 : 50}`}
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-[11px] px-1">
                          <span className="text-slate-400 font-medium">حد الأمان للمخزن:</span>
                          <span className="font-mono text-slate-500 font-semibold">
                            {p.lowStockAlertLimit.toLocaleString('ar-EG')} {p.unit}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Prompt */}
                    <div className="w-full mt-3 pt-2.5 border-t border-slate-50 flex items-center justify-between text-[10px] font-bold text-slate-400 group-hover:text-emerald-700 transition-colors">
                      <span>انقر لتعديل تفاصيل الصنف...</span>
                      <span className={isLow ? "text-rose-600 animate-pulse" : "text-emerald-600"}>
                        {isLow ? "⚠️ رصيد منخفض" : "✓ رصيد مستقر"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Global Modals for addition and updates rendered perfectly */}
        <AddProductModal 
          isOpen={isProductModalOpen} 
          onClose={() => setIsProductModalOpen(false)} 
          onAdd={handleAddProduct} 
        />

        <EditProductModal 
          isOpen={isEditProductModalOpen} 
          onClose={() => {
            setIsEditProductModalOpen(false);
            setEditingProduct(null);
          }}
          product={editingProduct}
          onUpdate={handleUpdateProduct}
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div dir="rtl" className="min-h-screen bg-[#f7f9f8] flex items-center justify-center font-sans">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-600 font-bold text-base">جاري تحميل البيانات من قاعدة البيانات...</p>
          <p className="text-slate-400 font-medium text-xs">يتم الاتصال بـ Supabase</p>
        </div>
      </div>
    );
  }

  return (
    <div id="erp-charity-root" dir="rtl" className="min-h-screen bg-[#f7f9f8] flex font-sans select-none antialiased">
      
      {/* Sidebar - Customized for RTL charity setup */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        pendingRequestsCount={pendingCount}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Panel Content Scroller */}
      <div id="main-content-scroller" className="flex-1 flex flex-col p-5 md:p-6.5 overflow-y-auto max-h-screen">
        
        {/* Header supplying dynamic quick search and User permissions simulation */}
        <Header 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
          currentRole={currentRole}
          setCurrentRole={setCurrentRole}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        {/* 1. APPLET MAIN ROUTING CONTAINER */}
        {activeTab === 'dashboard' ? (
          <div className="animate-fade-in mt-2 space-y-4">
            
            {/* Top row with dynamic action cues */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-right" dir="rtl">
              <div>
                <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                  <span>لوحة المتابعة الطبية والإمداد الغذائي</span>
                </h1>
                <p className="text-xs text-slate-400 font-bold mt-1 tracking-wide">
                  إدارة مستودعات السلال الغذائية، تموين التكيات، الرقابة الجغرافية وتتبع الوجبات للعائلات.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => {
                    if (window.confirm("هل ترغب في تصدير تقرير التوزيع اليومي بصيغة Excel (محاكاة)؟")) {
                      alert("تم إنشاء ملف التقرير وتصديره بنجاح.");
                    }
                  }}
                  className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-705 font-bold text-xs py-2.5 px-4.5 rounded-xl cursor-pointer transition-all flex items-center gap-1.5 shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>تصدير البيانات</span>
                </button>
              </div>
            </div>

            {/* Alarm banner in case list items are low */}
            {lowStockQuantity > 0 && (
              <div className="bg-rose-50 border border-rose-200 text-slate-800 p-3.5 rounded-2xl flex items-center justify-between text-xs font-bold shadow-2xs" dir="rtl">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4.5 h-4.5 text-rose-600 animate-pulse" />
                  <span>تنبيه لوجستي المنسق: هناك <strong className="text-rose-700">{lowStockQuantity} أصناف</strong> في المخزن المركزي شارفت على النفاد وتجاوزت الحد الأدنى الآمن!</span>
                </div>
                <button 
                  onClick={() => setActiveTab('inventory')} 
                  className="bg-rose-600 hover:bg-rose-700 text-white px-2.5 py-1 rounded-lg text-[10px] uppercase font-black font-sans cursor-pointer transition-colors"
                >
                  معاينة النقص
                </button>
              </div>
            )}

            {/* Split row: Left 2/3 and Right 1/3 layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch animate-fade-in">
              
              {/* Left Column (Metric cards, charts, custom shift widgets) */}
              <div className="lg:col-span-2 flex flex-col gap-5">
                
                {/* 4 KPIs with real counters */}
                <MetricCards 
                  totalInventoryCount={products.length} 
                  activeKitchensCount={kitchens.length} 
                  pendingRequestsCount={pendingCount} 
                  mealsDistributedCount={mealsSumToday + 4000} // base matching historical value
                  onCardClick={(id) => {
                    if (id === 'pendingRequests') setActiveTab('requests');
                    if (id === 'inventoryStore') setActiveTab('inventory');
                    if (id === 'activeKitchens') setActiveTab('kitchens');
                  }}
                />

                {/* Main weekly meal chart and central adjustment logs */}
                <ChartsAndReminders 
                  logs={logs} 
                  onAddLog={handleAddLogTrigger} 
                />

                {/* Active kitchen staff list and daily target semi-circular graphic */}
                <BottomGrid 
                  members={members} 
                  onAddMemberClick={() => setIsEmployeeModalOpen(true)} 
                  onRemoveMember={handleRemoveEmployee} 
                  percentageAchievements={41}
                />
              </div>

              {/* Right Column (Community Kitchen fast list & fresh meal dispatch clock ticker) */}
              <div className="h-full">
                <RightPanel 
                  kitchens={kitchens} 
                  onAddKitchenClick={() => setIsKitchenModalOpen(true)} 
                  onRemoveKitchen={handleRemoveKitchen} 
                />
              </div>

            </div>

          </div>
        ) : activeTab === 'inventory' ? (
          // CENTRAL FOOD PRODUCTS LOGISTICS TAB
          <div className="animate-fade-in mt-2 space-y-5" dir="rtl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <h2 className="text-lg font-black text-slate-800">حصر المواد الغذائية والتموينية بالمنظمة</h2>
                <p className="text-[11px] text-slate-400 font-bold">بوابة حصر الأصناف الغذائية، تتبع الرصيد الحالي للجمعية.</p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {/* Search field to search using item name */}
                <div className="relative min-w-[280px]">
                  <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
                    <Search className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="ابحث باسم المادة الغذائية..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pr-9 pl-8 text-xs font-bold text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-600 transition-all font-sans text-right"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 font-bold text-[11px]"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <button
                  onClick={() => setIsProductModalOpen(true)}
                  className="bg-emerald-800 hover:bg-emerald-950 text-white font-extrabold text-xs py-2.5 px-3.5 rounded-xl cursor-pointer flex items-center justify-center gap-1.5 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة صنف تمويني لمخازننا</span>
                </button>
              </div>
            </div>

            {/* Storekeeper (Owner) sharing and configuration ribbon */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2.5xl p-4.5 flex flex-col md:flex-row items-center justify-between gap-4 font-sans text-right">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-emerald-50 text-emerald-800 border border-emerald-100">
                  <Share2 className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-[13px] font-black text-slate-800">بوابة مشاركة المستودع المستقلة (صاحب المخزن) 🌾</h4>
                  <p className="text-[10.5px] text-slate-500 font-bold mt-0.5">
                    انسخ رابط البوابة المستقلة (الخالية من القوائم الجانبية تماماً مثل الصورة الثانية) لمشاركتها مع صاحب المنتجات أو المشرف لتعديل وحذف المنتجات وزيادة/نقص الكمية مباشرة.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap justify-end">
                {/* Share Button with copy confirmation */}
                <button
                  onClick={() => {
                    const shareUrl = `${window.location.origin}${window.location.pathname}?view=shared-inventory`;
                    navigator.clipboard.writeText(shareUrl)
                      .then(() => alert("✅ تم نسخ رابط البوابة المستقلة الفريد بنجاح! يمكن لشركاء الإمداد ومسؤولي المخازن الدخول للجرد السلس وزيادة ونقص الكمية بلمسة واحدة."))
                      .catch(() => alert("الرابط المنسوخ: " + shareUrl));
                  }}
                  className="bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold text-[11px] py-2 px-4 rounded-xl cursor-pointer flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <Link className="w-3.5 h-3.5" />
                  <span>نسخ رابط البوابة للمشاركة 🔗</span>
                </button>

                {/* Direct switch to verify in preview */}
                <button
                  onClick={() => {
                    window.history.pushState({}, '', '?view=shared-inventory');
                    setIsStandaloneShare(true);
                  }}
                  className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-black text-[11px] py-1.5 px-3 rounded-xl cursor-pointer transition-all shadow-3xs hover:border-slate-350"
                >
                  معاينة البوابة المستقلة 👁️
                </button>
              </div>
            </div>

            {/* Grid display of product cards mirroring the requested dashboard layout */}
            {filteredProducts.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2.5xl p-12 text-center text-slate-450 font-bold text-xs shadow-3xs/80">
                لا توجد أصناف تطابق بحثك حالياً في المستودع المركزي.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
                {filteredProducts.map(p => {
                  const isLow = p.quantity <= p.lowStockAlertLimit;

                  // Determine Category Icon, palette and design parameters
                  let iconElement = <Boxes className="w-5.5 h-5.5" />;
                  let bgClass = "bg-purple-50 text-purple-600";
                  if (p.category === 'لحوم') {
                    iconElement = <Beef className="w-5.5 h-5.5" />;
                    bgClass = "bg-rose-50 text-rose-600";
                  } else if (p.category === 'مواد غذائية') {
                    iconElement = <CookingPot className="w-5.5 h-5.5" />;
                    bgClass = "bg-sky-50 text-sky-600";
                  } else if (p.category === 'تشغيل وطاقة') {
                    iconElement = <Flame className="w-5.5 h-5.5" />;
                    bgClass = "bg-amber-50 text-amber-600";
                  }

                  return (
                    <div 
                      key={p.id} 
                      onClick={() => {
                        setEditingProduct(p);
                        setIsEditProductModalOpen(true);
                      }}
                      className="bg-white rounded-[24px] p-5.5 border border-slate-150/85 shadow-3xs flex flex-col justify-between h-[255px] relative transition-all duration-300 hover:shadow-md hover:border-emerald-250/70 hover:-translate-y-1 group cursor-pointer"
                    >
                      {/* Card Top Header */}
                      <div className="flex items-center justify-between w-full">
                        {/* Soft rounded category icon box */}
                        <div className={`w-10 h-10 rounded-[14px] flex items-center justify-center shadow-3xs ${bgClass}`}>
                          {iconElement}
                        </div>

                        {/* Actions at top-right */}
                        <div className="flex items-center gap-1.5 pb-1">
                          {/* Owner/Storekeeper edit pen */}
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingProduct(p);
                              setIsEditProductModalOpen(true);
                            }}
                            className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-400 flex items-center justify-center transition-all cursor-pointer shadow-3xs"
                            title="تعديل الصنف"
                          >
                            <PenLine className="w-3.5 h-3.5" />
                          </div>

                          {/* Delete item button */}
                          <div
                            onClick={(e) => {
                              e.stopPropagation(); // Avoid card click
                              if (!perms.canManageStock && !isOwnerMode) {
                                return alert("ممنوع من الصرف: لا تملك صلاحية تعديل أو حذف بالمستودع المركزي.");
                              }
                              if (window.confirm(`هل ترغب في مسح صنف "${p.name}" بالكامل من الرصيد العام؟`)) {
                                setProducts(products.filter(item => item.id !== p.id));
                              }
                            }}
                            className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 hover:border-rose-105 hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-all cursor-pointer shadow-3xs"
                            title="مسح الصنف"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      </div>

                      {/* Card Middle: Product Information */}
                      <div className="flex-1 flex flex-col justify-center mt-3">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`text-[9.5px] font-black px-2 py-0.5 rounded-md ${isLow ? 'bg-rose-50 text-rose-600 border border-rose-100/40' : 'bg-slate-100 text-slate-600'}`}>
                            {p.category}
                          </span>
                        </div>
                        
                        <h3 className="font-extrabold text-slate-800 text-[14px] tracking-tight leading-snug mt-1.5 select-text line-clamp-1 group-hover:text-emerald-950 transition-colors">
                          {p.name}
                        </h3>

                        {/* Quantities & Manual Adjusters */}
                        <div className="mt-2.5 space-y-1.5 text-right font-bold text-xs" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400 font-medium text-[11px]">الرصيد المتاح:</span>
                            
                            {/* Stepper buttons to increment or decrement quantity easily */}
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const step = p.unit === 'طن' ? 1 : p.unit === 'كرتونة' ? 5 : 50;
                                  const newQty = Math.max(0, p.quantity - step);
                                  handleUpdateProduct({ ...p, quantity: newQty });
                                }}
                                className="w-6.5 h-6.5 rounded-lg bg-slate-55 hover:bg-rose-50 text-slate-500 hover:text-rose-600 font-black flex items-center justify-center border border-slate-200 hover:border-rose-100 transition-all text-[11px] cursor-pointer shadow-3xs"
                                title={`طرح ${p.unit === 'طن' ? 1 : p.unit === 'كرتونة' ? 5 : 50}`}
                              >
                                <Minus className="w-3 h-3" />
                              </button>

                              <span className={`font-mono text-[13px] font-black min-w-[70px] text-center px-1 rounded bg-slate-50 border border-slate-100 py-0.5 ${isLow ? 'text-rose-600 font-extrabold' : 'text-slate-800'}`}>
                                {p.quantity.toLocaleString('ar-EG')} {p.unit}
                              </span>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const step = p.unit === 'طن' ? 1 : p.unit === 'كرتونة' ? 5 : 50;
                                  const newQty = p.quantity + step;
                                  handleUpdateProduct({ ...p, quantity: newQty });
                                }}
                                className="w-6.5 h-6.5 rounded-lg bg-slate-55 hover:bg-emerald-50 text-slate-500 hover:text-emerald-700 font-black flex items-center justify-center border border-slate-200 hover:border-emerald-100 transition-all text-[11px] cursor-pointer shadow-3xs"
                                title={`إضافة ${p.unit === 'طن' ? 1 : p.unit === 'كرتونة' ? 5 : 50}`}
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between text-[11px] px-1.5">
                            <span className="text-slate-400 font-medium">حد الأمان للمخزن:</span>
                            <span className="font-mono text-slate-500 font-semibold">
                              {p.lowStockAlertLimit.toLocaleString('ar-EG')} {p.unit}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Card Bottom: Click to Update Prompt */}
                      <div className="w-full mt-3 pt-2.5 border-t border-slate-50 flex items-center justify-between text-[10px] font-bold text-slate-400 group-hover:text-emerald-700 transition-colors">
                        <span>انقر على الصنف لتعديله كلياً...</span>
                        <PenLine className="w-3 h-3 opacity-60 group-hover:opacity-100" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : activeTab === 'kitchens' ? (
          // DETAILED GEOGRAPHIC KITCHEN TABS
          <div className="animate-fade-in mt-2 space-y-4" dir="rtl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-205">
              <div>
                <h2 className="text-lg font-black text-slate-800">إدارة التكيات ومراكز الطهو الخيرية</h2>
                <p className="text-[11px] text-slate-400 font-bold">تنسيق وتجهيز الوجبات، الأعداد المستهدفة والمستهلكة الفعالة بالتكيات.</p>
              </div>
              <button
                onClick={() => setIsKitchenModalOpen(true)}
                className="bg-emerald-800 hover:bg-emerald-950 text-white font-extrabold text-xs py-2 px-3.5 rounded-xl cursor-pointer flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>برمجة تكية طعام جديدة</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {kitchens.map(kitchen => (
                <div 
                  key={kitchen.id} 
                  onClick={() => {
                    setEditingKitchen(kitchen);
                    setIsEditKitchenModalOpen(true);
                  }}
                  className="bg-white border border-slate-200 rounded-2.5xl p-5 shadow-2xs hover:shadow-md cursor-pointer hover:border-emerald-200 transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center border border-emerald-100">
                        <CookingPot className="w-5 h-5" />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-2.5 py-0.5 rounded-lg">شغال</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const shareUrl = `${window.location.origin}${window.location.pathname}?view=shared-kitchen&kitchenId=${kitchen.id}`;
                            navigator.clipboard.writeText(shareUrl)
                              .then(() => alert(`✅ تم نسخ رابط البوابة المستقلة لتكية "${kitchen.name}" بنجاح! يمكنك إرساله للمشرف الميداني وجرد المواد المتاحة بلمسة واحدة.`))
                              .catch(() => alert("رابط البوابة: " + shareUrl));
                          }}
                          className="w-7 h-7 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 flex items-center justify-center border border-emerald-100 transition-colors cursor-pointer"
                          title="نسخ رابط بوابة شريك الطهو"
                        >
                          <Link className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm("هل أنت متأكد من رغبتك في حذف هذه التكية؟")) {
                              handleRemoveKitchen(kitchen.id);
                            }
                          }}
                          className="w-7 h-7 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center border border-rose-100 transition-colors cursor-pointer"
                          title="حذف التكية"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h3 className="font-extrabold text-[15px] text-slate-800 leading-tight mb-1">{kitchen.name}</h3>
                    <p className="text-[11.5px] text-slate-400 font-bold flex items-center gap-1 leading-none mb-3">
                      <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                      <span>{kitchen.location}</span>
                    </p>

                    <div className="space-y-2 border-t border-slate-50 pt-3 text-xs text-slate-500 font-bold">
                      <div className="flex justify-between">
                        <span>المشرف المسؤول:</span>
                        <span className="text-slate-800 font-black">{kitchen.manager}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>الكوادر والمتطوعون بالداخل:</span>
                        <span className="text-slate-850 font-black">{kitchen.employeeCount} أفراد</span>
                      </div>
                    </div>
                  </div>

                  {/* Aesthetic prompt for update action */}
                  <div className="mt-4 border-t border-slate-50 pt-3 flex items-center justify-between text-[11px] font-bold text-slate-400 group-hover:text-emerald-700 transition-colors">
                    <span>انقر لتحديث بيانات التكية...</span>
                    <PenLine className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : activeTab === 'requests' ? (
          // MATERIAL REQUESTS APPROVAL TABS
          <div className="animate-fade-in mt-2 space-y-4" dir="rtl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-205">
              <div>
                <h2 className="text-lg font-black text-slate-800">إدارة طلبات التموين والموافقات المخزنية</h2>
                <p className="text-[11px] text-slate-400 font-bold">تلقي ومراجعة الطلبات الموجهة من التكيات الميدانية إلى المستودع المركزي. الموافقة تخصم المواد تلقائياً وتغذي التكيات.</p>
              </div>
              <button
                onClick={() => setIsRequestModalOpen(true)}
                className="bg-emerald-800 hover:bg-emerald-950 text-white font-extrabold text-xs py-2 px-3.5 rounded-xl cursor-pointer flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>إنشاء طلب تموين يدوي</span>
              </button>
            </div>

            <div className="space-y-4">
              {requests.map(req => {
                const isPending = req.status === 'قيد المراجعة';
                const isApproved = req.status === 'مقبول';
                return (
                  <div key={req.id} className="bg-white border border-slate-202 rounded-2.5xl p-5 shadow-3xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                    <div className="space-y-2 text-right">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-extrabold text-emerald-850 px-2 py-0.5 rounded bg-emerald-50 text-[10px]">{req.id}</span>
                        <span className="text-[10px] text-slate-400 font-bold">{req.date}</span>
                        <span className={`text-[9.5px] font-black px-2 py-0.5 rounded-md ${
                          isPending 
                            ? 'bg-amber-100 text-amber-800' 
                            : isApproved 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : 'bg-rose-100 text-rose-800'
                        }`}>
                          {req.status}
                        </span>
                      </div>

                      <h3 className="font-black text-slate-800 text-[14px] leading-tight">
                        جهة الطلب: <span className="text-emerald-900 font-black">{req.kitchenName}</span>
                      </h3>

                      <div className="flex flex-wrap gap-2 pt-1">
                        {req.items.map((item, id) => (
                          <span key={id} className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-150 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-650">
                            <strong>{item.name}</strong> - المطلوبة: <span className="text-emerald-800 font-extrabold font-sans">{item.quantity} {item.unit}</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Operational Approvals */}
                    <div className="flex items-center gap-2.5 justify-end">
                      {isPending ? (
                        <>
                          <button
                            onClick={() => handleAcceptRequest(req.id)}
                            className="bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs py-2 px-3 rounded-xl flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Check className="w-4 h-4" />
                            <span>قبول وصرف المطبخ</span>
                          </button>
                          <button
                            onClick={() => handleDenyRequest(req.id)}
                            className="bg-white hover:bg-rose-50 border border-slate-200 text-rose-600 font-extrabold text-xs py-2 px-3 rounded-xl flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <XIcon className="w-4 h-4" />
                            <span>رفض</span>
                          </button>
                        </>
                      ) : (
                        <div className="p-2 text-slate-400 text-xs font-bold flex items-center gap-1 bg-slate-50 rounded-xl px-4 border border-slate-200/50">
                          <Info className="w-3.5 h-3.5 text-slate-500" />
                          <span>تم معالجة الطلب وإغلاقه</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {requests.length === 0 && (
                <div className="text-center py-16 bg-white border border-slate-100 rounded-2.5xl text-slate-400 text-xs font-bold">
                  لا يوجد أي طلبات تموين في المنظومة الآن.
                </div>
              )}
            </div>
          </div>
        ) : activeTab === 'expenses' ? (() => {
          // Extract unique months and categories loaded in expenses
          const availableExpenseMonths = Array.from(
            new Set(
              expenses.map(exp => getArabicMonthYear(exp.date)).filter(m => m !== '')
            )
          );

          const availableExpenseCategories = Array.from(
            new Set(
              expenses.map(exp => exp.category).filter(c => c && c !== '')
            )
          ) as string[];

          // Filter list
          const filteredExpensesByFilter = expenses.filter(exp => {
            const monthMatch = selectedExpenseMonth === 'all' || getArabicMonthYear(exp.date) === selectedExpenseMonth;
            const categoryMatch = selectedExpenseCategory === 'all' || exp.category === selectedExpenseCategory;
            return monthMatch && categoryMatch;
          });

          const totalFilteredSum = filteredExpensesByFilter.reduce((sum, e) => sum + e.amount, 0);

          return (
            // SIDE EXPENSES TAB - المصروفات الجانبية والنثرية
            <div className="animate-fade-in mt-2 space-y-4" dir="rtl">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-205 gap-3.5">
                <div>
                  <h2 className="text-lg font-black text-slate-800">إدارة المصروفات النثرية والجانبية</h2>
                  <p className="text-[11px] text-slate-400 font-bold">تسجيل ومتابعة المبالغ المالية المصروفة ومستلزمات التشغيل الطارئة مع توثيق أسباب الصرف لضمان الشفافية المالية.</p>
                </div>
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-2 font-bold text-xs text-emerald-800 flex items-center gap-2 self-start sm:self-auto">
                  <Coins className="w-4 h-4 text-emerald-700" />
                  <span>إجمالي المصروفات العام: <strong className="text-emerald-950 font-sans text-sm">{expenses.reduce((sum, e) => sum + e.amount, 0).toLocaleString('ar-EG')} $</strong></span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
                {/* Form Input register (Spans 4) */}
                <div className="md:col-span-4 bg-white border border-slate-200 rounded-2.5xl p-5 shadow-2xs h-fit">
                  <h3 className="font-extrabold text-[13.5px] text-slate-805 mb-4 flex items-center gap-1.5 pb-2.5 border-b border-slate-100">
                    <Plus className="w-4 h-4 text-emerald-700" />
                    <span>تسجيل مصروف جانبي جديد</span>
                  </h3>
                  
                  <form onSubmit={handleAddExpense} className="space-y-4 text-xs font-bold text-slate-600">
                    <div>
                      <label className="block mb-1.5 text-slate-700 font-bold">قيمة المبلغ المصروف ($)</label>
                      <input
                        type="number"
                        min="1"
                        required
                        placeholder="مثال: 150"
                        value={newExpenseAmount}
                        onChange={(e) => setNewExpenseAmount(e.target.value)}
                        className="w-full border border-slate-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/10 rounded-xl px-3 py-2.5 text-xs font-bold font-sans text-right"
                      />
                    </div>

                    <div>
                      <label className="block mb-1.5 text-slate-700 font-bold">تصنيف نوع المصروف</label>
                      <select
                        value={newExpenseCategory}
                        onChange={(e) => setNewExpenseCategory(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2.5 bg-white font-bold text-xs cursor-pointer"
                      >
                        <option value="صيانة وإصلاح">صيانة وإصلاح</option>
                        <option value="أجور ونقل">أجور ونقل</option>
                        <option value="شراء معدات عاجلة">شراء معدات عاجلة</option>
                        <option value="وقود وتدفئة">وقود وتدفئة</option>
                        <option value="إغاثة ومشتريات طارئة">إغاثة ومشتريات طارئة</option>
                      </select>
                    </div>

                    <div>
                      <label className="block mb-1.5 text-slate-700 font-bold">بيان وملاحظة الصرف (لماذا صُرف هذا المبلغ؟)</label>
                      <textarea
                        required
                        rows={3}
                        placeholder="امثلة: أجور نقل حطب طهي، تغيير صنبور مياه مغسلة التكية..."
                        value={newExpenseReason}
                        onChange={(e) => setNewExpenseReason(e.target.value)}
                        className="w-full border border-slate-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/10 rounded-xl px-3 py-2.5 text-xs font-bold text-right placeholder-slate-400"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-emerald-800 hover:bg-emerald-950 text-white font-black py-2.5 rounded-xl transition-all cursor-pointer shadow-3xs flex items-center justify-center gap-1.5 hover:scale-[1.01]"
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>حفظ وتسجيل المصروف</span>
                    </button>
                  </form>
                </div>

                {/* Expense logs list (Spans 8) */}
                <div className="md:col-span-8 bg-white border border-slate-200 rounded-2.5xl p-5 shadow-2xs flex flex-col justify-between">
                  <div>
                    {/* Filter headers */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100 mb-4">
                      <h3 className="font-extrabold text-[13.5px] text-slate-805 flex items-center gap-1.5">
                        <Coins className="w-4 h-4 text-emerald-700" />
                        <span>دفتر قيود ومستندات المصروفات الجانبية ({filteredExpensesByFilter.length})</span>
                      </h3>

                      {/* Filter controls */}
                      <div className="flex items-center gap-2.5 flex-wrap text-right">
                        {/* Month select */}
                        <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-[11px] font-bold shadow-3xs">
                          <span className="text-slate-400 shrink-0">تاريخ الصرف:</span>
                          <select
                            value={selectedExpenseMonth}
                            onChange={(e) => setSelectedExpenseMonth(e.target.value)}
                            className="bg-transparent text-[11px] outline-none text-slate-700 cursor-pointer font-bold border-none py-0.5"
                          >
                            <option value="all">كل التواريخ والأشهر</option>
                            {availableExpenseMonths.map(m => {
                              const count = expenses.filter(e => getArabicMonthYear(e.date) === m).length;
                              return (
                                <option key={m} value={m}>
                                  {m} ({count})
                                </option>
                              );
                            })}
                          </select>
                        </div>

                        {/* Category select */}
                        <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-[11px] font-bold shadow-3xs">
                          <span className="text-slate-400 shrink-0">البند:</span>
                          <select
                            value={selectedExpenseCategory}
                            onChange={(e) => setSelectedExpenseCategory(e.target.value)}
                            className="bg-transparent text-[11px] outline-none text-slate-700 cursor-pointer font-bold border-none py-0.5"
                          >
                            <option value="all">كل التصنيفات ({expenses.length})</option>
                            {availableExpenseCategories.map(c => {
                              const count = expenses.filter(e => e.category === c).length;
                              return (
                                <option key={c} value={c}>
                                  {c} ({count})
                                </option>
                              );
                            })}
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                      {filteredExpensesByFilter.map(exp => (
                        <div key={exp.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100/80 flex items-center justify-between text-xs transition-all hover:bg-slate-100/50">
                          <div className="text-right space-y-1 md:max-w-[70%]">
                            <div className="flex items-center flex-wrap gap-2">
                              <span className="font-extrabold text-slate-700 font-sans text-xs bg-slate-200 px-2 py-0.5 rounded-lg">
                                {exp.amount.toLocaleString('ar-EG')} $
                              </span>
                              <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-100 px-2 py-0.5 rounded-lg font-bold">
                                {exp.category || 'عام'}
                              </span>
                              <span className="text-[10.5px] text-slate-400 font-sans font-medium">{exp.date}</span>
                            </div>
                            <div className="text-slate-750 font-bold leading-relaxed pt-1 flex items-start gap-1">
                              <span className="text-slate-405 select-none font-bold">المبرر والملاحظة: </span>
                              <span className="text-slate-800 font-black">{exp.reason}</span>
                            </div>
                          </div>

                          <div className="text-left shrink-0">
                            <button
                              onClick={() => handleDeleteExpense(exp.id)}
                              className="p-1.5 hover:bg-rose-50 rounded-xl cursor-pointer text-slate-400 hover:text-rose-600 transition-colors"
                              title="حذف المصروف"
                            >
                              <Trash2 className="w-4.5 h-4.5" />
                            </button>
                          </div>
                        </div>
                      ))}

                      {filteredExpensesByFilter.length === 0 && (
                        <div className="text-center py-20 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold text-xs">
                          لا يوجد أي مصروفات جانبية تطابق الفلتر المختار حالياً.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-500">
                    <div className="flex items-center gap-2">
                      <span>إجمالي بنود الفلترة المحددة:</span>
                      <strong className="text-emerald-800 font-sans font-black text-xs">{totalFilteredSum.toLocaleString('ar-EG')} $</strong>
                    </div>
                    <span>عدد ومقدار القيود: <strong className="text-slate-700 font-sans font-extrabold">{filteredExpensesByFilter.length}</strong></span>
                  </div>
                </div>
              </div>
            </div>
          );
        })() : activeTab === 'employees' ? (
          // EMPLOYEE PERMISSIONS TAB
          <div className="animate-fade-in mt-2 space-y-4" dir="rtl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-205">
              <div>
                <h2 className="text-lg font-black text-slate-800">طاقم المنظمة وصلاحيات المنظومة</h2>
                <p className="text-[11px] text-slate-400 font-bold">المشرفين، الطهاة وسائقي شاحنات الإغاثة. لكل كادر صلاحيات عمل وكراسة ملاحظات ودفعة راتب.</p>
              </div>
              <button
                onClick={() => setIsEmployeeModalOpen(true)}
                className="bg-emerald-800 hover:bg-emerald-950 text-white font-extrabold text-xs py-2 px-3.5 rounded-xl cursor-pointer flex items-center gap-1.5 transition-all shadow-3xs hover:scale-[1.01]"
              >
                <Plus className="w-4 h-4" />
                <span>أضف موظف جديد</span>
              </button>
            </div>

            {/* Realtime Employee Search & Stats Bar */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-3xs flex flex-col md:flex-row items-center justify-between gap-4 select-none">
              <div className="relative w-full md:max-w-md">
                <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  placeholder="ابحث باسم الموظف، المسمى المسؤول، أو رقم الجوال والمستندات..."
                  value={employeeSearchQuery}
                  onChange={(e) => setEmployeeSearchQuery(e.target.value)}
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl py-2.5 pr-9 pl-8 text-xs font-bold text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-600 transition-all font-sans text-right"
                />
                {employeeSearchQuery && (
                  <button 
                    onClick={() => setEmployeeSearchQuery('')}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 font-extrabold text-xs cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3 font-bold text-[11px] text-slate-500 shrink-0">
                <span className="bg-emerald-50 text-emerald-800 px-3.5 py-1.5 rounded-xl border border-emerald-100">
                  إجمالي طاقم الكوادر الميدانية المعتمدة: <strong className="text-emerald-950 font-sans text-xs">{members.length}</strong>
                </span>
              </div>
            </div>

            {/* Standard tabular display */}
            <div className="bg-white border border-slate-200 rounded-2.5xl overflow-hidden shadow-2xs">
              {/* Desktop header */}
              <div className="hidden md:grid p-4 bg-slate-50 text-xs font-black text-slate-500 grid-cols-12 border-b border-slate-200 text-right select-none gap-2">
                <div className="col-span-4">الكادر والاسم</div>
                <div className="col-span-3">المسمى / المسؤولية</div>
                <div className="col-span-2">رقم الجوال</div>
                <div className="col-span-2 text-right">كراسة القيود والرواتب</div>
                <div className="col-span-1 text-center">الإجراء</div>
              </div>

              <div className="divide-y divide-slate-100 font-bold text-xs text-slate-700">
                {filteredMembers.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 font-bold text-xs bg-white">
                    {employeeSearchQuery ? 'لا توجد كوادر عمل مطابقة لبحثك الحالي.' : 'لا توجد كوادر عمل مسجلة حالياً.'}
                  </div>
                ) : (
                  filteredMembers.map(member => {
                    const privileges = getPermission(member.role);
                    return (
                      <React.Fragment key={member.id}>
                        {/* Desktop row view */}
                        <div className="hidden md:grid p-4 grid-cols-12 items-center gap-2 hover:bg-slate-50/40">
                          <div className="col-span-4 font-black text-slate-800 flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center font-black text-slate-900 text-[11px]">
                              {member.name[0]}
                            </div>
                            <span>{member.name}</span>
                          </div>
                          <div className="col-span-3 text-emerald-800 font-black">{member.role}</div>
                          <div className="col-span-2 text-slate-500 font-sans">{member.phone}</div>
                          
                          {/* Notes count & View triggers */}
                          <div className="col-span-2 text-right">
                            <button
                              onClick={() => {
                                setSelectedEmployeeForNotes(member);
                                setIsEmployeeNotesModalOpen(true);
                              }}
                              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border text-[11px] font-black cursor-pointer transition-all hover:scale-[1.01] ${
                                member.notes && member.notes.length > 0
                                  ? 'bg-amber-50 text-amber-900 border-amber-250 hover:bg-amber-100'
                                  : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              <span>ملاحظات ({member.notes?.length || 0}) 📝</span>
                            </button>
                          </div>

                          <div className="col-span-1 text-center">
                            <button
                              onClick={() => {
                                if (!perms.canManageUsers) return alert("صلاحيات 'مدير النظام' مطلوبة لتسجيل كادر موظفين.");
                                if (window.confirm(`هل أنت متأكد من تفكيك اعتماد الكادر ${member.name}؟`)) {
                                  setMembers(members.filter(m => m.id !== member.id));
                                }
                              }}
                              className="text-slate-350 hover:text-rose-600 p-1 rounded-md"
                            >
                              <Trash2 className="w-4 h-4 mx-auto cursor-pointer" />
                            </button>
                          </div>
                        </div>

                        {/* Mobile and Tablet Card View */}
                        <div className="md:hidden p-4 flex flex-col gap-3 hover:bg-slate-50/40 text-right">
                          <div className="flex items-center justify-between">
                            <div className="font-black text-slate-800 flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center font-black text-slate-900 text-[11px]">
                                {member.name[0]}
                              </div>
                              <span className="text-sm">{member.name}</span>
                            </div>
                            
                            <button
                              onClick={() => {
                                if (!perms.canManageUsers) return alert("صلاحيات 'مدير النظام' مطلوبة لتسجيل كادر موظفين.");
                                if (window.confirm(`هل أنت متأكد من تفكيك اعتماد الكادر ${member.name}؟`)) {
                                  setMembers(members.filter(m => m.id !== member.id));
                                }
                              }}
                              className="text-slate-400 hover:text-rose-600 p-1 rounded-lg border border-slate-150 hover:bg-rose-50"
                              title="تفكيك الاعتماد"
                            >
                              <Trash2 className="w-4 h-4 cursor-pointer" />
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-100 pt-2 font-bold text-slate-600">
                            <div>
                              <span className="text-slate-400 block text-[10px]">المسمى الوظيفي:</span>
                              <span className="text-emerald-800 font-extrabold">{member.role}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[10px]">رقم الجوال:</span>
                              <span className="text-slate-700 font-sans">{member.phone}</span>
                            </div>
                          </div>

                          <div className="pt-1 select-none">
                            <button
                              onClick={() => {
                                setSelectedEmployeeForNotes(member);
                                setIsEmployeeNotesModalOpen(true);
                              }}
                              className={`w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border text-[11.5px] font-black cursor-pointer transition-all ${
                                member.notes && member.notes.length > 0
                                  ? 'bg-amber-50 text-amber-900 border-amber-200'
                                  : 'bg-slate-50 text-slate-600 border-slate-200'
                              }`}
                            >
                              <span>دفتر الملاحظات السلوكية والزيارات ({member.notes?.length || 0}) 📝</span>
                            </button>
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        ) : activeTab === 'reports' ? (
          // REPORTS TAB
          <div className="animate-fade-in mt-2 space-y-4" dir="rtl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-205">
              <div>
                <h2 className="text-lg font-black text-slate-800">بيانات الأداء الإحصائي العام</h2>
                <p className="text-[11px] text-slate-400 font-bold">ملخصات شهرية لتوزيع المساعدات والدعم التمويني المقدم لخدمة المجتمع.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="bg-white border border-slate-200 rounded-2.5xl p-5 shadow-2xs">
                <h4 className="font-extrabold text-[13px] text-slate-500 mb-2">تقدير استدامة العجز للأسبوع القادم</h4>
                <div className="text-3xl font-black text-emerald-800 font-sans">١٢,٠٠٠ وجبة</div>
                <p className="text-[10px] text-slate-400 font-bold mt-2">مستهدف الموارد المؤمنة في المخازن مقارنة بالاحتياج اللوجستي.</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-2.5xl p-5 shadow-2xs">
                <h4 className="font-extrabold text-[13px] text-slate-500 mb-2">مجموع المواد المصروفة للتمليك والتكيات</h4>
                <div className="text-3xl font-black text-slate-850 font-sans">١,٢٥٠ كغ / يوم</div>
                <p className="text-[10px] text-slate-400 font-bold mt-2">متوسط الاستهلاك اليومي للحبوب والبروتينات في المطابخ.</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-2.5xl p-5 shadow-2xs">
                <h4 className="font-extrabold text-[13px] text-slate-500 mb-2">كفاءة الأداء التشغيلي المالي</h4>
                <div className="text-3xl font-black text-[#166534] font-sans">٩٦.٤٪</div>
                <p className="text-[10px] text-slate-400 font-bold mt-2">نسبة الصرف الدقيق الموجه مباشرة لمطابخ الإعاشة دون فاقد.</p>
              </div>
            </div>

            <div className="bg-white rounded-2.5xl p-6 border border-slate-200/60 shadow-3xs text-center space-y-3">
              <p className="text-sm font-bold text-slate-600">منظومة سواعد الخير ERP تصدر إقرارات رقمية مشفرة لضمان الشفافية والموثوقية أمام الشركاء والجهات المانحة.</p>
              <button
                onClick={() => alert("جاري تجهيز تقرير الشفافية السنوي للعام 2026...")}
                className="bg-emerald-800 hover:bg-emerald-950 text-white text-xs font-black px-5 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer inline-flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>تنزيل التقرير المالي والتشغيلي الموحد</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white border border-slate-100 rounded-2.5xl my-4 text-center">
            <span className="text-4xl">⚙️</span>
            <h2 className="text-lg font-bold text-slate-700 mt-4 capitalize">{activeTab} Panel</h2>
            <button 
              onClick={() => setActiveTab('dashboard')} 
              className="mt-5 bg-emerald-800 text-white font-bold text-xs py-2 px-4 rounded-xl cursor-pointer"
            >
              الذهاب للرئيسية
            </button>
          </div>
        )}

      </div>

      {/* 2. OVERLAYS MODALS CONTAINER */}
      <AddProductModal 
        isOpen={isProductModalOpen} 
        onClose={() => setIsProductModalOpen(false)} 
        onAdd={handleAddProduct} 
      />

      <EditProductModal 
        isOpen={isEditProductModalOpen} 
        onClose={() => {
          setIsEditProductModalOpen(false);
          setEditingProduct(null);
        }}
        product={editingProduct}
        onUpdate={handleUpdateProduct}
      />

      <AddKitchenModal 
        isOpen={isKitchenModalOpen} 
        onClose={() => setIsKitchenModalOpen(false)} 
        onAdd={handleAddKitchen} 
      />

      <EditKitchenModal 
        isOpen={isEditKitchenModalOpen} 
        onClose={() => {
          setIsEditKitchenModalOpen(false);
          setEditingKitchen(null);
        }}
        kitchen={editingKitchen}
        onUpdate={handleUpdateKitchen}
      />

      <AddEmployeeModal 
        isOpen={isEmployeeModalOpen} 
        onClose={() => setIsEmployeeModalOpen(false)} 
        onAdd={handleAddEmployee} 
      />

      <CreateRequestModal 
        isOpen={isRequestModalOpen} 
        onClose={() => setIsRequestModalOpen(false)} 
        kitchens={kitchens} 
        products={products} 
        onCreate={handleCreateRequest} 
      />

      <EmployeeDetailsNoteModal
        isOpen={isEmployeeNotesModalOpen}
        onClose={() => {
          setIsEmployeeNotesModalOpen(false);
          setSelectedEmployeeForNotes(null);
        }}
        employee={selectedEmployeeForNotes}
        onUpdateEmployee={handleUpdateEmployee}
      />

    </div>
  );
}
