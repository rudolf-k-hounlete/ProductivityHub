import React from "react";
import { AppProvider } from "./context/AppContext";
import { ThemeProvider } from "./components/ThemeProvider";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import ModuleRouter from "./components/ModuleRouter";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";

function App() {
  return (
    <AppProvider>
      <ThemeProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <div className="min-h-screen bg-gray-50">
                    <Sidebar />
                    <Header />
                    <ModuleRouter />
                  </div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </ThemeProvider>
    </AppProvider>
  );
}

export default App;
