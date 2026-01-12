/**
 * بناء ملفات HTML مكتفية ذاتياً
 * Self-contained HTML Builder
 */

import { AssignmentState, Teacher, Subject, Classroom, Assignment } from '../store/types';
import { escapeHtml, sanitizeReportText, sanitizeForJson } from './sanitize';

/**
 * إعدادات بناء HTML
 */
interface HtmlBuilderOptions {
  title?: string;
  includeStyles?: boolean;
  includeScripts?: boolean;
  standalone?: boolean;
  rtl?: boolean;
  theme?: 'light' | 'dark' | 'auto';
  printOptimized?: boolean;
}

/**
 * بيانات التقرير للتصدير
 */
interface ExportReportData {
  type: 'teacher' | 'plan' | 'assignments' | 'workload';
  title: string;
  subtitle?: string;
  data: any;
  metadata: {
    generatedAt: string;
    totalRecords: number;
    filters?: any;
  };
}

/**
 * ملخص معلم للتصدير
 */
interface TeacherSummary {
  id: string;
  name: string;
  quota: number;
  assignments: {
    id: string;
    subjectId: string;
    subjectName: string;
    classroomId: string;
    classroomName: string;
    hours: number;
  }[];
  totals: {
    totalHours: number;
    remainingQuota: number;
    utilizationRate: number;
  };
}

/**
 * بيانات خطة الإسناد الكاملة
 */
interface PlanAllData {
  version: string;
  generatedAt: string;
  school?: string;
  meta: {
    title: string;
    includeDate: boolean;
    totalTeachers: number;
    totalAssignments: number;
    totalHours: number;
  };
  teachers: TeacherSummary[];
}

/**
 * فئة بناء HTML مكتفي ذاتياً
 */
export class HtmlAllBuilder {
  private options: Required<HtmlBuilderOptions>;
  private cssContent: string = '';
  private jsContent: string = '';

  constructor(options: Partial<HtmlBuilderOptions> = {}) {
    this.options = {
      title: 'تقرير نظام إسناد المواد',
      includeStyles: true,
      includeScripts: true,
      standalone: true,
      rtl: true,
      theme: 'light',
      printOptimized: true,
      ...options
    };

    this.initializeCSS();
    this.initializeJS();
  }

  /**
   * تهيئة CSS المدمج
   */
  private initializeCSS(): void {
    this.cssContent = `
      /* إعدادات عامة للعربية */
      * {
        box-sizing: border-box;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      }

      html {
        direction: ${this.options.rtl ? 'rtl' : 'ltr'};
        lang: ${this.options.rtl ? 'ar' : 'en'};
      }

      body {
        margin: 0;
        padding: 20px;
        background: ${this.options.theme === 'dark' ? '#1a1a1a' : '#f5f5f5'};
        color: ${this.options.theme === 'dark' ? '#ffffff' : '#333333'};
        line-height: 1.6;
        font-size: 14px;
      }

      .container {
        max-width: 1200px;
        margin: 0 auto;
        background: ${this.options.theme === 'dark' ? '#2d2d2d' : '#ffffff'};
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        padding: 30px;
      }

      .header {
        text-align: center;
        margin-bottom: 30px;
        border-bottom: 2px solid ${this.options.theme === 'dark' ? '#444' : '#e0e0e0'};
        padding-bottom: 20px;
      }

      .title {
        font-size: 28px;
        font-weight: bold;
        margin: 0 0 10px 0;
        color: ${this.options.theme === 'dark' ? '#ffffff' : '#2c3e50'};
      }

      .subtitle {
        font-size: 18px;
        color: ${this.options.theme === 'dark' ? '#cccccc' : '#7f8c8d'};
        margin: 0;
      }

      .metadata {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin: 20px 0;
        padding: 15px;
        background: ${this.options.theme === 'dark' ? '#3d3d3d' : '#f8f9fa'};
        border-radius: 6px;
        font-size: 12px;
        color: ${this.options.theme === 'dark' ? '#cccccc' : '#6c757d'};
      }

      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 20px;
        margin: 30px 0;
      }

      .stat-card {
        background: ${this.options.theme === 'dark' ? '#3d3d3d' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
        color: white;
        padding: 20px;
        border-radius: 10px;
        text-align: center;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      }

      .stat-number {
        font-size: 32px;
        font-weight: bold;
        display: block;
        margin-bottom: 8px;
      }

      .stat-label {
        font-size: 14px;
        opacity: 0.9;
      }

      .data-table {
        width: 100%;
        border-collapse: collapse;
        margin: 20px 0;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      }

      .data-table th,
      .data-table td {
        padding: 12px 15px;
        text-align: ${this.options.rtl ? 'right' : 'left'};
        border-bottom: 1px solid ${this.options.theme === 'dark' ? '#444' : '#e0e0e0'};
      }

      .data-table th {
        background: ${this.options.theme === 'dark' ? '#444' : '#f1f3f4'};
        font-weight: bold;
        color: ${this.options.theme === 'dark' ? '#ffffff' : '#333'};
      }

      .data-table tr:hover {
        background: ${this.options.theme === 'dark' ? '#3d3d3d' : '#f5f5f5'};
      }

      .data-table tr:nth-child(even) {
        background: ${this.options.theme === 'dark' ? '#2d2d2d' : '#f9f9f9'};
      }

      .status-active {
        color: #28a745;
        font-weight: bold;
      }

      .status-pending {
        color: #ffc107;
        font-weight: bold;
      }

      .status-cancelled {
        color: #dc3545;
        font-weight: bold;
      }

      .workload-bar {
        width: 100%;
        height: 20px;
        background: ${this.options.theme === 'dark' ? '#444' : '#e9ecef'};
        border-radius: 10px;
        overflow: hidden;
        position: relative;
      }

      .workload-fill {
        height: 100%;
        border-radius: 10px;
        transition: width 0.3s ease;
      }

      .workload-low { background: #28a745; }
      .workload-medium { background: #ffc107; }
      .workload-high { background: #dc3545; }

      .section {
        margin: 40px 0;
      }

      .section-title {
        font-size: 20px;
        font-weight: bold;
        color: ${this.options.theme === 'dark' ? '#ffffff' : '#2c3e50'};
        margin-bottom: 20px;
        padding-bottom: 10px;
        border-bottom: 2px solid ${this.options.theme === 'dark' ? '#444' : '#3498db'};
      }

      .teacher-info {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 20px;
        margin: 20px 0;
      }

      .info-card {
        background: ${this.options.theme === 'dark' ? '#3d3d3d' : '#ffffff'};
        border: 1px solid ${this.options.theme === 'dark' ? '#444' : '#e0e0e0'};
        border-radius: 8px;
        padding: 20px;
      }

      .info-item {
        display: flex;
        margin-bottom: 10px;
      }

      .info-label {
        font-weight: bold;
        min-width: 120px;
        color: ${this.options.theme === 'dark' ? '#cccccc' : '#7f8c8d'};
      }

      .info-value {
        flex: 1;
        color: ${this.options.theme === 'dark' ? '#ffffff' : '#2c3e50'};
      }

      .empty-state {
        text-align: center;
        padding: 60px 20px;
        color: ${this.options.theme === 'dark' ? '#cccccc' : '#7f8c8d'};
      }

      .empty-icon {
        font-size: 48px;
        margin-bottom: 20px;
        opacity: 0.5;
      }

      .footer {
        margin-top: 50px;
        padding-top: 20px;
        border-top: 2px solid ${this.options.theme === 'dark' ? '#444' : '#e0e0e0'};
        text-align: center;
        color: ${this.options.theme === 'dark' ? '#cccccc' : '#7f8c8d'};
        font-size: 12px;
      }

      /* أنماط الطباعة */
      @media print {
        body { 
          background: white !important; 
          color: black !important; 
        }
        .container { 
          box-shadow: none !important; 
          background: white !important; 
        }
        .stat-card { 
          background: #f0f0f0 !important; 
          color: black !important; 
        }
        .data-table th { 
          background: #f0f0f0 !important; 
          color: black !important; 
        }
        .no-print { display: none !important; }
      }

      /* تصميم متجاوب */
      @media (max-width: 768px) {
        .container { padding: 15px; }
        .stats-grid { grid-template-columns: 1fr; }
        .teacher-info { grid-template-columns: 1fr; }
        .metadata { flex-direction: column; text-align: center; }
      }
    `;
  }

  /**
   * تهيئة JavaScript المدمج
   */
  private initializeJS(): void {
    this.jsContent = `
      // وظائف مساعدة للتفاعل
      document.addEventListener('DOMContentLoaded', function() {
        // تبديل السمة
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
          themeToggle.addEventListener('click', function() {
            document.body.classList.toggle('dark-theme');
            localStorage.setItem('theme', document.body.classList.contains('dark-theme') ? 'dark' : 'light');
          });
        }

        // طباعة التقرير
        const printBtn = document.getElementById('printReport');
        if (printBtn) {
          printBtn.addEventListener('click', function() {
            window.print();
          });
        }

        // البحث في الجداول
        const searchInput = document.getElementById('searchTable');
        if (searchInput) {
          searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const table = document.querySelector('.data-table');
            if (table) {
              const rows = table.querySelectorAll('tbody tr');
              rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(searchTerm) ? '' : 'none';
              });
            }
          });
        }

        // تحميل السمة المحفوظة
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
          document.body.classList.add('dark-theme');
        }

        // رسوم بيانية بسيطة للعبء التدريسي
        function updateWorkloadBars() {
          const bars = document.querySelectorAll('.workload-fill');
          bars.forEach(bar => {
            const percentage = parseFloat(bar.getAttribute('data-percentage') || '0');
            bar.style.width = percentage + '%';
            
            if (percentage >= 100) bar.className = 'workload-fill workload-high';
            else if (percentage >= 80) bar.className = 'workload-fill workload-medium';
            else bar.className = 'workload-fill workload-low';
          });
        }

        updateWorkloadBars();

        // إضافة تأثيرات بصرية
        const cards = document.querySelectorAll('.stat-card, .info-card');
        cards.forEach(card => {
          card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
            this.style.transition = 'transform 0.2s ease';
          });
          
          card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
          });
        });

        // إحصائيات سريعة
        function calculateStats() {
          const totalRows = document.querySelectorAll('.data-table tbody tr').length;
          const visibleRows = document.querySelectorAll('.data-table tbody tr:not([style*="display: none"])').length;
          
          const statsInfo = document.getElementById('statsInfo');
          if (statsInfo) {
            statsInfo.textContent = \`عرض \${visibleRows} من أصل \${totalRows} عنصر\`;
          }
        }

        calculateStats();

        // تحديث الإحصائيات عند البحث
        if (searchInput) {
          searchInput.addEventListener('input', calculateStats);
        }
      });

      // وظيفة تصدير البيانات
      function exportToCSV() {
        const table = document.querySelector('.data-table');
        if (!table) return;

        let csv = '';
        const rows = table.querySelectorAll('tr:not([style*="display: none"])');
        
        rows.forEach(row => {
          const cells = row.querySelectorAll('th, td');
          const rowData = Array.from(cells).map(cell => {
            let text = cell.textContent.trim();
            return text.includes(',') ? \`"\${text}"\` : text;
          });
          csv += rowData.join(',') + '\\n';
        });

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'تقرير_الإسناد.csv';
        link.click();
        URL.revokeObjectURL(link.href);
      }

      // وظيفة مشاركة التقرير
      async function shareReport() {
        if (navigator.share) {
          try {
            await navigator.share({
              title: document.title,
              text: 'تقرير نظام إسناد المواد',
              url: window.location.href
            });
          } catch (err) {
            console.log('خطأ في المشاركة:', err);
          }
        } else {
          // نسخ الرابط
          await navigator.clipboard.writeText(window.location.href);
          alert('تم نسخ الرابط إلى الحافظة');
        }
      }
    `;
  }

  /**
   * بناء رأس HTML
   */
  private buildHead(title: string): string {
    return `
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        ${this.options.includeStyles ? `<style>${this.cssContent}</style>` : ''}
        <meta name="description" content="تقرير نظام إسناد المواد - نظام إدارة مدرسية شامل">
        <meta name="keywords" content="إسناد المواد، المعلمين، الجدولة، التقارير">
        <meta name="author" content="نظام MOTABEA">
      </head>
    `;
  }

  /**
   * بناء شريط أدوات التقرير
   */
  private buildToolbar(): string {
    return `
      <div class="toolbar no-print" style="margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; padding: 15px; background: #f8f9fa; border-radius: 8px;">
        <div style="display: flex; gap: 10px;">
          <button id="printReport" style="padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
            🖨️ طباعة
          </button>
          <button onclick="exportToCSV()" style="padding: 8px 16px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;">
            📊 تصدير CSV
          </button>
          <button onclick="shareReport()" style="padding: 8px 16px; background: #6f42c1; color: white; border: none; border-radius: 4px; cursor: pointer;">
            📤 مشاركة
          </button>
        </div>
        <div style="display: flex; align-items: center; gap: 10px;">
          <input type="text" id="searchTable" placeholder="بحث في البيانات..." style="padding: 8px; border: 1px solid #ddd; border-radius: 4px; width: 200px;">
          <button id="themeToggle" style="padding: 8px 12px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;">
            🌙 السمة الداكنة
          </button>
        </div>
      </div>
    `;
  }

  /**
   * بناء إحصائيات سريعة
   */
  private buildStats(stats: Array<{ label: string; value: string | number; color?: string }>): string {
    return `
      <div class="stats-grid">
        ${stats.map(stat => `
          <div class="stat-card" ${stat.color ? `style="background: ${stat.color};"` : ''}>
            <span class="stat-number">${stat.value}</span>
            <span class="stat-label">${stat.label}</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  /**
   * بناء جدول البيانات
   */
  private buildTable(headers: string[], rows: string[][], title?: string): string {
    return `
      ${title ? `<h2 class="section-title">${title}</h2>` : ''}
      <div style="overflow-x: auto;">
        <table class="data-table">
          <thead>
            <tr>
              ${headers.map(header => `<th>${header}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${rows.map(row => `
              <tr>
                ${row.map(cell => `<td>${cell}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  /**
   * بناء معلومات التقرير
   */
  private buildMetadata(metadata: any): string {
    const date = new Date(metadata.generatedAt).toLocaleString('ar-SA');
    return `
      <div class="metadata">
        <div>
          <strong>تاريخ التقرير:</strong> ${date}
        </div>
        <div>
          <strong>عدد السجلات:</strong> ${metadata.totalRecords}
        </div>
        <div id="statsInfo">
          عرض جميع البيانات
        </div>
      </div>
    `;
  }

  /**
   * بناء تذييل التقرير
   */
  private buildFooter(): string {
    return `
      <div class="footer">
        <p>تم إنشاء هذا التقرير بواسطة نظام MOTABEA لإدارة المدارس</p>
        <p>جميع الحقوق محفوظة © ${new Date().getFullYear()}</p>
      </div>
    `;
  }

  /**
   * بناء تقرير المعلمين
   */
  buildTeachersReport(state: AssignmentState): string {
    const stats = [
      { label: 'إجمالي المعلمين', value: state.teachers.length },
      { label: 'المعلمون النشطون', value: state.teachers.filter(t => t.isActive).length },
      { label: 'إجمالي الإسناد', value: state.assignments.length },
      { label: 'متوسط العبء', value: Math.round(state.teachers.reduce((sum, t) => sum + t.currentLoad, 0) / state.teachers.length || 0) + ' حصة' }
    ];

    const headers = ['اسم المعلم', 'التخصص', 'العبء الحالي', 'الحد الأقصى', 'النسبة', 'الحالة'];
    const rows = state.teachers.map(teacher => {
      const assignments = state.assignments.filter(a => a.teacherId === teacher.id);
      const currentLoad = assignments.reduce((sum, a) => sum + a.hoursPerWeek, 0);
      const percentage = teacher.maxLoad > 0 ? Math.round((currentLoad / teacher.maxLoad) * 100) : 0;
      
      return [
        teacher.name,
        teacher.specialization,
        currentLoad.toString(),
        teacher.maxLoad.toString(),
        `<div class="workload-bar">
          <div class="workload-fill" data-percentage="${percentage}"></div>
         </div> ${percentage}%`,
        `<span class="status-${teacher.isActive ? 'active' : 'cancelled'}">${teacher.isActive ? 'نشط' : 'غير نشط'}</span>`
      ];
    });

    const metadata = {
      generatedAt: new Date().toISOString(),
      totalRecords: state.teachers.length
    };

    return `
      <!DOCTYPE html>
      <html>
      ${this.buildHead('تقرير المعلمين - نظام إسناد المواد')}
      <body>
        <div class="container">
          <div class="header">
            <h1 class="title">تقرير المعلمين</h1>
            <p class="subtitle">نظام إسناد المواد</p>
          </div>
          
          ${this.buildToolbar()}
          ${this.buildMetadata(metadata)}
          ${this.buildStats(stats)}
          ${this.buildTable(headers, rows, 'قائمة المعلمين')}
          ${this.buildFooter()}
        </div>
        
        ${this.options.includeScripts ? `<script>${this.jsContent}</script>` : ''}
      </body>
      </html>
    `;
  }

  /**
   * بناء تقرير الإسناد
   */
  buildAssignmentsReport(state: AssignmentState): string {
    const stats = [
      { label: 'إجمالي الإسناد', value: state.assignments.length },
      { label: 'الإسناد النشط', value: state.assignments.filter(a => a.status === 'active').length, color: '#28a745' },
      { label: 'قيد الانتظار', value: state.assignments.filter(a => a.status === 'pending').length, color: '#ffc107' },
      { label: 'إجمالي الحصص', value: state.assignments.reduce((sum, a) => sum + a.hoursPerWeek, 0) }
    ];

    const headers = ['المعلم', 'المادة', 'الفصل', 'عدد الحصص', 'الحالة', 'ملاحظات'];
    const rows = state.assignments.map(assignment => {
      const teacher = state.teachers.find(t => t.id === assignment.teacherId);
      const subject = state.subjects.find(s => s.id === assignment.subjectId);
      const classroom = state.classrooms.find(c => c.id === assignment.classroomId);
      
      const statusMap = {
        active: 'نشط',
        pending: 'قيد الانتظار',
        cancelled: 'ملغى'
      };
      
      return [
        teacher?.name || '',
        subject?.name || '',
        classroom?.name || '',
        assignment.hoursPerWeek.toString(),
        `<span class="status-${assignment.status}">${statusMap[assignment.status]}</span>`,
        assignment.notes || ''
      ];
    });

    const metadata = {
      generatedAt: new Date().toISOString(),
      totalRecords: state.assignments.length
    };

    return `
      <!DOCTYPE html>
      <html>
      ${this.buildHead('تقرير الإسناد - نظام إسناد المواد')}
      <body>
        <div class="container">
          <div class="header">
            <h1 class="title">تقرير الإسناد</h1>
            <p class="subtitle">توزيع المواد على المعلمين</p>
          </div>
          
          ${this.buildToolbar()}
          ${this.buildMetadata(metadata)}
          ${this.buildStats(stats)}
          ${this.buildTable(headers, rows, 'تفاصيل الإسناد')}
          ${this.buildFooter()}
        </div>
        
        ${this.options.includeScripts ? `<script>${this.jsContent}</script>` : ''}
      </body>
      </html>
    `;
  }

  /**
   * بناء تقرير معلم محدد
   */
  buildTeacherReport(state: AssignmentState, teacherId: string): string {
    const teacher = state.teachers.find(t => t.id === teacherId);
    if (!teacher) {
      return this.buildEmptyReport('المعلم غير موجود');
    }

    const assignments = state.assignments.filter(a => a.teacherId === teacherId);
    const totalHours = assignments.reduce((sum, a) => sum + a.hoursPerWeek, 0);
    const subjectCount = new Set(assignments.map(a => a.subjectId)).size;
    const classroomCount = new Set(assignments.map(a => a.classroomId)).size;
    const loadPercentage = teacher.maxLoad > 0 ? Math.round((totalHours / teacher.maxLoad) * 100) : 0;

    const stats = [
      { label: 'إجمالي الحصص', value: totalHours },
      { label: 'عدد المواد', value: subjectCount },
      { label: 'عدد الفصول', value: classroomCount },
      { label: 'نسبة العبء', value: `${loadPercentage}%`, color: loadPercentage >= 100 ? '#dc3545' : loadPercentage >= 80 ? '#ffc107' : '#28a745' }
    ];

    const teacherInfo = `
      <div class="teacher-info">
        <div class="info-card">
          <h3>معلومات المعلم</h3>
          <div class="info-item">
            <span class="info-label">الاسم:</span>
            <span class="info-value">${teacher.name}</span>
          </div>
          <div class="info-item">
            <span class="info-label">التخصص:</span>
            <span class="info-value">${teacher.specialization}</span>
          </div>
          <div class="info-item">
            <span class="info-label">الحد الأقصى للحصص:</span>
            <span class="info-value">${teacher.maxLoad} حصة</span>
          </div>
          <div class="info-item">
            <span class="info-label">الحالة:</span>
            <span class="info-value status-${teacher.isActive ? 'active' : 'cancelled'}">${teacher.isActive ? 'نشط' : 'غير نشط'}</span>
          </div>
        </div>
      </div>
    `;

    const headers = ['المادة', 'الفصل', 'عدد الحصص', 'الحالة', 'ملاحظات'];
    const rows = assignments.map(assignment => {
      const subject = state.subjects.find(s => s.id === assignment.subjectId);
      const classroom = state.classrooms.find(c => c.id === assignment.classroomId);
      
      const statusMap = {
        active: 'نشط',
        pending: 'قيد الانتظار',
        cancelled: 'ملغى'
      };
      
      return [
        subject?.name || '',
        classroom?.name || '',
        assignment.hoursPerWeek.toString(),
        `<span class="status-${assignment.status}">${statusMap[assignment.status]}</span>`,
        assignment.notes || ''
      ];
    });

    const metadata = {
      generatedAt: new Date().toISOString(),
      totalRecords: assignments.length
    };

    return `
      <!DOCTYPE html>
      <html>
      ${this.buildHead(`تقرير المعلم: ${teacher.name} - نظام إسناد المواد`)}
      <body>
        <div class="container">
          <div class="header">
            <h1 class="title">تقرير المعلم: ${teacher.name}</h1>
            <p class="subtitle">${teacher.specialization}</p>
          </div>
          
          ${this.buildToolbar()}
          ${this.buildMetadata(metadata)}
          ${teacherInfo}
          ${this.buildStats(stats)}
          ${this.buildTable(headers, rows, 'تفاصيل الإسناد')}
          ${this.buildFooter()}
        </div>
        
        ${this.options.includeScripts ? `<script>${this.jsContent}</script>` : ''}
      </body>
      </html>
    `;
  }

  /**
   * بناء تقرير فارغ
   */
  buildEmptyReport(message: string): string {
    return `
      <!DOCTYPE html>
      <html>
      ${this.buildHead('تقرير فارغ - نظام إسناد المواد')}
      <body>
        <div class="container">
          <div class="header">
            <h1 class="title">تقرير فارغ</h1>
            <p class="subtitle">نظام إسناد المواد</p>
          </div>
          
          <div class="empty-state">
            <div class="empty-icon">📋</div>
            <h2>لا توجد بيانات للعرض</h2>
            <p>${message}</p>
          </div>
          
          ${this.buildFooter()}
        </div>
      </body>
      </html>
    `;
  }

  /**
   * بناء تقرير شامل للنظام
   */
  buildCompleteReport(state: AssignmentState): string {
    // إحصائيات شاملة
    const totalTeachers = state.teachers.length;
    const activeTeachers = state.teachers.filter(t => t.isActive).length;
    const totalSubjects = state.subjects.length;
    const totalClassrooms = state.classrooms.length;
    const totalAssignments = state.assignments.length;
    const activeAssignments = state.assignments.filter(a => a.status === 'active').length;
    
    const stats = [
      { label: 'إجمالي المعلمين', value: totalTeachers },
      { label: 'المعلمون النشطون', value: activeTeachers },
      { label: 'إجمالي المواد', value: totalSubjects },
      { label: 'إجمالي الفصول', value: totalClassrooms },
      { label: 'إجمالي الإسناد', value: totalAssignments },
      { label: 'الإسناد النشط', value: activeAssignments }
    ];

    const metadata = {
      generatedAt: new Date().toISOString(),
      totalRecords: totalAssignments
    };

    // بناء التقرير بأقسام متعددة
    return `
      <!DOCTYPE html>
      <html>
      ${this.buildHead('التقرير الشامل - نظام إسناد المواد')}
      <body>
        <div class="container">
          <div class="header">
            <h1 class="title">التقرير الشامل</h1>
            <p class="subtitle">نظام إسناد المواد - عرض شامل للبيانات</p>
          </div>
          
          ${this.buildToolbar()}
          ${this.buildMetadata(metadata)}
          ${this.buildStats(stats)}
          
          <div class="section">
            <h2 class="section-title">ملخص النظام</h2>
            <p>يوضح هذا التقرير الحالة الشاملة لنظام إسناد المواد، بما في ذلك توزيع المعلمين والمواد والفصول.</p>
          </div>
          
          ${this.buildFooter()}
        </div>
        
        ${this.options.includeScripts ? `<script>${this.jsContent}</script>` : ''}
      </body>
      </html>
    `;
  }

  /**
   * بناء خطة الإسناد الكاملة كـ HTML ذاتي الاكتفاء
   * @param summaries ملخصات المعلمين
   * @param meta بيانات وصفية إضافية
   * @returns HTML كامل مع JSON مدمج
   */
  buildPlanAllHtml(summaries: TeacherSummary[], meta: {
    title?: string;
    schoolName?: string;
    includeDate?: boolean;
  } = {}): string {
    const generatedAt = new Date().toISOString();
    const dateStr = new Date().toLocaleDateString('ar-SA');
    
    // إعداد البيانات الوصفية
    const planMeta = {
      title: sanitizeReportText(meta.title || 'خطة إسناد المواد الكاملة'),
      includeDate: meta.includeDate !== false,
      totalTeachers: summaries.length,
      totalAssignments: summaries.reduce((sum, t) => sum + t.assignments.length, 0),
      totalHours: summaries.reduce((sum, t) => sum + t.totals.totalHours, 0)
    };

    // إنشاء بيانات JSON للتصدير
    const jsonData: PlanAllData = {
      version: '1.0.0',
      generatedAt,
      school: meta.schoolName ? sanitizeReportText(meta.schoolName) : undefined,
      meta: planMeta,
      teachers: summaries.map(summary => ({
        ...summary,
        name: sanitizeReportText(summary.name),
        assignments: summary.assignments.map(assignment => ({
          ...assignment,
          subjectName: sanitizeReportText(assignment.subjectName),
          classroomName: sanitizeReportText(assignment.classroomName)
        }))
      }))
    };

    // بناء الـ HTML
    return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="generator" content="نظام متابعة - MOTABEA">
  <title>${escapeHtml(planMeta.title)}</title>
  <style>
    /* CSS Reset */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    /* RTL والنصوص العربية */
    html {
      direction: rtl;
      font-family: 'Segoe UI', 'Tahoma', 'Arial', sans-serif;
    }

    body {
      font-size: 14px;
      line-height: 1.6;
      color: #333;
      background: #fff;
    }

    /* التخطيط الأساسي */
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }

    /* الرأس */
    .header {
      text-align: center;
      margin-bottom: 30px;
      border-bottom: 3px solid #2563eb;
      padding-bottom: 20px;
    }

    .header h1 {
      font-size: 2.2em;
      color: #1e40af;
      margin-bottom: 10px;
      font-weight: bold;
    }

    .header .school-name {
      font-size: 1.4em;
      color: #374151;
      margin-bottom: 8px;
    }

    .header .date {
      color: #6b7280;
      font-size: 1.1em;
    }

    /* الجداول */
    .teacher-section {
      margin-bottom: 40px;
      break-inside: avoid;
    }

    .teacher-header {
      background: linear-gradient(135deg, #2563eb, #1d4ed8);
      color: white;
      padding: 15px;
      margin-bottom: 15px;
      border-radius: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .teacher-name {
      font-size: 1.3em;
      font-weight: bold;
    }

    .teacher-stats {
      font-size: 0.95em;
      opacity: 0.9;
    }

    .assignments-table {
      width: 100%;
      border-collapse: collapse;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      border-radius: 8px;
      overflow: hidden;
    }

    .assignments-table th {
      background: #f8fafc;
      color: #374151;
      padding: 12px;
      text-align: center;
      font-weight: bold;
      border-bottom: 2px solid #e5e7eb;
    }

    .assignments-table td {
      padding: 10px 12px;
      text-align: center;
      border-bottom: 1px solid #f3f4f6;
    }

    .assignments-table tr:nth-child(even) {
      background: #f9fafb;
    }

    .assignments-table tr:hover {
      background: #f3f4f6;
    }

    /* إجمالي المعلم */
    .teacher-total {
      background: #eff6ff;
      border: 2px solid #3b82f6;
      border-radius: 8px;
      padding: 15px;
      margin-top: 15px;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 10px;
    }

    .total-item {
      text-align: center;
    }

    .total-label {
      display: block;
      font-size: 0.9em;
      color: #6b7280;
      margin-bottom: 5px;
    }

    .total-value {
      display: block;
      font-size: 1.2em;
      font-weight: bold;
      color: #1e40af;
    }

    /* حالة الاستخدام */
    .utilization {
      padding: 4px 8px;
      border-radius: 4px;
      color: white;
      font-size: 0.85em;
      font-weight: bold;
    }

    .utilization.high { background: #dc2626; }
    .utilization.medium { background: #d97706; }
    .utilization.low { background: #059669; }

    /* تنسيقات الطباعة */
    @media print {
      body {
        font-size: 12px;
      }
      
      .container {
        padding: 10px;
      }
      
      .teacher-section {
        break-inside: avoid;
        margin-bottom: 30px;
      }
      
      .assignments-table {
        font-size: 0.9em;
      }
      
      .teacher-header {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }

    @page {
      size: A4;
      margin: 1cm;
    }

    /* الملخص النهائي */
    .summary-section {
      margin-top: 40px;
      padding: 20px;
      background: #f8fafc;
      border-radius: 8px;
      border-left: 4px solid #2563eb;
    }

    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
    }

    .summary-card {
      background: white;
      padding: 15px;
      border-radius: 6px;
      text-align: center;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .no-data {
      text-align: center;
      padding: 40px;
      color: #6b7280;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- الرأس -->
    <div class="header">
      ${meta.schoolName ? `<div class="school-name">${escapeHtml(meta.schoolName)}</div>` : ''}
      <h1>${escapeHtml(planMeta.title)}</h1>
      ${planMeta.includeDate ? `<div class="date">تاريخ الإنشاء: ${dateStr}</div>` : ''}
    </div>

    <!-- بيانات JSON مدمجة -->
    <script type="application/json" id="mutaaba-plan">${sanitizeForJson(JSON.stringify(jsonData, null, 2))}</script>

    <!-- START:ASSIGNMENTS -->
    ${summaries.length > 0 ? summaries.map(teacher => `
    <section class="teacher" data-teacher-id="${escapeHtml(teacher.id)}" data-teacher-name="${escapeHtml(teacher.name)}">
      <div class="teacher-header">
        <div class="teacher-name">${escapeHtml(teacher.name)}</div>
        <div class="teacher-stats">
          النصاب: ${teacher.quota} حصة | المسند: ${teacher.totals.totalHours} حصة
        </div>
      </div>

      ${teacher.assignments.length > 0 ? `
      <table class="assignments-table">
        <thead>
          <tr>
            <th>المادة</th>
            <th>الفصل</th>
            <th>عدد الحصص</th>
            <th>نسبة الاستخدام</th>
          </tr>
        </thead>
        <tbody>
          ${teacher.assignments.map(assignment => {
            const utilization = teacher.quota > 0 ? (assignment.hours / teacher.quota * 100) : 0;
            const utilizationClass = utilization >= 80 ? 'high' : utilization >= 50 ? 'medium' : 'low';
            return `
            <tr data-subject="${escapeHtml(assignment.subjectId)}" 
                data-class="${escapeHtml(assignment.classroomId)}" 
                data-hours="${assignment.hours}">
              <td>${escapeHtml(assignment.subjectName)}</td>
              <td>${escapeHtml(assignment.classroomName)}</td>
              <td>${assignment.hours}</td>
              <td><span class="utilization ${utilizationClass}">${utilization.toFixed(1)}%</span></td>
            </tr>
            `;
          }).join('')}
        </tbody>
      </table>
      ` : '<div class="no-data">لا توجد إسنادات لهذا المعلم</div>'}

      <div class="teacher-total">
        <div class="total-item">
          <span class="total-label">إجمالي الحصص المسندة</span>
          <span class="total-value">${teacher.totals.totalHours}</span>
        </div>
        <div class="total-item">
          <span class="total-label">النصاب المتبقي</span>
          <span class="total-value">${teacher.totals.remainingQuota}</span>
        </div>
        <div class="total-item">
          <span class="total-label">معدل الاستخدام</span>
          <span class="total-value">${teacher.totals.utilizationRate.toFixed(1)}%</span>
        </div>
      </div>
    </section>
    `).join('') : '<div class="no-data">لا توجد بيانات معلمين للعرض</div>'}
    <!-- END:ASSIGNMENTS -->

    <!-- الملخص النهائي -->
    <div class="summary-section">
      <h2 style="margin-bottom: 20px; color: #1e40af;">ملخص الخطة</h2>
      <div class="summary-grid">
        <div class="summary-card">
          <div class="total-label">إجمالي المعلمين</div>
          <div class="total-value">${planMeta.totalTeachers}</div>
        </div>
        <div class="summary-card">
          <div class="total-label">إجمالي الإسنادات</div>
          <div class="total-value">${planMeta.totalAssignments}</div>
        </div>
        <div class="summary-card">
          <div class="total-label">إجمالي الحصص</div>
          <div class="total-value">${planMeta.totalHours}</div>
        </div>
        <div class="summary-card">
          <div class="total-label">تاريخ الإنشاء</div>
          <div class="total-value" style="font-size: 1em;">${dateStr}</div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
  }
}

/**
 * دالة مساعدة لبناء خطة HTML كاملة
 * @param summaries ملخصات المعلمين
 * @param meta بيانات وصفية
 * @returns HTML كامل
 */
export function buildPlanAllHtml(
  summaries: TeacherSummary[], 
  meta?: {
    title?: string;
    schoolName?: string;
    includeDate?: boolean;
  }
): string {
  const builder = new HtmlAllBuilder({
    standalone: true,
    includeStyles: true,
    rtl: true,
    printOptimized: true
  });
  
  return builder.buildPlanAllHtml(summaries, meta);
}

export default HtmlAllBuilder;
export type { TeacherSummary, PlanAllData };