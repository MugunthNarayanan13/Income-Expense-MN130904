// src/lib/db.ts
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "./firebase";
import { Income, Expense } from "../types/models";

// Add an income record
export const addIncome = async (income: Income) => {
  const incomeRef = collection(db, "income");
  return await addDoc(incomeRef, income);
};

// Add an expense record
export const addExpense = async (expense: Expense) => {
  const expenseRef = collection(db, "expenses");
  return await addDoc(expenseRef, expense);
};

// Fetch income by month and year
export const getIncomeByMonthYear = async (month: string, year: number) => {
  const incomeRef = collection(db, "income");
  const q = query(incomeRef, where("month", "==", month), where("year", "==", year));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => doc.data());
};

// Fetch expenses by month and year
export const getExpenseByMonthYear = async (month: string, year: number) => {
  const expenseRef = collection(db, "expenses");
  const q = query(expenseRef, where("month", "==", month), where("year", "==", year));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => doc.data());
};
