import React, { ReactNode, useEffect } from "react";
import { useAuth } from "../../hooks/use-auth";
import { useNavigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, session } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!session) {
      navigate("/login");
    }
  }, [user, session, navigate]);

  if (!session) {
    return null; // or a loading spinner
  }

  return <>{children}</>;
};

export default ProtectedRoute;
