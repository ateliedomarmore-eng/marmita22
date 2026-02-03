import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import {
    collection,
    addDoc,
    onSnapshot,
    query,
    orderBy,
    serverTimestamp,
    doc,
    deleteDoc
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { Plus, Trash2, UserPlus, Receipt } from 'lucide-react';

export default function Employees() {
    const [employees, setEmployees] = useState([]);
    const [newName, setNewName] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [loading, setLoading] = useState(true);

    // Expense Form State
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [expenseAmount, setExpenseAmount] = useState('');
    const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        const q = query(collection(db, 'employees'), orderBy('name', 'asc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setEmployees(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    async function handleAddEmployee(e) {
        e.preventDefault();
        if (!newName.trim()) return;
        try {
            await addDoc(collection(db, 'employees'), {
                name: newName,
                createdAt: serverTimestamp()
            });
            setNewName('');
            setIsAdding(false);
        } catch (err) {
            console.error(err);
            alert('Erro ao adicionar funcionário');
        }
    }

    async function handleAddExpense(e) {
        e.preventDefault();
        if (!selectedEmployee || !expenseAmount) return;
        try {
            await addDoc(collection(db, 'expenses'), {
                employeeId: selectedEmployee.id,
                employeeName: selectedEmployee.name,
                amount: parseFloat(expenseAmount),
                date: expenseDate,
                createdAt: serverTimestamp()
            });
            setExpenseAmount('');
            setSelectedEmployee(null);
            alert('Gasto registrado com sucesso!');
        } catch (err) {
            console.error(err);
            alert('Erro ao registrar gasto');
        }
    }

    async function handleDeleteEmployee(id) {
        if (window.confirm('Tem certeza que deseja excluir este funcionário?')) {
            try {
                await deleteDoc(doc(db, 'employees', id));
            } catch (err) {
                console.error(err);
            }
        }
    }

    return (
        <Layout>
            <div className="fade-in">
                <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Funcionários</h1>
                        <p style={{ color: 'var(--text-muted)' }}>Gerencie sua equipe e registre gastos individuais.</p>
                    </div>
                    <button onClick={() => setIsAdding(!isAdding)} className="btn btn-primary">
                        {isAdding ? 'Cancelar' : <><UserPlus size={18} /> Novo Funcionário</>}
                    </button>
                </div>

                {isAdding && (
                    <div className="glass card" style={{ marginBottom: '2rem' }}>
                        <form onSubmit={handleAddEmployee} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Nome Completo</label>
                                <input
                                    autoFocus
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    placeholder="Ex: João Silva"
                                />
                            </div>
                            <button className="btn btn-primary">Salvar</button>
                        </form>
                    </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                    {employees.map(emp => (
                        <div key={emp.id} className="glass card fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ fontSize: '1.1rem' }}>{emp.name}</h3>
                                <button
                                    onClick={() => handleDeleteEmployee(emp.id)}
                                    style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                    onClick={() => setSelectedEmployee(emp)}
                                    className="btn btn-secondary"
                                    style={{ flex: 1, padding: '0.5rem', fontSize: '0.85rem' }}
                                >
                                    <Receipt size={16} /> Lançar Gasto
                                </button>
                            </div>
                        </div>
                    ))}
                    {!loading && employees.length === 0 && (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                            Nenhum funcionário cadastrado.
                        </div>
                    )}
                </div>

                {/* Modal/Overlay para Lançar Gasto */}
                {selectedEmployee && (
                    <div style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        padding: '1rem'
                    }}>
                        <div className="glass card fade-in" style={{ width: '100%', maxWidth: '400px' }}>
                            <h3 style={{ marginBottom: '1.5rem' }}>Gasto: {selectedEmployee.name}</h3>
                            <form onSubmit={handleAddExpense} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Valor (R$)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        autoFocus
                                        value={expenseAmount}
                                        onChange={(e) => setExpenseAmount(e.target.value)}
                                        placeholder="0,00"
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Data</label>
                                    <input
                                        type="date"
                                        required
                                        value={expenseDate}
                                        onChange={(e) => setExpenseDate(e.target.value)}
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                                    <button type="button" onClick={() => setSelectedEmployee(null)} className="btn" style={{ flex: 1, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                                        Cancelar
                                    </button>
                                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                                        Confirmar
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}
