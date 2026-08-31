/* =========================
   Student Expense Tracker
   JavaScript
========================= */


/* =========================
   Variables
========================= */

const expenseForm = document.getElementById("expenseForm");

const expenseTitle = document.getElementById("expenseTitle");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");
const noteInput = document.getElementById("note");

const expenseList = document.getElementById("expenseList");

const totalExpense = document.getElementById("totalExpense");
const todayExpense = document.getElementById("todayExpense");
const transactionCount = document.getElementById("transactionCount");

const categorySummary = document.getElementById("categorySummary");

const filterCategory = document.getElementById("filterCategory");

const clearAllBtn = document.getElementById("clearAllBtn");


/* =========================
   Expense Data
========================= */

let expenses = JSON.parse(localStorage.getItem("studentExpenses")) || [];


/* =========================
   Set Today's Date
========================= */

const today = new Date();

const year = today.getFullYear();
const month = String(today.getMonth() + 1).padStart(2, "0");
const day = String(today.getDate()).padStart(2, "0");

const todayString = `${year}-${month}-${day}`;

dateInput.value = todayString;


/* =========================
   Category Icons
========================= */

const categoryIcons = {
    Food: "🍔",
    Transport: "🚌",
    Education: "📚",
    Shopping: "🛍️",
    Entertainment: "🎮",
    Bills: "💡",
    Other: "📦"
};


/* =========================
   Add Expense
========================= */

expenseForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const title = expenseTitle.value.trim();
    const amount = parseFloat(amountInput.value);
    const category = categoryInput.value;
    const date = dateInput.value;
    const note = noteInput.value.trim();


    // Validation
    if (title === "") {
        alert("Please enter an expense name.");
        return;
    }

    if (isNaN(amount) || amount <= 0) {
        alert("Please enter a valid amount.");
        return;
    }

    if (category === "") {
        alert("Please select a category.");
        return;
    }

    if (date === "") {
        alert("Please select a date.");
        return;
    }


    // Create new expense
    const newExpense = {
        id: Date.now(),
        title: title,
        amount: amount,
        category: category,
        date: date,
        note: note
    };


    // Add to array
    expenses.push(newExpense);


    // Save to browser
    saveExpenses();


    // Reset form
    expenseForm.reset();

    dateInput.value = todayString;


    // Update website
    updateDashboard();

});


/* =========================
   Save Expenses
========================= */

function saveExpenses() {

    localStorage.setItem(
        "studentExpenses",
        JSON.stringify(expenses)
    );

}


/* =========================
   Update Dashboard
========================= */

function updateDashboard() {

    updateSummary();

    displayExpenses();

    updateCategorySummary();

}


/* =========================
   Update Summary
========================= */

function updateSummary() {

    let total = 0;

    let todayTotal = 0;


    expenses.forEach(function (expense) {

        total += expense.amount;

        if (expense.date === todayString) {
            todayTotal += expense.amount;
        }

    });


    totalExpense.textContent = total.toFixed(2);

    todayExpense.textContent = todayTotal.toFixed(2);

    transactionCount.textContent = expenses.length;

}


/* =========================
   Display Expenses
========================= */

function displayExpenses() {

    const selectedCategory = filterCategory.value;


    let filteredExpenses = expenses;


    // Filter by category
    if (selectedCategory !== "All") {

        filteredExpenses = expenses.filter(function (expense) {

            return expense.category === selectedCategory;

        });

    }


    // Sort newest first
    filteredExpenses = [...filteredExpenses].sort(function (a, b) {

        return new Date(b.date) - new Date(a.date);

    });


    // Empty state
    if (filteredExpenses.length === 0) {

        expenseList.innerHTML = `
            <div class="empty-state">

                <div class="empty-icon">🧾</div>

                <h3>No expenses found</h3>

                <p>
                    Add an expense or change the category filter.
                </p>

            </div>
        `;

        return;

    }


    // Clear list
    expenseList.innerHTML = "";


    // Display each expense
    filteredExpenses.forEach(function (expense) {

        const expenseItem = document.createElement("div");

        expenseItem.className = "expense-item";


        const formattedDate = formatDate(expense.date);


        expenseItem.innerHTML = `

            <div class="expense-info">

                <div class="expense-icon">
                    ${categoryIcons[expense.category] || "📦"}
                </div>


                <div class="expense-details">

                    <h3>${escapeHTML(expense.title)}</h3>

                    <p>
                        ${expense.category}
                        •
                        ${formattedDate}
                        ${expense.note ? " • " + escapeHTML(expense.note) : ""}
                    </p>

                </div>

            </div>


            <div class="expense-right">

                <span class="expense-amount">
                    - ৳${expense.amount.toFixed(2)}
                </span>

                <button
                    class="delete-btn"
                    onclick="deleteExpense(${expense.id})"
                    title="Delete expense"
                >
                    🗑️
                </button>

            </div>

        `;


        expenseList.appendChild(expenseItem);

    });

}


/* =========================
   Delete Expense
========================= */

function deleteExpense(id) {

    const confirmed = confirm(
        "Are you sure you want to delete this expense?"
    );


    if (!confirmed) {
        return;
    }


    expenses = expenses.filter(function (expense) {

        return expense.id !== id;

    });


    saveExpenses();

    updateDashboard();

}


/* =========================
   Clear All Expenses
========================= */

clearAllBtn.addEventListener("click", function () {

    if (expenses.length === 0) {

        alert("There are no expenses to clear.");

        return;

    }


    const confirmed = confirm(
        "Are you sure you want to delete ALL expenses?"
    );


    if (!confirmed) {
        return;
    }


    expenses = [];

    saveExpenses();

    updateDashboard();

});


/* =========================
   Filter
========================= */

filterCategory.addEventListener("change", function () {

    displayExpenses();

});


/* =========================
   Category Summary
========================= */

function updateCategorySummary() {

    if (expenses.length === 0) {

        categorySummary.innerHTML = `
            <div class="empty-category">

                <span>📊</span>

                <p>No expenses yet</p>

            </div>
        `;

        return;

    }


    const categoryTotals = {};


    // Calculate category totals
    expenses.forEach(function (expense) {

        if (!categoryTotals[expense.category]) {

            categoryTotals[expense.category] = 0;

        }

        categoryTotals[expense.category] += expense.amount;

    });


    // Find highest amount
    const highestAmount = Math.max(
        ...Object.values(categoryTotals)
    );


    categorySummary.innerHTML = "";


    Object.keys(categoryTotals)
        .sort(function (a, b) {

            return categoryTotals[b] - categoryTotals[a];

        })
        .forEach(function (category) {

            const amount = categoryTotals[category];


            const percentage =
                highestAmount > 0
                    ? (amount / highestAmount) * 100
                    : 0;


            const categoryItem =
                document.createElement("div");

            categoryItem.className = "category-item";


            categoryItem.innerHTML = `

                <div class="category-top">

                    <span class="category-name">
                        ${categoryIcons[category] || "📦"}
                        ${category}
                    </span>

                    <span class="category-amount">
                        ৳${amount.toFixed(2)}
                    </span>

                </div>


                <div class="progress-background">

                    <div
                        class="progress-bar"
                        style="width: ${percentage}%"
                    ></div>

                </div>

            `;


            categorySummary.appendChild(categoryItem);

        });

}


/* =========================
   Format Date
========================= */

function formatDate(dateString) {

    const date = new Date(dateString + "T00:00:00");


    return date.toLocaleDateString("en-BD", {

        day: "2-digit",
        month: "short",
        year: "numeric"

    });

}


/* =========================
   Security Helper
========================= */

function escapeHTML(text) {

    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}


/* =========================
   Initial Load
========================= */

updateDashboard();