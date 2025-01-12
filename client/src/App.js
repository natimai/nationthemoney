import React, { useState } from 'react';
import './Confetti.css';
import './App.css';
import Dashboard from './Dashboard';
import { auth } from "./firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";

function App() {
  // Hooks - חייבים להיות ברמה העליונה
  const [expenses, setExpenses] = useState([]);
  const [income, setIncome] = useState([]);
  const [entry, setEntry] = useState({ name: '', amount: '', category: '' });
  const [currentScreen, setCurrentScreen] = useState('dashboard');
  const [showConfetti, setShowConfetti] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [popupMessage, setPopupMessage] = useState(null); 
  const [unlockedAchievements, setUnlockedAchievements] = useState([]);
  const [user, setUser] = useState(null); // מידע על המשתמש
  const [profileData, setProfileData] = useState({ name: "", age: "" }); // פרטי הפרופיל
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currency, setCurrency] = useState('₪'); // ברירת מחדל: שקל
const [popupColor, setPopupColor] = useState(""); // גם זה לפני ה-return
const [buttonText, setButtonText] = useState('Swipe to Add');
const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

const filterHistoryByMonth = () => {
  return history.filter((item) => {
    const itemMonth = new Date(item.date).getMonth();
    return itemMonth === selectedMonth;
  });
};

const handleMonthChange = (direction) => {
  setSelectedMonth((prev) => {
    const newMonth = prev + direction;
    if (newMonth < 0) return 11; // דצמבר
    if (newMonth > 11) return 0; // ינואר
    return newMonth;
  });
};

// פונקציה להוספת הכנסה
const addIncome = () => {
  const updatedIncome = [...income, { ...entry, category: "Other" }];
  setIncome(updatedIncome);
  setEntry({ name: "", amount: "" }); // איפוס הטופס
};
const [isExpanded, setIsExpanded] = useState(false);
const toggleExpand = () => {
  setIsExpanded((prev) => !prev); // החלפת מצב הפתיחה
};
const handleSwipe = (direction) => {
  if (entry.amount) {
    if (direction === "right") {
      alert("💰 Income added under 'General'");
      // הוסף את ההכנסה לקטגוריה "כללי"
    } else if (direction === "left") {
      alert("💸 Expense added under 'General'");
      // הוסף את ההוצאה לקטגוריה "כללי"
    }
    setEntry({ name: "", amount: "" }); // איפוס השדות
  } else {
    alert("Please enter an amount before swiping!");
  }
};
// משתנים עבור מעקב אחר מחוות
const [startX, setStartX] = useState(null); // התחלת נקודת המגע

const [isSwiping, setIsSwiping] = useState(false);
const [swipeDirection, setSwipeDirection] = useState(null);
const [swipeStrength, setSwipeStrength] = useState(0);
// פונקציה להוספת הוצאה
const addExpense = () => {
  const updatedExpenses = [...expenses, { ...entry, category: "Other" }];
  setExpenses(updatedExpenses);
  setEntry({ name: "", amount: "" }); // איפוס הטופס
};
// מנהל התחלת וסיום מחוות
let touchStartX = 0;

const handleTouchStart = (e) => {
  setStartX(e.touches[0].clientX);
};

const handleTouchMove = (e) => {
  const currentX = e.touches[0].clientX;
  const deltaX = currentX - startX;
  setSwipeStrength(Math.min(Math.abs(deltaX) / 200, 1));

  if (deltaX > 0) {
    setSwipeDirection('right');
  } else {
    setSwipeDirection('left');
  }
  setIsSwiping(true);
};
const handleTouchEnd = (e) => {
  const touchEndX = e.changedTouches[0].screenX;
  if (touchStartX - touchEndX > 50) {
    // הוספת הוצאה
    if (entry.name && entry.amount) {
      addExpense();
      showPopup("💸 Expense added successfully!", "red");
    } else {
      alert("Please fill in the fields before swiping!");
    }
  } else if (touchEndX - touchStartX > 50) {
    // הוספת הכנסה
    if (entry.name && entry.amount) {
      addIncome();
      showPopup("💰 Income added successfully!", "green");
    } else {
      alert("Please fill in the fields before swiping!");
    }
  }
};
// פונקציה לטיפול בהחלקה ימינה
const handleSwipeRight = () => {
  if (entry.name && entry.amount) {
    const newIncome = {
      ...entry,
      category: 'General',
    };
    setIncome((prev) => [...prev, newIncome]); // הוספת הכנסה
    setPopupMessage('Income added! ✅');
    setPopupColor('green');
    setTimeout(() => setPopupMessage(null), 2000); // איפוס הודעה
    setEntry({ name: '', amount: '' }); // איפוס שדות
  } else {
    setPopupMessage('Please fill in all fields! ❌');
    setPopupColor('red');
    setTimeout(() => setPopupMessage(null), 2000); // איפוס הודעה
  }
};

// פונקציה לטיפול בהחלקה שמאלה
const handleSwipeLeft = () => {
  if (entry.name && entry.amount) {
    const newExpense = {
      ...entry,
      category: 'General',
    };
    setExpenses((prev) => [...prev, newExpense]); // הוספת הוצאה
    setPopupMessage('Expense added! ✅');
    setPopupColor('red');
    setTimeout(() => setPopupMessage(null), 2000); // איפוס הודעה
    setEntry({ name: '', amount: '' }); // איפוס שדות
  } else {
    setPopupMessage('Please fill in all fields! ❌');
    setPopupColor('red');
    setTimeout(() => setPopupMessage(null), 2000); // איפוס הודעה
  }
};
const [isBoxOpen, setIsBoxOpen] = useState(true); // מצב התיבה (פתוחה/סגורה)
const handleAddEntry = (type) => {
  if (!entry.name || !entry.amount) {
    alert('Please fill in all fields!');
    return;
  }

  const newEntry = {
    id: Date.now(),
    date: new Date(),
    name: entry.name,
    amount: parseFloat(entry.amount),
    type, // 'income' או 'expense'
  };

  const updatedHistory = [...history, newEntry];
  setHistory(updatedHistory);
  localStorage.setItem('history', JSON.stringify(updatedHistory));

  // איפוס השדות
  setEntry({ name: '', amount: '' });
  setIsBoxOpen(false);
};

const [history, setHistory] = useState(
  JSON.parse(localStorage.getItem('history')) || []
);

  // קטגוריות להוצאות
  const expenseCategories = [
    { name: 'Eating Out', emoji: '🍔' },
    { name: 'Grocery Shopping', emoji: '🛒' },
    { name: 'Car Expenses', emoji: '🚗' },
    { name: 'Entertainment', emoji: '🎬' },
    { name: 'Other', emoji: '❓' },
  ];

  // קטגוריות להכנסות
  const incomeCategories = [
    { name: 'Salary', emoji: '💼' },
    { name: 'Allowance', emoji: '🎁' },
    { name: 'Client Payment', emoji: '💵' },
    { name: 'Other', emoji: '❓' },
  ];

  const achievements = [
    {
      id: 1,
      text: 'Added your first expense!',
      condition: (expenses) => expenses && expenses.length > 0,
    },
    {
      id: 2,
      text: 'Added your first income!',
      condition: (income) => income && income.length > 0,
    },
    {
      id: 3,
      text: 'Spent {currency}3000!',
      condition: (expenses) =>
        expenses && expenses.reduce((sum, entry) => sum + parseFloat(entry.amount || 0), 0) >= 3000,
    },
  ];

  // פונקציות התחברות
  const handleSignIn = () => {
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        setIsLoggedIn(true);
        setUser(userCredential.user); // שמירת מידע על המשתמש
      })
      .catch((error) => console.error(error.message));
  };
  
  const handleSignUp = () => {
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        setIsLoggedIn(true);
        setUser(userCredential.user); // שמירת מידע על המשתמש
      })
      .catch((error) => console.error(error.message));
  };
  
  const handleSignOut = () => {
    auth.signOut()
      .then(() => {
        setIsLoggedIn(false);
        setUser(null);
        setProfileData({ name: "", age: "" });
      })
      .catch((error) => console.error("Error signing out:", error));
  };
  

  // פונקציות חישוב וסידור
  const calculateCategoryTotals = (entries, categories) => {
    const totals = {};
    categories.forEach((cat) => (totals[cat.name] = 0));
    entries.forEach((entry) => {
      if (totals[entry.category] !== undefined) {
        totals[entry.category] += parseFloat(entry.amount);
      }
    });
    return totals;
  };

  const checkAchievements = (updatedExpenses, updatedIncome) => {
    const relevantAchievements = achievements.filter((ach) => {
      if (unlockedAchievements.includes(ach.id)) {
        return false;
      }
      if (ach.text.includes('expense')) {
        return ach.condition(updatedExpenses);
      } else if (ach.text.includes('income')) {
        return ach.condition(updatedIncome);
      } else {
        return ach.condition(updatedExpenses, updatedIncome);
      }
    });

    if (relevantAchievements.length > 0) {
      setUnlockedAchievements((prev) => [...prev, ...relevantAchievements.map((ach) => ach.id)]);
      relevantAchievements.forEach((ach, index) => {
        setTimeout(() => {
          setPopupMessage(`🎉 Achievement unlocked: {currency}{ach.text} 🎉`);
        }, index * 3000);
      });

      setTimeout(() => {
        setPopupMessage(null);
      }, relevantAchievements.length * 3000);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEntry({ ...entry, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (entry.name && entry.amount && entry.category) {
      if (currentScreen === 'expenses') {
        const updatedExpenses = [...expenses, entry];
        setExpenses(updatedExpenses);
        checkAchievements(updatedExpenses, income);
      } else {
        const updatedIncome = [...income, entry];
        setIncome(updatedIncome);
        checkAchievements(expenses, updatedIncome);
      }
      setEntry({ name: '', amount: '', category: '' });
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } else {
      alert('Please fill in all fields!');
    }
  };

  const expenseTotals = calculateCategoryTotals(expenses, expenseCategories);
  const incomeTotals = calculateCategoryTotals(income, incomeCategories);
// פונקציה להצגת פרטים על קטגוריה
const toggleCategoryDetails = (category) => {
  setExpandedCategory(expandedCategory === category ? null : category);
};

// פונקציה לעריכת פריט
const handleEdit = (entry, index) => {
  // ממלא את הטופס מחדש כדי שהמשתמש יוכל לערוך
  setEntry({ ...entry });
  
  // מסיר את הפריט מהרשימה כדי למנוע כפילות
  const updatedExpenses = [...expenses];
  updatedExpenses.splice(index, 1);
  setExpenses(updatedExpenses);
};

// פונקציה למחיקת פריט
const handleDelete = (index, type) => {
  if (type === 'expenses') {
    const updatedExpenses = [...expenses];
    updatedExpenses.splice(index, 1);
    setExpenses(updatedExpenses);
  } else if (type === 'income') {
    const updatedIncome = [...income];
    updatedIncome.splice(index, 1);
    setIncome(updatedIncome);
  }
};

if (!isLoggedIn) {
  return (
    <div style={{ padding: '20px' }}>
      <h2>Login or Sign Up</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ marginBottom: '10px', padding: '10px', width: '100%' }}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ marginBottom: '10px', padding: '10px', width: '100%' }}
      />
      <button onClick={handleSignIn} style={{ marginRight: '10px' }}>Login</button>
      <button onClick={handleSignUp}>Sign Up</button>
    </div>
  );
}

// פונקציה להציג הודעת פופאפ
const showPopup = (message, color) => {
  setPopupMessage(message);
  setPopupColor(color);
  setTimeout(() => setPopupMessage(null), 3000); // הסתרת הפופאפ אחרי 3 שניות
};


return (
  <div>
    {/* כותרת ראשית */}
    <div className="header">
  🚀 Track Your Finances - Achieve More!
</div>
{currentScreen === 'dashboard' && (
 <Dashboard
 income={income}
 expenses={expenses}
 unlockedAchievements={unlockedAchievements}
 currency={currency} // העברת המטבע ל-Dashboard
/>

)}


<div>
    {/* כפתור לפתיחת תפריט הצד */}
    {isLoggedIn && (
      <button
        onClick={() => setIsSidebarOpen(true)}
        style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          padding: "10px 20px",
          backgroundColor: "#4CAF50",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        Profile
      </button>
    )}

    {/* תפריט הצד */}
    {isSidebarOpen && (
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          height: "100%",
          width: "300px",
          backgroundColor: "#f9f9f9",
          boxShadow: "-2px 0 5px rgba(0,0,0,0.2)",
          padding: "20px",
          zIndex: 1000,
        }}
      >
        <button
          onClick={() => setIsSidebarOpen(false)}
          style={{
            marginBottom: "20px",
            backgroundColor: "#FF6347",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            padding: "10px 20px",
            cursor: "pointer",
          }}
        >
          Close
        </button>

        <h2>Welcome, {profileData.name || "User"}!</h2>
        <p>Age: {profileData.age || "Unknown"}</p>
        <input
          type="text"
          placeholder="Enter your name"
          value={profileData.name}
          onChange={(e) =>
            setProfileData((prev) => ({ ...prev, name: e.target.value }))
          }
          style={{
            marginBottom: "10px",
            padding: "10px",
            width: "100%",
            borderRadius: "5px",
            border: "1px solid #ccc",
          }}
        />
        <input
          type="number"
          placeholder="Enter your age"
          value={profileData.age}
          onChange={(e) =>
            setProfileData((prev) => ({ ...prev, age: e.target.value }))
          }
          style={{
            marginBottom: "10px",
            padding: "10px",
            width: "100%",
            borderRadius: "5px",
            border: "1px solid #ccc",
          }}
          
        />
       {/* בחירת מטבע */}
    <label
      style={{
        display: "block",
        marginBottom: "10px",
        fontWeight: "bold",
      }}
    >
      Select Currency:
    </label>
    <select
      value={currency}
      onChange={(e) => {
        setCurrency(e.target.value);
        console.log("Selected currency:", e.target.value); // הוספת לוג
      }}
      style={{
        marginBottom: "20px",
        padding: "10px",
        width: "100%",
        borderRadius: "5px",
        border: "1px solid #ccc",
      }}
    >
      <option value="₪">₪ - Shekel</option>
      <option value="$">$ - Dollar</option>
      <option value="€">€ - Euro</option>
      <option value="£">£ - Pound</option>
    </select>

        <button
          onClick={handleSignOut}
          style={{
            padding: "10px 20px",
            backgroundColor: "#FF6347",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Sign Out
        </button>
      </div>
    )}
  </div>
);
    {/* הודעת פופאפ להישגים */}
    {popupMessage && (
      <div style={{
        position: 'fixed',
        top: '10px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: '#4CAF50',
        color: '#fff',
        padding: '10px 20px',
        borderRadius: '8px',
        fontSize: '1.2rem',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        zIndex: 1000,
        animation: 'fade-in-out 3s',
      }}>
        {popupMessage}
      </div>
    )}



{/* תפריט ניווט */}
<div style={{ textAlign: 'center', marginBottom: '20px' }}>
  <button
    className={`tab-button {currency}{currentScreen === 'dashboard' ? 'active' : ''}`}
    onClick={() => setCurrentScreen('dashboard')}
  >
    Dashboard
  </button>
  <button
    className={`tab-button {currency}{currentScreen === 'expenses' ? 'active' : ''}`}
    onClick={() => setCurrentScreen('expenses')}
  >
    Expenses
  </button>
  <button
    className={`tab-button {currency}{currentScreen === 'income' ? 'active' : ''}`}
    onClick={() => setCurrentScreen('income')}
  >
    Income
  </button>
  <button
    className={`tab-button {currency}{currentScreen === 'achievements' ? 'active' : ''}`}
    onClick={() => setCurrentScreen('achievements')}
  >
    Achievements
  </button>
</div>



      {/* קונפטי */}
      {showConfetti && (
        <>
          {Array.from({ length: 50 }).map((_, index) => {
            const leftPosition = Math.random() * 100;
            const duration = 4 + Math.random() * 2;
            const delay = Math.random();
            const rotation = Math.random() * 360;
            const size = 1 + Math.random() * 1.5;

            const emojis =
              currentScreen === 'expenses'
                ? ['😭', '😡', '💸', '🤦', '😩']
                : ['😊', '🎉', '💰', '😁', '✨'];
            const emoji = emojis[Math.floor(Math.random() * emojis.length)];

            return (
              <div
                key={index}
                className="confetti"
                style={{
                  position: 'fixed',
                  left: `{currency}{leftPosition}%`,
                  animationDuration: `{currency}{duration}s`,
                  animationDelay: `{currency}{delay}s`,
                  transform: `rotate({currency}{rotation}deg)`,
                  fontSize: `{currency}{size}rem`,
                }}
              >
                {emoji}
              </div>
            );
          })}
        </>
      )}
{popupMessage && (
  <div
    style={{
      position: "fixed",
      bottom: "80px",
      left: "50%",
      transform: "translateX(-50%)",
      backgroundColor: popupColor,
      color: "#fff",
      padding: "15px 20px",
      borderRadius: "8px",
      fontWeight: "bold",
      zIndex: 1000,
      animation: "fade-in-out 0.5s",
    }}
  >
    {popupMessage}
  </div>
)}
{isBoxOpen && (
  <div
    style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: '#000000',
      padding: '20px',
      borderRadius: '15px 15px 0 0',
      boxShadow: '0 -4px 6px rgba(0,0,0,0.2)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '20px',
      color: '#ffffff',
      fontFamily: 'Arial, sans-serif',
      textAlign: 'center',
    }}
  >
    {/* כפתור סגירה */}
    <div style={{ alignSelf: 'flex-end', marginBottom: '-20px' }}>
      <button
        onClick={() => {
          setIsBoxOpen(false);
          setSwipeDirection(null); // איפוס כיוון
          setButtonText('Swipe to Add'); // איפוס טקסט
        }}
        style={{
          background: 'none',
          border: 'none',
          color: '#ffffff',
          fontSize: '20px',
          cursor: 'pointer',
        }}
      >
        ✖
      </button>
    </div>

    {/* כותרת */}
    <h3 style={{ fontSize: '20px', margin: '10px 0', color: '#4CAF50' }}>Add Entry</h3>

    {/* שדה להזנת שם */}
    <div style={{ width: '100%', padding: '0 20px' }}>
      <label
        style={{
          display: 'block',
          fontSize: '14px',
          color: '#b0b0b0',
          marginBottom: '5px',
        }}
      >
        Entry Name
      </label>
      <input
        type="text"
        placeholder="Enter name"
        value={entry.name}
        onChange={(e) => setEntry({ ...entry, name: e.target.value })}
        style={{
          width: '100%',
          padding: '10px',
          border: '1px solid #333',
          borderRadius: '5px',
          backgroundColor: '#1c1c1c',
          color: '#ffffff',
        }}
      />
    </div>

    {/* שדה להזנת סכום */}
    <div style={{ width: '100%', padding: '0 20px' }}>
      <label
        style={{
          display: 'block',
          fontSize: '14px',
          color: '#b0b0b0',
          marginBottom: '5px',
        }}
      >
        Amount
      </label>
      <input
        type="number"
        placeholder="Enter amount"
        value={entry.amount}
        onChange={(e) => setEntry({ ...entry, amount: e.target.value })}
        style={{
          width: '100%',
          padding: '10px',
          border: '1px solid #333',
          borderRadius: '5px',
          backgroundColor: '#1c1c1c',
          color: '#ffffff',
        }}
      />
    </div>

    {/* כפתור פעולה עם החלקה */}
    <div
  onTouchStart={(e) => setStartX(e.touches[0].clientX)}
  onTouchMove={(e) => {
    const currentX = e.touches[0].clientX;
    const deltaX = currentX - startX;

    if (deltaX > 50) {
      setSwipeDirection('right');
      setButtonText('Slide Right to Add Income');
    } else if (deltaX < -50) {
      setSwipeDirection('left');
      setButtonText('Slide Left to Add Expense');
    }
  }}
  onTouchEnd={() => {
    if (swipeDirection === 'right' && entry.name && entry.amount) {
      handleAddEntry('income');
    } else if (swipeDirection === 'left' && entry.name && entry.amount) {
      handleAddEntry('expense');
    } else {
      alert('Please fill in the fields before swiping.');
    }
    setSwipeDirection(null);
    setButtonText('Swipe to Add');
  }}
  style={{
    width: '100%',
    textAlign: 'center',
  }}
>
  <button
    style={{
      width: '100%',
      padding: '15px',
      borderRadius: '10px',
      border: 'none',
      backgroundColor: swipeDirection === 'right' ? '#4CAF50' : swipeDirection === 'left' ? '#FF6347' : '#555',
      color: '#ffffff',
      fontSize: '16px',
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'background-color 0.3s ease',
      animation: 'bounce 2s infinite',
    }}
  >
    {buttonText}
  </button>
</div>
  </div>
)}
{!isBoxOpen && (
  <button
    onClick={() => setIsBoxOpen(true)}
    style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      width: '50px',
      height: '50px',
      backgroundColor: '#4CAF50',
      color: '#fff',
      border: 'none',
      borderRadius: '50%',
      fontSize: '24px',
      fontWeight: 'bold',
      cursor: 'pointer',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
    }}
  >
    +
  </button>
)}








{/* מד התקדמות להוצאות */}
{currentScreen === 'expenses' && expenses.length > 0 && (
  <div style={{ margin: '20px auto', maxWidth: '600px' }}>
    {Object.keys(expenseTotals).map((category) => (
      <div key={category} style={{ marginBottom: '10px' }}>
        <label
          onClick={() => toggleCategoryDetails(category)}
          style={{
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'block',
            marginBottom: '5px',
            color: expandedCategory === category ? '#4CAF50' : '#000',
          }}
        >
          {category} {expenseCategories.find((cat) => cat.name === category)?.emoji || ''}
        </label>
        <div
          style={{
            backgroundColor: '#e0e0e0',
            borderRadius: '8px',
            overflow: 'hidden',
            marginTop: '5px',
          }}
        >
          <div
            style={{
              width: `${(expenseTotals[category] / Math.max(...Object.values(expenseTotals))) * 100}%`,
              backgroundColor: '#FF6384',
              height: '20px',
            }}
          ></div>
        </div>
        <p style={{ margin: '5px 0', color: '#555' }}>{currency}{expenseTotals[category].toFixed(2)}</p>

        {/* פירוט הקטגוריה */}
        {currentScreen === 'expenses' && expandedCategory === category && (
          <ul style={{ listStyle: 'none', paddingLeft: '0', marginTop: '10px' }}>
            {expenses
              .filter((entry) => entry.category === category)
              .map((entry, index) => (
                <li
                  key={index}
                  style={{
                    padding: '5px 0',
                    borderBottom: '1px solid #ddd',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span>{entry.name}: {currency}{parseFloat(entry.amount).toFixed(2)}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {/* תיבת בחירה לשינוי קטגוריה */}
                    <select
                      value={entry.category}
                      onChange={(e) => {
                        const updatedExpenses = [...expenses];
                        updatedExpenses[index].category = e.target.value; // שינוי הקטגוריה
                        setExpenses(updatedExpenses);
                      }}
                      style={{
                        padding: '5px',
                        borderRadius: '5px',
                        border: '1px solid #ccc',
                      }}
                    >
                      {expenseCategories.map((cat) => (
                        <option key={cat.name} value={cat.name}>
                          {cat.emoji} {cat.name}
                        </option>
                      ))}
                    </select>
                    {/* כפתור מחיקה */}
                    <button
                      onClick={() => handleDelete(index, 'expenses')}
                      style={{
                        padding: '5px 10px',
                        backgroundColor: '#FF6347',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                </li>
              ))}
          </ul>
        )}
      </div>
    ))}
  </div>
)}

{/* מד התקדמות להכנסות */}
{currentScreen === 'income' && income.length > 0 && (
  <div style={{ margin: '20px auto', maxWidth: '600px' }}>
    {Object.keys(incomeTotals).map((category) => (
      <div key={category} style={{ marginBottom: '10px' }}>
        <label
          onClick={() => toggleCategoryDetails(category)}
          style={{
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'block',
            marginBottom: '5px',
            color: expandedCategory === category ? '#4CAF50' : '#000',
          }}
        >
          {category} {incomeCategories.find((cat) => cat.name === category)?.emoji || ''}
        </label>
        <div
          style={{
            backgroundColor: '#e0e0e0',
            borderRadius: '8px',
            overflow: 'hidden',
            marginTop: '5px',
          }}
        >
          <div
            style={{
              width: `${(incomeTotals[category] / Math.max(...Object.values(incomeTotals))) * 100}%`,
              backgroundColor: '#4CAF50',
              height: '20px',
            }}
          ></div>
        </div>
        <p style={{ margin: '5px 0', color: '#555' }}>{currency}{incomeTotals[category].toFixed(2)}</p>

        {/* פירוט הקטגוריה */}
        {currentScreen === 'income' && expandedCategory === category && (
          <ul style={{ listStyle: 'none', paddingLeft: '0', marginTop: '10px' }}>
            {income
              .filter((entry) => entry.category === category)
              .map((entry, index) => (
                <li
                  key={index}
                  style={{
                    padding: '5px 0',
                    borderBottom: '1px solid #ddd',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span>{entry.name}: {currency}{parseFloat(entry.amount).toFixed(2)}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {/* תיבת בחירה לשינוי קטגוריה */}
                    <select
                      value={entry.category}
                      onChange={(e) => {
                        const updatedIncome = [...income];
                        updatedIncome[index].category = e.target.value; // שינוי הקטגוריה
                        setIncome(updatedIncome);
                      }}
                      style={{
                        padding: '5px',
                        borderRadius: '5px',
                        border: '1px solid #ccc',
                      }}
                    >
                      {incomeCategories.map((cat) => (
                        <option key={cat.name} value={cat.name}>
                          {cat.emoji} {cat.name}
                        </option>
                      ))}
                    </select>
                    {/* כפתור מחיקה */}
                    <button
                      onClick={() => handleDelete(index, 'income')}
                      style={{
                        padding: '5px 10px',
                        backgroundColor: '#FF6347',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                </li>
              ))}
          </ul>
        )}
      </div>
    ))}
  </div>
)}
<div style={{ padding: '20px', textAlign: 'center' }}>
  <h2>History</h2>

  {/* בחירת חודש */}
  <div style={{ marginBottom: '20px' }}>
    <button onClick={() => handleMonthChange(-1)}>⬅ Previous</button>
    <span style={{ margin: '0 10px', fontWeight: 'bold' }}>
      {new Date(0, selectedMonth).toLocaleString('default', { month: 'long' })}
    </span>
    <button onClick={() => handleMonthChange(1)}>Next ➡</button>
  </div>

  {/* טבלת היסטוריה */}
  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
    <thead>
      <tr>
        <th style={{ border: '1px solid #ccc', padding: '8px' }}>Date</th>
        <th style={{ border: '1px solid #ccc', padding: '8px' }}>Name</th>
        <th style={{ border: '1px solid #ccc', padding: '8px' }}>Amount</th>
        <th style={{ border: '1px solid #ccc', padding: '8px' }}>Type</th>
      </tr>
    </thead>
    <tbody>
      {filterHistoryByMonth().map((item) => (
        <tr key={item.id}>
          <td style={{ border: '1px solid #ccc', padding: '8px' }}>
            {new Date(item.date).toLocaleDateString()}
          </td>
          <td style={{ border: '1px solid #ccc', padding: '8px' }}>{item.name}</td>
          <td style={{ border: '1px solid #ccc', padding: '8px' }}>{item.amount}</td>
          <td style={{ border: '1px solid #ccc', padding: '8px' }}>
            {item.type === 'income' ? 'Income' : 'Expense'}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>


{currentScreen === 'achievements' && (
  <div style={{ margin: '20px auto', maxWidth: '600px' }}>
    <h2 style={{ textAlign: 'center', color: '#4CAF50' }}>Achievements</h2>
    <ul style={{ listStyle: 'none', paddingLeft: '0', marginTop: '10px' }}>
      {achievements.map((ach) => (
        <li
          key={ach.id}
          style={{
            padding: '10px',
            margin: '5px 0',
            borderRadius: '4px',
            backgroundColor: unlockedAchievements.includes(ach.id) ? '#DFF2BF' : '#F2DEDE',
            color: unlockedAchievements.includes(ach.id) ? '#4CAF50' : '#FF6347',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>{ach.text}</span>
          <span>{unlockedAchievements.includes(ach.id) ? '✅' : '❌'}</span>
        </li>
      ))}
    </ul>
  </div>
)}

{showSuccessMessage && (
  <div style={{
    position: 'fixed',
    bottom: '80px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: '#4CAF50',
    color: '#fff',
    padding: '15px 30px',
    borderRadius: '12px',
    fontSize: '1.2rem',
    fontWeight: 'bold',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
    zIndex: 1000,
    animation: 'fade-in-out 3s',
  }}>
    ✅ {currentScreen === 'expenses' ? 'Expense' : 'Income'} added successfully!
  </div>
)}



    </div>
  );
}

export default App;
