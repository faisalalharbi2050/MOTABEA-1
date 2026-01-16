import { Routes, Route } from 'react-router-dom'
// @ts-ignore
import { AuthProvider } from './contexts/AuthContext'
// @ts-ignore
import { ToastProvider } from './contexts/ToastContext'
// @ts-ignore
import { SchoolProvider } from './contexts/SchoolContext'
// @ts-ignore
import { NotificationProvider } from './contexts/NotificationContext'
// @ts-ignore
import Layout from './components/Layout/Layout'
// @ts-ignore
import HomePage from './pages/HomePage'
// @ts-ignore
import ScrollToTop from './components/ScrollToTop'
// @ts-ignore
import TutorialsPage from './pages/TutorialsPage'
// @ts-ignore
import PrivacyPolicyPage from './pages/PrivacyPolicyPage'
// @ts-ignore
// @ts-ignore
import TermsPage from './pages/TermsPage'
// @ts-ignore
import RefundPolicyPage from './pages/RefundPolicyPage'
// @ts-ignore
// @ts-ignore
import AuthPage from './pages/AuthPage'
// @ts-ignore
import FAQPage from './pages/FAQPage'
// @ts-ignore
import Dashboard from './pages/Dashboard/Dashboard'
// @ts-ignore
import TeachersPage from './pages/Dashboard/TeachersPage'
// @ts-ignore
import StudentsPage from './pages/Dashboard/StudentsPage'
// @ts-ignore
import SchedulePage from './pages/Dashboard/SchedulePage'
// @ts-ignore
import SupervisionPage from './pages/Dashboard/SupervisionPage'
// @ts-ignore
import SupervisionFormsPage from './pages/Dashboard/Supervision/SupervisionFormsPage'
// @ts-ignore
import DailySupervisionPage from './pages/Dashboard/Supervision/DailySupervisionPage'
// @ts-ignore
import DailySupervisionReportPage from './pages/Dashboard/Supervision/DailySupervisionReportPage'
// @ts-ignore
import DailyDutyPage from './pages/Dashboard/Supervision/DailyDutyPage'
// @ts-ignore
import DailyDutyReportPage from './pages/Dashboard/Supervision/DailyDutyReportPage'
// @ts-ignore
import TasksPage from './pages/Dashboard/TasksPage'
// @ts-ignore

// @ts-ignore
import SettingsPage from './pages/Dashboard/SettingsPage'
// @ts-ignore
import ScheduleSettingsFinal from './pages/Dashboard/ScheduleSettingsFinal'
// @ts-ignore
import SmartTimetablePageEnhanced from './pages/Dashboard/SmartTimetablePage'
// @ts-ignore
import ProtectedRoute from './components/Layout/ProtectedRoute'
// @ts-ignore
import TestLogin from './components/TestLogin'
// @ts-ignore
import DailyWaitingPage from './pages/DailyWaiting/DailyWaitingPage'
// @ts-ignore
import WhatsAppMessagingPage from './pages/Dashboard/WhatsAppMessagingPage'
// @ts-ignore
import BehaviorAttendancePage from './pages/Dashboard/BehaviorAttendancePage'
// @ts-ignore
import PermissionsPage from './pages/Dashboard/PermissionsPage'
// @ts-ignore
import UserFormPage from './pages/Dashboard/UserFormPage'
// @ts-ignore
import UserPermissionsPage from './pages/Dashboard/UserPermissionsPage'
// @ts-ignore
import SupportPage from './pages/SupportPage'
// @ts-ignore
import NotFoundPage from './pages/NotFoundPage'
// Initial Settings Pages
// @ts-ignore
import { 
  SchoolInfoPage,
  TimingPage,
  SubjectsPage,
  ClassroomManagement,
  StudentsManagement,
  TeachersManagementPage,
  AdministratorsPage
} from './pages/InitialSettings'
// @ts-ignore
import ClassroomScheduleSetup from './pages/InitialSettings/ClassroomScheduleSetup'
// @ts-ignore
import ClassroomSubjectsSetup from './pages/InitialSettings/ClassroomSubjectsSetup'
// @ts-ignore
import TeacherConstraintsPage from './pages/Dashboard/TeacherConstraintsPage'
// Assignment System Pages
import { UpdatedAssignmentPage, TeacherReportView, PlanReportView } from './features/assignment'
// Student Affairs Pages


function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <SchoolProvider>
          <NotificationProvider>
            <div className="min-h-screen bg-gray-50">
              <ScrollToTop />
              <Routes>
            {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/tutorials" element={<TutorialsPage />} />
              <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/refund-policy" element={<RefundPolicyPage />} />
              <Route path="/login" element={<AuthPage initialView="login" />} />
              <Route path="/register" element={<AuthPage initialView="register" />} />

              <Route path="/support" element={<SupportPage />} />
              <Route path="/faq" element={<FAQPage />} />
            
            {/* Protected Dashboard Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="teachers" element={<TeachersPage />} />
              <Route path="students" element={<StudentsPage />} />
              <Route path="schedule" element={<SchedulePage />} />
              <Route path="schedule/settings" element={<ScheduleSettingsFinal />} />
              <Route path="schedule/tables" element={<SmartTimetablePageEnhanced />} />
              <Route path="daily-waiting" element={<DailyWaitingPage />} />
              <Route path="behavior-attendance" element={<BehaviorAttendancePage />} />
              <Route path="messages" element={<WhatsAppMessagingPage />} />
              <Route path="supervision" element={<SupervisionPage />} />
              <Route path="supervision/forms" element={<SupervisionFormsPage />} />
              <Route path="supervision/daily" element={<DailySupervisionPage />} />
              <Route path="supervision/duty" element={<DailyDutyPage />} />
              <Route path="supervision/daily-report" element={<DailySupervisionReportPage />} />
              <Route path="supervision/daily-duty-report" element={<DailyDutyReportPage />} />
              <Route path="tasks" element={<TasksPage />} />

              <Route path="permissions" element={<PermissionsPage />} />
              <Route path="permissions/user-form" element={<UserFormPage />} />
              <Route path="permissions/user-permissions" element={<UserPermissionsPage />} />
              
              {/* Initial Settings Routes */}
              <Route path="initial-settings/school-info" element={<SchoolInfoPage />} />
              <Route path="initial-settings/timing" element={<TimingPage />} />
              <Route path="initial-settings/subjects" element={<SubjectsPage />} />
              <Route path="initial-settings/classrooms" element={<ClassroomManagement />} />
              <Route path="initial-settings/classrooms/schedule-setup" element={<ClassroomScheduleSetup />} />
              <Route path="initial-settings/classrooms/subjects-setup" element={<ClassroomSubjectsSetup />} />
              <Route path="initial-settings/students" element={<StudentsManagement />} />
              
              {/* Schedule Settings Routes */}
              <Route path="schedule/teacher-constraints" element={<TeacherConstraintsPage />} />
              <Route path="initial-settings/teachers" element={<TeachersManagementPage />} />
              <Route path="initial-settings/administrators" element={<AdministratorsPage />} />
              
              {/* Assignment System Routes */}
              <Route path="assignment" element={<UpdatedAssignmentPage />} />
              <Route path="assignment/plan" element={<PlanReportView />} />
              <Route path="assignment/teacher/:id" element={<TeacherReportView />} />


              
              <Route path="settings" element={<SettingsPage />} />
            </Route>
            
            {/* Test Route - خارج ProtectedRoute */}
            <Route path="/test-connection" element={<TestLogin />} />
            
            {/* Quick Access Routes - خارج ProtectedRoute */}

            {/* 404 Route */}
            <Route path="*" element={<NotFoundPage />} />

          </Routes>
        </div>
      </NotificationProvider>
    </SchoolProvider>
  </ToastProvider>
</AuthProvider>
  )
}

export default App
