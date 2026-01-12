# دليل تطبيق خوارزمية التتابع (Consecutive Periods)

## 📋 نظرة عامة

تم تحديث واجهة إعدادات التتابع في `ScheduleSettingsFinal.tsx` لتشمل شروطاً صارمة جديدة. يجب الآن تحديث خوارزمية توليد الجدول في `SmartTimetablePage.tsx` لتطبيق هذه الشروط.

---

## 🎯 المتطلبات الجديدة

### 1. شرط التحقق من النصاب (Validation Logic)

**القاعدة:** يجب أن يكون نصاب المادة الأسبوعي ≥ 2 حصص للسماح بالتتابع

```typescript
// في SUBJECTS array - تم إضافة periodsPerWeek لكل مادة
const SUBJECTS = [
  { id: 1, name: 'الرياضيات', periodsPerWeek: 5 },     // ✅ يمكن تطبيق التتابع
  { id: 2, name: 'العلوم', periodsPerWeek: 4 },         // ✅ يمكن تطبيق التتابع
  { id: 6, name: 'الاجتماعيات', periodsPerWeek: 2 },   // ✅ يمكن تطبيق التتابع
  { id: 10, name: 'الفنية', periodsPerWeek: 1 },       // ❌ لا يمكن تطبيق التتابع
];
```

**التطبيق في الواجهة:**
- المواد ذات النصاب < 2 تظهر باللون الرمادي
- عند محاولة اختيارها تظهر رسالة تحذير
- يتم منع إضافتها للقائمة

### 2. منطق بناء الجدول (Generation Logic)

**القاعدة الأساسية:** حصتان متتابعتان **مرة واحدة فقط** في الأسبوع

#### مثال: مادة الرياضيات (5 حصص)

**✅ التوزيع الصحيح:**
```
الأسبوع:
- الأحد: [حصة رياضيات][حصة رياضيات متتابعة] ← Block of 2
- الاثنين: [حصة رياضيات منفردة]
- الثلاثاء: [حصة رياضيات منفردة]
- الأربعاء: [حصة رياضيات منفردة]
```

**❌ التوزيع الخاطئ:**
```
الأسبوع:
- الأحد: [حصة رياضيات][حصة رياضيات متتابعة] ← Block 1
- الثلاثاء: [حصة رياضيات][حصة رياضيات متتابعة] ← Block 2 (خطأ!)
- الخميس: [حصة رياضيات منفردة]
```

### 3. قيود إضافية

- **الحد الأقصى للمواد المتتابعة:** لا يمكن اختيار أكثر من 3 مواد للتتابع
- **اختيار الفصول:** يمكن تطبيق التتابع على فصول محددة أو جميع الفصول
- **الأولوية:** التتابع له أولوية في التوزيع قبل الحصص المنفردة

---

## 🔧 خطوات التطبيق في SmartTimetablePage.tsx

### المرحلة 1: قراءة الإعدادات المحفوظة

```typescript
// في بداية Component أو useEffect
const loadConsecutiveSettings = () => {
  const savedSettings = localStorage.getItem('scheduleConsecutiveSettings');
  if (savedSettings) {
    const settings = JSON.parse(savedSettings);
    return {
      subjects: settings.subjects || [],      // IDs of subjects to apply consecutive
      classes: settings.classes || [],        // IDs of classes to apply to
      enabled: settings.enabled || false
    };
  }
  return { subjects: [], classes: [], enabled: false };
};

const consecutiveSettings = loadConsecutiveSettings();
```

### المرحلة 2: تعديل دالة handleAutoGenerate

```typescript
const handleAutoGenerate = async () => {
  setIsGenerating(true);
  setProgressPercentage(0);
  
  try {
    const consecutiveSettings = loadConsecutiveSettings();
    const newSessions: ClassSession[] = [];
    let sessionId = 1;
    
    // لكل فصل
    classes.forEach(classItem => {
      // تحقق من إذا كان الفصل مشمولاً في إعدادات التتابع
      const applyConsecutive = consecutiveSettings.classes.length === 0 || 
                               consecutiveSettings.classes.includes(classItem.id);
      
      // لكل مادة
      subjects.forEach(subject => {
        // تحقق من إذا كانت المادة مفعلة للتتابع
        const isConsecutiveSubject = consecutiveSettings.subjects.includes(subject.id);
        const canBeConsecutive = subject.periodsPerWeek >= 2;
        
        if (isConsecutiveSubject && canBeConsecutive && applyConsecutive) {
          // تطبيق منطق التتابع: حصتان متتابعتان + حصص منفردة
          addConsecutivePeriod(newSessions, classItem, subject, 2); // Block of 2
          
          // باقي الحصص منفردة
          const remainingPeriods = subject.periodsPerWeek - 2;
          for (let i = 0; i < remainingPeriods; i++) {
            addSinglePeriod(newSessions, classItem, subject);
          }
        } else {
          // توزيع عادي (كل الحصص منفردة)
          for (let i = 0; i < subject.periodsPerWeek; i++) {
            addSinglePeriod(newSessions, classItem, subject);
          }
        }
      });
    });
    
    setSessions(newSessions);
    setCanUndo(true);
  } catch (error) {
    console.error('خطأ في الإنشاء التلقائي:', error);
  } finally {
    setIsGenerating(false);
  }
};
```

### المرحلة 3: دوال مساعدة

```typescript
// دالة لإضافة حصتين متتابعتين
const addConsecutivePeriod = (
  sessions: ClassSession[], 
  classItem: Class, 
  subject: Subject, 
  count: number
) => {
  const teacher = teachers.find(t => t.subjects.includes(subject.name));
  if (!teacher) return;
  
  // البحث عن حصتين متتابعتين متاحتين
  const consecutiveSlot = findConsecutiveTimeSlots(sessions, classItem, teacher, count);
  
  if (consecutiveSlot) {
    for (let i = 0; i < count; i++) {
      sessions.push({
        id: (sessions.length + 1).toString(),
        teacherId: teacher.id,
        classId: classItem.id,
        subjectId: subject.id,
        timeSlotId: consecutiveSlot[i].id,
        type: 'basic',
        isLocked: false
      });
    }
  }
};

// دالة لإضافة حصة منفردة
const addSinglePeriod = (
  sessions: ClassSession[], 
  classItem: Class, 
  subject: Subject
) => {
  const teacher = teachers.find(t => t.subjects.includes(subject.name));
  if (!teacher) return;
  
  // البحث عن فترة زمنية متاحة
  const availableSlot = findAvailableTimeSlot(sessions, classItem, teacher);
  
  if (availableSlot) {
    sessions.push({
      id: (sessions.length + 1).toString(),
      teacherId: teacher.id,
      classId: classItem.id,
      subjectId: subject.id,
      timeSlotId: availableSlot.id,
      type: 'basic',
      isLocked: false
    });
  }
};

// دالة للبحث عن فترتين زمنيتين متتابعتين
const findConsecutiveTimeSlots = (
  sessions: ClassSession[],
  classItem: Class,
  teacher: Teacher,
  count: number
): TimeSlot[] | null => {
  // البحث في كل يوم
  for (const day of daysOfWeek) {
    // البحث عن حصص متتابعة
    for (let period = 1; period <= periodsPerDay - count + 1; period++) {
      const slots: TimeSlot[] = [];
      let allAvailable = true;
      
      // تحقق من توفر الحصص المتتابعة
      for (let i = 0; i < count; i++) {
        const slotId = `${day}-${period + i}`;
        const slot = timeSlots.find(ts => ts.id === slotId);
        
        if (!slot) {
          allAvailable = false;
          break;
        }
        
        // تحقق من عدم وجود تعارض للمعلم أو الفصل
        const hasConflict = sessions.some(s => 
          s.timeSlotId === slotId && 
          (s.teacherId === teacher.id || s.classId === classItem.id)
        );
        
        if (hasConflict) {
          allAvailable = false;
          break;
        }
        
        slots.push(slot);
      }
      
      if (allAvailable && slots.length === count) {
        return slots;
      }
    }
  }
  
  return null;
};

// دالة للبحث عن فترة زمنية واحدة متاحة
const findAvailableTimeSlot = (
  sessions: ClassSession[],
  classItem: Class,
  teacher: Teacher
): TimeSlot | null => {
  // ابحث عشوائياً أو بترتيب محدد
  const shuffledSlots = [...timeSlots].sort(() => Math.random() - 0.5);
  
  for (const slot of shuffledSlots) {
    // تحقق من عدم وجود تعارض
    const hasConflict = sessions.some(s => 
      s.timeSlotId === slot.id && 
      (s.teacherId === teacher.id || s.classId === classItem.id)
    );
    
    if (!hasConflict) {
      return slot;
    }
  }
  
  return null;
};
```

---

## ✅ قائمة التحقق (Checklist)

### في ScheduleSettingsFinal.tsx (تم ✓)
- [x] إضافة `periodsPerWeek` لكل مادة
- [x] إضافة متغير `selectedConsecutiveClasses`
- [x] تحديث واجهة اختيار المواد مع التحقق من النصاب
- [x] إضافة قائمة الفصول بدلاً من الملاحظات
- [x] تحديث الشرح التوضيحي
- [x] إضافة قيد 3 مواد كحد أقصى
- [x] حفظ الإعدادات في localStorage
- [x] تحميل الإعدادات المحفوظة

### في SmartTimetablePage.tsx (يحتاج تطبيق)
- [ ] قراءة الإعدادات من localStorage
- [ ] تعديل دالة `handleAutoGenerate`
- [ ] إضافة دالة `addConsecutivePeriod`
- [ ] إضافة دالة `addSinglePeriod`
- [ ] إضافة دالة `findConsecutiveTimeSlots`
- [ ] إضافة دالة `findAvailableTimeSlot`
- [ ] تحديث منطق التحقق من التعارضات
- [ ] اختبار الخوارزمية

---

## 📝 ملاحظات مهمة

1. **الأولوية:** يجب جدولة الحصص المتتابعة أولاً قبل الحصص المنفردة لضمان توفر المساحة
2. **التعارضات:** تحقق من عدم تعارض المعلم والفصل في نفس الوقت
3. **المرونة:** إذا لم تتوفر حصص متتابعة، يجب تحويل جميع الحصص لمنفردة
4. **التوثيق:** أضف console.log لتتبع عملية التوليد وتصحيح الأخطاء

---

## 🧪 اختبار الخوارزمية

### سيناريوهات الاختبار:

1. **مادة بحصتين فقط:**
   - النتيجة المتوقعة: حصتان متتابعتان فقط
   
2. **مادة بـ 5 حصص:**
   - النتيجة المتوقعة: block of 2 + 3 حصص منفردة
   
3. **مادة بحصة واحدة:**
   - النتيجة المتوقعة: حصة منفردة واحدة (لا تتابع)
   
4. **3 مواد متتابعة:**
   - النتيجة المتوقعة: يجب أن يعمل بشكل صحيح
   
5. **محاولة اختيار مادة رابعة:**
   - النتيجة المتوقعة: رسالة تحذير ومنع الاختيار

---

## 📞 الدعم والمساعدة

للأسئلة أو المشاكل في التطبيق، راجع:
- الكود الموجود في `ScheduleSettingsFinal.tsx` (السطور 134-144، 283، 2778-2950)
- دالة `saveChanges` (السطر 1192)
- دالة التحميل في `useEffect` (السطر 681)

---

تاريخ التحديث: نوفمبر 20، 2025
