import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { ProtectedRoute } from '../components/ProtectedRoute';

import { Login } from '../pages/auth/Login';
import { ForgotPassword } from '../pages/auth/ForgotPassword';
import { VerifyOTP } from '../pages/auth/VerifyOTP';
import { ResetPassword } from '../pages/auth/ResetPassword';
import { Forbidden } from '../pages/Forbidden';
import { Dashboard } from '../pages/dashboard/Dashboard';
import { Customers } from '../pages/customers/Customers';
import { AddCustomer } from '../pages/customers/AddCustomer';
import { Products } from '../pages/products/Products';
import { Inventory } from '../pages/inventory/Inventory';
import { Challans } from '../pages/challans/Challans';
import { CreateChallan } from '../pages/challans/CreateChallan';
import { Reports } from '../pages/reports/Reports';
import { Users } from '../pages/Users';
import { Settings } from '../pages/Settings';

import type { Role } from '../config/roles';

const roleRoute = (allowedRoles: Role[], element: React.ReactNode) => (
  <ProtectedRoute allowedRoles={allowedRoles}>{element}</ProtectedRoute>
);

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/verify-otp" element={<VerifyOTP />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/forbidden" element={<Forbidden />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="customers" element={roleRoute(['ADMIN', 'SALES', 'ACCOUNTS'], <Customers />)} />
        <Route path="customers/add" element={roleRoute(['ADMIN', 'SALES'], <AddCustomer />)} />
        <Route path="products" element={roleRoute(['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'], <Products />)} />
        <Route path="inventory" element={roleRoute(['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'], <Inventory />)} />
        <Route path="challans" element={roleRoute(['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'], <Challans />)} />
        <Route path="challans/create" element={roleRoute(['ADMIN', 'SALES'], <CreateChallan />)} />
        <Route path="reports" element={roleRoute(['ADMIN', 'SALES', 'ACCOUNTS'], <Reports />)} />
        <Route path="users" element={roleRoute(['ADMIN'], <Users />)} />
        <Route path="settings" element={roleRoute(['ADMIN'], <Settings />)} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};
