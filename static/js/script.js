let mainChart = null;
let trendChart = null;

window.onload = () => {
    if (typeof lucide !== 'undefined') lucide.createIcons();
    initHistoryChart();
    calculateEMI();
};

const themeBtn = document.getElementById('theme-btn');
themeBtn.addEventListener('change', () => {
    document.documentElement.setAttribute('data-theme', themeBtn.checked ? 'light' : 'dark');
});

function analyzeFinances() {
    const payload = JSON.stringify({
    salary: salary,
    homeNeeds: {
        food: document.getElementById('food').value || 0,
        milk: document.getElementById('milk').value || 0,
        elec: document.getElementById('elec').value || 0,
        utilities: document.getElementById('utilities').value || 0
    },
    misc: {
        travel: document.getElementById('travel').value || 0,
        medical: document.getElementById('medical').value || 0
    }
});

if (payload === lastPayload) {
    console.log("Same data, skipping DB insert");
    return;
}
lastPayload = payload;
    const salary = parseFloat(document.getElementById('salary').value) || 0;
    const expIds = ['food', 'milk', 'elec', 'utilities', 'travel', 'medical'];
    const totalExpenses = expIds.reduce((sum, id) => sum + (parseFloat(document.getElementById(id).value) || 0), 0);
    const investable = Math.max(0, salary - totalExpenses);

    const resultView = document.getElementById('result-view');
    
    // Dynamic Suggestion Engine
    let portfolio = [];
    if (investable < 15000) {
        portfolio = [
            { name: "Digital Gold", val: 0.4, risk: "Safe", icon: "🟡" },
            { name: "Index Mutual Funds", val: 0.6, risk: "Med", icon: "📈" }
        ];
    } else {
        portfolio = [
            { name: "Real Estate (Gala)", val: 0.4, risk: "Stable", icon: "🏠" },
            { name: "Bluechip Stocks", val: 0.3, risk: "High", icon: "🚀" },
            { name: "Hybrid Funds", val: 0.3, risk: "Med", icon: "📊" }
        ];
    }

    resultView.innerHTML = `
        <div style="text-align: center; margin-bottom: 1.5rem;">
            <p style="opacity: 0.6; font-size: 0.9rem;">MONTHLY SURPLUS</p>
            <h1 class="grad-text" style="font-size: 2.5rem; font-weight: 800;">₹${investable.toLocaleString()}</h1>
        </div>
        <div style="height: 220px; width: 100%; margin-bottom: 1.5rem;">
            <canvas id="mainChart"></canvas>
        </div>
        <div class="recommendations">
            ${portfolio.map(item => `
                <div class="rec-card">
                    <span>${item.icon} <b>${item.name}</b> <br><small style="opacity:0.6">${item.risk} Risk</small></span>
                    <span style="font-weight: 800;">₹${Math.round(investable * item.val).toLocaleString()}</span>
                </div>
            `).join('')}
        </div>
    `;

    updateChart(totalExpenses, investable);
}

function updateChart(exp, inv) {
    const ctx = document.getElementById('mainChart').getContext('2d');
    if (mainChart) mainChart.destroy();
    mainChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Expenses', 'Investments'],
            datasets: [{
                data: [exp, inv],
                backgroundColor: ['#db2777', '#7c3aed'],
                borderWidth: 0,
                hoverOffset: 15
            }]
        },
        options: { cutout: '82%', plugins: { legend: { display: false } }, responsive: true, maintainAspectRatio: false }
    });
}

function calculateEMI() {
    const P = parseFloat(document.getElementById('loanAmt').value);
    const r = parseFloat(document.getElementById('interest').value) / 12 / 100;
    const n = parseFloat(document.getElementById('tenure').value) * 12;
    const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    document.getElementById('emi-display').innerText = `₹${Math.round(emi).toLocaleString()}`;
}

function initHistoryChart() {
    const ctx = document.getElementById('historyChart').getContext('2d');
    trendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'],
            datasets: [{
                data: [4000, 9000, 8500, 13000, 16000, 20000],
                borderColor: '#7c3aed',
                backgroundColor: 'rgba(124, 58, 237, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });
}

function exportPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.text("WealthWise Investment Strategy", 20, 20);
    doc.text(`Monthly Surplus: ${document.querySelector('.grad-text')?.innerText || "₹0"}`, 20, 40);
    doc.save("WealthWise_Plan.pdf");
}

function shareWhatsApp() {
    const val = document.querySelector('.grad-text')?.innerText || "₹0";
    window.open(`https://wa.me/?text=My Monthly Investment Surplus: ${val}`, '_blank');
}

// ================= SEND DATA TO BACKEND =================
fetch("/calculate", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        salary: salary,
        homeNeeds: {
            food: document.getElementById('food').value || 0,
            milk: document.getElementById('milk').value || 0,
            elec: document.getElementById('elec').value || 0,
            utilities: document.getElementById('utilities').value || 0
        },
        misc: {
            travel: document.getElementById('travel').value || 0,
            medical: document.getElementById('medical').value || 0
        }
    })
})
.then(res => res.json())
.then(data => {
    console.log("Saved to DB:", data);
})
.catch(err => console.error("DB Error:", err));