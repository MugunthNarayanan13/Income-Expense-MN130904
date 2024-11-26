import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';

export default function EditIncomeForm({
    income,
    onClose,
    onSave,
}: {
    income: any;
    onClose: () => void;
    onSave: () => void;
}) {
    const [amount, setAmount] = useState(income.amount);
    const [date, setDate] = useState(
        new Date(income.date.seconds * 1000).toISOString().split('T')[0]
    );
    const [note, setNote] = useState(income.note || '');

    const handleSave = async () => {
        try {
            await updateDoc(doc(db, 'income', income.id), {
                amount,
                date: new Date(date),
                note,
            });
            alert('Income updated successfully!');
            onSave();
            onClose();
        } catch (error) {
            console.error('Error updating income:', error);
            alert('Failed to update income.');
        }
    };

    return (
        <div className="popup">
            <h2>Edit Income</h2>
            <form onSubmit={(e) => e.preventDefault()}>
                <label>
                    Amount:
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
                    Note:
                    <textarea value={note} onChange={(e) => setNote(e.target.value)} />
                </label>
                <button type="button" onClick={handleSave}>
                    Save
                </button>
                <button type="button" onClick={onClose}>
                    Cancel
                </button>
            </form>
        </div>
    );
}
