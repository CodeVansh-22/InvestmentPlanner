const themeBtn = document.getElementById('theme-btn');
themeBtn.addEventListener('change', () => {
    document.documentElement.setAttribute('data-theme', themeBtn.checked ? 'light' : 'dark');
});

function analyzeFinances() {
    const salary = parseFloat(document.getElementById('salary').value) || 0;
    
    // Comprehensive Input IDs
    const ids = ['food', 'milk', 'elec', 'utilities', 'travel', 'medical'];
    const totalExpenses = ids.reduce((sum, id) => sum + (parseFloat(document.getElementById(id).value) || 0), 0);
    const investable = Math.max(0, salary - totalExpenses);

    const resultBox = document.getElementById('result-view');
    
    // High-End Results UI
    resultBox.innerHTML = `
        <div class="result-header" style="text-align: center; margin-bottom: 30px;">
            <p style="color: var(--primary); font-weight: 700;">INVESTMENT POTENTIAL</p>
            <h1 style="font-size: 3.5rem; margin: 10px 0;">₹${investable.toLocaleString()}</h1>
            <p style="opacity: 0.6;">based on your ₹${totalExpenses.toLocaleString()} monthly expenses</p>
        </div>
        
        <div class="chart-wrap" style="height: 250px; position: relative; margin-bottom: 40px;">
            <canvas id="mainChart"></canvas>
        </div>

        <div class="recommendations">
            <div class="rec-card">
                <span>🚀 <b>Stocks</b> <br><small>High Return</small></span>
                <span style="font-weight: 800; font-size: 1.2rem;">₹${(investable * 0.3).toLocaleString()}</span>
            </div>
            <div class="rec-card" style="border-left-color: #10b981;">
                <span>📈 <b>Mutual Funds</b> <br><small>Growth</small></span>
                <span style="font-weight: 800; font-size: 1.2rem;">₹${(investable * 0.5).toLocaleString()}</span>
            </div>
            <div class="rec-card" style="border-left-color: #f1c40f;">
                <span>🟡 <b>Gold</b> <br><small>Safety</small></span>
                <span style="font-weight: 800; font-size: 1.2rem;">₹${(investable * 0.2).toLocaleString()}</span>
            </div>
        </div>
    `;

    // Initialize Doughnut Chart
    const ctx = document.getElementById('mainChart').getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Expenses', 'Investments'],
            datasets: [{
                data: [totalExpenses, investable],
                backgroundColor: ['#db2777', '#7c3aed'],
                hoverOffset: 10,
                borderWidth: 0
            }]
        },
        options: {
            cutout: '80%',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            }
        }
    });
}