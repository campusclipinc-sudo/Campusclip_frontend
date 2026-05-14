import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useSocketConnection } from "../hooks/useSocket";

/**
 * SocketProvider Component
 * Initializes Socket.io connection when user is authenticated
 */
const SocketProvider = ({ children }) => {
  const accessToken = useSelector((state) => state.user?.accessToken);
  // Initialize socket connection with access token
  useSocketConnection(accessToken);

  return <>{children}</>;
};

export default SocketProvider;
