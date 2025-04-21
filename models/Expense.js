const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const expenseSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  isRecurring: {
    type: Boolean,
    default: false, // Track whether the expense is recurring
  },
  frequency: {
    type: String, // 'daily', 'weekly', 'monthly', etc.
  },
  nextDueDate: {
    type: Date, // When the next expense is due
  }
});

const Expense = mongoose.model('Expense', expenseSchema);

module.exports = Expense;
