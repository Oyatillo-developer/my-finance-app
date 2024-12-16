import React, { useState, useEffect } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import "bootstrap/dist/css/bootstrap.min.css";
import "../style/app.scss";

ChartJS.register(ArcElement, Tooltip, Legend);

function App() {
  const [transactions, setTransactions] = useState([]);
  const [filterCategory, setFilterCategory] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Valyuta kurslarini olish
  useEffect(() => {
    const fetchCurrencyData = async () => {
      try {
        const response = await fetch("https://cbu.uz/uz/arkhiv-kursov-valyut/json/");
        const data = await response.json();

        const filteredData = data.map((item) => ({
          currency: item.Ccy,
          rate: parseFloat(item.Rate),
          name: item.CcyNm_UZ,
        }));

        setCurrencies(filteredData);
        setLoading(false);
      } catch (error) {
        setError("API bilan bog'lanishda xatolik yuz berdi.");
        setLoading(false);
      }
    };

    fetchCurrencyData();
  }, []);

  // LocalStorage’dan tranzaksiyalarni olish
  useEffect(() => {
    const savedTransactions = JSON.parse(localStorage.getItem("transactions"));
    if (savedTransactions) {
      setTransactions(savedTransactions);
    }
  }, []);

  // LocalStorage’ga tranzaksiyalarni saqlash
  useEffect(() => {
    localStorage.setItem("transactions", JSON.stringify(transactions));
  }, [transactions]);

  // Filtrlangan tranzaksiyalar
  const filteredTransactions = transactions.filter((t) => {
    const matchCategory = filterCategory ? t.category === filterCategory : true;
    const matchDate = filterDate ? t.date === filterDate : true;
    return matchCategory && matchDate;
  });

  const addTransaction = (transaction) => {
    // USD valyutasini olish
    const exchangeRate = currencies.find(
      (currency) => currency.currency === "USD"
    )?.rate;

    // Valyutani asosiy valyutaga aylantirish
    if (exchangeRate) {
      const amountInBaseCurrency = (transaction.amount * exchangeRate).toFixed(2);
      setTransactions([
        ...transactions,
        { ...transaction, amountInBaseCurrency },
      ]);
    }
  };

  const deleteTransaction = (id) => {
    setTransactions(transactions.filter((t) => t.id !== id));
  };

  const incomeData = transactions
    .filter((t) => t.type === "Daromad")
    .reduce((acc, t) => acc + parseFloat(t.amount), 0);

  const expenseData = transactions
    .filter((t) => t.type === "Xarajat")
    .reduce((acc, t) => acc + parseFloat(t.amount), 0);

  const chartData = {
    labels: ["Daromad", "Xarajat"],
    datasets: [
      {
        label: "Miqdor",
        data: [incomeData, expenseData],
        backgroundColor: ["green", "red"],
        hoverBackgroundColor: ["darkgreen", "darkred"],
      },
    ],
  };

  if (loading) {
    return <div>Yuklanmoqda...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="container">
      <h1 className="text-center mt-4">Moliyaviy Boshqaruv</h1>

      {/* Filter Inputs */}
      <div className="row">
        <div className="col-md-4">
          <input
            type="date"
            className="form-control"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            placeholder="Sana bo‘yicha filtr"
          />
        </div>
        <div className="col-md-4">
          <input
            type="text"
            className="form-control"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            placeholder="Kategoriya bo‘yicha filtr"
          />
        </div>
      </div>

      {/* Transaction Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const form = e.target;
          const type = form.type.value;
          const amount = form.amount.value;
          const category = form.category.value;
          const date = form.date.value;

          if (amount && category && date) {
            addTransaction({ id: Date.now(), type, amount, category, date });
            form.reset();
          }
        }}
        className="transaction-form mt-4"
      >
        <div className="row">
          <div className="col-md-3">
            <select name="type" className="form-control">
              <option value="Daromad">Daromad</option>
              <option value="Xarajat">Xarajat</option>
            </select>
          </div>
          <div className="col-md-3">
            <input
              type="number"
              name="amount"
              placeholder="Miqdor"
              className="form-control"
            />
          </div>
          <div className="col-md-3">
            <input
              type="text"
              name="category"
              placeholder="Kategoriya"
              className="form-control"
            />
          </div>
          <div className="col-md-3">
            <input type="date" name="date" className="form-control" />
          </div>
        </div>
        <button type="submit" className="btn btn-primary mt-3">
          Qo'shish
        </button>
      </form>

      {/* Transaction List */}
      <div className="transaction-list mt-4">
        <h3>Tranzaksiyalar ro'yxati</h3>
        {filteredTransactions.length === 0 && <p>Tranzaksiyalar yo'q</p>}
        <ul className="list-group">
          {filteredTransactions.map((transaction) => (
            <li
              key={transaction.id}
              className="list-group-item d-flex justify-content-between"
            >
              <span>
                {transaction.date} - {transaction.category} ({transaction.type}
                ): {transaction.amount} so'm
              </span>
              <button
                onClick={() => deleteTransaction(transaction.id)}
                className="btn btn-danger btn-sm"
              >
                O'chirish
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Doughnut Chart */}
      <div className="chart-container">
        <h3>Moliyaviy Grafikalar</h3>
        <Doughnut data={chartData} />
      </div>
    </div>
  );
}

export default App;
