# Daily Supervision System - Technical Documentation

## 🏗️ Architecture Overview

### Technology Stack
- **Frontend**: React 18.3.1 + TypeScript 5.5.3
- **Styling**: Tailwind CSS 3.4.11
- **Icons**: Lucide React
- **Routing**: React Router DOM
- **State Management**: React Hooks (useState)

### Project Structure

```
src/
├── types/
│   └── dailySupervision.ts                 # TypeScript interfaces and types
├── components/
│   └── DailySupervision/
│       ├── SupervisionSettingsDialog.tsx   # Settings modal component
│       ├── CreateSupervisionTableDialog.tsx # Table creation wizard
│       ├── ActivationTrackingDialog.tsx    # Activation tracking modal
│       └── ReportsDialog.tsx               # Reports generation modal
└── pages/
    └── Dashboard/
        └── DailySupervisionPage.tsx        # Main page component
```

## 📦 Components

### 1. DailySupervisionPage (Main Component)

**Location**: `src/pages/Dashboard/DailySupervisionPage.tsx`

**State Management**:
```typescript
const [showSettingsDialog, setShowSettingsDialog] = useState(false);
const [showCreateDialog, setShowCreateDialog] = useState(false);
const [showActivationDialog, setShowActivationDialog] = useState(false);
const [showReportsDialog, setShowReportsDialog] = useState(false);
const [showSendDialog, setShowSendDialog] = useState(false);
const [settings, setSettings] = useState<SupervisionSettings | null>(null);
const [tables, setTables] = useState<SupervisionTable[]>([]);
```

**Key Features**:
- Action bar with 6 buttons
- Dashboard cards showing current state
- Tables list view
- Modal management for all dialogs

**Props**: None (root component)

---

### 2. SupervisionSettingsDialog

**Location**: `src/components/DailySupervision/SupervisionSettingsDialog.tsx`

**Props**:
```typescript
interface SupervisionSettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: SupervisionSettings) => void;
  initialSettings?: SupervisionSettings;
}
```

**Features**:
- Multi-select weekdays with visual feedback
- Dynamic break count (1-4)
- Break timing configuration
- Supervisor count with auto-distribution preview
- Educational affairs vice and principal name inputs
- Form validation

**State**:
```typescript
const [settings, setSettings] = useState<Partial<SupervisionSettings>>({
  weekDays: [],
  breakCount: 1,
  breakTimings: [{ breakNumber: 1, afterLesson: 2 }],
  supervisorCount: 8,
  educationalAffairsVice: '',
  principalName: ''
});
```

---

### 3. CreateSupervisionTableDialog

**Location**: `src/components/DailySupervision/CreateSupervisionTableDialog.tsx`

**Props**:
```typescript
interface CreateSupervisionTableDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (table: SupervisionTable) => void;
  settings: SupervisionSettings;
}
```

**Features**:
- 2-step wizard interface
- Break selection
- Start day and date selection
- Dynamic table generation based on settings
- Copy location to all supervisors feature
- Individual supervisor data entry
- Follow-up supervisor assignment

**State**:
```typescript
const [startDay, setStartDay] = useState('');
const [startDate, setStartDate] = useState('');
const [tableData, setTableData] = useState<SupervisionDayData[]>([]);
const [selectedBreak, setSelectedBreak] = useState(1);
const [step, setStep] = useState(1);
```

---

### 4. ActivationTrackingDialog

**Location**: `src/components/DailySupervision/ActivationTrackingDialog.tsx`

**Props**:
```typescript
interface ActivationTrackingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (activations: SupervisionActivation[]) => void;
}
```

**Features**:
- Single day or week tracking modes
- 5 action types with color coding:
  - Present (green)
  - Absent (red)
  - Excused (yellow)
  - Withdrawn (orange)
  - Late (blue)
- "Mark all present" quick action
- Time input for withdrawn/late actions
- Notes field for each supervisor

**State**:
```typescript
const [trackingMode, setTrackingMode] = useState<'single' | 'week'>('single');
const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
const [activations, setActivations] = useState<{ [key: string]: any }>({});
```

---

### 5. ReportsDialog

**Location**: `src/components/DailySupervision/ReportsDialog.tsx`

**Props**:
```typescript
interface ReportsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}
```

**Features**:
- Weekly or monthly report types
- Date range selection
- Multi-supervisor selection
- Excluded dates (holidays) management
- Statistics calculation:
  - Total days
  - Working days (excluding holidays)
  - Fully activated (100%)
  - Not activated (0%)
  - Partially activated (50%)
  - Activation rate percentage
- Export to PDF
- Print functionality

**State**:
```typescript
const [reportType, setReportType] = useState<'weekly' | 'monthly'>('weekly');
const [startDate, setStartDate] = useState('');
const [endDate, setEndDate] = useState('');
const [selectedSupervisors, setSelectedSupervisors] = useState<string[]>([]);
const [excludedDates, setExcludedDates] = useState<string[]>([]);
const [showReport, setShowReport] = useState(false);
const [reportData, setReportData] = useState<SupervisionReport | null>(null);
```

---

## 📘 Type Definitions

**Location**: `src/types/dailySupervision.ts`

### Main Interfaces

```typescript
interface SupervisionSettings {
  id?: string;
  userId: string;
  weekDays: string[];
  breakCount: number;
  breakTimings: BreakTiming[];
  supervisorCount: number;
  educationalAffairsVice: string;
  principalName: string;
  createdAt?: string;
  updatedAt?: string;
}

interface BreakTiming {
  breakNumber: number;
  afterLesson: number;
}

interface SupervisionTable {
  id?: string;
  userId: string;
  breakNumber: number;
  startDay: string;
  startDate: string;
  supervisorCount: number;
  educationalAffairsVice: string;
  principalName: string;
  tableData: SupervisionDayData[];
  status: 'draft' | 'published' | 'archived';
  createdAt?: string;
  updatedAt?: string;
}

interface SupervisionDayData {
  day: string;
  date?: string;
  supervisors: SupervisorEntry[];
  followupSupervisor?: string;
}

interface SupervisorEntry {
  id?: string;
  name: string;
  position: 'right' | 'left';
  location: string;
  isAutoAssigned: boolean;
  teacherId?: string;
}

interface SupervisionActivation {
  id?: string;
  userId: string;
  tableId: string;
  supervisorId: string;
  supervisorName: string;
  day: string;
  date: string;
  action: 'present' | 'absent' | 'excused' | 'withdrawn' | 'late';
  actionTime?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface SupervisionReport {
  id?: string;
  userId: string;
  supervisorId?: string;
  supervisorName?: string;
  reportType: 'weekly' | 'monthly';
  startDate: string;
  endDate: string;
  excludedDates?: string[];
  statistics: SupervisionStatistics;
  details: SupervisionActivation[];
  pdfUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface SupervisionStatistics {
  totalDays: number;
  workingDays: number;
  fullyActivated: number;
  notActivated: number;
  partiallyActivated: number;
  activationRate: number;
}
```

### Constants

```typescript
export const WEEK_DAYS: WeekDay[] = [
  { nameAr: 'السبت', nameEn: 'Saturday', value: 'saturday' },
  { nameAr: 'الأحد', nameEn: 'Sunday', value: 'sunday' },
  { nameAr: 'الاثنين', nameEn: 'Monday', value: 'monday' },
  { nameAr: 'الثلاثاء', nameEn: 'Tuesday', value: 'tuesday' },
  { nameAr: 'الأربعاء', nameEn: 'Wednesday', value: 'wednesday' },
  { nameAr: 'الخميس', nameEn: 'Thursday', value: 'thursday' },
  { nameAr: 'الجمعة', nameEn: 'Friday', value: 'friday' }
];

export const SUPERVISION_ACTIONS = {
  present: { label: 'حاضر', color: 'green', value: 'present' },
  absent: { label: 'غائب', color: 'red', value: 'absent' },
  excused: { label: 'مستأذن', color: 'yellow', value: 'excused' },
  withdrawn: { label: 'منسحب', color: 'orange', value: 'withdrawn' },
  late: { label: 'متأخر', color: 'blue', value: 'late' }
} as const;
```

---

## 🎨 Styling Guide

### Color Palette

```css
/* Primary Colors */
--primary: #6366f1;        /* Indigo-600 */
--primary-hover: #4f46e5;  /* Indigo-700 */

/* Status Colors */
--success: #10b981;        /* Green-500 */
--warning: #f59e0b;        /* Amber-500 */
--error: #ef4444;          /* Red-500 */
--info: #3b82f6;           /* Blue-500 */

/* Neutral Colors */
--gray-50: #f8fafc;
--gray-100: #f1f5f9;
--gray-200: #e2e8f0;
--gray-300: #cbd5e1;
--gray-600: #475569;
--gray-700: #334155;
--gray-800: #1e293b;
```

### Tailwind Classes Patterns

**Buttons**:
```jsx
className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center gap-2"
```

**Modal Headers**:
```jsx
className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white p-6 rounded-t-lg"
```

**Input Fields**:
```jsx
className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
```

**Cards**:
```jsx
className="bg-white rounded-lg shadow-md p-6 border-2 border-gray-200"
```

---

## 🔌 API Integration Guide

### Required Endpoints

#### 1. Settings Management

**POST** `/api/supervision/settings`
```json
{
  "weekDays": ["sunday", "monday"],
  "breakCount": 2,
  "breakTimings": [
    { "breakNumber": 1, "afterLesson": 2 },
    { "breakNumber": 2, "afterLesson": 4 }
  ],
  "supervisorCount": 8,
  "educationalAffairsVice": "أحمد محمد",
  "principalName": "خالد علي"
}
```

**GET** `/api/supervision/settings/:userId`

**PUT** `/api/supervision/settings/:id`

---

#### 2. Table Management

**POST** `/api/supervision/tables`
```json
{
  "breakNumber": 1,
  "startDay": "sunday",
  "startDate": "2025-11-25",
  "supervisorCount": 8,
  "tableData": [
    {
      "day": "sunday",
      "supervisors": [
        {
          "name": "أحمد محمد",
          "position": "right",
          "location": "الساحة الرئيسية",
          "isAutoAssigned": false
        }
      ],
      "followupSupervisor": "محمد علي"
    }
  ],
  "status": "published"
}
```

**GET** `/api/supervision/tables/:userId`

**GET** `/api/supervision/tables/:id`

**DELETE** `/api/supervision/tables/:id`

**DELETE** `/api/supervision/tables/user/:userId` (Delete all)

---

#### 3. Activation Tracking

**POST** `/api/supervision/activations`
```json
{
  "tableId": "table-123",
  "supervisorId": "sup-456",
  "supervisorName": "أحمد محمد",
  "day": "sunday",
  "date": "2025-11-25",
  "action": "present",
  "actionTime": null,
  "notes": ""
}
```

**POST** `/api/supervision/activations/bulk` (For multiple activations)

**GET** `/api/supervision/activations/:userId?day=sunday&date=2025-11-25`

**PUT** `/api/supervision/activations/:id`

---

#### 4. Reports

**POST** `/api/supervision/reports`
```json
{
  "reportType": "weekly",
  "startDate": "2025-11-18",
  "endDate": "2025-11-25",
  "supervisorIds": ["sup-1", "sup-2"],
  "excludedDates": ["2025-11-20"]
}
```

**GET** `/api/supervision/reports/:userId`

**GET** `/api/supervision/reports/:id/pdf` (Download PDF)

---

#### 5. WhatsApp Notifications

**POST** `/api/supervision/notifications/send`
```json
{
  "recipients": ["all" | "group" | "single"],
  "supervisorIds": ["sup-1", "sup-2"],
  "message": "المعلم/ة الفاضل/ة، نشعركم بأنه تم إسناد مهمة الإشراف اليومي لكم"
}
```

---

## 🔄 Data Flow

### 1. Settings Flow
```
User clicks "إعدادات الإشراف"
  → SupervisionSettingsDialog opens
  → User configures settings
  → User clicks "حفظ"
  → handleSaveSettings(settings)
  → POST /api/supervision/settings
  → Update local state
  → Close dialog
```

### 2. Table Creation Flow
```
User clicks "إنشاء جدول"
  → Check if settings exist
  → CreateSupervisionTableDialog opens
  → Step 1: Select break, day, date
  → Step 2: Fill supervisor data
  → User clicks "إنشاء الجدول"
  → handleCreateTable(table)
  → POST /api/supervision/tables
  → Update local state
  → Close dialog
```

### 3. Activation Tracking Flow
```
User clicks "متابعة التفعيل"
  → ActivationTrackingDialog opens
  → User selects mode (single/week)
  → User selects date(s)
  → User clicks "تحميل المشرفين"
  → GET /api/supervision/supervisors (filtered)
  → Display supervisors
  → User marks actions
  → User clicks "حفظ المتابعة"
  → handleSaveActivation(activations)
  → POST /api/supervision/activations/bulk
  → Close dialog
```

### 4. Report Generation Flow
```
User clicks "التقارير"
  → ReportsDialog opens
  → User configures report parameters
  → User clicks "إنشاء التقرير"
  → POST /api/supervision/reports
  → Calculate statistics
  → Display report
  → User can export PDF or print
```

---

## 🧪 Testing Guidelines

### Unit Tests

**Component Tests**:
```typescript
describe('SupervisionSettingsDialog', () => {
  it('should render correctly', () => {});
  it('should validate required fields', () => {});
  it('should calculate supervisor distribution', () => {});
  it('should save settings', () => {});
});
```

**Integration Tests**:
```typescript
describe('DailySupervisionPage', () => {
  it('should open settings dialog', () => {});
  it('should create table after settings configured', () => {});
  it('should prevent table creation without settings', () => {});
});
```

---

## 📊 Performance Optimization

### Lazy Loading
```typescript
const SupervisionSettingsDialog = lazy(() => 
  import('../components/DailySupervision/SupervisionSettingsDialog')
);
```

### Memoization
```typescript
const memoizedTableData = useMemo(() => {
  return tables.map(table => ({
    ...table,
    // expensive calculations
  }));
}, [tables]);
```

### Debouncing
```typescript
const debouncedSave = useCallback(
  debounce((data) => {
    // Save to API
  }, 500),
  []
);
```

---

## 🔒 Security Considerations

1. **Input Validation**: All user inputs should be validated both client and server-side
2. **Authentication**: Ensure userId is properly authenticated
3. **Authorization**: Check user permissions before CRUD operations
4. **SQL Injection**: Use parameterized queries
5. **XSS Prevention**: Sanitize all text inputs

---

## 🚀 Deployment Checklist

- [ ] Environment variables configured
- [ ] Database tables created
- [ ] API endpoints tested
- [ ] Authentication integrated
- [ ] Error handling implemented
- [ ] Loading states added
- [ ] Responsive design verified
- [ ] Browser compatibility tested
- [ ] Performance optimized
- [ ] Security audit completed

---

## 📝 Future Enhancements

1. **Smart Auto-Assignment**: Integrate with teacher schedules for automatic supervisor assignment
2. **PDF Templates**: Custom professional print templates
3. **Email Notifications**: Send reports via email
4. **Mobile App**: Native mobile application
5. **Analytics Dashboard**: Advanced statistics and charts
6. **Multi-language**: Support for multiple languages
7. **Offline Mode**: PWA with offline capabilities
8. **Real-time Updates**: WebSocket integration for live updates

---

## 🤝 Contributing

For bug reports and feature requests, please create an issue in the project repository.

---

**Developed by**: GitHub Copilot  
**Date**: November 25, 2025  
**Version**: 1.0.0
