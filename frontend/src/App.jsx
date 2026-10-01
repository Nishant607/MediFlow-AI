import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import Login from './pages/auth/Login';
import RegisterPatient from './pages/auth/RegisterPatient';
import RegisterDoctor from './pages/auth/RegisterDoctor';
import PatientDashboard from './pages/patient/Dashboard';
import BookAppointment from './pages/patient/BookAppointment';
import MyAppointments from './pages/patient/MyAppointments';
import MedicalRecords from './pages/patient/MedicalRecords';
import PatientBilling from './pages/patient/Billing';
import PatientAIAssistant from './pages/patient/AIAssistant';
import EmergencyPage from './pages/patient/Emergency';
import PatientSettingsPage from './pages/patient/Settings';
import DoctorDashboard from './pages/doctor/Dashboard';
import DoctorSchedulePage from './pages/doctor/Schedule';
import DoctorPatientsPage from './pages/doctor/Patients';
import DoctorConsultationsPage from './pages/doctor/Consultations';
import DoctorMedicalRecordsPage from './pages/doctor/MedicalRecords';
import DoctorAIAssistantPage from './pages/doctor/AIAssistant';
import DoctorSettingsPage from './pages/doctor/Settings';
import AdminDashboard from './pages/admin/Dashboard';
import AdminBilling from './pages/admin/Billing';
import AdminKnowledgeBase from './pages/admin/KnowledgeBase';
import AuditLogsPage from './pages/admin/AuditLogs';
import AdminStaffPage from './pages/admin/Staff';
import AdminPatientsPage from './pages/admin/Patients';
import AdminAppointmentsPage from './pages/admin/Appointments';
import AdminSettingsPage from './pages/admin/Settings';
import AdminClinicPage from './pages/admin/Clinic';
import AdminConsultationPage from './pages/admin/Consultation';
import AdminFeedbackPage from './pages/admin/Feedback';
import AdminHelpCenterPage from './pages/admin/HelpCenter';
import AdminStaffReportPage from './pages/admin/StaffReport';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register/patient" element={<RegisterPatient />} />
          <Route path="/register/doctor" element={<RegisterDoctor />} />

          {/* Protected Patient Routes */}
          <Route
            path="/patient/dashboard"
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <PatientDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/book-appointment"
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <BookAppointment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/appointments"
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <MyAppointments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/medical-records"
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <MedicalRecords />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/billing"
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <PatientBilling />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/ai-assistant"
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <PatientAIAssistant />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/emergency"
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <EmergencyPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/settings"
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <PatientSettingsPage />
              </ProtectedRoute>
            }
          />

          {/* Protected Doctor Routes */}
          <Route
            path="/doctor/dashboard"
            element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <DoctorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/schedule"
            element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <DoctorSchedulePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/patients"
            element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <DoctorPatientsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/consultations"
            element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <DoctorConsultationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/records"
            element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <DoctorMedicalRecordsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/ai-assistant"
            element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <DoctorAIAssistantPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/settings"
            element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <DoctorSettingsPage />
              </ProtectedRoute>
            }
          />

          {/* Protected Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/billing"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminBilling />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/knowledge-base"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminKnowledgeBase />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/audit-logs"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AuditLogsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/staff"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminStaffPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/patients"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminPatientsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/appointments"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminAppointmentsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminSettingsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/clinic"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminClinicPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/consultation"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminConsultationPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/feedback"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminFeedbackPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/help-center"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminHelpCenterPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/staff-report"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminStaffReportPage />
              </ProtectedRoute>
            }
          />

          {/* Fallback Redirect */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
