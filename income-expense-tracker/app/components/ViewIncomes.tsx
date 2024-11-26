'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, query, where, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import EditIncomeForm from './EditIncomeForm';
import '../styles/ViewIncomes.css';

interface Income {
    id: string;
    amount: number;
    date: string;
    category: string;
    month: string;
    year: number;
    means: string;
    note?: string;
}

export default function ViewIncomes() {
    const [date, setDate] = useState<string>(''); // Specific date
    const [month, setMonth] = useState<string>('ALL'); // Month dropdown
    const [year, setYear] = useState<string>('ALL'); // Year dropdown
    const [incomes, setIncomes] = useState<any[]>([]); // Income records
    const [editIncome, setEditIncome] = useState<any>(null); // For editing a record

    // Fetch incomes based on filters
    const fetchIncomes = async () => {
        const incomeRef = collection(db, 'income'); // Reference to the "income" collection
        let incomeQuery: any = incomeRef; // Initialize as CollectionReference

        const conditions: any[] = [];
        if (year !== 'ALL') conditions.push(where('year', '==', parseInt(year)));
        if (month !== 'ALL') conditions.push(where('month', '==', month));
        if (date) conditions.push(where('date', '==', new Date(date)));

        if (conditions.length > 0) {
            incomeQuery = query(incomeRef, ...conditions); // Query with conditions
        }

        const snapshot = await getDocs(incomeQuery); // Works for both CollectionReference and Query

        // Map through the docs and enforce Income type
        const fetchedIncomes: Income[] = snapshot.docs.map((doc) => ({
            ...(doc.data() as Income), // Cast doc.data() to the Income interface
            id: doc.id,
        }));

        setIncomes(fetchedIncomes);
    };

    // Delete a specific income and update categories
    const handleDelete = async (income: Income) => {
        const confirmed = confirm('Are you sure you want to delete this income?');
        if (!confirmed) return;

        try {
            // Delete income from Firestore
            await deleteDoc(doc(db, 'income', income.id));

            // Update category frequency in Firestore
            const categorySnapshot = await getDocs(collection(db, 'incomeCategories'));
            const categoryDoc = categorySnapshot.docs.find(
                doc => doc.data().name === income.category
            );
            if (categoryDoc) {
                const updatedFrequency = categoryDoc.data().frequency - 1;
                if (updatedFrequency > 0) {
                    await updateDoc(doc(db, 'incomeCategories', categoryDoc.id), { frequency: updatedFrequency });
                } else {
                    await deleteDoc(doc(db, 'incomeCategories', categoryDoc.id));
                }
            }

            alert('Income deleted successfully!');
            fetchIncomes(); // Refresh the table
        } catch (error) {
            console.error('Error deleting income:', error);
            alert('Failed to delete income.');
        }
    };

    return (
        <div>
            <h2>View Incomes</h2>
            <div>
                <label>
                    Date:
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                    />
                </label>
                <label>
                    Month:
                    <select value={month} onChange={(e) => setMonth(e.target.value)}>
                        <option value="ALL">ALL</option>
                        {Array.from({ length: 12 }, (_, i) => new Date(0, i).toLocaleString('default', { month: 'long' })).map(
                            (m, i) => (
                                <option key={i} value={m}>
                                    {m}
                                </option>
                            )
                        )}
                    </select>
                </label>
                <label>
                    Year:
                    <select value={year} onChange={(e) => setYear(e.target.value)}>
                        <option value="ALL">ALL</option>
                        {Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                            <option key={y} value={y}>
                                {y}
                            </option>
                        ))}
                    </select>
                </label>
                <button onClick={fetchIncomes}>View</button>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Amount</th>
                        <th>Date</th>
                        <th>Category</th>
                        <th>Note</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {incomes.map((income) => (
                        <tr key={income.id}>
                            <td>{income.amount}</td>
                            <td>{new Date(income.date.seconds * 1000).toLocaleDateString('en-GB')}</td>
                            <td>{income.category}</td>
                            <td>{income.note || '-'}</td>
                            <td>
                                <button onClick={() => setEditIncome(income)}>Edit</button>
                                <button onClick={() => handleDelete(income)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {editIncome && (
                <EditIncomeForm
                    income={editIncome}
                    onClose={() => setEditIncome(null)}
                    onSave={fetchIncomes} // Refresh the table after editing
                />
            )}
        </div>
    );
}
