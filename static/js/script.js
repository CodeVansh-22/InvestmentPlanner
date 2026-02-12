let mainChart = null;
let trendChart = null;
let lastPayload = null;

// 🔥 Render backend URL
const BACKEND_URL = "https://investmentplanner-mhxc.onrender.com";

window.onload = () => {
    if (typeof lucide !== 'undefined') lucide.createIcons();
    initHistoryChart();
    calculateEMI();
};

// ================= THEME =================
const themeBtn = document.getElementById('theme-btn');
if (themeBtn) {
    themeBtn.addEventListener('change', () => {
        document.documentElement.setAttribute(
            'data-theme',
            themeBtn.checked ? 'light' : 'dark'
        );
    });
}

// ================= MAIN ANALYSIS =================
function analyzeFinances() {
    const salary = parseFloat(document.getElementById('salary').value) || 0;

    const homeNeeds = {
        food: Number(document.getElementById('food').value) || 0,
        milk: Number(document.getElementById('milk').value) || 0,
        elec: Number(document.getElementById('elec').value) || 0,
        utilities: Number(document.getElementById('utilities').value) || 0
    };

    const misc = {
        travel: Number(document.getElementById('travel').value) || 0,
        medical: Number(document.getElementById('medical').value) || 0
    };

    const totalExpenses =
        Object.values(homeNeeds).reduce((a, b) => a + b, 0) +
        Object.values(misc).reduce((a, b) => a + b, 0);

    const investable = Math.max(0, salary - totalExpenses);

    // ================= SUGGESTION ENGINE =================
    let portfolio = [];

    if (investable <= 5000) {
        portfolio = [
            { name: "Savings Account", val: 0.6, risk: "Very Safe", icon: "💰" },
            { name: "RD (Recurring Deposit)", val: 0.4, risk: "Safe", icon: "🏦" }
        ];
    } 
    else if (investable <= 15000) {
        portfolio = [
            { name: "Digital Gold", val: 0.3, risk: "Low", icon: "🟡" },
            { name: "Index Mutual Funds", val: 0.5, risk: "Medium", icon: "📈" },
            { name: "Emergency Fund", val: 0.2, risk: "Safe", icon: "🛡️" }
        ];
    } 
    else {
        portfolio = [
            { name: "Bluechip Stocks", val: 0.35, risk: "High", icon: "🚀" },
            { name: "Equity Mutual Funds", val: 0.35, risk: "Medium", icon: "📊" },
            { name: "Real Estate / REITs", val: 0.2, risk: "Stable", icon: "🏠" },
            { name: "Gold / Bonds", val: 0.1, risk: "Safe", icon: "🪙" }
        ];
    }

    // ================= UI UPDATE =================
    const resultView = document.getElementById('result-view');

    resultView.innerHTML = `
        <div style="text-align:center;margin-bottom:1.5rem">
            <p style="opacity:.6">MONTHLY SURPLUS</p>
            <h1 class="grad-text">₹${investable.toLocaleString()}</h1>
        </div>

        <div style="height:220px;margin-bottom:1.5rem">
            <canvas id="mainChart"></canvas>
        </div>

        <div class="recommendations">
            ${portfolio.map(p => `
                <div class="rec-card">
                    <span>${p.icon} <b>${p.name}</b><br>
                    <small style="opacity:.6">${p.risk} Risk</small></span>
                    <span style="font-weight:800">
                        ₹${Math.round(investable * p.val).toLocaleString()}
                    </span>
                </div>
            `).join("")}
        </div>
    `;

    updateChart(totalExpenses, investable);

    // ================= SAVE TO BACKEND =================
    const payloadObj = { salary, homeNeeds, misc };
    const payload = JSON.stringify(payloadObj);

    if (payload === lastPayload) return;
    lastPayload = payload;

    fetch(`${BACKEND_URL}/calculate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload
    })
    .then(res => res.json())
    .then(() => console.log("Saved to DB"))
    .catch(err => console.error("Backend Error:", err));
}

// ================= CHART =================
function updateChart(exp, inv) {
    const ctx = document.getElementById('mainChart').getContext('2d');
    if (mainChart) mainChart.destroy();

    mainChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Expenses', 'Investments'],
            datasets: [{
                data: [exp, inv],
                backgroundColor: ['#db2777', '#7c3aed']
            }]
        },
        options: {
            cutout: '80%',
            plugins: { legend: { display: false } }
        }
    });
}

// ================= EMI =================
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

// ================= HISTORY CHART =================
function initHistoryChart() {
    const ctx = document.getElementById('historyChart')?.getContext('2d');
    if (!ctx) return;

    trendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'],
            datasets: [{
                data: [4000, 9000, 8500, 13000, 16000, 20000],
                borderColor: '#7c3aed',
                backgroundColor: 'rgba(124,58,237,0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: { plugins: { legend: { display: false } } }
    });
}

// ================= EXPORTS =================
function exportPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.text("WealthWise Investment Strategy", 20, 20);
    doc.text(
        `Monthly Surplus: ${document.querySelector('.grad-text')?.innerText || "₹0"}`,
        20, 40
    );
    doc.save("WealthWise_Plan.pdf");
}

function shareWhatsApp() {
    const val = document.querySelector('.grad-text')?.innerText || "₹0";
    window.open(`https://wa.me/?text=My Monthly Investment Surplus: ${val}`, '_blank');
}