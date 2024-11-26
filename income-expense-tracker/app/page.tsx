'use client';

import { useState } from 'react';
import AddIncomeForm from '../app/components/AddIncomeForm';
import ViewIncomes from '../app/components/ViewIncomes';

export default function Home() {
  const [showAddIncome, setShowAddIncome] = useState(false);
  const [showViewIncomes, setShowViewIncomes] = useState(false);

  return (
    <main>
      <h1>Welcome to Income-Expense Tracker</h1>
      <div>
        <button onClick={() => setShowAddIncome(true)}>Add Income</button>
        <button>Add Expense</button>
        <button onClick={() => setShowViewIncomes(true)}>View Incomes</button>
      </div>
      {showAddIncome && <AddIncomeForm onClose={() => setShowAddIncome(false)} />}
      {showViewIncomes && <ViewIncomes />}
    </main>
  );
}
