import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell, LayoutDashboard, ListChecks, Menu, UserCircle2, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";

function AppLayout({ title, children }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const move = (event) => setCursor({ x: event.clientX, y: event.clientY });
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("mousemove", move);
    window.addEventListener("scroll", onScroll);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="app-shell premium-grid min-vh-100">
      <div className="cursor-glow" style={{ left: cursor.x - 140, top: cursor.y - 140 }} />
      <aside className={`sidebar ${sidebarOpen ? "" : "collapsed"}`}>
        <div className="sidebar-top">
          <button className="icon-btn" type="button" onClick={() => setSidebarOpen((prev) => !prev)}>
            {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
          {sidebarOpen && <span className="brand">TaskFlow</span>}
        </div>
        <nav className="sidebar-nav">
          <Link className="nav-pill" to="/dashboard" title="Dashboard">
            <LayoutDashboard size={18} />
            {sidebarOpen && <span>Dashboard</span>}
          </Link>
          <Link className="nav-pill" to="/dashboard" title="Tasks">
            <ListChecks size={18} />
            {sidebarOpen && <span>Tasks</span>}
          </Link>
          <Link className="nav-pill" to="/profile" title="Profile">
            <UserCircle2 size={18} />
            {sidebarOpen && <span>Profile</span>}
          </Link>
        </nav>
      </aside>
      <div className="content-shell">
        <header className={`topbar ${scrolled ? "scrolled" : ""}`}>
          <div>
            <p className="crumb">Workspace / Dashboard</p>
            <h2 className="topbar-title">{title}</h2>
          </div>
          <div className="topbar-actions">
            <button className="icon-btn" type="button" aria-label="notifications">
              <Bell size={16} />
            </button>
            <button className="btn btn-sm btn-light rounded-pill px-3" type="button" onClick={handleLogout}>
              Sign out
            </button>
          </div>
        </header>
        <main className="content-main">{children}</main>
        <nav className="mobile-bottom-nav">
          <Link to="/dashboard">
            <LayoutDashboard size={16} />
            <span>Home</span>
          </Link>
          <Link to="/dashboard">
            <ListChecks size={16} />
            <span>Tasks</span>
          </Link>
          <Link to="/profile">
            <UserCircle2 size={16} />
            <span>Profile</span>
          </Link>
        </nav>
      </div>
    </div>
  );
}

export default AppLayout;
