async function calculateInvestment() {
    const data = {
        salary: document.getElementById('salary').value,
        homeNeeds: {
            food: document.getElementById('food').value,
            elec: document.getElementById('electricity').value
        },
        misc: {
            travel: document.getElementById('travel').value,
            med: document.getElementById('medical').value
        }
    };

    const response = await fetch('/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    const result = await response.json();
    document.getElementById('amt-display').innerText = `₹${result.investment_amt}`;
    
    updateChart(data.homeNeeds, data.misc);
    showRecommendations(result.investment_amt);
}

function showRecommendations(amt) {
    const box = document.getElementById('suggestions');
    if (amt <= 0) {
        box.innerHTML = "<p>Reduce expenses to start investing!</p>";
        return;
    }

    box.innerHTML = `
        <div class="rec-item"><strong>Gold (Safe):</strong> ₹${(amt * 0.2).toFixed(0)} (Hedge)</div>
        <div class="rec-item"><strong>Mutual Funds (Mid):</strong> ₹${(amt * 0.5).toFixed(0)} (Growth)</div>
        <div class="rec-item"><strong>Stocks (High):</strong> ₹${(amt * 0.3).toFixed(0)} (Wealth)</div>
    `;
}

// Dark Mode Toggle
document.getElementById('theme-toggle').addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
});