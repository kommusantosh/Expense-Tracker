
// ==========================================
// VARIABLES
// ==========================================

const themeToggle = document.getElementById("themeToggle");

const welcomeScreen =
    document.getElementById("welcomeScreen");

const userNameInput =
    document.getElementById("userName");

const startButton =
    document.getElementById("startButton");

const app =
    document.getElementById("app");

const welcomeMessage =
    document.getElementById("welcomeMessage");

const amountInput =
    document.getElementById("amount");

const categoryInput =
    document.getElementById("category");

const descriptionInput =
    document.getElementById("description");

const dateInput =
    document.getElementById("date");

const addButton =
    document.getElementById("addExpense");

const updateButton =
    document.getElementById("updateExpense");

const expenseList =
    document.getElementById("expenseList");

const totalAmountDisplay =
    document.getElementById("totalAmount");

const expenseCountDisplay =
    document.getElementById("expenseCount");

const averageAmountDisplay =
    document.getElementById("averageAmount");

const emptyState =
    document.getElementById("emptyState");

const searchExpense =
    document.getElementById("searchExpense");

const filterCategory =
    document.getElementById("filterCategory");

const confirmModal =
    document.getElementById("confirmModal");

const cancelDeleteButton =
    document.getElementById("cancelDelete");

const confirmDeleteButton =
    document.getElementById("confirmDelete");

const chartCanvas =
    document.getElementById("expenseChart");

const categoryBreakdown =
    document.getElementById("categoryBreakdown");


let expenses =
    JSON.parse(
        localStorage.getItem("expenses")
    ) || [];

let expenseToDelete = null;

let expenseToEdit = null;

let expenseChart = null;


// ==========================================
// THEME
// ==========================================

const savedTheme =
    localStorage.getItem("theme");

if (savedTheme === "light") {

    document.body.classList.add(
        "light-mode"
    );

    themeToggle.textContent =
        "🌙 Dark";

} else {

    themeToggle.textContent =
        "☀️ Light";

}


themeToggle.addEventListener(
    "click",
    function () {

        document.body.classList.toggle(
            "light-mode"
        );

        const lightMode =
            document.body.classList.contains(
                "light-mode"
            );

        if (lightMode) {

            themeToggle.textContent =
                "🌙 Dark";

            localStorage.setItem(
                "theme",
                "light"
            );

        } else {

            themeToggle.textContent =
                "☀️ Light";

            localStorage.setItem(
                "theme",
                "dark"
            );

        }

        updateAnalytics();

    }
);


// ==========================================
// GREETING
// ==========================================

function getGreeting() {

    const hour =
        new Date().getHours();


    if (hour >= 5 && hour < 12) {
        return "🌅 Good Morning";
    }

    if (hour >= 12 && hour < 17) {
        return "☀️ Good Afternoon";
    }

    if (hour >= 17 && hour < 21) {
        return "🌆 Good Evening";
    }

    return "🌙 Good Night";
}


function updateGreeting() {

    const savedName =
        localStorage.getItem("userName");

    if (savedName) {

        welcomeMessage.textContent =
            `${getGreeting()}, ${savedName}! 👋`;

    }

}


// ==========================================
// SHOW APPLICATION
// ==========================================

function showApplication() {

    welcomeScreen.style.display =
        "none";

    app.style.display =
        "block";

    updateGreeting();

    displayExpenses();

}


// ==========================================
// USER LOGIN
// ==========================================

const savedUserName =
    localStorage.getItem("userName");


if (savedUserName) {

    showApplication();

}


startButton.addEventListener(
    "click",
    function () {

        const name =
            userNameInput.value.trim();


        if (name === "") {

            alert(
                "Please enter your name."
            );

            userNameInput.focus();

            return;

        }


        localStorage.setItem(
            "userName",
            name
        );


        showApplication();

        amountInput.focus();

    }
);


userNameInput.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Enter") {

            event.preventDefault();

            startButton.click();

        }

    }
);


// ==========================================
// DISPLAY EXPENSES
// ==========================================

function displayExpenses() {

    expenseList.innerHTML = "";


    const searchText =
        searchExpense.value
            .trim()
            .toLowerCase();


    const selectedCategory =
        filterCategory.value;


    const filteredExpenses =
        expenses.filter(
            function (expense) {

                const matchesSearch =
                    expense.category
                        .toLowerCase()
                        .includes(searchText) ||

                    expense.description
                        .toLowerCase()
                        .includes(searchText);


                const matchesCategory =
                    selectedCategory === "All" ||
                    expense.category ===
                    selectedCategory;


                return (
                    matchesSearch &&
                    matchesCategory
                );

            }
        );


    filteredExpenses.forEach(
        function (expense) {

            createExpenseCard(expense);

        }
    );


    updateSummary();

    updateEmptyState(
        filteredExpenses.length
    );

    updateAnalytics();

}


// ==========================================
// CREATE EXPENSE CARD
// ==========================================

function createExpenseCard(expenseData) {

    const card =
        document.createElement("div");


    card.innerHTML = `

        <p>

            <strong>
                ${getCategoryIcon(
                    expenseData.category
                )}

                ${escapeHTML(
                    expenseData.category
                )}
            </strong>

            -
            ${escapeHTML(
                expenseData.description
            )}

            <br>

            ₹${Number(
                expenseData.amount
            ).toLocaleString("en-IN")}

            <br>

            ${escapeHTML(
                expenseData.date
            )}

        </p>


        <div class="expense-actions">

            <button
                type="button"
                class="editButton"
            >
                Edit
            </button>

            <button
                type="button"
                class="deleteButton"
            >
                Delete
            </button>

        </div>

    `;


    expenseList.appendChild(card);


    const editButton =
        card.querySelector(
            ".editButton"
        );


    editButton.addEventListener(
        "click",
        function () {

            startEditing(expenseData);

        }
    );


    const deleteButton =
        card.querySelector(
            ".deleteButton"
        );


    deleteButton.addEventListener(
        "click",
        function () {

            expenseToDelete =
                expenseData;

            confirmModal.style.display =
                "flex";

        }
    );

}


// ==========================================
// EDIT EXPENSE
// ==========================================

function startEditing(expenseData) {

    expenseToEdit =
        expenseData;


    amountInput.value =
        expenseData.amount;

    categoryInput.value =
        expenseData.category;

    descriptionInput.value =
        expenseData.description;


    const parts =
        expenseData.date.split("/");


    if (parts.length === 3) {

        const day =
            parts[0];

        const month =
            parts[1];

        const year =
            "20" + parts[2];


        dateInput.value =
            `${year}-${month}-${day}`;

    }


    addButton.style.display =
        "none";

    updateButton.style.display =
        "block";


    document.querySelector(
        ".form-section"
    ).scrollIntoView({
        behavior: "smooth"
    });


    amountInput.focus();

}


// ==========================================
// UPDATE EXPENSE
// ==========================================

updateButton.addEventListener(
    "click",
    function () {

        if (!expenseToEdit) {
            return;
        }


        const amount =
            amountInput.value;

        const category =
            categoryInput.value;

        const description =
            descriptionInput.value.trim();

        const date =
            dateInput.value;


        if (
            amount === "" ||
            category === "" ||
            description === "" ||
            date === ""
        ) {

            alert(
                "Please fill in all fields."
            );

            return;

        }


        if (Number(amount) <= 0) {

            alert(
                "Please enter a valid amount."
            );

            return;

        }


        const parts =
            date.split("-");


        const formattedDate =
            `${parts[2]}/${parts[1]}/${parts[0].slice(2)}`;


        const index =
            expenses.findIndex(
                function (expense) {

                    return (
                        expense.id ===
                        expenseToEdit.id
                    );

                }
            );


        if (index !== -1) {

            expenses[index] = {

                id: expenseToEdit.id,

                amount: Number(amount),

                category: category,

                description: description,

                date: formattedDate

            };

        }


        saveExpenses();

        finishEditing();

        displayExpenses();
        
        showNotification(
            "Expense Updated",
            "Your expense was updated successfully.",
            "✏️"
        );
            }
);


// ==========================================
// FINISH EDITING
// ==========================================

function finishEditing() {

    expenseToEdit = null;

    addButton.style.display =
        "block";

    updateButton.style.display =
        "none";

    amountInput.value = "";

    categoryInput.value = "";

    descriptionInput.value = "";

    dateInput.value = "";

}


// ==========================================
// ADD EXPENSE
// ==========================================

addButton.addEventListener(
    "click",
    function () {

        const amount =
            amountInput.value;

        const category =
            categoryInput.value;

        const description =
            descriptionInput.value.trim();

        const date =
            dateInput.value;


        if (
            amount === "" ||
            category === "" ||
            description === "" ||
            date === ""
        ) {

            alert(
                "Please fill in all fields."
            );

            return;

        }


        if (Number(amount) <= 0) {

            alert(
                "Please enter a valid amount."
            );

            return;

        }


        const parts =
            date.split("-");


        const formattedDate =
            `${parts[2]}/${parts[1]}/${parts[0].slice(2)}`;


        const newExpense = {

            id: Date.now(),

            amount: Number(amount),

            category: category,

            description: description,

            date: formattedDate

        };


        expenses.push(newExpense);


        saveExpenses();

        displayExpenses();

        showNotification(
            "Expense Added",
            "Your expense was added successfully.",
            "✅"
        );


        amountInput.value = "";

        categoryInput.value = "";

        descriptionInput.value = "";

        dateInput.value = "";

        amountInput.focus();

    }
);


// ==========================================
// SAVE EXPENSES
// ==========================================

function saveExpenses() {

    localStorage.setItem(
        "expenses",
        JSON.stringify(expenses)
    );

}


// ==========================================
// DELETE
// ==========================================

cancelDeleteButton.addEventListener(
    "click",
    function () {

        confirmModal.style.display =
            "none";

        expenseToDelete = null;

    }
);


confirmDeleteButton.addEventListener(
    "click",
    function () {

        if (expenseToDelete) {

            expenses =
                expenses.filter(
                    function (expense) {

                        return (
                            expense.id !==
                            expenseToDelete.id
                        );

                    }
                );


            saveExpenses();

            displayExpenses();

            showNotification( "Expense Deleted", "The expense was deleted successfully.", "🗑️" );

        }


        confirmModal.style.display =
            "none";

        expenseToDelete = null;

    }
);


// ==========================================
// SEARCH
// ==========================================

searchExpense.addEventListener(
    "input",
    function () {

        displayExpenses();

    }
);


// ==========================================
// FILTER
// ==========================================

filterCategory.addEventListener(
    "change",
    function () {

        displayExpenses();

    }
);


// ==========================================
// KEYBOARD ENTER
// ==========================================

amountInput.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Enter") {

            event.preventDefault();

            categoryInput.focus();

        }

    }
);


categoryInput.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Enter") {

            event.preventDefault();

            descriptionInput.focus();

        }

    }
);


descriptionInput.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Enter") {

            event.preventDefault();

            dateInput.focus();

        }

    }
);


dateInput.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Enter") {

            event.preventDefault();

            if (
                updateButton.style.display ===
                "block"
            ) {

                updateButton.click();

            } else {

                addButton.click();

            }

        }

    }
);


// ==========================================
// ANALYTICS
// ==========================================

function updateAnalytics() {

    if (
        !chartCanvas ||
        !categoryBreakdown ||
        typeof Chart === "undefined"
    ) {

        return;

    }


    const categoryTotals = {};


    expenses.forEach(
        function (expense) {

            const category =
                expense.category;

            const amount =
                Number(expense.amount);


            if (!categoryTotals[category]) {

                categoryTotals[category] = 0;

            }


            categoryTotals[category] +=
                amount;

        }
    );


    const categories =
        Object.keys(categoryTotals);


    const amounts =
        Object.values(categoryTotals);


    categoryBreakdown.innerHTML = "";


    if (categories.length === 0) {

        categoryBreakdown.innerHTML = `

            <div class="category-item">

                <span class="category-name">
                    📊 No data yet
                </span>

                <span class="category-amount">
                    ₹0
                </span>

            </div>

        `;


        if (expenseChart) {

            expenseChart.destroy();

            expenseChart = null;

        }

        return;

    }


    categories.forEach(
        function (category) {

            const item =
                document.createElement("div");


            item.className =
                "category-item";


            item.innerHTML = `

                <span class="category-name">

                    ${getCategoryIcon(
                        category
                    )}

                    ${escapeHTML(
                        category
                    )}

                </span>

                <span class="category-amount">

                    ₹${categoryTotals[
                        category
                    ].toLocaleString("en-IN")}

                </span>

            `;


            categoryBreakdown.appendChild(
                item
            );

        }
    );


    if (expenseChart) {

        expenseChart.destroy();

    }


    const isLightMode =
        document.body.classList.contains(
            "light-mode"
        );


    expenseChart =
        new Chart(
            chartCanvas,
            {

                type: "doughnut",

                data: {

                    labels: categories,

                    datasets: [
                        {
                            data: amounts,

                            borderWidth: 2
                        }
                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    plugins: {

                        legend: {

                            position: "bottom",

                            labels: {

                                color:
                                    isLightMode
                                        ? "#374151"
                                        : "#cbd5e1",

                                padding: 15

                            }

                        }

                    }

                }

            }
        );

}


// ==========================================
// SUMMARY
// ==========================================

function updateSummary() {

    let total = 0;


    expenses.forEach(
        function (expense) {

            total +=
                Number(expense.amount);

        }
    );


    const count =
        expenses.length;


    const average =
        count > 0
            ? total / count
            : 0;


    totalAmountDisplay.textContent =
        total.toLocaleString("en-IN");


    expenseCountDisplay.textContent =
        count;


    averageAmountDisplay.textContent =
        Math.round(average)
            .toLocaleString("en-IN");

}



// ==========================================
// EMPTY STATE
// ==========================================

function updateEmptyState(
    visibleCount
) {

    const title =
        emptyState.querySelector("h3");

    const text =
        emptyState.querySelector("p");


    // No expenses at all

    if (expenses.length === 0) {

        emptyState.style.display =
            "block";


        title.textContent =
            "💸 No expenses yet";


        text.textContent =
            "Start tracking your spending by adding your first expense.";


        return;

    }


    // Expenses exist, but search/filter found nothing

    if (visibleCount === 0) {

        emptyState.style.display =
            "block";


        title.textContent =
            "🔍 No matching expenses";


        text.textContent =
            "Try changing your search or category filter.";


        return;

    }


    // Expenses are available

    emptyState.style.display =
        "none";

}




// ==========================================
// CATEGORY ICON
// ==========================================

function getCategoryIcon(category) {

    const icons = {

        Food: "🍔",

        Travel: "🚕",

        Shopping: "🛍️",

        Education: "📚",

        Bills: "💡",

        Entertainment: "🎮",

        Health: "❤️",

        Other: "📦"

    };


    return icons[category] || "📦";

}


// ==========================================
// HTML SAFETY
// ==========================================

function escapeHTML(value) {

    return String(value)

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");

}


// ==========================================
// UPDATE GREETING
// ==========================================

setInterval(
    updateGreeting,
    60000
);


// ==========================================
// MONTHLY BUDGET
// ==========================================

const monthlyBudgetInput =
    document.getElementById("monthlyBudget");

const saveBudgetButton =
    document.getElementById("saveBudget");

const budgetAmountDisplay =
    document.getElementById("budgetAmount");

const budgetSpentDisplay =
    document.getElementById("budgetSpent");

const budgetRemainingDisplay =
    document.getElementById("budgetRemaining");

const budgetPercentageDisplay =
    document.getElementById("budgetPercentage");

const budgetProgressBar =
    document.getElementById("budgetProgressBar");

const budgetMessage =
    document.getElementById("budgetMessage");


// ==========================================
// LOAD SAVED BUDGET
// ==========================================

let monthlyBudget =
    Number(
        localStorage.getItem("monthlyBudget")
    ) || 0;


if (monthlyBudget > 0) {

    monthlyBudgetInput.value =
        monthlyBudget;

}


// ==========================================
// SAVE BUDGET
// ==========================================

saveBudgetButton.addEventListener(
    "click",
    function () {

        const budget =
            Number(
                monthlyBudgetInput.value
            );


        if (
            monthlyBudgetInput.value === "" ||
            budget <= 0
        ) {

            alert(
                "Please enter a valid monthly budget."
            );

            monthlyBudgetInput.focus();

            return;

        }


        monthlyBudget =
            budget;


        localStorage.setItem(
            "monthlyBudget",
            monthlyBudget
        );


        updateBudget();


        budgetMessage.textContent =
            "Your monthly budget has been saved.";

        showNotification(
            "Budget Saved",
            "Your monthly budget has been saved successfully.",
            "🎯"
        );
    }
);


// ==========================================
// ENTER KEY FOR BUDGET
// ==========================================

monthlyBudgetInput.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Enter") {

            event.preventDefault();

            saveBudgetButton.click();

        }

    }
);


// ==========================================
// GET CURRENT MONTH EXPENSES
// ==========================================

function getCurrentMonthSpending() {

    const now =
        new Date();


    const currentMonth =
        now.getMonth();


    const currentYear =
        now.getFullYear();


    let total =
        0;


    expenses.forEach(
        function (expense) {

            if (!expense.date) {
                return;
            }


            const parts =
                expense.date.split("/");


            if (parts.length !== 3) {
                return;
            }


            const day =
                Number(parts[0]);

            const month =
                Number(parts[1]) - 1;

            const year =
                Number("20" + parts[2]);


            if (
                month === currentMonth &&
                year === currentYear
            ) {

                total +=
                    Number(expense.amount);

            }

        }
    );


    return total;

}


// ==========================================
// UPDATE BUDGET
// ==========================================

function updateBudget() {

    if (!budgetAmountDisplay) {
        return;
    }


    const spent =
        getCurrentMonthSpending();


    const remaining =
        monthlyBudget - spent;


    let percentage =
        0;


    if (monthlyBudget > 0) {

        percentage =
            (spent / monthlyBudget) * 100;

    }


    const displayPercentage =
        Math.round(percentage);


    // ======================================
    // DISPLAY VALUES
    // ======================================

    budgetAmountDisplay.textContent =
        monthlyBudget.toLocaleString(
            "en-IN"
        );


    budgetSpentDisplay.textContent =
        spent.toLocaleString(
            "en-IN"
        );


    budgetRemainingDisplay.textContent =
        Math.abs(remaining).toLocaleString(
            "en-IN"
        );


    budgetPercentageDisplay.textContent =
        `${displayPercentage}%`;


    // ======================================
    // PROGRESS BAR
    // ======================================

    const progressWidth =
        Math.min(percentage, 100);


    budgetProgressBar.style.width =
        `${progressWidth}%`;


    // ======================================
    // BUDGET MESSAGE
    // ======================================

    if (monthlyBudget === 0) {

        budgetPercentageDisplay.textContent =
            "0%";

        budgetProgressBar.style.width =
            "0%";

        budgetMessage.textContent =
            "Set your monthly budget to start tracking.";

        return;

    }


    if (spent > monthlyBudget) {

        budgetMessage.textContent =
            `🚨 You have exceeded your budget by ₹${(
                spent - monthlyBudget
            ).toLocaleString("en-IN")}.`;

    }

    else if (
        spent >= monthlyBudget * 0.8
    ) {

        budgetMessage.textContent =
            `⚠️ You're getting close to your budget. ₹${remaining.toLocaleString("en-IN")} remaining.`;

    }

    else {

        budgetMessage.textContent =
            `✅ You're within your budget. ₹${remaining.toLocaleString("en-IN")} remaining.`;

    }

}


// ==========================================
// UPDATE BUDGET WHEN EXPENSES CHANGE
// ==========================================

const originalDisplayExpenses =
    displayExpenses;


displayExpenses =
    function () {

        originalDisplayExpenses();

        updateBudget();

    };


// ==========================================
// INITIAL BUDGET UPDATE
// ==========================================

updateBudget();


// ==========================================
// EXPORT EXPENSES TO CSV
// ==========================================

const exportCSVButton =
    document.getElementById("exportCSV");


exportCSVButton.addEventListener(
    "click",
    function () {

        // Check whether there are expenses

        if (expenses.length === 0) {

            alert(
                "There are no expenses to export."
            );

            return;

        }


        // CSV header

        let csv =
            "Date,Category,Description,Amount\n";


        // Add every expense

        expenses.forEach(
            function (expense) {

                const date =
                    `"${expense.date}"`;

                const category =
                    `"${escapeCSV(
                        expense.category
                    )}"`;

                const description =
                    `"${escapeCSV(
                        expense.description
                    )}"`;

                const amount =
                    `"${expense.amount}"`;


                csv +=
                    `${date},${category},${description},${amount}\n`;

            }
        );


        // Create file

        const blob =
            new Blob(
                [csv],
                {
                    type: "text/csv;charset=utf-8;"
                }
            );


        // Create temporary download link

        const url =
            URL.createObjectURL(blob);


        const link =
            document.createElement("a");


        link.href = url;

        link.download =
            `expense-report-${getTodayDate()}.csv`;


        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);


        URL.revokeObjectURL(url);

        showNotification(
            "Export Complete",
            "Your expense report was downloaded successfully.",
            "📊"
        );
    }
);


// ==========================================
// CSV SAFETY
// ==========================================

function escapeCSV(value) {

    return String(value)
        .replace(/"/g, '""');

}


// ==========================================
// TODAY'S DATE
// ==========================================

function getTodayDate() {

    const today =
        new Date();


    const day =
        String(
            today.getDate()
        ).padStart(2, "0");


    const month =
        String(
            today.getMonth() + 1
        ).padStart(2, "0");


    const year =
        today.getFullYear();


    return `${day}-${month}-${year}`;

}


// ==========================================
// MONTHLY REPORT
// ==========================================

const reportMonthInput =
    document.getElementById("reportMonth");

const reportTotalDisplay =
    document.getElementById("reportTotal");

const reportCountDisplay =
    document.getElementById("reportCount");

const reportAverageDisplay =
    document.getElementById("reportAverage");

const reportCategoryDisplay =
    document.getElementById("reportCategory");

const reportMessage =
    document.getElementById("reportMessage");


// ==========================================
// SET CURRENT MONTH
// ==========================================

function setCurrentReportMonth() {

    const today =
        new Date();


    const year =
        today.getFullYear();


    const month =
        String(
            today.getMonth() + 1
        ).padStart(2, "0");


    reportMonthInput.value =
        `${year}-${month}`;

}


setCurrentReportMonth();


// ==========================================
// WHEN MONTH CHANGES
// ==========================================

reportMonthInput.addEventListener(
    "change",
    function () {

        updateMonthlyReport();

    }
);


// ==========================================
// UPDATE MONTHLY REPORT
// ==========================================

function updateMonthlyReport() {

    if (
        !reportMonthInput ||
        !reportMonthInput.value
    ) {

        return;

    }


    const selectedMonth =
        reportMonthInput.value;


    const parts =
        selectedMonth.split("-");


    const selectedYear =
        Number(parts[0]);


    const selectedMonthNumber =
        Number(parts[1]);


    // ======================================
    // FIND EXPENSES FOR SELECTED MONTH
    // ======================================

    const monthlyExpenses =
        expenses.filter(
            function (expense) {

                if (!expense.date) {
                    return false;
                }


                const dateParts =
                    expense.date.split("/");


                if (dateParts.length !== 3) {
                    return false;
                }


                const expenseMonth =
                    Number(dateParts[1]);


                const expenseYear =
                    Number(
                        "20" + dateParts[2]
                    );


                return (
                    expenseMonth ===
                    selectedMonthNumber &&

                    expenseYear ===
                    selectedYear
                );

            }
        );


    // ======================================
    // NO EXPENSES
    // ======================================

    if (
        monthlyExpenses.length === 0
    ) {

        reportTotalDisplay.textContent =
            "0";

        reportCountDisplay.textContent =
            "0";

        reportAverageDisplay.textContent =
            "0";

        reportCategoryDisplay.textContent =
            "—";


        reportMessage.textContent =
            "📭 No expenses found for this month.";

        return;

    }


    // ======================================
    // TOTAL
    // ======================================

    let total =
        0;


    monthlyExpenses.forEach(
        function (expense) {

            total +=
                Number(expense.amount);

        }
    );


    // ======================================
    // AVERAGE
    // ======================================

    const average =
        total /
        monthlyExpenses.length;


    // ======================================
    // CATEGORY TOTALS
    // ======================================

    const categoryTotals = {};


    monthlyExpenses.forEach(
        function (expense) {

            const category =
                expense.category;


            if (!categoryTotals[category]) {

                categoryTotals[category] =
                    0;

            }


            categoryTotals[category] +=
                Number(expense.amount);

        }
    );


    // ======================================
    // FIND HIGHEST CATEGORY
    // ======================================

    let highestCategory =
        "—";

    let highestAmount =
        0;


    Object.keys(
        categoryTotals
    ).forEach(
        function (category) {

            if (
                categoryTotals[category] >
                highestAmount
            ) {

                highestAmount =
                    categoryTotals[category];

                highestCategory =
                    category;

            }

        }
    );


    // ======================================
    // DISPLAY RESULTS
    // ======================================

    reportTotalDisplay.textContent =
        total.toLocaleString(
            "en-IN"
        );


    reportCountDisplay.textContent =
        monthlyExpenses.length;


    reportAverageDisplay.textContent =
        Math.round(
            average
        ).toLocaleString(
            "en-IN"
        );


    reportCategoryDisplay.textContent =
        `${getCategoryIcon(
            highestCategory
        )} ${highestCategory}`;


    // ======================================
    // MESSAGE
    // ======================================

    reportMessage.textContent =
        `📊 You spent ₹${total.toLocaleString(
            "en-IN"
        )} across ${
            monthlyExpenses.length
        } expense${
            monthlyExpenses.length === 1
                ? ""
                : "s"
        } this month.`;

}


// ==========================================
// INITIAL REPORT
// ==========================================

updateMonthlyReport();


// ==========================================
// UPDATE REPORT WHEN EXPENSES CHANGE
// ==========================================

const originalDisplayExpensesForReport =
    displayExpenses;


displayExpenses =
    function () {

        originalDisplayExpensesForReport();

        updateMonthlyReport();

    };


// ==========================================
// BACKUP DATA
// ==========================================

const backupDataButton =
    document.getElementById("backupData");


backupDataButton.addEventListener(
    "click",
    function () {

        // Get saved user name

        const savedName =
            localStorage.getItem(
                "userName"
            ) || "";


        // Create backup object

        const backupData = {

            app: "Expense Tracker",

            version: "1.0",

            backupDate:
                new Date().toISOString(),

            userName:
                savedName,

            monthlyBudget:
                monthlyBudget,

            expenses:
                expenses

        };


        // Convert data to JSON

        const jsonData =
            JSON.stringify(
                backupData,
                null,
                4
            );


        // Create backup file

        const blob =
            new Blob(
                [jsonData],
                {
                    type:
                        "application/json"
                }
            );


        // Create download link

        const url =
            URL.createObjectURL(
                blob
            );


        const link =
            document.createElement(
                "a"
            );


        link.href =
            url;


        link.download =
            `expense-tracker-backup-${getTodayDate()}.json`;


        document.body.appendChild(
            link
        );


        link.click();


        document.body.removeChild(
            link
        );


        URL.revokeObjectURL(
            url
        );


        // Confirmation

        alert(
            "✅ Your expense data has been backed up successfully!"
        );

        showNotification(
            "Backup Complete",
            "Your expense data has been backed up successfully.",
            "💾"
        );

    }
);


// ==========================================
// RESTORE DATA
// ==========================================

const restoreDataButton =
    document.getElementById("restoreData");

const restoreFileInput =
    document.getElementById("restoreFile");


// Open file selector

restoreDataButton.addEventListener(
    "click",
    function () {

        restoreFileInput.click();

    }
);


// When a backup file is selected

restoreFileInput.addEventListener(
    "change",
    function (event) {

        const file =
            event.target.files[0];


        if (!file) {
            return;
        }


        // Make sure it is a JSON file

        if (
            !file.name
                .toLowerCase()
                .endsWith(".json")
        ) {

            alert(
                "❌ Please select a valid JSON backup file."
            );

            restoreFileInput.value = "";

            return;

        }


        const reader =
            new FileReader();


        reader.onload =
            function (e) {

                try {

                    const backup =
                        JSON.parse(
                            e.target.result
                        );


                    // Validate backup

                    if (
                        backup.app !==
                        "Expense Tracker"
                    ) {

                        throw new Error(
                            "Invalid backup file."
                        );

                    }


                    if (
                        !Array.isArray(
                            backup.expenses
                        )
                    ) {

                        throw new Error(
                            "Expense data is missing."
                        );

                    }


                    // Confirm before restoring

                    const confirmed =
                        confirm(
                            "Restore this backup?\n\nYour current expense data will be replaced."
                        );


                    if (!confirmed) {

                        restoreFileInput.value =
                            "";

                        return;

                    }


                    // Restore expenses

                    expenses =
                        backup.expenses;


                    localStorage.setItem(
                        "expenses",
                        JSON.stringify(
                            expenses
                        )
                    );


                    // Restore budget

                    if (
                        typeof backup.monthlyBudget ===
                        "number"
                    ) {

                        monthlyBudget =
                            backup.monthlyBudget;


                        localStorage.setItem(
                            "monthlyBudget",
                            monthlyBudget
                        );


                        if (
                            monthlyBudgetInput
                        ) {

                            monthlyBudgetInput.value =
                                monthlyBudget;

                        }

                    }


                    // Restore user name

                    if (
                        typeof backup.userName ===
                        "string" &&
                        backup.userName.trim() !== ""
                    ) {

                        localStorage.setItem(
                            "userName",
                            backup.userName
                        );

                    }


                    // Refresh everything

                    displayExpenses();

                    updateBudget();

                    updateMonthlyReport();


                    // Clear selected file

                    restoreFileInput.value =
                        "";


                    showNotification(
                        "Restore Complete",
                        "Your expense data has been restored successfully.",
                        "📤"
                    );


                }

                catch (error) {

                    console.error(
                        "Restore error:",
                        error
                    );


                    alert(
                        "❌ This is not a valid Expense Tracker backup file."
                    );


                    restoreFileInput.value =
                        "";

                }

            };


        reader.readAsText(file);

    }
);

// ==========================================
// CUSTOM NOTIFICATION
// ==========================================

function setupNotifications() {

    const customNotification =
        document.getElementById("customNotification");

    const notificationTitle =
        document.getElementById("notificationTitle");

    const notificationMessage =
        document.getElementById("notificationMessage");

    const notificationClose =
        document.getElementById("notificationClose");

    const notificationIcon =
        document.querySelector(".notification-icon");


    // Check that all elements exist

    if (
        !customNotification ||
        !notificationTitle ||
        !notificationMessage ||
        !notificationClose ||
        !notificationIcon
    ) {

        console.error(
            "Notification elements were not found."
        );

        return;

    }


    let notificationTimer;


    // ======================================
    // SHOW NOTIFICATION
    // ======================================

    window.showNotification =
        function (
            title,
            message,
            icon = "✅"
        ) {

            notificationTitle.textContent =
                title;

            notificationMessage.textContent =
                message;

            notificationIcon.textContent =
                icon;


            customNotification.classList.add(
                "show"
            );


            clearTimeout(
                notificationTimer
            );


            notificationTimer =
                setTimeout(
                    function () {

                        customNotification.classList.remove(
                            "show"
                        );

                    },
                    3500
                );

        };


    // ======================================
    // CLOSE BUTTON
    // ======================================

    notificationClose.addEventListener(
        "click",
        function () {

            customNotification.classList.remove(
                "show"
            );

        }
    );

}


// ==========================================
// START NOTIFICATION SYSTEM
// ==========================================

if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        setupNotifications
    );

}
else {

    setupNotifications();

}

