import React, { useState, useMemo, useCallback } from "react";
import { useApp } from "../../context/AppContext";
import { FinancialTransaction } from "../../types";
import * as Icons from "lucide-react";

const Finance: React.FC = () => {
  const { state, dispatch } = useApp();
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<FinancialTransaction | null>(null);
  const [dateRange, setDateRange] = useState("month");
  const [searchTerm, setSearchTerm] = useState("");

  const initialFormData = {
    amount: "",
    type: "expense" as "income" | "expense",
    category: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    account: "",
  };

  const [formData, setFormData] = useState(initialFormData);

  const categories = useMemo(() => {
    const incomeCategories = new Set([
      "Salary",
      "Freelance",
      "Investment",
      "Gift",
      "Other Income",
    ]);
    const expenseCategories = new Set([
      "Food",
      "Transportation",
      "Housing",
      "Utilities",
      "Entertainment",
      "Healthcare",
      "Shopping",
      "Education",
      "Other Expense",
    ]);

    state.financialTransactions.forEach((t) => {
      if (t.category) {
        if (t.type === "income") incomeCategories.add(t.category);
        else expenseCategories.add(t.category);
      }
    });

    return {
      income: Array.from(incomeCategories),
      expense: Array.from(expenseCategories),
    };
  }, [state.financialTransactions]);

  const accounts = useMemo(() => {
    const defaultAccounts = new Set([
      "Cash",
      "Checking Account",
      "Savings Account",
      "Credit Card",
      "Investment Account",
    ]);
    state.financialTransactions.forEach((t) => {
      if (t.account) defaultAccounts.add(t.account);
    });
    return Array.from(defaultAccounts);
  }, [state.financialTransactions]);

  const filteredTransactions = useMemo(
    () =>
      state.financialTransactions.filter((transaction) => {
        const matchesType = filter === "all" || transaction.type === filter;
        const matchesCategory =
          categoryFilter === "all" || transaction.category === categoryFilter;
        const matchesSearch =
          transaction.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          transaction.category.toLowerCase().includes(searchTerm.toLowerCase());

        const transactionDate = new Date(transaction.date);
        const now = new Date();
        let matchesDate = true;

        if (dateRange === "week") {
          const weekAgo = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() - 7
          );
          matchesDate = transactionDate >= weekAgo;
        } else if (dateRange === "month") {
          const monthAgo = new Date(
            now.getFullYear(),
            now.getMonth() - 1,
            now.getDate()
          );
          matchesDate = transactionDate >= monthAgo;
        } else if (dateRange === "year") {
          const yearAgo = new Date(
            now.getFullYear() - 1,
            now.getMonth(),
            now.getDate()
          );
          matchesDate = transactionDate >= yearAgo;
        }

        return matchesType && matchesCategory && matchesDate && matchesSearch;
      }),
    [state.financialTransactions, filter, categoryFilter, searchTerm, dateRange]
  );

  const totalIncome = useMemo(
    () =>
      filteredTransactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0),
    [filteredTransactions]
  );

  const totalExpenses = useMemo(
    () =>
      filteredTransactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0),
    [filteredTransactions]
  );

  const netIncome = totalIncome - totalExpenses;

  const resetForm = useCallback(() => {
    setFormData(initialFormData);
    setEditingTransaction(null);
    setShowModal(false);
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      if (!formData.amount || !formData.category || !formData.description) {
        alert("Please fill all required fields.");
        return;
      }

      const transactionData = {
        id: editingTransaction?.id || crypto.randomUUID(),
        amount: parseFloat(formData.amount),
        type: formData.type,
        category: formData.category,
        description: formData.description,
        date: new Date(formData.date),
        account: formData.account,
      };

      if (editingTransaction) {
        dispatch({
          type: "UPDATE_FINANCIAL_TRANSACTION",
          payload: transactionData,
        });
      } else {
        dispatch({
          type: "ADD_FINANCIAL_TRANSACTION",
          payload: transactionData,
        });
      }

      resetForm();
    },
    [formData, editingTransaction, dispatch, resetForm]
  );

  const handleEdit = useCallback((transaction: FinancialTransaction) => {
    setEditingTransaction(transaction);
    setFormData({
      amount: transaction.amount.toString(),
      type: transaction.type,
      category: transaction.category,
      description: transaction.description,
      date: new Date(transaction.date).toISOString().split("T")[0],
      account: transaction.account || "",
    });
    setShowModal(true);
  }, []);

  const handleDelete = useCallback(
    (transactionId: string) => {
      if (window.confirm("Are you sure you want to delete this transaction?")) {
        dispatch({
          type: "DELETE_FINANCIAL_TRANSACTION",
          payload: transactionId,
        });
      }
    },
    [dispatch]
  );

  const getCategoryExpenses = useMemo(() => {
    const categoryTotals: { [key: string]: number } = {};

    filteredTransactions
      .filter((t) => t.type === "expense")
      .forEach((transaction) => {
        categoryTotals[transaction.category] =
          (categoryTotals[transaction.category] || 0) + transaction.amount;
      });

    return Object.entries(categoryTotals)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
  }, [filteredTransactions]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Finance</h1>
        <button
          onClick={() => {
            setEditingTransaction(null);
            setFormData(initialFormData);
            setShowModal(true);
          }}
          className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-shadow"
        >
          <Icons.Plus className="h-4 w-4 mr-2 inline" />
          New Transaction
        </button>
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-50 rounded-xl">
              <Icons.TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Income</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(totalIncome)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-50 rounded-xl">
              <Icons.TrendingDown className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Expenses
              </p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(totalExpenses)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
          <div className="flex items-center gap-3">
            <div
              className={`p-3 rounded-xl ${netIncome >= 0 ? "bg-blue-50" : "bg-orange-50"}`}
            >
              <Icons.DollarSign
                className={`h-6 w-6 ${netIncome >= 0 ? "text-blue-600" : "text-orange-600"}`}
              />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Net Income</p>
              <p
                className={`text-2xl font-bold ${netIncome >= 0 ? "text-blue-600" : "text-orange-600"}`}
              >
                {formatCurrency(netIncome)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-50 rounded-xl">
              <Icons.Receipt className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Transactions</p>
              <p className="text-2xl font-bold text-purple-600">
                {filteredTransactions.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative">
          <Icons.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex bg-white/80 backdrop-blur-sm rounded-lg p-1 border border-gray-200/50">
          {["all", "income", "expense"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === f
                  ? "bg-blue-500 text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Categories</option>
          {[...categories.income, ...categories.expense].map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
          <option value="all">All Time</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transactions List */}
        <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Transactions
          </h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredTransactions
              .sort(
                (a, b) =>
                  new Date(b.date).getTime() - new Date(a.date).getTime()
              )
              .map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        transaction.type === "income"
                          ? "bg-green-50"
                          : "bg-red-50"
                      }`}
                    >
                      {transaction.type === "income" ? (
                        <Icons.ArrowUpRight className="h-4 w-4 text-green-600" />
                      ) : (
                        <Icons.ArrowDownLeft className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {transaction.description}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {transaction.category} •{" "}
                        {new Date(transaction.date).toLocaleDateString()}
                      </p>
                      {transaction.account && (
                        <p className="text-xs text-gray-500">
                          {transaction.account}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`font-bold ${
                        transaction.type === "income"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {transaction.type === "income" ? "+" : "-"}
                      {formatCurrency(transaction.amount)}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEdit(transaction)}
                        className="p-1 text-gray-400 hover:text-blue-500 rounded"
                      >
                        <Icons.Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(transaction.id)}
                        className="p-1 text-gray-400 hover:text-red-500 rounded"
                      >
                        <Icons.Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            {filteredTransactions.length === 0 && (
              <p className="text-gray-500 text-center py-8">
                No transactions found.
              </p>
            )}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Top Expense Categories
          </h3>
          <div className="space-y-4">
            {getCategoryExpenses.map(([category, amount]) => {
              const percentage =
                totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;
              return (
                <div key={category}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      {category}
                    </span>
                    <span className="text-sm font-bold text-gray-900">
                      {formatCurrency(amount)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {percentage.toFixed(1)}% of expenses
                  </div>
                </div>
              );
            })}
            {getCategoryExpenses.length === 0 && (
              <p className="text-gray-500 text-center py-8">
                No expense data available.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Transaction Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {editingTransaction ? "Edit Transaction" : "New Transaction"}
              </h2>
              <button
                onClick={resetForm}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <Icons.X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: e.target.value as any,
                      category: "",
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Category</option>
                  {categories[formData.type].map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account
                </label>
                <select
                  value={formData.account}
                  onChange={(e) =>
                    setFormData({ ...formData, account: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Account</option>
                  {accounts.map((account) => (
                    <option key={account} value={account}>
                      {account}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 rounded-lg hover:shadow-lg transition-shadow"
                >
                  {editingTransaction
                    ? "Update Transaction"
                    : "Add Transaction"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Finance;
