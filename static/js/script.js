let mainChart = null;
let trendChart = null;
let lastPayload = null;

window.onload = () => {
    if (typeof lucide !== 'undefined') lucide.createIcons();
    initHistoryChart();
    calculateEMI();
};

const themeBtn = document.getElementById('theme-btn');
if (themeBtn) {
    themeBtn.addEventListener('change', () => {
        document.documentElement.setAttribute(
            'data-theme',
            themeBtn.checked ? 'light' : 'dark'
        );
    });
}

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

    // -------- UI --------
    const resultView = document.getElementById('result-view');
    resultView.innerHTML = `
        <div style="text-align:center;margin-bottom:1.5rem">
            <p style="opacity:.6">MONTHLY SURPLUS</p>
            <h1 class="grad-text">₹${investable.toLocaleString()}</h1>
        </div>
        <div style="height:220px"><canvas id="mainChart"></canvas></div>
    `;

    updateChart(totalExpenses, investable);

    // -------- DB PAYLOAD --------
    const payloadObj = { salary, homeNeeds, misc };
    const payload = JSON.stringify(payloadObj);

    if (payload === lastPayload) {
        console.log("Same data, skipping insert");
        return;
    }
    lastPayload = payload;

    // -------- SEND TO BACKEND --------
    fetch("/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload
    })
    .then(res => res.json())
    .then(() => console.log("Saved to DB"))
    .catch(err => console.error("DB error:", err));
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
                backgroundColor: ['#db2777', '#7c3aed'],
                borderWidth: 0
            }]
        },
        options: { cutout: '80%', plugins: { legend: { display: false } } }
    });
}

function calculateEMI() {
    const P = Number(document.getElementById('loanAmt')?.value || 0);
    const r = Number(document.getElementById('interest')?.value || 0) / 12 / 100;
    const n = Number(document.getElementById('tenure')?.value || 0) * 12;
    if (!P || !r || !n) return;

    const emi = (P * r * Math.pow(1 + r, n)) /
                (Math.pow(1 + r, n) - 1);

    document.getElementById('emi-display').innerText =
        `₹${Math.round(emi).toLocaleString()}`;
}

function initHistoryChart() {
    const ctx = document.getElementById('historyChart')?.getContext('2d');
    if (!ctx) return;

    trendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Sep','Oct','Nov','Dec','Jan','Feb'],
            datasets: [{
                data: [4000,9000,8500,13000,16000,20000],
                borderColor: '#7c3aed',
                fill: true,
                tension: .4
            }]
        },
        options: { plugins: { legend: { display: false } } }
    });
}