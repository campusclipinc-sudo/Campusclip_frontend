import React from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <h1>Welcome to user panel Home Page</h1>
      <div style={styles.buttonContainer}>
        <button style={styles.button} onClick={() => navigate("/login")}>
          Login
        </button>
        <button style={styles.button} onClick={() => navigate("/signup")}>
          Sign Up
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonContainer: {
    marginTop: 20,
    display: "flex",
    gap: "10px",
  },
  button: {
    padding: "10px 20px",
    fontSize: "16px",
    cursor: "pointer",
  },
};

export default Home;
