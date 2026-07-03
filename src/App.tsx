import { useState, useEffect } from "react";
import { seedDatabaseIfEmpty, testConnection } from "./firebase";
import LoginScreen from "./components/LoginScreen";
import PilotDashboard from "./components/PilotDashboard";
import PilotRequestFlow from "./components/PilotRequestFlow";
import SupplyDashboard from "./components/SupplyDashboard";
import ExecutiveDashboard from "./components/ExecutiveDashboard";
import AdminDashboard from "./components/AdminDashboard";

interface UserSession {
  name: string;
  role: string;
  rank?: string;
  email: string;
}

export default function App() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [showRequestFlow, setShowRequestFlow] = useState(false);

  useEffect(() => {
    // Test Firestore connectivity and automatically seed initial data on boot
    const initFirebase = async () => {
      await testConnection();
      await seedDatabaseIfEmpty();
    };
    initFirebase();
  }, []);

  const handleLoginSuccess = (session: UserSession) => {
    setUser(session);
    setShowRequestFlow(false);
  };

  const handleLogout = () => {
    setUser(null);
    setShowRequestFlow(false);
  };

  if (!user) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  // Route based on role
  switch (user.role) {
    case "pilot":
      if (showRequestFlow) {
        return (
          <PilotRequestFlow 
            currentUser={user} 
            onClose={() => setShowRequestFlow(false)} 
          />
        );
      }
      return (
        <PilotDashboard 
          currentUser={user} 
          onNewRequestClick={() => setShowRequestFlow(true)} 
          onLogout={handleLogout}
        />
      );

    case "supply":
      return <SupplyDashboard currentUser={user} onLogout={handleLogout} />;

    case "commander":
    case "executive":
      return <ExecutiveDashboard currentUser={user} onLogout={handleLogout} />;

    case "admin":
      return <AdminDashboard currentUser={user} onLogout={handleLogout} />;

    default:
      return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }
}

