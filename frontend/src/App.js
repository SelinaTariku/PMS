import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./pages/login";
import ForgotPassword from "./pages/forgotPassword";
import Dashboard from "./pages/Dashboard"
import CustomerLogin from "./pages/CustomerLogin";
import CustChangePassword from "./pages/customerChngePassword"
import SignUp from "./pages/Signup"
import CustomerForgetPassword from "./pages/CustomerForgetPassword"
import ProductPage from "./components/Customner/ProductListforCustomer";
import ProductListAfterCustLogin from "./components/Customner/productListAfterCustLogin"

import PortalPage from "./pages/Portal";
import Home from "./components/web/Home";
import About from "./components/web/About";
import NewsEvents from "./components/web/News";
import Subscribe from "./components/web/addPharmacy";
import Contact from "./components/web/contact";
import PharmacSphere from "./pages/web/webPages";

import AuthRoute from "./components/AuthRoute";
import ChangePassword from "./pages/ChangePassword";
import InvalidPermission from "./components/InvalidPermission";




import PharmacyOverview from "./components/Dashboards/Pharmamcy/PharmacyOverview";
import BranchOverview from "./components/Dashboards/Branch/branchOverview";

import UserManagement from "./components/UserManagment/UserManagment";

import PharmacyManagement from "./components/PharmacyManagment/PharmacyManagement";
import PharmacyManagementForBranchManage from "./components/PharmacyManagment/PharmacyManagementForBranchManager"
import AutorisePharmacy from './components/PharmacyManagment/AuthorisePharmacy';
import UnautorisedPharmacy from "./components/PharmacyManagment/UnautorisedPharmacy";
import RejectedPharmacy from "./components/PharmacyManagment/RejectedPharmacy";
import SessionManager from "./components/SessionManager";
import ManagePermission from "./components/ManageRolePermission/PermissionManagement";
import ManageRole from "./components/ManageRolePermission/RoleManagement";

import ManageBranch from "./components/branchManagement/BranchManagment";

import ManagementProduct from "./components/ProductManagement/ProductManagement";
import OrderManagement from "./components/OrderManagemetn/OrderManagement";

import PaymentProcessing from "./components/PaymentProcessing/paymentProcessing";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PharmacSphere />}>
          <Route path="Home" element={<Home />} />
          <Route path="AboutUs" element={<About />} />
          <Route path="News&Events" element={<NewsEvents />} />
          <Route path="Subscribe" element={<Subscribe />} />
          <Route path="ContactUs" element={<Contact />} />
        </Route>

        <Route path="/PMS.com" element={<ProductPage />}> </Route>
        <Route path="/PMS/login" element={<CustomerLogin />}> </Route>
        <Route path="/PMS/Chnage-Password" element={<CustChangePassword />}> </Route>
        <Route path="/PMS/signUp" element={<SignUp />}> </Route>
        <Route path="/PMS/forgot-password" element={<CustomerForgetPassword />}> </Route>
        <Route path="/PMS/products" element={<AuthRoute><ProductListAfterCustLogin /></AuthRoute>}> </Route>
        
        <Route path="/PharmacSphere" element={<Login />} />
        <Route path="/PharmacSphere/ChangePassword" element={<ChangePassword />} />
        <Route path="/PharmacSphere/forgot-password" element={<ForgotPassword />} />
        <Route path="/invalid-permission" element={<InvalidPermission />} /> 

        <Route path="/PharmacSphere/Portal" element={<AuthRoute><PortalPage /></AuthRoute>}>
          <Route
            path="Dashboard/PharmacyOverview"
            element={
              <SessionManager requiredPermission="PharmacyOverview">
                <AuthRoute><PharmacyOverview /></AuthRoute>
              </SessionManager>
            }
          />
           <Route
            path="Dashboard/Dashboard"
            element={
              <SessionManager requiredPermission="Dashboard">
                <AuthRoute><Dashboard/></AuthRoute>
              </SessionManager>
            }
          />
          
          <Route
            path="Dashboard/BranchOverview"
            element={
              <SessionManager requiredPermission="BranchOverview">
                <AuthRoute><BranchOverview /></AuthRoute>
              </SessionManager>
            }
          />
          <Route
            path="PharmacyManagement/ManagePharmacy"
            element={
              <SessionManager requiredPermission="ManagePharmacy">
                <AuthRoute><PharmacyManagement /></AuthRoute>
              </SessionManager>
            }
          />
          <Route
            path="PharmacyManagement/AutorisePharmacy"
            element={
              <SessionManager requiredPermission="AutorisePharmacy">
                <AuthRoute><AutorisePharmacy /></AuthRoute>
              </SessionManager>
            }
          />
          <Route
            path="PharmacyManagement/UnautorisedPharmacy"
            element={
              <SessionManager requiredPermission="UnautorisedPharmacy">
                <AuthRoute><UnautorisedPharmacy /></AuthRoute>
              </SessionManager>
            }
          />
          <Route
            path="PharmacyManagement/RejectedPharmacy"
            element={
              <SessionManager requiredPermission="RejectedPharmacy">
                <AuthRoute><RejectedPharmacy /></AuthRoute>
              </SessionManager>
            }
          />
          <Route
            path="AccountSetting/ManageUser"
            element={
              <SessionManager requiredPermission="ManageUser">
                <AuthRoute><UserManagement /></AuthRoute>
              </SessionManager>
            }
          />
          <Route
            path="AccountSetting/ManagePermission"
            element={
              <SessionManager requiredPermission="ManagePermission">
                <AuthRoute><ManagePermission /></AuthRoute>
              </SessionManager>
            }
          />
          <Route
            path="AccountSetting/ManageRole"
            element={
              <SessionManager requiredPermission="ManageRole">
                <AuthRoute><ManageRole /></AuthRoute>
              </SessionManager>
            }
          />
          <Route
            path="BranchManagement/ManageBranch"
            element={
              <SessionManager requiredPermission="ManageBranch">
                <AuthRoute><ManageBranch /></AuthRoute>
              </SessionManager>
            }
          />
          <Route
            path="ProductManagement"
            element={
              <SessionManager requiredPermission="ProductManagement">
                <AuthRoute><ManagementProduct /></AuthRoute>
              </SessionManager>
            }
          />
          <Route
            path="OrderManagement"
            element={
              <SessionManager requiredPermission="OrderManagement">
                <AuthRoute><OrderManagement /></AuthRoute>
              </SessionManager>
            }
          />
          <Route
            path="PaymentProcessing"
            element={
              <SessionManager requiredPermission="PaymentProcessing">
                <AuthRoute><PaymentProcessing /></AuthRoute>
              </SessionManager>
            }
          />
           <Route
            path="Pharmacy"
            element={
              <SessionManager requiredPermission="Pharmacy">
                <AuthRoute><PharmacyManagementForBranchManage /></AuthRoute>
              </SessionManager>
            }
          />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;