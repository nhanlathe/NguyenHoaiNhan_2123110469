import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import Login from './pages/auth/Login';
import DashboardLayout from './components/DashboardLayout';
import DashboardHome from './pages/home/DashboardHome';
import Products from './pages/product/Products';
import Customers from './pages/customer/Customers';
import Staff from './pages/auth/Staff';
import POS from './pages/pos/POS';
import SalesHistory from './pages/pos/SalesHistory';
import VoucherManager from './pages/admin/VoucherManager';
import SupportInbox from './pages/admin/SupportInbox';
import Home from './pages/storefront/Home';
import CustomerProfile from './pages/customer/CustomerProfile';
import CustomerSupport from './pages/customer/CustomerSupport';
import Cart from './pages/storefront/Cart';
import OrderHistory from './pages/customer/OrderHistory';
import MyVouchers from './pages/customer/MyVouchers';
import AccountSettings from './pages/customer/AccountSettings';
import PaymentSuccess from './pages/storefront/PaymentSuccess';
import PaymentFail from './pages/storefront/PaymentFail';

function AppRoutes() {
  const { user } = useAuth();
  
  const PrivateRoute = ({ children, roles }) => {
    if (!user) return <Navigate to="/login" />;
    if (roles && !roles.includes(user.role)) return <Navigate to="/" />;
    return children;
  };

  return (
    <Routes>
      <Route path="/" element={user ? (user.role === 'Customer' ? <Navigate to="/home" /> : <Navigate to="/dashboard" />) : <Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      
      {/* Admin/Staff Routes */}
      <Route path="/dashboard" element={<PrivateRoute roles={['Admin', 'Staff']}><DashboardLayout /></PrivateRoute>}>
        <Route index element={<DashboardHome />} />
        <Route path="products" element={<Products />} />
        <Route path="customers" element={<Customers />} />
        <Route path="staff" element={<PrivateRoute roles={['Admin']}><Staff /></PrivateRoute>} />
        <Route path="vouchers" element={<PrivateRoute roles={['Admin']}><VoucherManager /></PrivateRoute>} />
        <Route path="support" element={<SupportInbox />} />
        <Route path="pos" element={<POS />} />
        <Route path="sales-history" element={<SalesHistory />} />
      </Route>

      {/* Customer Routes */}
      <Route path="/home" element={<Home />} />
      <Route path="/profile" element={<PrivateRoute roles={['Customer']}><CustomerProfile /></PrivateRoute>} />
      <Route path="/support" element={<PrivateRoute roles={['Customer']}><CustomerSupport /></PrivateRoute>} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/order-history" element={<PrivateRoute roles={['Customer']}><OrderHistory /></PrivateRoute>} />
      <Route path="/my-vouchers" element={<PrivateRoute roles={['Customer']}><MyVouchers /></PrivateRoute>} />
      <Route path="/account-settings" element={<PrivateRoute roles={['Customer']}><AccountSettings /></PrivateRoute>} />
      <Route path="/payment-success" element={<PaymentSuccess />} />
      <Route path="/payment-fail" element={<PaymentFail />} />
    </Routes>
  );
}

import { AlertProvider } from './context/AlertContext';

export default function App() {
  return (
    <AlertProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </AlertProvider>
  );
}
