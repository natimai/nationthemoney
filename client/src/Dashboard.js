import React from 'react';

function Dashboard({ income, expenses, unlockedAchievements, currency }) {
  const totalIncome = income.reduce((total, entry) => total + parseFloat(entry.amount), 0);
  const totalExpenses = expenses.reduce((total, entry) => total + parseFloat(entry.amount), 0);
  const savings = totalIncome - totalExpenses;

  const achievementsToShow = unlockedAchievements.slice(-3); // 3 הישגים אחרונים

  return (
    <div className="dashboard">
      <h1 className="header">Welcome to Your Dashboard</h1>
      <div className="overview">
        <div className="card">
          <h2>Total Savings</h2>
          <p>{currency}{savings.toFixed(2)}</p>
        </div>
        <div className="card">
          <h2>Monthly Expenses</h2>
          <p>{currency}{(totalExpenses / 30).toFixed(2)} (average)</p>
        </div>
        <div className="card">
          <h2>Monthly Income</h2>
          <p>{currency}{(totalIncome / 30).toFixed(2)} (average)</p>
        </div>
      </div>
      <div className="achievements">
        <h2>Recent Achievements</h2>
        <ul>
          {achievementsToShow.map((ach, index) => (
            <li key={index}>{ach.text}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Dashboard;
