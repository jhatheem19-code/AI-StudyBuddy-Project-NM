import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { AuthProvider } from "./auth";
import {
  AdminDashboard,
  AdminHealth,
  AdminMaterials,
  AdminReports,
  AdminUsers,
  AIToolsPage,
  AssistantPage,
  Landing,
  MaterialsPage,
  Protected,
  SearchPage,
  StudentDashboard,
  StudyPlanPage
} from "./pages";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />

          <Route
            path="/student"
            element={
              <Protected role="student">
                <StudentDashboard />
              </Protected>
            }
          />
          <Route
            path="/student/materials"
            element={
              <Protected role="student">
                <MaterialsPage />
              </Protected>
            }
          />
          <Route
            path="/student/ai-tools"
            element={
              <Protected role="student">
                <AIToolsPage />
              </Protected>
            }
          />
          <Route
            path="/student/search"
            element={
              <Protected role="student">
                <SearchPage />
              </Protected>
            }
          />
          <Route
            path="/student/assistant"
            element={
              <Protected role="student">
                <AssistantPage />
              </Protected>
            }
          />
          <Route
            path="/student/study-plan"
            element={
              <Protected role="student">
                <StudyPlanPage />
              </Protected>
            }
          />

          <Route
            path="/admin"
            element={
              <Protected role="admin">
                <AdminDashboard />
              </Protected>
            }
          />
          <Route
            path="/admin/users"
            element={
              <Protected role="admin">
                <AdminUsers />
              </Protected>
            }
          />
          <Route
            path="/admin/materials"
            element={
              <Protected role="admin">
                <AdminMaterials />
              </Protected>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <Protected role="admin">
                <AdminReports />
              </Protected>
            }
          />
          <Route
            path="/admin/health"
            element={
              <Protected role="admin">
                <AdminHealth />
              </Protected>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
