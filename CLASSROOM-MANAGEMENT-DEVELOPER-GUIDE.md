# 🔧 دليل المطور - تطوير صفحة إدارة الفصول

## 📋 نظرة عامة تقنية

تم إجراء تحسينات شاملة على نظام إدارة الفصول في MOTABEA، مع التركيز على تحسين تجربة المستخدم، الأداء، والتوافق مع الأجهزة المختلفة.

---

## 🏗️ البنية المعمارية

### الملفات الرئيسية

```
src/
├── pages/
│   └── InitialSettings/
│       ├── ClassroomManagement.tsx          # الصفحة الرئيسية
│       ├── ClassroomScheduleSetup.tsx       # صفحة إعداد الحصص (جديد)
│       └── ClassroomSubjectsSetup.tsx       # صفحة إعداد المواد (جديد)
└── App.tsx                                   # التوجيه (معدّل)
```

---

## 🔄 التغييرات التقنية الرئيسية

### 1. إزالة النوافذ المنبثقة (Modals)

**قبل:**
```tsx
// استخدام Dialog Components
<Dialog open={isScheduleModalOpen}>
  <DialogContent>
    {/* محتوى النافذة */}
  </DialogContent>
</Dialog>
```

**بعد:**
```tsx
// التوجيه لصفحات منفصلة
const openScheduleModal = (classroom: Classroom) => {
  navigate(`/dashboard/initial-settings/classrooms/schedule-setup?classroomId=${classroom.id}&classroomName=${encodeURIComponent(classroom.name)}`);
};
```

**المزايا:**
- تحسين الأداء (تحميل كسول للصفحات)
- تجربة أفضل على الأجهزة المحمولة
- سهولة الصيانة والتطوير
- إمكانية مشاركة الروابط المباشرة

---

### 2. نظام التوجيه المحسّن

**التعديلات في `App.tsx`:**

```tsx
// إضافة Routes جديدة
import ClassroomScheduleSetup from './pages/InitialSettings/ClassroomScheduleSetup'
import ClassroomSubjectsSetup from './pages/InitialSettings/ClassroomSubjectsSetup'

// في Routes:
<Route path="initial-settings/classrooms/schedule-setup" element={<ClassroomScheduleSetup />} />
<Route path="initial-settings/classrooms/subjects-setup" element={<ClassroomSubjectsSetup />} />
```

**معاملات URL (Query Parameters):**
- `classroomId`: معرّف الفصل
- `classroomName`: اسم الفصل (للعرض)
- `stage`: المرحلة الدراسية (للمواد)
- `stageId`: معرّف المرحلة (للحصص)

---

### 3. نظام الحفظ باستخدام localStorage

**هيكل البيانات:**

```typescript
// حفظ الفصول لكل مرحلة
interface StorageStructure {
  [`classrooms_stage_${stageId}`]: Classroom[];
  [`periods_${classroomId}`]: {
    dailyPeriods: { [day: string]: number };
    hasEighthPeriod: boolean;
  };
  [`subjects_${classroomId}`]: Subject[];
}
```

**مثال على الحفظ:**

```tsx
// حفظ الفصول
localStorage.setItem(
  `classrooms_stage_${activeGrade.id}`, 
  JSON.stringify(classrooms)
);

// قراءة الفصول
const savedData = localStorage.getItem(`classrooms_stage_${activeGrade?.id}`);
if (savedData) {
  const savedClassrooms = JSON.parse(savedData);
  setClassrooms(savedClassrooms);
}
```

---

### 4. خوارزمية توزيع الفصول

**الدالة الرئيسية:**

```tsx
const calculateClassroomDistribution = (totalClassrooms: number, gradesCount: number) => {
  const classroomsPerGrade = Math.floor(totalClassrooms / gradesCount);
  const remainder = totalClassrooms % gradesCount;
  
  const distribution: number[] = [];
  for (let i = 0; i < gradesCount; i++) {
    // توزيع الفائض على الصفوف الأولى
    distribution.push(classroomsPerGrade + (i < remainder ? 1 : 0));
  }
  
  return distribution;
};
```

**مثال عملي:**
```tsx
// 24 فصل ÷ 6 صفوف
Input: totalClassrooms = 24, gradesCount = 6
Output: [4, 4, 4, 4, 4, 4]  // 4 فصول لكل صف

// 25 فصل ÷ 6 صفوف
Input: totalClassrooms = 25, gradesCount = 6
Output: [5, 4, 4, 4, 4, 4]  // الفائض يذهب للصف الأول
```

---

### 5. خوارزمية الترتيب التلقائي

**دالة الترتيب:**

```tsx
const sortedClassrooms = classrooms.sort((a, b) => {
  // الترتيب الأول: حسب الصف
  if (a.grade_level !== b.grade_level) {
    return a.grade_level - b.grade_level;
  }
  // الترتيب الثاني: حسب القسم
  return parseInt(a.section) - parseInt(b.section);
});
```

**النتيجة:**
```
1/1, 1/2, 1/3, 2/1, 2/2, 2/3, 3/1, 3/2...
```

---

### 6. إنشاء الفصول التلقائية

**منطق الإنشاء عند التحميل:**

```tsx
const loadClassrooms = async (gradeLevel: number) => {
  const savedData = localStorage.getItem(`classrooms_stage_${activeGrade?.id}`);
  
  if (!savedData && activeGrade) {
    // إنشاء فصول تلقائية
    const defaultClassrooms: Classroom[] = [];
    
    for (let gradeIndex = 1; gradeIndex <= activeGrade.gradesCount; gradeIndex++) {
      defaultClassrooms.push({
        id: `${activeGrade.id}_${gradeIndex}_1_${Date.now()}_${gradeIndex}`,
        name: `${gradeIndex}/1`,
        grade_level: gradeIndex,
        section: '1',
        // ... بقية الخصائص
      });
    }
    
    setClassrooms(defaultClassrooms);
    localStorage.setItem(`classrooms_stage_${activeGrade.id}`, JSON.stringify(defaultClassrooms));
  }
};
```

---

## 🎨 التحسينات البصرية (Styling)

### نظام الألوان المحدّث

```tsx
// الألوان الرئيسية
const colors = {
  primary: {
    dark: '#4f46e5',    // Indigo 600
    main: '#6366f1',     // Indigo 500
    light: '#818cf8',    // Indigo 400
  },
  // استخدام gradients للأناقة
  gradient: 'from-[#4f46e5] to-[#6366f1]',
};
```

### الأنماط المستخدمة

```tsx
// زر إضافة فصل
<Button 
  style={{ 
    backgroundColor: '#818cf8', 
    color: 'white', 
    borderColor: '#818cf8' 
  }}
  className="hover:opacity-90 transition-all"
/>

// بطاقة تحديد عدد الفصول
<CardHeader className="bg-gradient-to-r from-[#4f46e5] to-[#6366f1]">
  <CardTitle className="text-white">
    {/* المحتوى */}
  </CardTitle>
</CardHeader>
```

---

## 🔌 الـ APIs والـ Interfaces

### واجهات البيانات (TypeScript Interfaces)

```typescript
interface Classroom {
  id: string;
  name: string;
  grade_level: number;
  section: string;
  room_number?: string;
  capacity: number;
  class_teacher_id?: string;
  semester: string;
  education_type: 'general' | 'memorization';
  status: 'active' | 'inactive';
  notes?: string;
  subjects?: Subject[];
  created_at: string;
  updated_at: string;
}

interface Subject {
  id: string;
  name: string;
  code: string;
  weekly_hours: number;
  is_assigned: boolean;
}

interface Grade {
  id: string;
  level: number;
  name: string;
  stage: 'kindergarten' | 'primary' | 'middle' | 'secondary';
  education_type: 'general' | 'memorization';
  subjects: Subject[];
  gradesCount: number;
}
```

---

## 🔐 State Management

### الحالات الرئيسية

```tsx
// في ClassroomManagement.tsx
const [grades, setGrades] = useState<Grade[]>([]);
const [activeGrade, setActiveGrade] = useState<Grade | null>(null);
const [classrooms, setClassrooms] = useState<Classroom[]>([]);
const [classroomCount, setClassroomCount] = useState<number>(0);
const [isLoading, setIsLoading] = useState(false);

// حالات مربع الحوار
const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
const [confirmDialogData, setConfirmDialogData] = useState<ConfirmDialogData | null>(null);

// حالات الإضافة اليدوية
const [isAddingNewClass, setIsAddingNewClass] = useState(false);
const [newClassroomName, setNewClassroomName] = useState('');
```

---

## 🧪 الاختبار والتحقق

### قائمة التحقق من الوظائف

```typescript
// Test Cases
describe('ClassroomManagement', () => {
  test('إنشاء فصول تلقائية عند التحميل', () => {
    // التحقق من إنشاء فصل واحد لكل صف
  });
  
  test('توزيع الفصول بشكل صحيح', () => {
    expect(calculateClassroomDistribution(24, 6)).toEqual([4,4,4,4,4,4]);
  });
  
  test('ترتيب الفصول بشكل صحيح', () => {
    // التحقق من الترتيب حسب الصف ثم القسم
  });
  
  test('الحفظ والقراءة من localStorage', () => {
    // التحقق من حفظ وقراءة البيانات
  });
});
```

---

## 📱 التوافق مع الأجهزة (Responsive)

### Breakpoints المستخدمة

```tsx
// Tailwind CSS breakpoints
const breakpoints = {
  sm: '640px',   // Phones
  md: '768px',   // Tablets
  lg: '1024px',  // Laptops
  xl: '1280px',  // Desktops
};

// أمثلة
className="flex flex-col sm:flex-row"  // عمودي على الجوال، أفقي على الكمبيوتر
className="w-full sm:w-auto"           // عرض كامل على الجوال، تلقائي على الكمبيوتر
```

---

## 🚀 الأداء (Performance)

### التحسينات المطبقة

1. **Lazy Loading للصفحات**
   ```tsx
   // التحميل الكسول للصفحات المنفصلة
   const ClassroomScheduleSetup = React.lazy(() => 
     import('./pages/InitialSettings/ClassroomScheduleSetup')
   );
   ```

2. **Memoization**
   ```tsx
   const sortedClassrooms = useMemo(() => {
     return classrooms.sort(...);
   }, [classrooms]);
   ```

3. **تحسين re-renders**
   ```tsx
   // استخدام useCallback للدوال
   const handleSave = useCallback(() => {
     // ...
   }, [dependencies]);
   ```

---

## 🔄 دورة الحياة (Lifecycle)

### تدفق البيانات

```
1. المستخدم يفتح الصفحة
   ↓
2. تحميل المراحل من SchoolContext
   ↓
3. اختيار مرحلة → useEffect يُشغّل loadClassrooms
   ↓
4. التحقق من localStorage
   ├─ موجود: تحميل البيانات
   └─ غير موجود: إنشاء فصول تلقائية
   ↓
5. عرض الفصول للمستخدم
   ↓
6. المستخدم يُجري تعديلات
   ↓
7. الحفظ في localStorage
   ↓
8. تحديث الواجهة
```

---

## 🐛 التعامل مع الأخطاء

### نظام معالجة الأخطاء

```tsx
const generateClassrooms = async () => {
  setIsLoading(true);
  try {
    // العملية الرئيسية
    const newClassrooms = createClassrooms();
    setClassrooms(newClassrooms);
    
    // إظهار رسالة نجاح
    toast({
      title: "نجح",
      description: "تم إنشاء الفصول بنجاح",
    });
  } catch (error) {
    // معالجة الخطأ
    showConfirmDialog({
      title: "خطأ",
      description: "فشلت العملية، يرجى المحاولة مرة أخرى",
      variant: 'destructive',
      onConfirm: () => {}
    });
  } finally {
    setIsLoading(false);
  }
};
```

---

## 📦 الاعتماديات (Dependencies)

### المكتبات المستخدمة

```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-router-dom": "^6.x",
    "lucide-react": "^0.x",
    "@radix-ui/react-dialog": "^1.x",
    "@radix-ui/react-tabs": "^1.x"
  }
}
```

---

## 🔮 التطويرات المستقبلية

### ميزات مقترحة

1. **Drag & Drop لترتيب الفصول**
   ```tsx
   import { DndContext } from '@dnd-kit/core';
   
   // السماح بسحب وإسقاط الفصول لإعادة ترتيبها
   ```

2. **استيراد/تصدير الفصول**
   ```tsx
   // تصدير إلى Excel
   const exportToExcel = () => {
     const data = classrooms.map(c => ({ ... }));
     XLSX.writeFile(workbook, 'classrooms.xlsx');
   };
   ```

3. **نسخ الإعدادات بين الفصول**
   ```tsx
   const copySettings = (fromId: string, toId: string) => {
     // نسخ الحصص والمواد
   };
   ```

---

## 📝 ملاحظات للمطورين

### Best Practices

1. **استخدم TypeScript بشكل صارم**
   ```tsx
   // ✅ جيد
   const classroom: Classroom = { ... };
   
   // ❌ سيء
   const classroom: any = { ... };
   ```

2. **معالجة الأخطاء دائماً**
   ```tsx
   // ✅ جيد
   try {
     await saveData();
   } catch (error) {
     handleError(error);
   }
   
   // ❌ سيء
   await saveData(); // بدون معالجة أخطاء
   ```

3. **استخدم التعليقات المفيدة**
   ```tsx
   // ✅ جيد
   // توزيع الفصول بالتساوي على الصفوف مع إضافة الفائض للصفوف الأولى
   
   // ❌ سيء
   // حلقة
   ```

---

## 🔗 الروابط المفيدة

- [React Router Documentation](https://reactrouter.com/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)

---

## 📞 الدعم الفني للمطورين

للأسئلة أو المساعدة التقنية:
- راجع التوثيق الفني
- تحقق من الأمثلة في الكود
- استخدم TypeScript للاستفادة من IntelliSense

---

**آخر تحديث**: 6 نوفمبر 2025
**الإصدار**: 2.0
**المطوّر**: نظام MOTABEA
