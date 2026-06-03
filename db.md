# مخطط قاعدة بيانات سوبر بيس (Supabase / PostgreSQL Database Schema)

هذا الملف يحتوي على التصميم المتكامل لهيكل قاعدة البيانات (Database Schema) الموجه لمنصة **سوبر بيس (Supabase)** لتلبية متطلبات تطبيق إدارة لوجستيات وسجلات تكيات الإغاثة ومخازنها المركزية والمصروفات النثرية.

---

## 📌 مخطط الكيانات والعلاقات (Entity Relationship & Tables Overview)

يتكون هيكل قاعدة البيانات من الجداول الرئيسية التالية لتقابل بالكامل جميع الشاشات والمكونات الموجودة حالياً بالتطبيق:

1. **`kitchens` (إدارة التكيات والمطابخ الميدانية)**: تضم بيانات التكيات ومواقعها ومستهدف وجباتها.
2. **`products` (سجل الأصناف والمخزون المركزي)**: يضم كافة البنود والمستلزمات في المستودع.
3. **`material_requests` (طلبات تموين المواد)**: تسجل طلبات الطهي والموافقة عليها.
4. **`material_request_items` (تفاصيل أصناف طلبات التموين)**: جدول وسيط (Pivot Table) يحفظ الكميات المطلوبة لكل مادة ضمن الطلب الواحد لمنع تكرار البيانات وتحديد أصناف متعددة.
5. **`inventory_logs` (سجل حركة المستودع والتدقيق التدريجي)**: يدون تفاصيل التوريد، الصرف، والتحويل مع هوية الكوادر.
6. **`employees` (إدارة شؤون الموظفين والكوادر)**: يحفظ بيانات المتطوعين، أدوارهم التفصيلية، وأرقام تواصلهم.
7. **`employee_notes` (سجلات وتقييمات الكوادر الميدانية)**: ملاحظات دورية وسلوكيات تضاف لملف كل موظف.
8. **`side_expenses` (سجل المصروفات النثرية والجانبية)**: يسجل قيم الصرف الطارئ للوقود، الصيانة، الأجور، والتشغيل مع بيان المبررات وتفاصيل الصرف (صُرف لماذا؟).

---

## 🛠️ كود إنشاء الجداول (DDL: SQL Tables Declaration)

بإمكانك نسخ الكود البرمجي أدناه ولصقه مباشرة في **Supabase SQL Editor** لإنشاء الجداول والقيود والعلاقات بالكامل:

```sql
-- تفعيل إضافات UUID لتهيئة المعرفات بأمان
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================================================
-- 1. جدول الكوادر والموظفين (employees)
-- =========================================================
CREATE TABLE IF NOT EXISTS public.employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('مدير النظام', 'مسؤول مخزن', 'مسؤول تكية', 'موظف توزيع', 'سائق', 'طباخ')),
    phone TEXT NOT NULL,
    email TEXT NULL UNIQUE,
    avatar_seed TEXT NOT NULL DEFAULT 'default_face',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- =========================================================
-- 2. جدول الملاحظات التابعة للموظفين (employee_notes)
-- =========================================================
CREATE TABLE IF NOT EXISTS public.employee_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- =========================================================
-- 3. جدول التكيات والمطابخ الميدانية (kitchens)
-- =========================================================
CREATE TABLE IF NOT EXISTS public.kitchens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    manager TEXT NOT NULL,
    employee_count INTEGER NOT NULL DEFAULT 1 CHECK (employee_count >= 0),
    daily_meals_goal INTEGER NOT NULL DEFAULT 500 CHECK (daily_meals_goal >= 0),
    current_meals_today INTEGER NOT NULL DEFAULT 0 CHECK (current_meals_today >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- =========================================================
-- 4. جدول المخزون والأصناف المركزي (products)
-- =========================================================
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL CHECK (category IN ('مواد غذائية', 'لحوم', 'خضار وفواكه', 'مواد تنظيف', 'تشغيل وطاقة')),
    quantity NUMERIC NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    unit TEXT NOT NULL,
    low_stock_alert_limit NUMERIC NOT NULL DEFAULT 10,
    kitchen_id UUID NULL REFERENCES public.kitchens(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- =========================================================
-- 5. جدول طلبات التموين والموافقات المخزنية (material_requests)
-- =========================================================
CREATE TABLE IF NOT EXISTS public.material_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    kitchen_id UUID NOT NULL REFERENCES public.kitchens(id) ON DELETE RESTRICT,
    status TEXT NOT NULL DEFAULT 'قيد المراجعة' CHECK (status IN ('قيد المراجعة', 'مقبول', 'مرفوض')),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- =========================================================
-- 6. تفاصيل أصناف وكميات طلبات التموين (material_request_items)
-- =========================================================
CREATE TABLE IF NOT EXISTS public.material_request_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID NOT NULL REFERENCES public.material_requests(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    quantity NUMERIC NOT NULL CHECK (quantity > 0),
    unit TEXT NOT NULL,
    UNIQUE (request_id, product_id) -- لمنع تكرار نفس الصنف في نفس الطلب
);

-- =========================================================
-- 7. سجل حركة المواد والتدقيق المالي واللوجستي (inventory_logs)
-- =========================================================
CREATE TABLE IF NOT EXISTS public.inventory_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NULL REFERENCES public.products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('إضافة', 'صرف', 'تحويل')),
    quantity NUMERIC NOT NULL CHECK (quantity > 0),
    unit TEXT NOT NULL,
    destination TEXT NULL, -- التكية المستلمة أو موقع الصرف
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    user_name TEXT NOT NULL, -- اسم الكادر المسؤول عن الحركة
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- =========================================================
-- 8. جدول المصروفات الجانبية والنثرية (side_expenses)
-- =========================================================
CREATE TABLE IF NOT EXISTS public.side_expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    amount NUMERIC NOT NULL CHECK (amount > 0),
    reason TEXT NOT NULL, -- بيان وملاحظة الصرف (لمصلحة ماذا صُرفت الأموال)
    category TEXT NOT NULL CHECK (category IN ('صيانة وإصلاح', 'أجور ونقل', 'شراء معدات عاجلة', 'وقود وتدفئة', 'إغاثة ومشتريات طارئة')),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
```

---

## ⚡ فهارس تسريع الاستعلامات والبحث للـ Filters (Database Indexes)

لضمان سرعة البحث والتصفية المباشرة (مثل فلترة المصروفات الجانبية بالتصنيف أو تاريخ الشهر، أو معرفات التموين الميداني):

```sql
-- تحسين تصفية المصروفات بالبند والتاريخ
CREATE INDEX IF NOT EXISTS idx_side_expenses_category ON public.side_expenses (category);
CREATE INDEX IF NOT EXISTS idx_side_expenses_date ON public.side_expenses (date);

-- تحسين استعلامات المخزون والتكيات
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products (category);
CREATE INDEX IF NOT EXISTS idx_material_requests_status ON public.material_requests (status);
CREATE INDEX IF NOT EXISTS idx_material_requests_kitchen ON public.material_requests (kitchen_id);
```

---

## 🛠️ الأتمتة البرمجية: خصم المخزن تلقائياً عند قبول طلبات التموين (Triggers & Functions)

ميزة قوية في PostgreSQL لسوبر بيس تضمن أن **مخزون المستودع يتحدث تلقائياً** فور تغيير حالة طلب تموين إلى `'مقبول'`، وتوثيق ذلك تلقائياً في سجلات حركة المستندات (`inventory_logs`):

```sql
CREATE OR REPLACE FUNCTION public.proc_auto_deduct_inventory_on_approval()
RETURNS TRIGGER AS $$
DECLARE
    r_item RECORD;
    v_product_name TEXT;
BEGIN
    -- نفذ الإجراء فقط عندما تتغير الحالة من 'قيد المراجعة' إلى 'مقبول'
    IF NEW.status = 'مقبول' AND OLD.status = 'قيد المراجعة' THEN
        
        -- تكرار على كافة المواد والعناصر التابعة للطلب
        FOR r_item IN 
            SELECT product_id, quantity, unit FROM public.material_request_items WHERE request_id = NEW.id
        LOOP
            -- الحصول على اسم المنتج لتدوينه في لوائح العمليات
            SELECT name INTO v_product_name FROM public.products WHERE id = r_item.product_id;
            
            -- 1. خصم الكمية من جدول المخزون الرئيسي
            UPDATE public.products 
            SET quantity = quantity - r_item.quantity 
            WHERE id = r_item.product_id;
            
            -- 2. إدراج القيد تلقائياً في سجل حركة المستودع
            INSERT INTO public.inventory_logs (
                product_id,
                product_name,
                type,
                quantity,
                unit,
                destination,
                date,
                user_name
            ) VALUES (
                r_item.product_id,
                v_product_name,
                'صرف',
                r_item.quantity,
                r_item.unit,
                (SELECT name FROM public.kitchens WHERE id = NEW.kitchen_id),
                NEW.date,
                'أتمتة النظام (موافقة صرف)'
            );
        END LOOP;
        
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ربط التابع بالجدول كـ Trigger
CREATE TRIGGER trg_on_request_approval
    AFTER UPDATE ON public.material_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.proc_auto_deduct_inventory_on_approval();
```

---

## 🔒 حماية وتأمين البيانات (Row Level Security - RLS)

توفر منصة Supabase الحماية الكاملة للمخزن والمصروفات. هنا كود تفعيل السياسات لحظر التعديل غير المصرح به للعامة والسماح لجميع المستخدمين المسجلين في النظام بالقراءة:

```sql
-- تفعيل ميزة الأمان RLS على الجداول
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kitchens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.side_expenses ENABLE ROW LEVEL SECURITY;

-- سياسات الوصول (بسيطة ومفتوحة للقراءة، التحكم مقيد ببرمجيات الاستدعاء)
CREATE POLICY "مسموح للجميع قراءة البيانات" 
    ON public.side_expenses FOR SELECT 
    USING (true);

CREATE POLICY "التحكم الكامل للمستخدمين المعتمدين" 
    ON public.side_expenses FOR ALL 
    TO authenticated
    USING (true)
    WITH CHECK (true);
```

---

### 💡 إرشادات سريعة لربط Supabase مع كود React:

1. قم بتثبيت حزمة الواجهة البرمجية في مشروعك:
   ```bash
   npm install @supabase/supabase-js
   ```
2. قم بإنشاء ملف إعدادات المصادقة والاتصال بمزود الخدمة في المستودع المحلي باسم `src/lib/supabaseClient.ts`:
   ```typescript
   import { createClient } from '@supabase/supabase-js';

   const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
   const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

   export const supabase = createClient(supabaseUrl, supabaseAnonKey);
   ```
3. باستعمال الرابط والبيانات أعلاه، يمكنك استبدال عمليات الـ `localStorage.getItem` بطلبات قاعدة البيانات السحابية الحقيقية لتعيش البيانات وتتزامن بين كافة أجهزة الكوادر بكفاءة عالية وأمان مطلق.
