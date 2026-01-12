/**
 * وحدة تصدير الجداول المدرسية
 * توفر دوال لتصدير الجدول إلى Excel و HTML بتنسيقات احترافية
 */

import * as XLSX from 'xlsx';

// أنواع البيانات
interface ClassSession {
  id: string;
  teacherId: string;
  classId: string;
  subjectId?: string;
  subject?: string;
  timeSlotId?: string;
  day?: string;       // اختياري
  period?: number;    // اختياري
  type?: 'basic' | 'standby';
  isLocked?: boolean;
  isStandby?: boolean;
}

// الألوان المستخدمة في التصدير
const COLORS = {
  headerBg: '0080C0',      // أزرق للعناوين
  white: 'FFFFFF',          // أبيض
  lightCyan: '80FFFF',      // سماوي فاتح
  lightGray: 'E0E0E0',      // رمادي فاتح
  lightYellow: 'FFFFCC',    // أصفر فاتح للانتظار
  borderGray: '999999',     // رمادي للحدود
  black: '000000',          // أسود
};

// الأيام الدراسية
const DAYS = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'];

// الحصص الدراسية
const PERIODS = [
  { number: 1, startTime: '7:00', endTime: '7:45' },
  { number: 2, startTime: '7:45', endTime: '8:30' },
  { number: 3, startTime: '8:30', endTime: '9:15' },
  { number: 4, startTime: '9:35', endTime: '10:20' },
  { number: 5, startTime: '10:20', endTime: '11:05' },
  { number: 6, startTime: '11:05', endTime: '11:50' },
  { number: 7, startTime: '11:50', endTime: '12:35' },
];

interface Teacher {
  id: string;
  name: string;
  subject?: string;
}

interface Class {
  id: string;
  name: string;
  grade?: string;
}

/**
 * تصدير الجدول إلى Excel
 */
export const exportToExcel = (
  sessions: ClassSession[],
  teachers: Teacher[],
  classes: Class[]
) => {
  try {
    // إنشاء Workbook جديد
    const workbook = XLSX.utils.book_new();

    // إضافة ورقة لكل معلم
    teachers.forEach((teacher) => {
      const worksheet = createTeacherSheet(sessions, teacher, classes);
      XLSX.utils.book_append_sheet(workbook, worksheet, sanitizeSheetName(teacher.name));
    });

    // إضافة ورقة لكل فصل
    classes.forEach((classItem) => {
      const worksheet = createClassSheet(sessions, classItem, teachers);
      XLSX.utils.book_append_sheet(workbook, worksheet, sanitizeSheetName(classItem.name));
    });

    // إضافة ورقة ملخصة
    const summarySheet = createSummarySheet(sessions, teachers, classes);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'الملخص');

    // حفظ الملف
    const fileName = `جدول_المدرسة_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);

    return { success: true, fileName };
  } catch (error) {
    console.error('خطأ في تصدير Excel:', error);
    return { success: false, error: 'فشل تصدير الملف' };
  }
};

/**
 * إنشاء ورقة عمل لجدول معلم
 */
const createTeacherSheet = (
  sessions: ClassSession[],
  teacher: Teacher,
  classes: Class[]
): XLSX.WorkSheet => {
  // إنشاء البيانات
  const data: any[][] = [];

  // صف العنوان
  data.push(['جدول المعلم: ' + teacher.name]);
  data.push([]); // صف فارغ

  // صف رؤوس الأعمدة
  const headerRow = ['الحصة', ...DAYS];
  data.push(headerRow);

  // صفوف الحصص
  PERIODS.forEach((period) => {
    const row: any[] = [
      `الحصة ${period.number}\n${period.startTime}-${period.endTime}`
    ];

    DAYS.forEach((day, dayIndex) => {
      // البحث عن الحصة المناسبة
      const session = sessions.find(
        (s) =>
          s.teacherId === teacher.id &&
          s.day === getDayName(dayIndex) &&
          s.period === period.number
      );

      if (session) {
        const classItem = classes.find((c) => c.id === session.classId);
        row.push(
          `${session.subject}\n${classItem?.name || 'فصل غير معروف'}`
        );
      } else {
        row.push('-');
      }
    });

    data.push(row);
  });

  // تحويل البيانات إلى worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(data);

  // تطبيق التنسيقات
  applyWorksheetFormatting(worksheet, data.length, headerRow.length);

  return worksheet;
};

/**
 * إنشاء ورقة عمل لجدول فصل
 */
const createClassSheet = (
  sessions: ClassSession[],
  classItem: Class,
  teachers: Teacher[]
): XLSX.WorkSheet => {
  // إنشاء البيانات
  const data: any[][] = [];

  // صف العنوان
  data.push(['جدول الفصل: ' + classItem.name]);
  data.push([]); // صف فارغ

  // صف رؤوس الأعمدة
  const headerRow = ['الحصة', ...DAYS];
  data.push(headerRow);

  // صفوف الحصص
  PERIODS.forEach((period) => {
    const row: any[] = [
      `الحصة ${period.number}\n${period.startTime}-${period.endTime}`
    ];

    DAYS.forEach((day, dayIndex) => {
      // البحث عن الحصة المناسبة
      const session = sessions.find(
        (s) =>
          s.classId === classItem.id &&
          s.day === getDayName(dayIndex) &&
          s.period === period.number
      );

      if (session) {
        const teacher = teachers.find((t) => t.id === session.teacherId);
        row.push(
          `${session.subject}\n${teacher?.name || 'معلم غير معروف'}`
        );
      } else {
        row.push('-');
      }
    });

    data.push(row);
  });

  // تحويل البيانات إلى worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(data);

  // تطبيق التنسيقات
  applyWorksheetFormatting(worksheet, data.length, headerRow.length);

  return worksheet;
};

/**
 * إنشاء ورقة الملخص
 */
const createSummarySheet = (
  sessions: ClassSession[],
  teachers: Teacher[],
  classes: Class[]
): XLSX.WorkSheet => {
  const data: any[][] = [];

  data.push(['ملخص الجدول المدرسي']);
  data.push([]);
  data.push(['إحصائيات عامة']);
  data.push([]);
  data.push(['عدد المعلمين:', teachers.length]);
  data.push(['عدد الفصول:', classes.length]);
  data.push(['عدد الحصص المجدولة:', sessions.length]);
  data.push(['عدد الأيام الدراسية:', DAYS.length]);
  data.push(['عدد الحصص اليومية:', PERIODS.length]);
  data.push([]);
  data.push(['تاريخ الإنشاء:', new Date().toLocaleString('ar-SA')]);

  const worksheet = XLSX.utils.aoa_to_sheet(data);

  // تعيين عرض الأعمدة
  worksheet['!cols'] = [{ width: 25 }, { width: 15 }];

  return worksheet;
};

/**
 * تطبيق التنسيقات على ورقة العمل
 */
const applyWorksheetFormatting = (
  worksheet: XLSX.WorkSheet,
  rowCount: number,
  colCount: number
) => {
  // تعيين عرض الأعمدة
  worksheet['!cols'] = [
    { width: 18 }, // عمود الحصة
    ...Array(colCount - 1).fill({ width: 22 }), // أعمدة الأيام
  ];

  // تعيين ارتفاع الصفوف
  worksheet['!rows'] = [
    { hpt: 30 }, // صف العنوان
    { hpt: 10 }, // صف فارغ
    { hpt: 25 }, // صف الرؤوس
    ...Array(rowCount - 3).fill({ hpt: 50 }), // صفوف الحصص
  ];

  // تطبيق تنسيق النص المتعدد الأسطر
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
  for (let R = range.s.r; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
      if (!worksheet[cellAddress]) continue;

      // تفعيل التفاف النص
      if (!worksheet[cellAddress].s) worksheet[cellAddress].s = {};
      worksheet[cellAddress].s.alignment = {
        vertical: 'center',
        horizontal: 'center',
        wrapText: true,
      };
    }
  }
};

/**
 * تنظيف اسم الورقة (Excel لا يقبل بعض الرموز)
 */
const sanitizeSheetName = (name: string): string => {
  return name
    .replace(/[:\\\/\?\*\[\]]/g, '_')
    .substring(0, 31); // Excel يحد الأسماء بـ 31 حرف
};

/**
 * الحصول على اسم اليوم من الفهرس
 */
const getDayName = (dayIndex: number): string => {
  const dayMap: { [key: number]: string } = {
    0: 'sunday',
    1: 'monday',
    2: 'tuesday',
    3: 'wednesday',
    4: 'thursday',
  };
  return dayMap[dayIndex] || 'sunday';
};

/**
 * تصدير الجدول إلى XML (لمنصة مدرستي)
 */
export const exportToHTML = (
  sessions: ClassSession[],
  teachers: Teacher[],
  classes: Class[]
) => {
  try {
    // إنشاء محتوى XML
    const xmlContent = generateXMLContent(sessions, teachers, classes);

    // إنشاء Blob وتحميل الملف
    const blob = new Blob([xmlContent], { type: 'application/xml;charset=windows-1256' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `timetable_${new Date().toISOString().split('T')[0]}.xml`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);

    return { success: true, fileName: link.download };
  } catch (error) {
    console.error('خطأ في تصدير XML:', error);
    return { success: false, error: 'فشل تصدير الملف' };
  }
};

/**
 * توليد محتوى XML بنفس بنية ملف منصة مدرستي
 */
const generateXMLContent = (
  sessions: ClassSession[],
  teachers: Teacher[],
  classes: Class[]
): string => {
  const currentYear = new Date().getFullYear();
  
  let xml = `<?xml version="1.0" encoding="windows-1256"?>
<timetable ascttversion="2026.10.1" importtype="database" options="daynumbering1,idprefix:Motabea" displayname="Motabea XML" displaycountries="sa" displayinmenu="0">
  
  <!-- الأيام الدراسية -->
  <days options="canadd,canremove,canupdate,silent" columns="name,short,day">
    <day name="الأحد" short="الأحد" day="1"/>
    <day name="الإثنين" short="الإثنين" day="2"/>
    <day name="الثلاثاء" short="الثلاثاء" day="3"/>
    <day name="الأربعاء" short="الأربعاء" day="4"/>
    <day name="الخميس" short="الخميس" day="5"/>
  </days>
  
  <!-- الحصص الدراسية -->
  <periods options="canadd,canremove,canupdate,silent" columns="period,starttime,endtime">`;

  PERIODS.forEach(period => {
    xml += `
    <period period="${period.number}" starttime="${period.startTime}" endtime="${period.endTime}"/>`;
  });

  xml += `
  </periods>
  
  <!-- الصفوف الدراسية -->
  <grades options="canadd,canremove,canupdate,silent" columns="id,name,noofperiodsinweek">`;

  // استخراج الصفوف الفريدة
  const uniqueGrades = [...new Set(classes.map(c => c.grade))];
  uniqueGrades.forEach((grade, index) => {
    xml += `
    <grade id="*${index + 1}" name="${grade}"/>`;
  });

  xml += `
  </grades>
  
  <!-- المواد الدراسية -->
  <subjects options="canadd,canremove,canupdate,silent" columns="id,name,short">`;

  // استخراج المواد الفريدة من الجلسات
  const uniqueSubjects = [...new Set(sessions.map(s => s.subject).filter(Boolean))];
  uniqueSubjects.forEach((subject, index) => {
    xml += `
    <subject id="*${index + 1}" name="${subject}" short="${subject}"/>`;
  });

  xml += `
  </subjects>
  
  <!-- المعلمون -->
  <teachers options="canadd,canremove,canupdate,silent" columns="id,name,short,gender,color">`;

  teachers.forEach((teacher, index) => {
    const color = getTeacherColor(index);
    xml += `
    <teacher id="*${index + 1}" name="${teacher.name}" short="${teacher.name}" gender="F" color="${color}"/>`;
  });

  xml += `
  </teachers>
  
  <!-- الفصول -->
  <classrooms options="canadd,canremove,canupdate,silent" columns="id,name,short,capacity">
  </classrooms>
  
  <studentsubjects options="canadd,canremove,canupdate,silent" columns="subjectid,studentid,seminargroup">
  </studentsubjects>
  
  <!-- الفصول الدراسية -->
  <classes options="canadd,canremove,canupdate,silent" columns="id,name,short,teacherid,gradeid">`;

  classes.forEach((classItem, index) => {
    xml += `
    <class id="*${index + 1}" name="${classItem.name}" short="${classItem.name}" teacherid="" gradeid=""/>`;
  });

  xml += `
  </classes>
  
  <students options="canadd,canremove,canupdate,silent" columns="id,name,classid">
  </students>
  
  <!-- البطاقات (الحصص) -->
  <cards options="canadd,canremove,canupdate,silent" columns="day,period,subjectid,teacherid,classroomid,classids,studentids,lessonid">`;

  sessions.forEach((session, index) => {
    const dayNum = getDayNumber(session.day);
    const teacherIndex = teachers.findIndex(t => t.id === session.teacherId) + 1;
    const classIndex = classes.findIndex(c => c.id === session.classId) + 1;
    const subjectIndex = uniqueSubjects.indexOf(session.subject || '') + 1;
    
    xml += `
    <card classids="*${classIndex}" subjectid="*${subjectIndex}" lessonid="*${index + 1}" teacherid="*${teacherIndex}" classroomid="" studentids="" day="${dayNum}" period="${session.period}"/>`;
  });

  xml += `
  </cards>
  
  <!-- الدروس -->
  <lessons options="canadd,canremove,canupdate,silent" columns="id,periodsperweek,subjectid,teacherid,classids,studentids,seminargroup,capacity">`;

  // حساب عدد الحصص لكل معلم/فصل/مادة
  const lessonMap = new Map();
  sessions.forEach(session => {
    const key = `${session.teacherId}-${session.classId}-${session.subject}`;
    lessonMap.set(key, (lessonMap.get(key) || 0) + 1);
  });

  let lessonId = 1;
  lessonMap.forEach((count, key) => {
    const [teacherId, classId, subject] = key.split('-');
    const teacherIndex = teachers.findIndex(t => t.id === teacherId) + 1;
    const classIndex = classes.findIndex(c => c.id === classId) + 1;
    const subjectIndex = uniqueSubjects.indexOf(subject) + 1;
    
    xml += `
    <lesson id="*${lessonId}" classids="*${classIndex}" subjectid="*${subjectIndex}" periodsperweek="${count}.0" teacherid="*${teacherIndex}" studentids="" capacity="*" seminargroup=""/>`;
    lessonId++;
  });

  xml += `
  </lessons>
  
  <OptionalClasses/>
  <StudentOptionalClasses/>
  
  <!-- جدول التوزيع النهائي -->
  <TimeTableSchedules>`;

  sessions.forEach(session => {
    const dayNum = getDayNumber(session.day);
    const teacherIndex = teachers.findIndex(t => t.id === session.teacherId) + 1;
    const classIndex = classes.findIndex(c => c.id === session.classId) + 1;
    const subjectIndex = uniqueSubjects.indexOf(session.subject || '') + 1;
    
    xml += `
    <TimeTableSchedule DayID="${dayNum}" Period="${session.period}" LengthID="0" SchoolRoomID="" SubjectGradeID="*${subjectIndex}" ClassID="*${classIndex}" OptionalClassID="" TeacherID="*${teacherIndex}"/>`;
  });

  xml += `
  </TimeTableSchedules>
  
</timetable>`;

  return xml;
};

/**
 * الحصول على رقم اليوم
 */
const getDayNumber = (dayName: string): number => {
  const dayMap: { [key: string]: number } = {
    'sunday': 1,
    'monday': 2,
    'tuesday': 3,
    'wednesday': 4,
    'thursday': 5,
    'الأحد': 1,
    'الإثنين': 2,
    'الثلاثاء': 3,
    'الأربعاء': 4,
    'الخميس': 5
  };
  return dayMap[dayName.toLowerCase()] || 1;
};

/**
 * الحصول على لون المعلم
 */
const getTeacherColor = (index: number): string => {
  const colors = [
    '#FFFFFF', '#0080C0', '#8080FF', '#408080', '#80FFFF',
    '#00FF00', '#808000', '#808080', '#C0C0C0', '#0080FF'
  ];
  return colors[index % colors.length];
};
