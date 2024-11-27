'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, doc, increment } from 'firebase/firestore';
import { db } from '../app/firebase/firebase';
import '../app/styles/AddIncomeForm.css';

interface Category {
    id: string;
    name: string;
    frequency: number;
}

export default function AddIncomeForm({ onClose }: { onClose: () => void }) {
    const [amount, setAmount] = useState<number>(0);
    const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]); // Default: Today
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('SELECT');
    const [newCategory, setNewCategory] = useState<string>('');
    const [means, setMeans] = useState<string>('');
    const [note, setNote] = useState<string>('');

    useEffect(() => {
        // Fetch categories from Firestore
        const fetchCategories = async () => {
            const categoryCollection = collection(db, 'incomeCategories');
            const snapshot = await getDocs(categoryCollection);
            const fetchedCategories = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            })) as Category[];
            fetchedCategories.sort((a, b) => b.frequency - a.frequency); // Sort by usage frequency
            setCategories(fetchedCategories);
        };

        fetchCategories();
    }, []);

    const handleAddIncome = async () => {
        if (!amount || selectedCategory === 'SELECT' || !means) {
            alert('Please fill out all required fields!');
            return;
        }

        const incomeData = {
            amount,
            date: new Date(date),
            category: newCategory || selectedCategory,
            month: new Date(date).toLocaleString('default', { month: 'long' }),
            year: new Date(date).getFullYear(),
            means,
            note,
        };

        // Add income to Firestore
        await addDoc(collection(db, 'income'), incomeData);

        // Update category frequency or add new category
        if (newCategory) {
            await addDoc(collection(db, 'incomeCategories'), { name: newCategory, frequency: 1 });
        } else {
            const categoryDoc = doc(db, 'incomeCategories', categories.find(c => c.name === selectedCategory)?.id!);
            await updateDoc(categoryDoc, { frequency: increment(1) });
        }

        alert('Income added successfully!');
        onClose(); // Close the form
    };

    return (
        <div className="popup">
            <h2>Add Income</h2>
            <form onSubmit={(e) => e.preventDefault()}>
                <label>
                    Amount (₹):
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value))}
                        required
                    />
                </label>
                <label>
                    Date:
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                    />
                </label>
                <label>
                    Category:
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        disabled={newCategory !== ''}
                    >
                        <option value="SELECT">SELECT</option>
                        {categories.map(category => (
                            <option key={category.id} value={category.name}>
                                {category.name}
                            </option>
                        ))}
                        <option value="ADD_NEW">ADD NEW CATEGORY</option>
                    </select>
                </label>
                {selectedCategory === 'ADD_NEW' && (
                    <label>
                        New Category:
                        <input
                            type="text"
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                        />
                    </label>
                )}
                <label>
                    Means:
                    <input
                        type="text"
                        value={means}
                        onChange={(e) => setMeans(e.target.value)}
                        required
                    />
                </label>
                <label>
                    Note (optional):
                    <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                    />
                </label>
                <button type="button" onClick={handleAddIncome}>Add Income</button>
                <button type="button" onClick={onClose}>Cancel</button>
            </form>
        </div>
    );
}
