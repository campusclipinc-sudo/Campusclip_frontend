import React from "react";
import { useNavigate } from "react-router-dom";
import SEOHead from "../components/SEOHead";
import { getMetadata } from "../utils/seoConfig";

const Home = () => {
  const navigate = useNavigate();
  const metadata = getMetadata("home");

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "CampusClip",
    "url": "https://campusclip.com",
    "logo": "https://campusclip.com/favicon.png",
    "description": "Your all-in-one campus social platform for clubs, classes, events, and student connections.",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+1-xxx-xxx-xxxx",
      "contactType": "Customer Support"
    }
  };

  return (
    <>
      <SEOHead {...metadata} jsonLd={organizationSchema} />
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
    </>
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
