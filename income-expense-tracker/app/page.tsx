'use client';

import { useState } from 'react';
import AddIncomeForm from '../app/components/AddIncomeForm';

export default function Home() {
  const [showAddIncome, setShowAddIncome] = useState(false);

  return (
    <main>
      <h1>Welcome to Income-Expense Tracker</h1>
      <div>
        <button onClick={() => setShowAddIncome(true)}>Add Income</button>
        <button>Add Expense</button>
      </div>
      {showAddIncome && <AddIncomeForm onClose={() => setShowAddIncome(false)} />}
    </main>
  );
}
