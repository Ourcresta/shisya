import { Link, useLocation } from "wouter";
import { ChevronDown, Home, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import sealLogo from "@assets/image_1771692892158.png";

const navLinks = [
  { label: "Home", href: "/", hideOn: "/" },
  { label: "Courses", href: "/courses" },
  { label: "Subscription", href: "/pricing" },
];

const udyogDropdownItems = [
  { label: "Internship", href: "/shishya/udyog" },
  { label: "Jobs", href: "/shishya/udyog/jobs" },
];

const moreDropdownItems = [
  { label: "About Our Shiksha", href: "#" },
  { label: "AI Usha Mentor", href: "#" },
  { label: "Certifications", href: "#" },
  { label: "Become a Guru", href: "#" },
  { label: "Help Center", href: "#" },
  { label: "Contact Us", href: "#" },
];

export function LandingNavbar() {
  const [location, setLocation] = useLocation();
  const { user, logout } = useAuth();

  const initials = user?.fullName
    ? user.fullName.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() || "U";

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  return (
    <nav className="auth-navbar" data-testid="auth-navbar">
      <div className="auth-navbar-inner">
        <Link href="/" className="auth-navbar-brand" data-testid="link-home">
          <img src={sealLogo} alt="OurShiksha" className="auth-navbar-logo" />
          <span className="auth-navbar-brand-text">
            Our <span className="auth-navbar-brand-accent">Shiksha</span>
          </span>
        </Link>

        <div className="auth-navbar-links">
          {navLinks.filter((link) => !link.hideOn || link.hideOn !== location).map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="auth-navbar-link"
              data-testid={`link-nav-${link.label.toLowerCase()}`}
            >
              {link.label}
              <ChevronDown className="auth-navbar-chevron" />
            </Link>
          ))}
          <div className="auth-navbar-dropdown" data-testid="nav-udyog-dropdown">
            <button className="auth-navbar-link" data-testid="link-nav-udyog">
              Our Udyog
              <ChevronDown className="auth-navbar-chevron" />
            </button>
            <div className="auth-navbar-dropdown-menu">
              {udyogDropdownItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="auth-navbar-dropdown-item"
                  data-testid={`link-udyog-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="auth-navbar-dropdown" data-testid="nav-more-dropdown">
            <button className="auth-navbar-link" data-testid="link-nav-more">
              More
              <ChevronDown className="auth-navbar-chevron" />
            </button>
            <div className="auth-navbar-dropdown-menu">
              {moreDropdownItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="auth-navbar-dropdown-item"
                  data-testid={`link-more-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="auth-navbar-right">
          <div className="auth-navbar-dropdown auth-navbar-dropdown-right" data-testid="nav-profile-dropdown">
            <button className="auth-navbar-action" data-testid="link-nav-profile">
              {user && (
                <span className="landing-nav-avatar" data-testid="avatar-initials">
                  {initials}
                </span>
              )}
              Profile
              <ChevronDown className="auth-navbar-chevron" />
            </button>
            <div className="auth-navbar-dropdown-menu auth-navbar-dropdown-menu-right landing-nav-profile-menu">
              {user ? (
                <>
                  <div className="landing-nav-user-info" data-testid="text-user-info">
                    <span className="landing-nav-avatar landing-nav-avatar-lg" data-testid="avatar-initials-lg">
                      {initials}
                    </span>
                    <div className="landing-nav-user-details">
                      <span className="landing-nav-user-name" data-testid="text-user-name">
                        {user.fullName || "Student"}
                      </span>
                      <span className="landing-nav-user-email" data-testid="text-user-email">
                        {user.email}
                      </span>
                    </div>
                  </div>
                  <Link
                    href="/shishya/dashboard"
                    className="auth-navbar-dropdown-item landing-nav-dashboard-link"
                    data-testid="link-profile-dashboard"
                  >
                    <Home className="w-4 h-4" />
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="landing-nav-logout-btn"
                    data-testid="button-logout"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="auth-navbar-dropdown-item" data-testid="link-profile-login">
                    Login
                  </Link>
                  <Link href="/signup" className="auth-navbar-dropdown-item" data-testid="link-profile-signup-shishya">
                    Sign up as Shishya
                  </Link>
                  <Link href="/signup?role=guru" className="auth-navbar-dropdown-item" data-testid="link-profile-signup-guru">
                    Sign up as Guru
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
