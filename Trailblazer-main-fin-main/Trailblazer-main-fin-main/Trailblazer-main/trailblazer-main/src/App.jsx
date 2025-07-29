import React from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Shared Components
import Header from "./assets/components/Header";
import Hero from "./assets/components/Hero";
import Services from "./assets/components/Services";
import HowItWorks from "./assets/components/How It Works";
import About from "./assets/components/About";
import Footer from "./assets/components/Footer";

// Pages
import Login from "./assets/Login/Login";
import SignUp from "./assets/SignUp/SignUp";
import AdminLogin from "./assets/AdminLogin/AdminLogin";
import ContactForm from "./assets/ContactForm/ContactForm";
import AboutUs from "./assets/AboutUs/AboutUs";
import ForgotPassword from "./assets/ForgotPassword/forgot-password";
import VerifyEmail from "./assets/VerifyEmail/VerifyEmail";
import Dashboard from "./assets/Dashboard/Dashboard";
import Terms from "./assets/Terms/Terms";
import ProfilePage from "./assets/Dashboard/ProfilePage";
import OrderHistory from "./assets/Dashboard/OrderHistory";
import Basket from "./assets/Basket/Basket";
import Delivery from "./assets/Delivery/Delivery";
import DeliveryAddress from "./assets/DeliveryAddress/DeliveryAddress";
import UploadFiles from "./assets/UploadFiles/UploadFiles";
import Payment from "./assets/Payment/Payment";
import Layout from "./assets/Layout/Layout";
import TemplateDetail from "./assets/TemplateDetail/TemplateDetail";
import LayoutSpecification from "./assets/LayoutSpecification/LayoutSpecification";
import OrderConfirmed from "./assets/OrderConfirmed/OrderConfirmed";
import AdminDashboard from "./assets/AdminPage/AdminDashboard";
import AdminOrderHistory from "./assets/AdminPage/AdminOrderHistory";
import UserList from "./assets/UserList/UserList";

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Home Page */}
        <Route
          path="/"
          element={
            <>
              <Header />
              <Hero />
              <Services />
              <HowItWorks />
              <About />
              <Footer />
            </>
          }
        />
        {/* Contact Page */}
        <Route
          path="/contact"
          element={
            <>
              <Header />
              <ContactForm />
              <Footer />
            </>
          }
        />
        {/* About Us Page */}
        <Route
          path="/aboutus"
          element={
            <>
              <Header />
              <AboutUs />
              <Footer />
            </>
          }
        />
        {/* Terms & Privacy Policy (Separate Routes) */}
        <Route
          path="/terms"
          element={
            <>
              <Header />
              <Terms />
            </>
          }
        />
        <Route
          path="/privacy"
          element={
            <>
              <Header />
              <Terms />
            </>
          }
        />
        <Route
          path="/upload/:service"
          element={
            <>
              <Header />
              <UploadFiles />
            </>
          }
        />
        <Route
          path="/upload"
          element={
            <>
              <Header />
              <UploadFiles />
            </>
          }
        />
        <Route
          path="/basket"
          element={
            <>
              <Header />
              <Basket />
            </>
          }
        />
        <Route
          path="/delivery"
          element={
            <>
              <Header />
              <Delivery />
            </>
          }
        />
        <Route
          path="/deliveryaddress"
          element={
            <>
              <Header />
              <DeliveryAddress />
            </>
          }
        />
        <Route
          path="/payment"
          element={
            <>
              <Header />
              <Payment />
            </>
          }
        />
        <Route
          path="/confirmation"
          element={
            <>
              <Header />
              <OrderConfirmed />
            </>
          }
        />
        <Route
          path="/layout"
          element={
            <>
              <Header />
              <Layout />
              <Footer />
            </>
          }
        />
        <Route
          path="/template/:templateId"
          element={
            <>
              <Header />
              <TemplateDetail />
            </>
          }
        />
        <Route
          path="/template/:templateId/specification"
          element={
            <>
              <Header />
              <LayoutSpecification />
            </>
          }
        />
        <Route
          path="/specifications"
          element={
            <>
              <Header />
              <LayoutSpecification />
            </>
          }
        />
        {/* Auth Pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/adminlogin" element={<AdminLogin />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/service" element={<Services />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/orderhistory" element={<OrderHistory />} />
        <Route path="/upload/:service" element={<UploadFiles />} />
        <Route path="/upload" element={<UploadFiles />} />
        <Route path="/basket" element={<Basket />} />
        <Route path="/delivery" element={<Delivery />} />
        <Route path="/deliveryaddress" element={<DeliveryAddress />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/confirmation" element={<OrderConfirmed />} />
        <Route path="/admindashboard" element={<AdminDashboard />} />
        <Route path="/admin-orderhistory" element={<AdminDashboard />} />
        <Route path="/admin-sales" element={<AdminDashboard />} />
        <Route path="/admin-messages" element={<AdminDashboard />} />
        <Route path="/admin-profile" element={<AdminDashboard />} />
        <Route path="/admin/orders" element={<AdminOrderHistory />} />
        <Route path="/users" element={<UserList />} />
      </Routes>
    </Router>
  );
};

export default App;
