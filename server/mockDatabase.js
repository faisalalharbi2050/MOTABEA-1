// Mock Database for MOTABEA
// هذا الملف يحتوي على بيانات مؤقتة، سيتم استبدالها بقاعدة بيانات حقيقية لاحقاً

const mockDatabase = {
  // المدارس - سيتم إضافتها من خلال واجهة المستخدم
  schools: [],

  // الفصول - سيتم إضافتها من خلال واجهة المستخدم
  classes: [],

  // الطلاب - سيتم إضافتهم من خلال واجهة المستخدم
  students: [],

  // جلسات الاجتماعات التخصصية
  meetingSessions: [],

  // مشاركي الاجتماعات (المعلمين)
  meetingParticipants: []
};

module.exports = mockDatabase;