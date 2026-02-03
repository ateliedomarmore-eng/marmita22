import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    Users,
    DollarSign,
    LogOut,
    Menu,
    X
} from 'lucide-react';

export default function Layout({ children }) {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

    async function handleLogout() {
        try {
            await logout();
            navigate('/login');
        } catch (err) {
            console.error("Falha ao sair:", err);
        }
    }

    const navItems = [
        { path: '/', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { path: '/funcionarios', label: 'Funcionários', icon: <Users size={20} /> },
        { path: '/financeiro', label: 'Financeiro', icon: <DollarSign size={20} /> },
    ];

    const SidebarContent = () => (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '1.5rem' }}>
            <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ background: 'var(--primary)', padding: '0.5rem', borderRadius: '0.5rem', color: 'white' }}>
                    🍱
                </div>
                <h3 style={{ fontSize: '1.1rem', color: 'var(--primary)' }}>Marmita Control</h3>
            </div>

            <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {navItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsSidebarOpen(false)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.75rem 1rem',
                            borderRadius: '0.5rem',
                            textDecoration: 'none',
                            color: location.pathname === item.path ? 'var(--primary)' : 'var(--text-muted)',
                            background: location.pathname === item.path ? 'var(--glass-bg)' : 'transparent',
                            fontWeight: location.pathname === item.path ? '600' : '400',
                            transition: 'all 0.2s'
                        }}
                    >
                        {item.icon}
                        {item.label}
                    </Link>
                ))}
            </nav>

            <button
                onClick={handleLogout}
                className="btn"
                style={{
                    marginTop: 'auto',
                    justifyContent: 'flex-start',
                    color: 'var(--danger)',
                    background: 'transparent',
                    padding: '0.75rem 1rem',
                    fontWeight: '500'
                }}
            >
                <LogOut size={20} />
                Sair
            </button>
        </div>
    );

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
            {/* Desktop Sidebar */}
            <aside className="glass" style={{ width: '260px', position: 'fixed', height: '100vh', display: 'none', md: 'block', borderRight: '1px solid var(--border)' }}>
                <SidebarContent />
            </aside>

            {/* Mobile Header */}
            <header className="glass" style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                height: '60px',
                display: 'flex',
                alignItems: 'center',
                padding: '0 1rem',
                zIndex: 100,
                borderBottom: '1px solid var(--border)'
            }}>
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="btn"
                    style={{ background: 'transparent', padding: '0.5rem', color: 'var(--text)' }}
                >
                    {isSidebarOpen ? <X /> : <Menu />}
                </button>
                <h3 style={{ marginLeft: '1rem', fontSize: '1rem' }}>Marmita Control</h3>
            </header>

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    onClick={() => setIsSidebarOpen(false)}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.5)',
                        zIndex: 150,
                        backdropFilter: 'blur(2px)'
                    }}
                />
            )}

            {/* Mobile Sidebar */}
            <aside className="glass" style={{
                position: 'fixed',
                top: 0,
                left: isSidebarOpen ? 0 : '-280px',
                width: '280px',
                height: '100vh',
                zIndex: 200,
                transition: 'left 0.3s ease',
                borderRight: '1px solid var(--border)'
            }}>
                <SidebarContent />
            </aside>

            {/* Main Content */}
            <main style={{
                flex: 1,
                marginLeft: '0', // Adjust for sidebar on desktop later if needed via CSS
                marginTop: '60px',
                padding: '1.5rem',
                maxWidth: '1200px',
                marginInline: 'auto',
                width: '100%'
            }}>
                {children}
            </main>

            <style>{`
        @media (min-width: 768px) {
          aside:first-of-type { display: block !important; }
          header { display: none !important; }
          main { margin-left: 260px !important; margin-top: 0 !important; }
        }
      `}</style>
        </div>
    );
}
