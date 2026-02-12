let mainChart = null;
let trendChart = null;
let lastPayload = null;

const BACKEND_URL = "https://investmentplanner-mhxc.onrender.com";

window.onload = () => {
    if (typeof lucide !== 'undefined') lucide.createIcons();
    initHistoryChart();
    calculateEMI();
};

function analyzeFinances() {
    const salary = parseFloat(document.getElementById('salary').value) || 0;

    const homeNeeds = {
        food: document.getElementById('food').value || 0,
        milk: document.getElementById('milk').value || 0,
        elec: document.getElementById('elec').value || 0,
        utilities: document.getElementById('utilities').value || 0
    };

    const misc = {
        travel: document.getElementById('travel').value || 0,
        medical: document.getElementById('medical').value || 0
    };

    const totalExpenses =
        Object.values(homeNeeds).reduce((a, b) => a + Number(b), 0) +
        Object.values(misc).reduce((a, b) => a + Number(b), 0);

    const investable = Math.max(0, salary - totalExpenses);

    document.getElementById('result-view').innerHTML = `
        <h2>Monthly Surplus</h2>
        <h1>₹${investable.toLocaleString()}</h1>
        <canvas id="mainChart"></canvas>
    `;

    updateChart(totalExpenses, investable);

    const payloadObj = { salary, homeNeeds, misc };
    const payload = JSON.stringify(payloadObj);

    if (payload === lastPayload) return;
    lastPayload = payload;

    // 🔥 IMPORTANT FIX (FULL BACKEND URL)
    fetch(`${BACKEND_URL}/calculate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload
    })
    .then(res => res.json())
    .then(() => console.log("Saved to DB"))
    .catch(err => console.error("Backend error:", err));
}

function updateChart(exp, inv) {
    const ctx = document.getElementById('mainChart').getContext('2d');
    if (mainChart) mainChart.destroy();

    mainChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Expenses', 'Investment'],
            datasets: [{
                data: [exp, inv],
                backgroundColor: ['#db2777', '#7c3aed']
            }]
        },
        options: { plugins: { legend: { display: false } } }
    });
}

function calculateEMI() {}
function initHistoryChart() {}