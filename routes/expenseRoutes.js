const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');

// Homepage - Show chart + summary
router.get('/', async (req, res) => {
  const expenses = await Expense.find().sort({ date: -1 });

  // Group expenses by category for pie chart
  const chartData = {};
  expenses.forEach(exp => {
    if (!chartData[exp.category]) chartData[exp.category] = 0;
    chartData[exp.category] += exp.amount;
  });

  // Monthly spending summary
  const summary = {};
  expenses.forEach(exp => {
    const monthKey = exp.date.toLocaleString('default', { month: 'long', year: 'numeric' });
    if (!summary[monthKey]) summary[monthKey] = 0;
    summary[monthKey] += exp.amount;
  });

  const monthlySummary = Object.entries(summary)
    .map(([month, total]) => ({ month, total }))
    .sort((a, b) => new Date(b.month) - new Date(a.month));

  res.render('index', {
    expenses,
    chartData,
    monthlySummary
  });
});

// Detailed Expense List Page
router.get('/list', async (req, res) => {
  const expenses = await Expense.find().sort({ date: -1 });
  res.render('list', { expenses });
});

// Add Expense Form
router.get('/add', (req, res) => {
  res.render('add');
});

// Submit New Expense
router.post('/add', async (req, res) => {
  const { title, amount, category, date, isRecurring, frequency, nextDueDate } = req.body;

  // Create a new expense document
  const expense = new Expense({
    title,
    amount: parseFloat(amount),
    category,
    date: new Date(date),
    isRecurring: isRecurring === 'on', // If checkbox is checked, save as true
    frequency,
    nextDueDate: isRecurring === 'on' ? new Date(nextDueDate) : null // Set next due date if recurring
  });

  // Save the expense to the database
  await expense.save();

  // If the expense is recurring, calculate the next due date
  if (isRecurring === 'on') {
    calculateNextDueDate(expense);
  }

  res.redirect('/');
});

// Edit Form
router.get('/edit/:id', async (req, res) => {
  const expense = await Expense.findById(req.params.id);
  res.render('edit', { expense });
});

// Submit Edit
router.post('/edit/:id', async (req, res) => {
  const { title, amount, category, date, isRecurring, frequency, nextDueDate } = req.body;

  // Update the expense document with new values
  const expense = await Expense.findById(req.params.id);
  
  expense.title = title;
  expense.amount = parseFloat(amount);
  expense.category = category;
  expense.date = new Date(date);
  expense.isRecurring = isRecurring === 'on';
  expense.frequency = frequency;
  expense.nextDueDate = isRecurring === 'on' ? new Date(nextDueDate) : null;

  // Save the updated expense
  await expense.save();

  // If the expense is recurring, recalculate the next due date
  if (expense.isRecurring) {
    calculateNextDueDate(expense);
  }

  res.redirect('/list');
});

// Delete Expense
router.delete('/delete/:id', async (req, res) => {
  // Delete the expense from the database
  await Expense.findByIdAndDelete(req.params.id);
  res.redirect('/list');
});

// Helper function to calculate the next due date for recurring expenses
function calculateNextDueDate(expense) {
  let nextDueDate = new Date(expense.nextDueDate);

  switch (expense.frequency) {
    case 'daily':
      nextDueDate.setDate(nextDueDate.getDate() + 1);
      break;
    case 'weekly':
      nextDueDate.setDate(nextDueDate.getDate() + 7);
      break;
    case 'monthly':
      nextDueDate.setMonth(nextDueDate.getMonth() + 1);
      break;
    case 'yearly':
      nextDueDate.setFullYear(nextDueDate.getFullYear() + 1);
      break;
    default:
      break;
  }

  expense.nextDueDate = nextDueDate;
  expense.save(); // Update next due date for recurring expenses
}

module.exports = router;
