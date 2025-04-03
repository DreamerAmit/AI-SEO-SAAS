import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Registration from "./components/Users/Register";
import Login from "./components/Users/Login";
import Dashboard from "./components/Users/Dashboard";
import PrivateNavbar from "./components/Navbar/PrivateNavbar";
import PublicNavbar from "./components/Navbar/PublicNavbar";
import Home from "./components/Home/Home";
import { useAuth } from "./AuthContext/AuthContext";
import AuthRoute from "./components/AuthRoute/AuthRoute";
import BlogPostAIAssistant from "./components/ContentGeneration/ContentGeneration";
import BetaPlan from './components/Plans/BetaPlan';
import Plan from './components/Plans/Plan';
import FreePlanSignup from "./components/StripePayment/FreePlanSignup";
import CheckoutForm from "./components/StripePayment/CheckoutForm";
import PaymentSuccess from "./components/StripePayment/PaymentSuccess";
import ContentGenerationHistory from "./components/ContentGeneration/ContentHistory";
import AppFeatures from "./components/Support/Support";
//import AboutUs from "./components/About/About";
import Blogs from "./components/Blogs/Blogs";
import BlogPost1 from './components/Blogs/posts/BlogPost1';
import BlogPost2 from './components/Blogs/posts/BlogPost2';
import BlogPost3 from './components/Blogs/posts/BlogPost3';
import Images from './components/Images/Images';
import AccountPage from './components/Account/Account';
import Help from './components/Help/Help';
import EmailConfirmation from './components/Users/emailConfirmation';
import ScrapePage from './components/Images/ScrapePage';  
import ScrapedImages from './components/Images/ScrapedImages';
import UploadImages from './components/Images/UploadImages';
import './App.css';  // or wherever your global CSS file is located
import { Toaster } from 'react-hot-toast';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CaptionGenerator from "./components/Images/CaptionGenerator";

export default function App() {
  //custom auth hook
  const { isAuthenticated } = useAuth();

  return (
    <>
      <Toaster position="top-right" />
      <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
        <BrowserRouter>
          {/* Navbar */}
          {isAuthenticated ? <PrivateNavbar /> : <PublicNavbar />}
          <Routes>
            <Route path="/register" element={<Registration />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/dashboard"
              element={
                <AuthRoute>
                  <Dashboard />
                </AuthRoute>
              }
            />
            <Route
              path="/generate-content"
              element={
                <AuthRoute>
                  <BlogPostAIAssistant />
                </AuthRoute>
              }
            />
            <Route
              path="/history"
              element={
                <AuthRoute>
                  <ContentGenerationHistory />
                </AuthRoute>
              }
            />
            <Route path="/" element={<Home />} />
            <Route path="/plans" element={<Plan />} />
            <Route
              path="/free-plan"
              element={
                <AuthRoute>
                  <FreePlanSignup />
                </AuthRoute>
              }
            />
            <Route
              path="/checkout/:plan"
              element={
                <AuthRoute>
                  <CheckoutForm />
                </AuthRoute>
              }
            />
            <Route path="/success" element={<PaymentSuccess />} />
            <Route path="/support" element={<AppFeatures />} />
            <Route path="/blogs" element={<Blogs />} />
            <Route path="/blog/post1" element={<BlogPost1 />} />
            <Route path="/blog/post2" element={<BlogPost2 />} />
            <Route path="/blog/post3" element={<BlogPost3 />} />
            <Route path="/images" element={<Images />} /> 
            <Route path="/scrape" element={<ScrapePage />} />
            <Route path="/scraped-images" element={<ScrapedImages />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="/help" element={<Help />} />
            <Route path="/confirm-email/:token" element={<EmailConfirmation />} />
            <Route path="/upload-images" element={<UploadImages />} />
            <Route
              path="/caption-generator"
              element={
                <AuthRoute>
                  <CaptionGenerator />
                </AuthRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </GoogleOAuthProvider>
      <ToastContainer 
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
}