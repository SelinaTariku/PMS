import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import ForgotPassword from "./pages/forgotPassword";
import PortalPage from "./pages/Portal";
import Home from "./components/web/Home"
import About from "./components/web/About"
import NewsEvents from "./components/web/News"
import Subscribe from "./components/web/addPharmacy"
import Contact from "./components/web/contact"
import PharmacSphere from "./pages/web/webPages";
import AuthRoute from "./components/AuthRoute";
import ChangePassword from "./pages/ChangePassword";
import PharmacyOverview from "./components/Dashboards/Pharmamcy/PharmacyOverview";
import BranchOverview from "./components/Dashboards/Branch/branchOverview";
import PharmacyManagement from "./components/PharmacyManagment/PharmacyManagement";
import AutorisePharmacy from './components/PharmacyManagment/AuthorisePharmacy';
import UserManagement from "./components/UserManagment/UserManagment";
import SessionManager from "./components/SessionManager";
import UnautorisedPharmacy from "./components/PharmacyManagment/UnautorisedPharmacy";
import RejectedPharmacy from "./components/PharmacyManagment/RejectedPharmacy";
import ManagePermission from "./components/ManageRolePermission/PermissionManagement"
import ManageRole from "./components/ManageRolePermission/RoleManagement"
const App = () => {
  return (
    <Router>
        <Routes>
          <Route path="/" element={<PharmacSphere />} >
          <Route path="Home" element={<Home />} />
            <Route path="AboutUs" element={<About />} />
            <Route path="News&Events" element={<NewsEvents/>} />
            <Route path="Subscribe" element={<Subscribe />} />
            <Route path="ContactUs" element={<Contact />} />
          </Route>
          <Route path="/PharmacSphere" element={<Login />} />
          <Route path="/PharmacSphere/ChangePassword" element={<ChangePassword />} />
          <Route path="/PharmacSphere/forgot-password" element={<ForgotPassword />} />

          <Route path="/PharmacSphere/Portal" element={<AuthRoute><PortalPage /></AuthRoute>}>
            <Route path="Dashboard/PharmacyOverview" element={<AuthRoute><PharmacyOverview /></AuthRoute>} />
            <Route path="Dashboard/BranchOverview" element={<AuthRoute><BranchOverview /></AuthRoute>} />
            <Route path="PharmacyManagement/ManagePharmacy" element={<AuthRoute><PharmacyManagement /></AuthRoute>} />
            <Route path="PharmacyManagement/AutorisePharmacy" element={<AuthRoute><AutorisePharmacy /></AuthRoute>} />
            <Route path="PharmacyManagement/UnautorisedPharmacy" element={<AuthRoute><UnautorisedPharmacy /></AuthRoute>} />
            <Route path="PharmacyManagement/RejectedPharmacy" element={<AuthRoute><RejectedPharmacy /></AuthRoute>} />
            <Route path="AccountSetting/ManageUser" element={<AuthRoute><UserManagement /></AuthRoute>} />
            <Route path="AccountSetting/ManagePermission" element={<AuthRoute><ManagePermission /></AuthRoute>} />
            <Route path="AccountSetting/ManageRole" element={<AuthRoute><ManageRole /></AuthRoute>} />
            
          </Route>
        </Routes>
    </Router>
  );
};

export default App;