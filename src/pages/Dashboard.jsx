import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../services/firebase';
import {
    TrendingUp,
    TrendingDown,
    Users as UsersIcon,
    Plus,
    ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

export default function Dashboard() {
    const [sales, setSales] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const qSales = query(collection(db, 'sales'), orderBy('date', 'desc'));
        const qExpenses = query(collection(db, 'expenses'), orderBy('date', 'desc'));
        const qEmployees = query(collection(db, 'employees'));

        const unsubSales = onSnapshot(qSales, (snap) => setSales(snap.docs.map(d => d.data())));
        const unsubExpenses = onSnapshot(qExpenses, (snap) => setExpenses(snap.docs.map(d => d.data())));
        const unsubEmployees = onSnapshot(qEmployees, (snap) => setEmployees(snap.docs.map(d => d.data())));

        setLoading(false);
        return () => {
            unsubSales();
            unsubExpenses();
            unsubEmployees();
        };
    }, []);

    const currentMonth = new Date().toISOString().slice(0, 7);
    const monthlySales = sales
        .filter(s => s.date.startsWith(currentMonth))
        .reduce((acc, curr) => acc + curr.amount, 0);

    const monthlyExpenses = expenses
        .filter(e => e.date.startsWith(currentMonth))
        .reduce((acc, curr) => acc + curr.amount, 0);

    const chartData = {
        labels: ['Vendas', 'Gastos'],
        datasets: [
            {
                label: 'Resumo Mensal (R$)',
                data: [monthlySales, monthlyExpenses],
                backgroundColor: [
                    'rgba(16, 185, 129, 0.6)',
                    'rgba(239, 68, 68, 0.6)',
                ],
                borderColor: [
                    '#10b981',
                    '#ef4444',
                ],
                borderWidth: 1,
                borderRadius: 8,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            title: { display: false },
        },
        scales: {
            y: { beginAtZero: true, grid: { color: 'var(--border)' }, ticks: { color: 'var(--text-muted)' } },
            x: { grid: { display: false }, ticks: { color: 'var(--text-muted)' } }
        }
    };

    const StatCard = ({ title, value, icon, color }) => (
        <div className="glass card" style={{ flex: 1, minWidth: '250px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{title}</p>
                    <h2 style={{ fontSize: '1.75rem' }}>{value}</h2>
                </div>
                <div style={{
                    background: color,
                    padding: '0.5rem',
                    borderRadius: '0.75rem',
                    color: 'white',
                    display: 'flex'
                }}>
                    {icon}
                </div>
            </div>
        </div>
    );

    return (
        <div className="fade-in">
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Marmita Control Dashboard 👋</h1>
                <p style={{ color: 'var(--text-muted)' }}>Bem-vindo ao seu painel financeiro.</p>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2rem' }}>
                <StatCard
                    title="Vendas (Mês Atual)"
                    value={`R$ ${monthlySales.toFixed(2)}`}
                    icon={<TrendingUp size={24} />}
                    color="var(--secondary)"
                />
                <StatCard
                    title="Gastos (Mês Atual)"
                    value={`R$ ${monthlyExpenses.toFixed(2)}`}
                    icon={<TrendingDown size={24} />}
                    color="var(--danger)"
                />
                <StatCard
                    title="Equipe Ativa"
                    value={employees.length}
                    icon={<UsersIcon size={24} />}
                    color="var(--primary)"
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                <div className="glass card" style={{ height: '350px' }}>
                    <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>Comparativo do Mês</h3>
                    <div style={{ height: '240px' }}>
                        <Bar data={chartData} options={chartOptions} />
                    </div>
                </div>

                <div className="glass card">
                    <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>Ações Rápidas</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <Link to="/financeiro" className="btn btn-secondary" style={{ textDecoration: 'none', justifyContent: 'space-between' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Plus size={18} /> Registrar Venda</span>
                            <ArrowRight size={16} />
                        </Link>
                        <Link to="/funcionarios" className="btn btn-primary" style={{ textDecoration: 'none', justifyContent: 'space-between' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Plus size={18} /> Lançar Gasto Func.</span>
                            <ArrowRight size={16} />
                        </Link>
                        <div style={{
                            marginTop: '1rem',
                            padding: '1rem',
                            background: 'var(--bg)',
                            borderRadius: '0.75rem',
                            border: '1px dashed var(--border)',
                            textAlign: 'center',
                            fontSize: '0.85rem',
                            color: 'var(--text-muted)'
                        }}>
                            💡 Dica: Registre as vendas diariamente para relatórios mais precisos.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
