import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import BalancesPage from './pages/BalancesPage';
import VouchersListPage from './pages/vouchers/VouchersListPage';
import CreateVoucherPage from './pages/vouchers/CreateVoucherPage';
import VoucherDetailPage from './pages/vouchers/VoucherDetailPage';
import SettlementsListPage from './pages/settlements/SettlementsListPage';
import TransfersListPage from './pages/transfers/TransfersListPage';
import AccountStatementPage from './pages/AccountStatementPage';
import PartiesStatementPage from './pages/PartiesStatementPage';
import ExpensesReportPage from './pages/ExpensesReportPage';
import DuesAndChecksPage from './pages/DuesAndChecksPage';
import MasterDataPage from './pages/master-data/MasterDataPage';
import UsersPage from './pages/users/UsersPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<BalancesPage />} />
        <Route path="vouchers" element={<VouchersListPage />} />
        <Route path="vouchers/new" element={<CreateVoucherPage />} />
        <Route path="vouchers/:id/edit" element={<CreateVoucherPage />} />
        <Route path="vouchers/:id" element={<VoucherDetailPage />} />
        <Route path="settlements" element={<SettlementsListPage />} />
        <Route path="transfers" element={<TransfersListPage />} />
        <Route path="statement" element={<AccountStatementPage />} />
        <Route path="parties-statement" element={<PartiesStatementPage />} />
        <Route path="expenses-report" element={<ExpensesReportPage />} />
        <Route path="dues-and-checks" element={<DuesAndChecksPage />} />
        <Route path="master-data/:resource" element={<MasterDataPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
