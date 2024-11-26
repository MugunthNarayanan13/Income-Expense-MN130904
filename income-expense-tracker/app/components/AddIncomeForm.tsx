'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, doc, increment } from 'firebase/firestore';
import { db } from '../firebase/firebase';

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
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-5 border border-gray-300 shadow-lg z-50">
            <h2 className="text-xl font-bold mb-4">Add Income</h2>
            <form onSubmit={(e) => e.preventDefault()}>
                <label className="block mb-2">
                    Amount (₹):
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value))}
                        required
                        className="block w-full mt-1 p-2 border border-gray-300 rounded"
                    />
                </label>
                <label className="block mb-2">
                    Date:
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="block w-full mt-1 p-2 border border-gray-300 rounded"
                    />
                </label>
                <label className="block mb-2">
                    Category:
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        disabled={newCategory !== ''}
                        className="block w-full mt-1 p-2 border border-gray-300 rounded"
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
                    <label className="block mb-2">
                        New Category:
                        <input
                            type="text"
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            className="block w-full mt-1 p-2 border border-gray-300 rounded"
                        />
                    </label>
                )}
                <label className="block mb-2">
                    Means:
                    <input
                        type="text"
                        value={means}
                        onChange={(e) => setMeans(e.target.value)}
                        required
                        className="block w-full mt-1 p-2 border border-gray-300 rounded"
                    />
                </label>
                <label className="block mb-2">
                    Note (optional):
                    <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        className="block w-full mt-1 p-2 border border-gray-300 rounded"
                    />
                </label>
                <div className="flex justify-end space-x-2 mt-4">
                    <button type="button" onClick={handleAddIncome} className="px-4 py-2 bg-blue-500 text-white rounded">Add Income</button>
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">Cancel</button>
                </div>
            </form>
        </div>
    );
}
