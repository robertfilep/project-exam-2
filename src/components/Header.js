import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { clearSession, useSession } from "../session";

const Header = () => {
  const { token, avatarUrl } = useSession();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const [query, setQuery] = useState(
    new URLSearchParams(location.search).get("q") || "",
  );
  React.useEffect(() => {
    setMenuOpen(false);
    setQuery(new URLSearchParams(location.search).get("q") || "");
  }, [location]);

  const handleLogout = () => {
    clearSession();
    setMenuOpen(false);
    navigate("/");
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/?q=${encodeURIComponent(query.trim())}`);
    } else {
      navigate("/");
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark py-3">
      <div className="container">
        {/* Left: Logo and Brand */}
        <Link to="/" className="navbar-brand d-flex align-items-center">
          <img
            src={process.env.PUBLIC_URL + "/logoBlue.png"}
            alt="Logo"
            style={{ height: "40px", marginRight: "10px" }}
          />
          <span className="fs-4 fw-bold">Holidaze</span>
        </Link>

        {/* Mobile: Hamburger Toggle + Profile Image */}
        <div className="d-lg-none d-flex align-items-center ms-auto">
          <button
            className="navbar-toggler me-2"
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-controls="navbarContent"
            aria-expanded={menuOpen}
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          {token && avatarUrl && (
            <img
              src={avatarUrl}
              alt="Profile"
              className="rounded-circle"
              style={{ height: "40px", width: "40px", objectFit: "cover" }}
            />
          )}
        </div>

        {/* Collapsible Content */}
        <div
          className={`collapse navbar-collapse${menuOpen ? " show" : ""}`}
          id="navbarContent"
        >
          {/* Center: Search Bar */}
          <div className="d-flex flex-grow-1 justify-content-center">
            <form
              role="search"
              onSubmit={handleSearchSubmit}
              className="d-flex"
              style={{ maxWidth: "500px", width: "100%" }}
            >
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="form-control me-2"
                placeholder="Search venues..."
                aria-label="Search venues"
              />
              <button type="submit" className="btn btn-outline-light">
                Search
              </button>
            </form>
          </div>

          {/* Right: Navigation Links (Desktop) */}
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0 align-items-center">
            <li className="nav-item">
              <Link className="nav-link" to="/">
                Home
              </Link>
            </li>
            {token ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/profile">
                    Profile
                  </Link>
                </li>
                <li className="nav-item">
                  <button
                    className="btn nav-link btn-link"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </li>
                {/* Desktop: Show profile image to the right */}
                {avatarUrl && (
                  <li className="nav-item ms-2 d-none d-lg-block">
                    <img
                      src={avatarUrl}
                      alt="Profile"
                      className="rounded-circle"
                      style={{
                        height: "40px",
                        width: "40px",
                        objectFit: "cover",
                      }}
                    />
                  </li>
                )}
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">
                    Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/register">
                    Register
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Header;
