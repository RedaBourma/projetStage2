
import { useState, useEffect, createContext, useContext } from "react";
import Layout from "@/components/Layout";
import LoginPage from "@/pages/LoginPage";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Create an auth context to manage authentication state globally
type AuthContextType = {
  isLoggedIn: boolean;
  login: () => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  login: () => {},
  logout: () => {},
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

const queryClient = new QueryClient();

const App = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Function to handle login
  const handleLogin = () => {
    setLoggedIn(true);
  };

  // Function to handle logout
  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    setLoggedIn(false);
    // Clear any cached data
    queryClient.clear();
  };

  // Check for existing auth token when the app loads
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      // Optional: You could validate the token with the backend here
      setLoggedIn(true);
    }
    setIsCheckingAuth(false);
  }, []);

  // Show a loading state while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-govbg">
        <div className="text-xl">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn: loggedIn, login: handleLogin, logout: handleLogout }}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          {loggedIn ? (
            <Layout />
          ) : (
            <LoginPage onLogin={handleLogin} />
          )}
        </TooltipProvider>
      </QueryClientProvider>
    </AuthContext.Provider>
  );
};

export default App;
