import { lazy, Suspense, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { LazyMotion, domMax } from "framer-motion";
import AOS from "aos";
import "aos/dist/aos.css";

import Navbar from "./components/navbar";
import Footer from "./components/footer";
import ProtectedRoute from "./components/ProtectedRoute";
import AuroraBackground from "./components/AuroraBackground";
import GlassSkeleton from "./components/ui/GlassSkeleton";

// Dynamic Code-Splitting for Route-Level Bundles
const Landing = lazy(() => import("./pages/landing"));
const Login = lazy(() => import("./pages/auth/login"));
const Signup = lazy(() => import("./pages/auth/Signup"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/auth/ResetPassword"));
const GitHubCallback = lazy(() => import("./pages/auth/GitHubCallBack"));

const AboutUs = lazy(() => import("./pages/AboutUs"));
const Contact = lazy(() => import("./pages/Contact"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Profile = lazy(() => import("./pages/Profile"));

const SoilInsights = lazy(() => import("./pages/insights/SoilInsights"));
const SolarInsights = lazy(() => import("./pages/insights/SolarInsights"));
const CropInsights = lazy(() => import("./pages/insights/CropInsights"));
const SystemInsights = lazy(() => import("./pages/insights/SystemInsights"));
const NotFound = lazy(() => import("./pages/NotFound"));

function RouteLoadingFallback() {
  return (
    <div className="w-full min-h-[60vh] flex items-center justify-center p-6">
      <div className="glass p-8 rounded-3xl max-w-sm w-full text-center space-y-4">
        <GlassSkeleton variant="circular" width="48px" height="48px" className="mx-auto" />
        <GlassSkeleton variant="text" width="60%" className="mx-auto" />
        <GlassSkeleton variant="rectangular" height="36px" className="w-full" />
      </div>
    </div>
  );
}

function App() {
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      disable: () => typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches,
    });
  }, []);

  return (
    <LazyMotion features={domMax} strict={false}>
      <AuroraBackground />
      <Navbar />
      <main className="min-h-[100dvh] pt-20 md:pt-24 pb-safe-nav md:pb-8 relative">
        <Suspense fallback={<RouteLoadingFallback />}>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/contact" element={<Contact />} />

            {/* Auth routes */}
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/github/callback" element={<GitHubCallback />} />

            {/* Protected routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            <Route
              path="/insights/soil"
              element={
                <ProtectedRoute>
                  <SoilInsights />
                </ProtectedRoute>
              }
            />
            <Route
              path="/insights/solar"
              element={
                <ProtectedRoute>
                  <SolarInsights />
                </ProtectedRoute>
              }
            />
            <Route
              path="/insights/crop"
              element={
                <ProtectedRoute>
                  <CropInsights />
                </ProtectedRoute>
              }
            />
            <Route
              path="/insights/system"
              element={
                <ProtectedRoute>
                  <SystemInsights />
                </ProtectedRoute>
              }
            />

            {/* Catch-all 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>

      <Footer />
    </LazyMotion>
  );
}

export default App;
