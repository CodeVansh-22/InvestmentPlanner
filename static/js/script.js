function updateUI(salary, expenses, investable) {
    const expensePer = ((expenses / salary) * 100).toFixed(0);
    
    const outputHtml = `
        <div class="result-header">
            <h3>👤 Your Profile: User, ₹${salary.toLocaleString()} salary</h3>
            <p>💸 Total Expenses: <span class="highlight">₹${expenses.toLocaleString()} (${expensePer}%)</span></p>
            <p>💰 Available Investment: <span class="highlight" style="color: #00b894">₹${investable.toLocaleString()}/month</span></p>
        </div>
        
        <h4>🎯 Recommended Portfolio:</h4>
        <div class="portfolio-item"><span>• Mutual Funds (8-12%)</span> <span>₹${(investable * 0.6).toFixed(0)}</span></div>
        <div class="portfolio-item"><span>• Gold (Safe)</span> <span>₹${(investable * 0.2).toFixed(0)}</span></div>
        <div class="portfolio-item"><span>• Stocks (Growth)</span> <span>₹${(investable * 0.15).toFixed(0)}</span></div>
        <div class="portfolio-item"><span>• Property SIP</span> <span>₹${(investable * 0.05).toFixed(0)}</span></div>
        
        <p style="font-size: 0.8rem; margin-top: 20px; opacity: 0.7;">
            📱 Mobile Responsive • Dark/Light Theme • Zero Dependencies
        </p>
    `;
    
    document.getElementById('suggestions').innerHTML = outputHtml;
}

// Dark Mode Switch with smooth transition
document.getElementById('theme-toggle').addEventListener('click', () => {
    const body = document.body;
    body.style.opacity = '0'; // Quick fade out
    setTimeout(() => {
        body.classList.toggle('dark-theme');
        body.style.opacity = '1'; // Fade back in
    }, 200);
});