import React from "react";
import { Container, Navbar, Nav, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import logo from "../../assets/logo.png";
import { useDispatch, useSelector } from "react-redux";
import { isUserLoggedIn, logout } from "../../store/userSlice";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Header = () => {
  const dispatch = useDispatch();
  const checkloggedinuser = useSelector(isUserLoggedIn);
  const navigate = useNavigate();
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
                dispatch(logout());
                navigate("/login");
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
