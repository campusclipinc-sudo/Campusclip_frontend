import React from "react";
import { Container, Navbar, Nav, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import logo from "../../assets/logo.png";
import { useSelector } from "react-redux";
import { isUserLoggedIn } from "../../store/userSlice";
import { useLogout } from "../../hooks/useLogout";
import { toast } from "react-toastify";

const Header = () => {
  const checkloggedinuser = useSelector(isUserLoggedIn);
  const { logout } = useLogout();
  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="px-3">
      <Container fluid>
        {/* Logo */}
        <Navbar.Brand href="/">
          <img
            src={logo} // Replace with your logo path
            alt="Logo"
            height="40"
            className="d-inline-block align-top"
          />
        </Navbar.Brand>

        {/* Spacer & Logout */}
        <Nav className="ms-auto">
          {checkloggedinuser && (
            <Button
              variant="outline-light"
              onClick={() => {
                logout();
              }}
            >
              <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />
              Logout
            </Button>
          )}
        </Nav>
      </Container>
    </Navbar>
  );
};

export default Header;
