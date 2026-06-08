import React, { useState, useEffect } from 'react';
import { X, PackagePlus, Store, UserPlus, FileUp, ClipboardList, ArrowLeftRight, Trash2, User, Phone, Mail, FileText, Calendar, Plus } from 'lucide-react';
import { Product, Kitchen, Employee, EmployeeRole, ProductCategory, MaterialRequest } from '../types';

// 1. ADD FOOD PRODUCT MODAL
interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (product: Omit<Product, 'id'>) => void;
}

export const AddProductModal: React.FC<AddProductModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ProductCategory>('مواد غذائية');
  const [quantity, setQuantity] = useState(0);
  const [unit, setUnit] = useState('كغ');
  const [lowStockAlertLimit, setLowStockAlertLimit] = useState(50);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return alert("يرجى إدخال اسم المادة.");
    onAdd({
      name: name.trim(),
      category,
      quantity: Number(quantity),
      unit,
      lowStockAlertLimit: Number(lowStockAlertLimit)
    });
    setName('');
    setQuantity(0);
    onClose();
  };

  return (
    <div dir="rtl" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white rounded-2.5xl p-6.5 w-full max-w-md shadow-2xl border border-slate-150 text-right">
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <PackagePlus className="w-5 h-5 text-emerald-700" />
            <h3 className="font-black text-slate-800 text-[15.5px]">إضافة صنف جديد للمستودع</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer">
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 font-sans text-xs">
          <div>
            <label className="block font-bold text-slate-555 mb-1.5">اسم المادة / المنتج الغذائي</label>
            <input
              type="text"
              required
              placeholder="مثال: أرز بسمتي ذهبي، دجاج مبرد"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-600 font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block font-bold text-slate-555 mb-1.5">تصنيف المادة</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProductCategory)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 outline-none bg-white font-bold"
              >
                <option value="مواد غذائية">🍚 مواد غذائية</option>
                <option value="لحوم">🥩 لحوم ودواجن</option>
                <option value="خضار وفواكه">🥬 خضار وفواكه</option>
                <option value="مواد تنظيف">🧴 مواد تنظيف معقمة</option>
                <option value="تشغيل وطاقة">🔥 غاز وطاقة طبخ</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-555 mb-1.5">وحدة القياس</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 outline-none bg-white font-bold"
              >
                <option value="كغ">كيلوغرام (كغ)</option>
                <option value="طن">طن متري</option>
                <option value="كرتونة">كرتونة معبأة</option>
                <option value="لتر">لتر سائل</option>
                <option value="حبة">حبة فردية</option>
                <option value="إسطوانة">إسطوانة طاقة</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block font-bold text-slate-555 mb-1.5">الكمية المتوفرة حالاً</label>
              <input
                type="number"
                min="0"
                required
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-555 mb-1.5 font-sans">حد تنبيه المخزون المنخفض</label>
              <input
                type="number"
                min="1"
                required
                value={lowStockAlertLimit}
                onChange={(e) => setLowStockAlertLimit(Number(e.target.value))}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none font-bold"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-800 hover:bg-emerald-950 text-white font-black py-3 rounded-xl transition-all shadow-sm cursor-pointer"
          >
            إضافة الصنف للمخزون الموحد
          </button>
        </form>
      </div>
    </div>
  );
};

// 1.5. EDIT FOOD PRODUCT MODAL
interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onUpdate: (updatedProduct: Product) => void;
}

export const EditProductModal: React.FC<EditProductModalProps> = ({ isOpen, onClose, product, onUpdate }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ProductCategory>('مواد غذائية');
  const [quantity, setQuantity] = useState(0);
  const [unit, setUnit] = useState('كغ');
  const [lowStockAlertLimit, setLowStockAlertLimit] = useState(50);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setCategory(product.category);
      setQuantity(product.quantity);
      setUnit(product.unit);
      setLowStockAlertLimit(product.lowStockAlertLimit);
    }
  }, [product, isOpen]);

  if (!isOpen || !product) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return alert("يرجى إدخال اسم المادة.");
    onUpdate({
      ...product,
      name: name.trim(),
      category,
      quantity: Number(quantity),
      unit,
      lowStockAlertLimit: Number(lowStockAlertLimit)
    });
    onClose();
  };

  return (
    <div dir="rtl" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white rounded-2.5xl p-6.5 w-full max-w-md shadow-2xl border border-slate-150 text-right">
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <PackagePlus className="w-5 h-5 text-emerald-700" />
            <h3 className="font-black text-slate-800 text-[15.5px]">تعديل بيانات الصنف وحصره</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer">
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 font-sans text-xs">
          <div>
            <label className="block font-bold text-slate-555 mb-1.5">اسم المادة / المنتج الغذائي</label>
            <input
              type="text"
              required
              placeholder="مثال: أرز بسمتي ذهبي، دجاج مبرد"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-600 font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block font-bold text-slate-555 mb-1.5">تصنيف المادة</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProductCategory)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 outline-none bg-white font-bold"
              >
                <option value="مواد غذائية">🍚 مواد غذائية</option>
                <option value="لحوم">🥩 لحوم ودواجن</option>
                <option value="خضار وفواكه">🥬 خضار وفواكه</option>
                <option value="مواد تنظيف">🧴 مواد تنظيف معقمة</option>
                <option value="تشغيل وطاقة">🔥 غاز وطاقة طبخ</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-555 mb-1.5">وحدة القياس</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 outline-none bg-white font-bold"
              >
                <option value="كغ">كيلوغرام (كغ)</option>
                <option value="طن">طن متري</option>
                <option value="كرتونة">كرتونة معبأة</option>
                <option value="لتر">لتر سائل</option>
                <option value="حبة">حبة فردية</option>
                <option value="إسطوانة">إسطوانة طاقة</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block font-bold text-slate-555 mb-1.5">الرصيد المتاح حالاً</label>
              <input
                type="number"
                min="0"
                required
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-555 mb-1.5 font-sans">حد تنبيه المخزون المنخفض</label>
              <input
                type="number"
                min="1"
                required
                value={lowStockAlertLimit}
                onChange={(e) => setLowStockAlertLimit(Number(e.target.value))}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none font-bold"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-800 hover:bg-emerald-950 text-white font-black py-3 rounded-xl transition-all shadow-sm cursor-pointer"
          >
            تعديل وحفظ بيانات الصنف
          </button>
        </form>
      </div>
    </div>
  );
};

// 2. ADD COMMUNITY KITCHEN (TAKIYA) MODAL
interface AddKitchenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (kitchen: Omit<Kitchen, 'id' | 'currentMealsToday'>) => void;
}

export const AddKitchenModal: React.FC<AddKitchenModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [manager, setManager] = useState('');
  const [dailyMealsGoal, setDailyMealsGoal] = useState(1000);
  const [employeeCount, setEmployeeCount] = useState(5);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !location.trim()) return alert("يرجى ملئ الخانات المطلوبة.");
    onAdd({
      name: name.trim(),
      location: location.trim(),
      manager: manager.trim() || 'الشيخ أبو أحمد',
      dailyMealsGoal: Number(dailyMealsGoal),
      employeeCount: Number(employeeCount)
    });
    setName('');
    setLocation('');
    onClose();
  };

  return (
    <div dir="rtl" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white rounded-2.5xl p-6.5 w-full max-w-md shadow-2xl border border-slate-150 text-right">
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-emerald-700" />
            <h3 className="font-black text-slate-800 text-[15.5px]">تسجيل تكية طعام جديدة للمنظمة</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer">
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 font-sans text-xs">
          <div>
            <label className="block font-bold text-slate-555 mb-1.5">اسم التكية / مركز التوزيع</label>
            <input
              type="text"
              required
              placeholder="مثال: تكية رفح الشعبية، تكية المربع الغربي"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block font-bold text-slate-555 mb-1.5">الموقع الجغرافي / الحي</label>
              <input
                type="text"
                required
                placeholder="مثال: مخيم جباليا، غزة"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-555 mb-1.5">الشيخ المسؤول / أمين التكية</label>
              <input
                type="text"
                required
                placeholder="اسم منسق التكية"
                value={manager}
                onChange={(e) => setManager(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block font-bold text-slate-555 mb-1.5">الوجبات المستهدفة باليوم</label>
              <input
                type="number"
                min="100"
                required
                value={dailyMealsGoal}
                onChange={(e) => setDailyMealsGoal(Number(e.target.value))}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-555 mb-1.5">عدد موظفي المطبخ</label>
              <input
                type="number"
                min="1"
                required
                value={employeeCount}
                onChange={(e) => setEmployeeCount(Number(e.target.value))}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none font-bold"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-800 hover:bg-emerald-950 text-white font-black py-3 rounded-xl transition-all shadow-sm cursor-pointer"
          >
            تسجيل وتدشين التكية بالمشروع الخيرية
          </button>
        </form>
      </div>
    </div>
  );
};

// 2.5. EDIT COMMUNITY KITCHEN (TAKIYA) MODAL
interface EditKitchenModalProps {
  isOpen: boolean;
  onClose: () => void;
  kitchen: Kitchen | null;
  onUpdate: (updatedKitchen: Kitchen) => void;
}

export const EditKitchenModal: React.FC<EditKitchenModalProps> = ({ isOpen, onClose, kitchen, onUpdate }) => {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [manager, setManager] = useState('');
  const [dailyMealsGoal, setDailyMealsGoal] = useState(1000);
  const [employeeCount, setEmployeeCount] = useState(5);

  useEffect(() => {
    if (kitchen) {
      setName(kitchen.name);
      setLocation(kitchen.location);
      setManager(kitchen.manager);
      setDailyMealsGoal(kitchen.dailyMealsGoal);
      setEmployeeCount(kitchen.employeeCount);
    }
  }, [kitchen, isOpen]);

  if (!isOpen || !kitchen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !location.trim()) return alert("يرجى ملئ الخانات المطلوبة.");
    onUpdate({
      ...kitchen,
      name: name.trim(),
      location: location.trim(),
      manager: manager.trim(),
      dailyMealsGoal: Number(dailyMealsGoal),
      employeeCount: Number(employeeCount)
    });
    onClose();
  };

  return (
    <div dir="rtl" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white rounded-2.5xl p-6.5 w-full max-w-md shadow-2xl border border-slate-150 text-right">
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-emerald-700" />
            <h3 className="font-black text-slate-800 text-[15.5px]">تعديل بيانات التكية الخيرية</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer">
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 font-sans text-xs">
          <div>
            <label className="block font-bold text-slate-555 mb-1.5">اسم التكية / مركز التوزيع</label>
            <input
              type="text"
              required
              placeholder="مثال: تكية رفح الشعبية، تكية المربع الغربي"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block font-bold text-slate-555 mb-1.5">الموقع الجغرافي / الحي</label>
              <input
                type="text"
                required
                placeholder="مثال: مخيم جباليا، غزة"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-555 mb-1.5">الشيخ المسؤول / أمين التكية</label>
              <input
                type="text"
                required
                placeholder="اسم منسق التكية"
                value={manager}
                onChange={(e) => setManager(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block font-bold text-slate-555 mb-1.5">الوجبات المستهدفة باليوم</label>
              <input
                type="number"
                min="100"
                required
                value={dailyMealsGoal}
                onChange={(e) => setDailyMealsGoal(Number(e.target.value))}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-555 mb-1.5">عدد موظفي المطبخ</label>
              <input
                type="number"
                min="1"
                required
                value={employeeCount}
                onChange={(e) => setEmployeeCount(Number(e.target.value))}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none font-bold"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-800 hover:bg-emerald-950 text-white font-black py-3 rounded-xl transition-all shadow-sm cursor-pointer"
          >
            حفظ وتعديل بيانات التكية
          </button>
        </form>
      </div>
    </div>
  );
};

// 3. REGISTER VOLUNTEER (EMPLOYEE) MODAL
interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (employee: Omit<Employee, 'id'>) => void;
}

export const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState<EmployeeRole>('طباخ');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return alert("يرجى تزويد الاسم.");
    
    // Pick appropriate avatar seeds
    const seeds: Record<EmployeeRole, string> = {
      'مدير النظام': 'yasmin',
      'مسؤول مخزن': 'khaled',
      'مسؤول تكية': 'abu-ahmad',
      'موظف توزيع': 'yousef',
      'سائق': 'yousef',
      'طباخ': 'abu-ahmad'
    };

    onAdd({
      name: name.trim(),
      role,
      phone: phone.trim() || '٠٥٩-٩٩٩-١٢٣٤',
      email: email.trim() || 'worker@charity.org',
      avatarSeed: seeds[role] || 'khaled'
    });

    setName('');
    setPhone('');
    setEmail('');
    onClose();
  };

  return (
    <div dir="rtl" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white rounded-2.5xl p-6.5 w-full max-w-md shadow-2xl border border-slate-150 text-right">
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-emerald-700" />
            <h3 className="font-black text-slate-800 text-[15.5px]">تسجيل كادر / متطوع جديد بالمنظمة</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer">
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 font-sans text-xs">
          <div>
            <label className="block font-bold text-slate-555 mb-1.5">اسم الكادر أو المتطوع</label>
            <input
              type="text"
              required
              placeholder="مثال: الشيخ فهد الأحمد"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none font-bold"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-555 mb-1.5">الدور المناط / المسمى الوظيفي</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as EmployeeRole)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 outline-none bg-white font-bold"
            >
              <option value="طباخ">👨‍🍳 طباخ رئيسي (إعداد الطعام بالتكيات)</option>
              <option value="مسؤول تكية">🕌 مسؤول تكية ومصرف ميداني</option>
              <option value="مسؤول مخزن">📦 مسؤول مخزن (أمين المستودع المركزي)</option>
              <option value="موظف توزيع">🚚 فريق توزيع ميداني</option>
              <option value="سائق">🚛 سائق نقل لوجستي</option>
              <option value="مدير النظام">⚙️ إداري عام للمنظمة (مدير النظام)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block font-bold text-slate-555 mb-1.5">رقم الاتصال (الجوال)</label>
              <input
                type="text"
                placeholder="٠٥٩-xxxxxxx"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none font-bold text-left"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-555 mb-1.5">البريد الإلكتروني</label>
              <input
                type="email"
                placeholder="name@donezocharity.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none font-bold text-left"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-800 hover:bg-emerald-950 text-white font-black py-3 rounded-xl transition-all shadow-sm cursor-pointer"
          >
            حفظ الكادر وتحميل الصلاحيات التلقائية لعمله
          </button>
        </form>
      </div>
    </div>
  );
};

// 4. KITCHEN MATERIAL REQUEST MODAL
interface CreateRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  kitchens: Kitchen[];
  products: Product[];
  onCreate: (request: Omit<MaterialRequest, 'id' | 'status' | 'date'>) => void;
}

export const CreateRequestModal: React.FC<CreateRequestModalProps> = ({
  isOpen,
  onClose,
  kitchens,
  products,
  onCreate
}) => {
  // products هنا هي المستودع الرئيسي فقط (تُمرَّر من App.tsx)
  const [kitchenId, setKitchenId] = useState('');
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState(10);

  // تحديث الاختيارات لما تتغير القائمة
  useEffect(() => {
    if (kitchens.length > 0 && !kitchenId) setKitchenId(kitchens[0].id);
  }, [kitchens]);

  useEffect(() => {
    if (products.length > 0 && !productId) setProductId(products[0].id);
  }, [products]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const kit = kitchens.find(k => k.id === kitchenId);
    const prod = products.find(p => p.id === productId);
    if (!kit || !prod) return alert("يرجى التأكد من توفر تكيات ومنتجات في المخزون الرئيسي.");
    if (quantity <= 0) return alert("أدخل كمية صحيحة أكبر من صفر.");
    if (quantity > prod.quantity) return alert(`⚠️ الكمية المطلوبة (${quantity}) أكبر من المتاح في المستودع (${prod.quantity} ${prod.unit}).`);

    onCreate({
      kitchenId: kit.id,
      kitchenName: kit.name,
      items: [{
        productId: prod.id,
        name: prod.name,
        quantity: Number(quantity),
        unit: prod.unit
      }]
    });

    onClose();
  };

  return (
    <div dir="rtl" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in font-sans">
      <div className="bg-white rounded-2.5xl p-6.5 w-full max-w-md shadow-2xl border border-slate-150 text-right">
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-emerald-700" />
            <h3 className="font-black text-slate-800 text-[15.5px]">إنشاء طلب تموين مواد للتكية</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer">
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-555 mb-1.5">التكية الطالبة</label>
            <select
              value={kitchenId}
              onChange={(e) => setKitchenId(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 outline-none bg-white font-bold"
            >
              {kitchens.map(k => (
                <option key={k.id} value={k.id}>{k.name} ({k.location})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block font-bold text-slate-555 mb-1.5">الصنف المطلوب</label>
              <select
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 outline-none bg-white font-bold"
              >
                {products.length === 0 ? (
                  <option value="">لا توجد مواد في المستودع الرئيسي</option>
                ) : products.map(p => (
                  <option key={p.id} value={p.id}>{p.name} (متاح: {p.quantity} {p.unit})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-555 mb-1.5">الكمية المطلوبة</label>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none font-bold"
              />
            </div>
          </div>

          <p className="p-2.5 rounded-lg bg-emerald-50 text-emerald-800 text-[10px] font-bold">
            * الطلب سيذهب مباشرة لمسؤول المستودع للمراجعة. في حال القبول، سيتم خصم المواد وصرفها للتكية تلقائياً.
          </p>

          <button
            type="submit"
            className="w-full bg-emerald-800 hover:bg-emerald-950 text-white font-black py-3 rounded-xl transition-all shadow-sm cursor-pointer"
          >
            إرسال طلب التموين الميداني
          </button>
        </form>
      </div>
    </div>
  );
};

interface EmployeeDetailsNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
  onUpdateEmployee: (updatedMember: Employee) => void;
}

export const EmployeeDetailsNoteModal: React.FC<EmployeeDetailsNoteModalProps> = ({
  isOpen,
  onClose,
  employee,
  onUpdateEmployee,
}) => {
  const [noteText, setNoteText] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('all');

  useEffect(() => {
    setSelectedMonth('all');
  }, [employee?.id]);

  if (!isOpen || !employee) return null;

  const notesList = employee.notes || [];

  // Helper to extract month + year dynamically from date string
  const getNoteMonthYear = (dateStr: string) => {
    const parts = dateStr.trim().split(/\s+/);
    if (parts.length >= 3) {
      // e.g., "يونيو ٢٠٢٦"
      return `${parts[1]} ${parts[2]}`;
    }
    if (parts.length >= 2) {
      return parts[1];
    }
    return '';
  };

  // Get unique months listed in notes
  const availableMonths = Array.from(
    new Set(
      notesList
        .map(note => getNoteMonthYear(note.date))
        .filter(m => m !== '')
    )
  );

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return alert("يرجى كتابة نص الملاحظة أو السلفة.");

    const today = new Date();
    const formattedDate = today.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }) + ' ' + today.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

    const newNote = {
      id: 'note-' + Date.now(),
      text: noteText.trim(),
      date: formattedDate,
    };

    const updatedEmployee: Employee = {
      ...employee,
      notes: [newNote, ...notesList],
    };

    onUpdateEmployee(updatedEmployee);
    setNoteText('');
  };

  const handleRemoveNote = (noteId: string) => {
    if (!window.confirm("هل أنت متأكد من رغبتك في حذف هذه الملاحظة تلقائياً؟")) return;
    const updatedEmployee: Employee = {
      ...employee,
      notes: notesList.filter(n => n.id !== noteId),
    };
    onUpdateEmployee(updatedEmployee);
  };

  const handleClearAllNotes = () => {
    if (!window.confirm(`⚠️ تحذير: هل أنت متأكد من شطب وحذف كافة الملاحظات والقيود المسجلة باسم "${employee.name}" بالكامل؟ لا يمكن استرجاع البيانات بعد الحذف.`)) return;
    const updatedEmployee: Employee = {
      ...employee,
      notes: [],
    };
    onUpdateEmployee(updatedEmployee);
    setSelectedMonth('all');
  };

  // Filter notes list by the selected month
  const filteredNotes = selectedMonth === 'all'
    ? notesList
    : notesList.filter(n => getNoteMonthYear(n.date) === selectedMonth);

  return (
    <div dir="rtl" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-2xl border border-slate-155 text-right flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 border border-amber-100 flex items-center justify-center shadow-3xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-[15px]">الملف الشخصي ودفتر ملاحظات الموظف 📝</h3>
              <p className="text-[10px] text-slate-400 font-bold mt-0.5">مفكرة مستقلة لكشف رواتب وسلفيات الكادر الميداني: {employee.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="mt-4 space-y-4 overflow-y-auto pr-1 flex-1">
          
          {/* Profile Card */}
          <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-sans">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-slate-400 shrink-0" />
              <div>
                <span className="text-slate-400 block text-[9.5px] font-black">الاسم الكامل</span>
                <span className="font-black text-slate-700">{employee.name}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Store className="w-4 h-4 text-slate-400 shrink-0" />
              <div>
                <span className="text-slate-400 block text-[9.5px] font-black">الدور الميداني</span>
                <span className="font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md inline-block">{employee.role}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-slate-400 shrink-0" />
              <div>
                <span className="text-slate-400 block text-[9.5px] font-black">رقم الجوال للخدمة</span>
                <span className="font-bold text-slate-600 font-sans">{employee.phone}</span>
              </div>
            </div>
          </div>

          {/* New Note Form */}
          <form onSubmit={handleAddNote} className="space-y-2 mt-2 bg-[#fcfdfd] p-3.5 border border-slate-100 rounded-xl">
            <label className="block text-[11px] font-black text-slate-700 mb-1">تسجيل ملاحظة جديدة (استلام راتب، سلفة مالية، حضور/غياب، عهدة):</label>
            <div className="flex gap-2">
              <textarea
                rows={1}
                required
                placeholder="مثال: استلم سلفة بقيمة ١٠٠ دولار لظرف طارئ أو استلم مرتب شهر مايو..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold font-sans text-right placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-600 min-h-[44px] resize-none"
              />
              <button
                type="submit"
                className="bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold text-xs px-4 rounded-xl cursor-pointer shrink-0 transition-colors flex items-center justify-center gap-1 shadow-3xs"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة ملاحظة</span>
              </button>
            </div>
          </form>

          {/* Timeline list */}
          <div className="pt-2 border-t border-slate-100">
            
            {/* Filter and Delete Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 shrink-0">
              <h4 className="font-black text-slate-800 text-[12.5px]">
                سجل الملاحظات والأعباء الموثق ({filteredNotes.length})
              </h4>
              
              {notesList.length > 0 && (
                <div className="flex items-center gap-3.5 flex-wrap sm:flex-nowrap">
                  {/* Month Filter */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-400 font-bold shrink-0">تصفية بالشهر:</span>
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-bold py-1 px-2.5 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-600 text-slate-700 cursor-pointer text-right min-w-[120px]"
                    >
                      <option value="all">عرض الكل ({notesList.length})</option>
                      {availableMonths.map((m) => {
                        const count = notesList.filter(n => getNoteMonthYear(n.date) === m).length;
                        return (
                          <option key={m} value={m}>
                            {m} ({count} قييد)
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {/* Clear All Button */}
                  <button
                    type="button"
                    onClick={handleClearAllNotes}
                    className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-150 rounded-lg text-[10.5px] font-black py-1 px-3.5 cursor-pointer transition-colors flex items-center gap-1 shadow-3xs"
                    title="حذف وحذف كل الملاحظات"
                  >
                    <Trash2 className="w-3 h-3 text-rose-500" />
                    <span>حذف جميع الملاحظات</span>
                  </button>
                </div>
              )}
            </div>
            
            {filteredNotes.length === 0 ? (
              <div className="text-center py-8 text-slate-400 font-bold text-xs bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                {selectedMonth !== 'all' 
                  ? `لا توجد قيود مسجلة في شهر ${selectedMonth}.`
                  : `لا توجد مذكرات أو قيود حالياً.`
                }
              </div>
            ) : (
              <div className="space-y-2 max-h-[220px] overflow-y-auto pl-1">
                {filteredNotes.map((note) => (
                  <div key={note.id} className="p-3 bg-white border border-slate-150/90 rounded-xl flex items-center justify-between gap-4 text-xs hover:border-slate-350 duration-200 group animate-fade-in">
                    <div className="text-right space-y-1 flex-1">
                      <p className="text-slate-700 font-black leading-relaxed">{note.text}</p>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-sans font-semibold mt-1">
                        <Calendar className="w-3 h-3 text-slate-350" />
                        <span>{note.date}</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleRemoveNote(note.id)}
                      className="text-slate-355 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors shrink-0 cursor-pointer"
                      title="حذف القيد"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="pt-3.5 border-t border-slate-100 flex justify-end shrink-0 select-none">
          <button
            onClick={onClose}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs py-2 px-5 rounded-xl cursor-pointer transition-colors"
          >
            إغلاق المذكرة
          </button>
        </div>

      </div>
    </div>
  );
};
