import { Link, useLocation } from "wouter";
import { useState } from "react";
import { ChevronDown, Home, LogOut, Menu, X, Briefcase, BookOpen, CreditCard, Info, Sparkles, Mail, Handshake, HelpCircle, Award } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import sealLogo from "@assets/image_1771692892158.png";

const navLinks = [
  { label: "Home", href: "/", hideOn: "/" },
  { label: "Courses", href: "/courses" },
  { label: "Subscription", href: "/pricing" },
];

const udyogDropdownItems = [
  { label: "Internship", href: "/shishya/udyog", icon: Briefcase },
  { label: "Jobs", href: "/shishya/udyog/jobs", icon: BookOpen },
];

const moreDropdownItems = [
  { label: "About Our Shiksha", href: "/about", icon: Info },
  { label: "AI Usha Mentor", href: "/ai-usha-mentor", icon: Sparkles },
  { label: "Certifications", href: "/shishya/certificates", icon: Award },
  { label: "Become a Guru", href: "/become-guru", icon: Handshake },
  { label: "Help Center", href: "/help", icon: HelpCircle },
  { label: "Contact Us", href: "/contact", icon: Mail },
  { label: "Become a Partner", href: "/become-a-partner", icon: Handshake },
];

function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function LandingNavbar() {
  const [location, setLocation] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();

  const displayName = user?.fullName ? toTitleCase(user.fullName) : null;

  const initials = user?.fullName
    ? user.fullName.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() || "U";

  const handleLogout = async () => {
    await logout();
    setLocation("/");
    setMobileOpen(false);
  };

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      <nav className="auth-navbar" data-testid="auth-navbar">
        <div className="auth-navbar-inner">
          <Link href="/" className="auth-navbar-brand" data-testid="link-home" onClick={closeMobile}>
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
                    <item.icon className="w-3.5 h-3.5 shrink-0" />
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
                    <item.icon className="w-3.5 h-3.5 shrink-0" />
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
                          {displayName || "Student"}
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
                    <Link href="/signup" className="auth-navbar-dropdown-item" data-testid="link-profile-signup">
                      Sign up
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Mobile hamburger */}
            <button
              className="landing-nav-hamburger"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              data-testid="button-mobile-menu-toggle"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile slide-down menu */}
      {mobileOpen && (
        <>
          <div
            className="landing-nav-mobile-backdrop"
            onClick={closeMobile}
            data-testid="mobile-menu-backdrop"
          />
          <div className="landing-nav-mobile-menu" data-testid="mobile-menu-panel">
            {user && (
              <div className="landing-nav-mobile-user">
                <span className="landing-nav-avatar landing-nav-avatar-lg">{initials}</span>
                <div>
                  <div className="text-sm font-semibold text-white">{displayName || "Student"}</div>
                  <div className="text-xs" style={{ color: "rgba(148,163,184,0.7)" }}>{user.email}</div>
                </div>
              </div>
            )}

            <div className="landing-nav-mobile-section">
              <div className="landing-nav-mobile-label">Navigation</div>
              {navLinks.filter((link) => !link.hideOn || link.hideOn !== location).map((link) => (
                <Link key={link.label} href={link.href} className="landing-nav-mobile-item" onClick={closeMobile}
                  data-testid={`mobile-link-${link.label.toLowerCase()}`}>
                  {link.label}
                </Link>
              ))}
              <div className="landing-nav-mobile-label" style={{ marginTop: "1rem" }}>Our Udyog</div>
              {udyogDropdownItems.map((item) => (
                <Link key={item.label} href={item.href} className="landing-nav-mobile-item" onClick={closeMobile}
                  data-testid={`mobile-link-udyog-${item.label.toLowerCase()}`}>
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              ))}
              <div className="landing-nav-mobile-label" style={{ marginTop: "1rem" }}>More</div>
              {moreDropdownItems.map((item) => (
                <Link key={item.label} href={item.href} className="landing-nav-mobile-item" onClick={closeMobile}
                  data-testid={`mobile-link-more-${item.label.toLowerCase()}`}>
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="landing-nav-mobile-actions">
              {user ? (
                <>
                  <Link href="/shishya/dashboard" className="landing-nav-mobile-btn-primary" onClick={closeMobile}
                    data-testid="mobile-link-dashboard">
                    <Home className="w-4 h-4" />
                    Dashboard
                  </Link>
                  <button className="landing-nav-mobile-btn-ghost" onClick={handleLogout}
                    data-testid="mobile-button-logout">
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="landing-nav-mobile-btn-primary" onClick={closeMobile}
                    data-testid="mobile-link-login">
                    Login
                  </Link>
                  <Link href="/signup" className="landing-nav-mobile-btn-ghost" onClick={closeMobile}
                    data-testid="mobile-link-signup">
                    Sign Up Free
                  </Link>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
