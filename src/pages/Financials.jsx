import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import {
    collection,
    addDoc,
    onSnapshot,
    query,
    orderBy,
    serverTimestamp,
    where,
    limit
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { TrendingUp, Plus, Calendar, List } from 'lucide-react';

export default function Financeiro() {
    const [sales, setSales] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [saleAmount, setSaleAmount] = useState('');
    const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Pegar últimas vendas e gastos
        const qSales = query(collection(db, 'sales'), orderBy('date', 'desc'), limit(20));
        const unsubscribeSales = onSnapshot(qSales, (snapshot) => {
            setSales(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        const qExpenses = query(collection(db, 'expenses'), orderBy('date', 'desc'), limit(20));
        const unsubscribeExpenses = onSnapshot(qExpenses, (snapshot) => {
            setExpenses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        });

        return () => {
            unsubscribeSales();
            unsubscribeExpenses();
        };
    }, []);

    async function handleAddSale(e) {
        e.preventDefault();
        if (!saleAmount) return;
        try {
            await addDoc(collection(db, 'sales'), {
                amount: parseFloat(saleAmount),
                date: saleDate,
                createdAt: serverTimestamp()
            });
            setSaleAmount('');
            alert('Venda registrada!');
        } catch (err) {
            console.error(err);
            alert('Erro ao registrar venda');
        }
    }

    // Cálculos simples para o relatório atual
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const monthlySales = sales
        .filter(s => s.date.startsWith(currentMonth))
        .reduce((acc, curr) => acc + curr.amount, 0);

    const monthlyExpenses = expenses
        .filter(e => e.date.startsWith(currentMonth))
        .reduce((acc, curr) => acc + curr.amount, 0);

    return (
        <Layout>
            <div className="fade-in">
                <div style={{ marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Controle Financeiro</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Registre vendas e visualize o balancete mensal.</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
                    {/* Registro de Vendas */}
                    <div className="glass card">
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                            <TrendingUp size={20} color="var(--secondary)" /> Registrar Venda Total
                        </h3>
                        <form onSubmit={handleAddSale} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem' }}>Valor das Vendas (R$)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={saleAmount}
                                    onChange={(e) => setSaleAmount(e.target.value)}
                                    placeholder="0,00"
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem' }}>Data</label>
                                <input
                                    type="date"
                                    required
                                    value={saleDate}
                                    onChange={(e) => setSaleDate(e.target.value)}
                                />
                            </div>
                            <button className="btn btn-secondary">
                                <Plus size={18} /> Salvar Venda
                            </button>
                        </form>
                    </div>

                    {/* Relatório Mensal Simples */}
                    <div className="glass card" style={{ background: 'var(--primary)', color: 'white' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                            <Calendar size={20} /> Resumo: {new Date().toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '0.5rem' }}>
                                <span>Vendas Totais:</span>
                                <span style={{ fontWeight: 700 }}>R$ {monthlySales.toFixed(2)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '0.5rem' }}>
                                <span>Gastos Totais:</span>
                                <span style={{ fontWeight: 700 }}>R$ {monthlyExpenses.toFixed(2)}</span>
                            </div>
                            <p style={{ fontSize: '0.8rem', opacity: 0.8, marginTop: '1rem' }}>
                                * Este relatório considera apenas os lançamentos do mês vigente.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Listagem de Últimas Movimentações */}
                <div className="glass card">
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                        <List size={20} /> Últimos Lançamentos
                    </h3>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '500px' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                    <th style={{ padding: '1rem' }}>Data</th>
                                    <th style={{ padding: '1rem' }}>Tipo</th>
                                    <th style={{ padding: '1rem' }}>Descrição</th>
                                    <th style={{ padding: '1rem' }}>Valor</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* Combinar vendas e gastos para a lista, ordenando por data (vendas primeiro se mesma data pra exemplo) */}
                                {[...sales.map(s => ({ ...s, type: 'Venda' })), ...expenses.map(e => ({ ...e, type: 'Gasto', desc: e.employeeName }))]
                                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                                    .slice(0, 10)
                                    .map((item, idx) => (
                                        <tr key={idx} style={{ borderBottom: '1px solid var(--border)', fontSize: '0.9rem' }}>
                                            <td style={{ padding: '1rem' }}>{new Date(item.date).toLocaleDateString('pt-BR')}</td>
                                            <td style={{ padding: '1rem' }}>
                                                <span style={{
                                                    padding: '0.25rem 0.5rem',
                                                    borderRadius: '0.25rem',
                                                    fontSize: '0.75rem',
                                                    background: item.type === 'Venda' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                    color: item.type === 'Venda' ? 'var(--secondary)' : 'var(--danger)'
                                                }}>
                                                    {item.type}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem' }}>{item.desc || 'Venda Total'}</td>
                                            <td style={{ padding: '1rem', fontWeight: 600 }}>R$ {item.amount.toFixed(2)}</td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
