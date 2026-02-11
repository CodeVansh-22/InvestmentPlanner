// Global Chart Instances to prevent memory leaks
let mainChart = null;
let trendChart = null;

// Initialize Lucide Icons on load
window.onload = () => {
    if (typeof lucide !== 'undefined') lucide.createIcons();
    initHistoryChart();
    calculateEMI();
};

// 1. Theme Toggle Logic
const themeBtn = document.getElementById('theme-btn');
if (themeBtn) {
    themeBtn.addEventListener('change', () => {
        const mode = themeBtn.checked ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', mode);
        localStorage.setItem('wealthwise-theme', mode);
    });
}

// 2. The Core Analysis Engine (Dynamic Suggestions)
function analyzeFinances() {
    const salary = parseFloat(document.getElementById('salary').value) || 0;
    
    // Summing detailed expenses
    const expIds = ['food', 'milk', 'elec', 'utilities', 'travel', 'medical'];
    const totalExpenses = expIds.reduce((sum, id) => sum + (parseFloat(document.getElementById(id).value) || 0), 0);
    const investable = Math.max(0, salary - totalExpenses);

    const resultBox = document.getElementById('result-view');
    
    // Tiered Investment Logic
    let portfolio = [];
    if (investable <= 0) {
        portfolio = [{ name: "Emergency Fund", amt: 0, desc: "Reduce expenses to start.", risk: "N/A" }];
    } else if (investable < 10000) {
        // Small Budget: Priority on Safety
        portfolio = [
            { name: "Gold (Digital/Physical)", amt: investable * 0.5, desc: "Safe haven & inflation hedge", risk: "Low" },
            { name: "Mutual Funds (SIP)", amt: investable * 0.5, desc: "Diversified growth", risk: "Medium" }
        ];
    } else if (investable < 50000) {
        // Mid Budget: Balanced Growth
        portfolio = [
            { name: "Blue Chip Stocks", amt: investable * 0.3, desc: "Stable dividend companies", risk: "High" },
            { name: "Mutual Funds", amt: investable * 0.5, desc: "Professional management", risk: "Medium" },
            { name: "Gold/SGB", amt: investable * 0.2, desc: "Portfolio insurance", risk: "Low" }
        ];
    } else {
        // High Budget: Wealth Creation & Real Estate
        portfolio = [
            { name: "Property (House/Gala)", amt: investable * 0.4, desc: "Tangible asset & rental potential", risk: "Stable" },
            { name: "Equity/Growth Stocks", amt: investable * 0.3, desc: "High wealth creation", risk: "Very High" },
            { name: "Mutual Funds", amt: investable * 0.2, desc: "Consistent returns", risk: "Medium" },
            { name: "Gold", amt: investable * 0.1, desc: "Diversification", risk: "Low" }
        ];
    }

    // Render Results
    resultBox.innerHTML = `
        <div class="result-header">
            <h3>Monthly Surplus</h3>
            <h1 class="grad-text">₹${investable.toLocaleString()}</h1>
        </div>
        <div class="chart-wrap" style="height: 250px; margin: 20px 0;">
            <canvas id="mainChart"></canvas>
        </div>
        <div class="recommendations">
            ${portfolio.map(item => `
                <div class="rec-card" style="border-left: 5px solid ${item.risk === 'Low' || item.risk === 'Stable' ? '#10b981' : '#7c3aed'}">
                    <div>
                        <strong>${item.name}</strong> <small>(${item.risk} Risk)</small>
                        <p style="font-size: 0.8rem; opacity: 0.7; margin: 0;">${item.desc}</p>
                    </div>
                    <span style="font-weight: 800;">₹${Math.round(item.amt).toLocaleString()}</span>
                </div>
            `).join('')}
        </div>
    `;

    renderDoughnut(totalExpenses, investable);
}

// 3. Chart Rendering
function renderDoughnut(exp, inv) {
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
        options: { cutout: '80%', plugins: { legend: { display: false } }, responsive: true, maintainAspectRatio: false }
    });
}

function initHistoryChart() {
    const ctx = document.getElementById('historyChart').getContext('2d');
    trendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'],
            datasets: [{
                label: 'Growth Trend',
                data: [5000, 8000, 7500, 12000, 15000, 18500],
                borderColor: '#7c3aed',
                backgroundColor: 'rgba(124, 58, 237, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });
}

// 4. EMI Calculator
function calculateEMI() {
    const P = parseFloat(document.getElementById('loanAmt')?.value || 5000000);
    const r = parseFloat(document.getElementById('interest')?.value || 8.5) / 12 / 100;
    const n = parseFloat(document.getElementById('tenure')?.value || 20) * 12;

    const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const display = document.getElementById('emi-display');
    if (display) display.innerText = `₹${Math.round(emi).toLocaleString()}`;
}

// 5. Sharing & Export
function exportPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const inv = document.querySelector('.grad-text')?.innerText || "₹0";

    doc.setFontSize(22);
    doc.text("WealthWise Investment Strategy", 20, 30);
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 40);
    doc.text(`Monthly Investable Amount: ${inv}`, 20, 60);
    doc.text("Suggestions are based on your risk-profile and monthly surplus.", 20, 70);
    
    doc.save("WealthWise_Plan.pdf");
}

function shareWhatsApp() {
    const inv = document.querySelector('.grad-text')?.innerText || "₹0";
    const text = `Check out my WealthWise Investment Plan! I have a monthly surplus of ${inv} for wealth building. 🚀`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
}