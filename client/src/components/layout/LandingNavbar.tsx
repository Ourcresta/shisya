import { Link, useLocation } from "wouter";
import { ChevronDown } from "lucide-react";
import sealLogo from "@assets/image_1771692892158.png";

const navLinks = [
  { label: "Courses", href: "/courses" },
  { label: "Subscription", href: "/pricing" },
];

const udyogDropdownItems = [
  { label: "Internship", href: "/shishya/udyog" },
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
  const [location] = useLocation();

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
          {navLinks.map((link) => (
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
              Profile
              <ChevronDown className="auth-navbar-chevron" />
            </button>
            <div className="auth-navbar-dropdown-menu auth-navbar-dropdown-menu-right">
              <Link href="/login" className="auth-navbar-dropdown-item" data-testid="link-profile-login">
                Login
              </Link>
              <Link href="/signup" className="auth-navbar-dropdown-item" data-testid="link-profile-signup-shishya">
                Sign up as Shishya
              </Link>
              <Link href="/signup?role=guru" className="auth-navbar-dropdown-item" data-testid="link-profile-signup-guru">
                Sign up as Guru
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
