# دليل المطور - نظام الكشوف

## البنية التقنية

### Frontend Structure

```
src/
├── pages/Dashboard/
│   ├── StudentReportsPage.tsx          # صفحة عرض جميع الكشوف
│   ├── CreateStudentReportPage.tsx     # صفحة إنشاء/تعديل كشف
│   └── ViewStudentReportPage.tsx       # صفحة عرض وتعبئة الكشف
├── components/Layout/
│   └── Sidebar.tsx                     # القائمة الجانبية (تم إضافة قسم كشوف)
└── App.tsx                             # مسارات التطبيق (تم إضافة المسارات)
```

### Backend Structure

```
server/
├── routes/
│   └── studentReports.js               # API endpoints للكشوف
└── index.js                            # تسجيل المسارات (تم التعديل)
```

---

## API Endpoints

### 1. جلب جميع الكشوف
```javascript
GET /api/student-reports

Headers:
  Authorization: Bearer {token}

Response: 200 OK
[
  {
    id: string,
    name: string,
    className: string,
    sectionName: string,
    subjectName: string,
    columns: Column[],
    createdAt: string,
    updatedAt: string
  }
]
```

### 2. جلب كشف معين
```javascript
GET /api/student-reports/:id

Headers:
  Authorization: Bearer {token}

Response: 200 OK
{
  id: string,
  name: string,
  className: string,
  sectionName: string,
  subjectName: string,
  columns: Column[],
  students: Student[],
  grades: { [studentId]: { [columnId]: value } },
  createdAt: string,
  updatedAt: string
}
```

### 3. إنشاء كشف جديد
```javascript
POST /api/student-reports

Headers:
  Authorization: Bearer {token}
  Content-Type: application/json

Body:
{
  name: string,
  classId: string,
  sectionId: string,
  subjectId: string,
  columns: [
    {
      name: string,
      hasGrade: boolean,
      maxGrade?: number
    }
  ]
}

Response: 201 Created
{
  id: string,
  ...
}
```

### 4. تحديث كشف
```javascript
PUT /api/student-reports/:id

Headers:
  Authorization: Bearer {token}
  Content-Type: application/json

Body:
{
  name: string,
  classId: string,
  sectionId: string,
  subjectId: string,
  columns: Column[]
}

Response: 200 OK
```

### 5. حذف كشف
```javascript
DELETE /api/student-reports/:id

Headers:
  Authorization: Bearer {token}

Response: 200 OK
{
  message: "Report deleted successfully"
}
```

### 6. حفظ الدرجات
```javascript
PUT /api/student-reports/:id/grades

Headers:
  Authorization: Bearer {token}
  Content-Type: application/json

Body:
{
  grades: {
    [studentId]: {
      [columnId]: value
    }
  }
}

Response: 200 OK
{
  message: "Grades saved successfully",
  grades: {...}
}
```

---

## Types & Interfaces

### Column
```typescript
interface Column {
  id: string;
  name: string;
  hasGrade: boolean;
  maxGrade?: number;
}
```

### Student
```typescript
interface Student {
  id: string;
  name: string;
  number: number;
}
```

### StudentReport
```typescript
interface StudentReport {
  id: string;
  name: string;
  subjectName: string;
  className: string;
  sectionName: string;
  columns: Column[];
  createdAt: string;
  updatedAt: string;
}
```

### ReportData (للعرض)
```typescript
interface ReportData {
  id: string;
  name: string;
  subjectName: string;
  className: string;
  sectionName: string;
  columns: Column[];
  students: Student[];
  grades: { [studentId: string]: { [columnId: string]: string } };
}
```

---

## Component Props

### StudentReportsPage
```typescript
// لا يوجد props - صفحة مستقلة
```

### CreateStudentReportPage
```typescript
// لا يوجد props - تستخدم useParams() للحصول على id في حالة التعديل
```

### ViewStudentReportPage
```typescript
// لا يوجد props - تستخدم useParams() للحصول على id
```

---

## State Management

### StudentReportsPage
```typescript
const [reports, setReports] = useState<StudentReport[]>([]);
const [loading, setLoading] = useState(false);
const [searchTerm, setSearchTerm] = useState('');
const [filterClass, setFilterClass] = useState('all');
const [filterSubject, setFilterSubject] = useState('all');
const [showCreateModal, setShowCreateModal] = useState(false);
```

### CreateStudentReportPage
```typescript
const [reportName, setReportName] = useState('');
const [selectedClass, setSelectedClass] = useState('');
const [selectedSection, setSelectedSection] = useState('');
const [selectedSubject, setSelectedSubject] = useState('');
const [columns, setColumns] = useState<Column[]>([]);
const [classrooms, setClassrooms] = useState<Classroom[]>([]);
const [subjects, setSubjects] = useState<Subject[]>([]);
const [loading, setLoading] = useState(false);
const [saving, setSaving] = useState(false);
```

### ViewStudentReportPage
```typescript
const [report, setReport] = useState<ReportData | null>(null);
const [grades, setGrades] = useState<{ [studentId: string]: { [columnId: string]: string } }>({});
const [loading, setLoading] = useState(true);
const [saving, setSaving] = useState(false);
const [editMode, setEditMode] = useState(false);
```

---

## Data Flow

### إنشاء كشف جديد

```
User Input (Form)
    ↓
Validation
    ↓
POST /api/student-reports
    ↓
Server validates & creates report
    ↓
Returns report with ID
    ↓
Navigate to /dashboard/student-reports/:id
    ↓
Fetch students for class/section
    ↓
Display report with student names
```

### تعبئة البيانات

```
User opens report
    ↓
GET /api/student-reports/:id
    ↓
Display report with empty/existing grades
    ↓
User enters "Edit Mode"
    ↓
User fills in data
    ↓
User clicks "Save"
    ↓
PUT /api/student-reports/:id/grades
    ↓
Server saves grades
    ↓
Success message
    ↓
Refresh data
```

---

## Helper Functions

### في CreateStudentReportPage

```typescript
// إضافة عمود جديد
const addColumn = () => {
  const newColumn: Column = {
    id: `col-${Date.now()}`,
    name: '',
    hasGrade: false,
    maxGrade: undefined
  };
  setColumns([...columns, newColumn]);
};

// حذف عمود
const removeColumn = (id: string) => {
  setColumns(columns.filter(col => col.id !== id));
};

// تحديث عمود
const updateColumn = (id: string, field: keyof Column, value: any) => {
  setColumns(columns.map(col => 
    col.id === id ? { ...col, [field]: value } : col
  ));
};
```

### في ViewStudentReportPage

```typescript
// تحديث درجة طالب
const handleGradeChange = (studentId: string, columnId: string, value: string) => {
  setGrades(prev => ({
    ...prev,
    [studentId]: {
      ...(prev[studentId] || {}),
      [columnId]: value
    }
  }));
};

// حساب المجموع لطالب
const calculateTotal = (studentId: string) => {
  if (!report) return 0;
  
  let total = 0;
  report.columns.forEach(col => {
    if (col.hasGrade) {
      const grade = parseFloat(grades[studentId]?.[col.id] || '0');
      total += grade;
    }
  });
  return total;
};

// حساب المجموع الأعظمي
const calculateMaxTotal = () => {
  if (!report) return 0;
  
  let total = 0;
  report.columns.forEach(col => {
    if (col.hasGrade && col.maxGrade) {
      total += col.maxGrade;
    }
  });
  return total;
};
```

---

## Styling

### Tailwind Classes المستخدمة بكثرة

```css
/* Buttons */
.btn-primary: bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700

/* Cards */
.card: bg-white rounded-lg shadow-sm border border-gray-200

/* Inputs */
.input: px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500

/* Tables */
.table-cell: border-2 border-gray-400 px-3 py-3 text-center
```

### Print Styles

```css
.print:hidden    /* مخفي عند الطباعة */
.hidden.print:block    /* يظهر فقط عند الطباعة */
```

---

## Testing

### Manual Testing Checklist

- [ ] إنشاء كشف جديد
- [ ] عرض قائمة الكشوف
- [ ] البحث في الكشوف
- [ ] التصفية حسب الفصل
- [ ] التصفية حسب المادة
- [ ] فتح كشف
- [ ] تعبئة البيانات
- [ ] حفظ البيانات
- [ ] حساب المجاميع
- [ ] طباعة الكشف
- [ ] تعديل تصميم الكشف
- [ ] حذف كشف

---

## Known Limitations

### حالياً
- ❌ لا يوجد تصدير إلى Excel (قادم)
- ❌ لا يوجد تصدير إلى PDF (قادم)
- ✅ البيانات مؤقتة في الذاكرة (يجب ربطها بقاعدة بيانات حقيقية)

### للمستقبل
- إضافة قوالب جاهزة للكشوف
- نسخ كشف موجود
- إحصائيات وتقارير
- رسوم بيانية

---

## Performance Considerations

### Frontend
- استخدام `useMemo` لحساب المجاميع (إذا لزم الأمر)
- Lazy loading للصور والمكونات الكبيرة
- Debouncing للبحث

### Backend
- التخزين المؤقت (Caching) لبيانات الفصول والمواد
- Pagination لقوائم الكشوف الكبيرة
- Database indexing على الحقول المستخدمة في البحث

---

## Security Considerations

✅ **متضمن حالياً:**
- JWT Authentication لجميع endpoints
- ربط الكشوف بالمدرسة
- التحقق من ملكية الكشف قبل التعديل/الحذف

⚠️ **يجب إضافته:**
- Rate limiting محدد لكل endpoint
- Input sanitization
- XSS protection
- CSRF protection

---

## Database Schema (للمستقبل)

عند الانتقال إلى قاعدة بيانات حقيقية:

### جدول student_reports
```sql
CREATE TABLE student_reports (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  school_id VARCHAR(36) NOT NULL,
  class_id VARCHAR(36) NOT NULL,
  section_id VARCHAR(36) NOT NULL,
  subject_id VARCHAR(36) NOT NULL,
  columns JSON NOT NULL,
  created_by VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (school_id) REFERENCES schools(id),
  FOREIGN KEY (class_id) REFERENCES classes(id),
  FOREIGN KEY (section_id) REFERENCES sections(id),
  FOREIGN KEY (subject_id) REFERENCES subjects(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);
```

### جدول report_grades
```sql
CREATE TABLE report_grades (
  id VARCHAR(36) PRIMARY KEY,
  report_id VARCHAR(36) NOT NULL,
  student_id VARCHAR(36) NOT NULL,
  column_id VARCHAR(36) NOT NULL,
  value VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (report_id) REFERENCES student_reports(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES students(id),
  UNIQUE KEY (report_id, student_id, column_id)
);
```

---

## Deployment Notes

### Environment Variables
```
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000
JWT_SECRET=your-secret-key
```

### Build Commands
```bash
# Frontend
npm run build

# Backend
# لا يحتاج build - يعمل مباشرة مع Node.js
```

---

## Troubleshooting

### مشكلة: لا تظهر الكشوف
**الحل:**
- تأكد من تسجيل الدخول
- تأكد من وجود token صالح
- تحقق من Console للأخطاء

### مشكلة: لا يتم حفظ البيانات
**الحل:**
- تأكد من أن الخادم الخلفي يعمل
- تحقق من Network tab في المتصفح
- تأكد من صحة البيانات المُرسلة

### مشكلة: أسماء الطلاب لا تظهر
**الحل:**
- تأكد من وجود طلاب في الفصل والشعبة المحددة
- تحقق من دالة `getStudentsByClassAndSection`

---

## Contributing

عند إضافة ميزات جديدة:
1. اتبع نمط الكود الحالي
2. أضف التعليقات بالعربية
3. حدّث التوثيق
4. اختبر جميع الحالات

---

**آخر تحديث**: 12 أكتوبر 2025
**الإصدار**: 1.0.0
