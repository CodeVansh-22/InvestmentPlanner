from flask import Flask, render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy
import datetime

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
db = SQLAlchemy(app)

# Database Model
class InvestmentRecord(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    salary = db.Column(db.Float)
    expenses = db.Column(db.Float)
    investment = db.Column(db.Float)
    date = db.Column(db.DateTime, default=datetime.datetime.utcnow)

with app.app_context():
    db.create_all()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/calculate', methods=['POST'])
def calculate():
    data = request.json
    salary = float(data.get('salary', 0))
    
    # Summing up expenses
    home_needs = sum([float(v) for v in data.get('homeNeeds', {}).values()])
    misc = sum([float(v) for v in data.get('misc', {}).values()])
    
    total_expenses = home_needs + misc
    investment_amt = salary - total_expenses
    
    # Save to DB
    new_record = InvestmentRecord(salary=salary, expenses=total_expenses, investment=investment_amt)
    db.session.add(new_record)
    db.session.commit()

    return jsonify({
        "total_expenses": total_expenses,
        "investment_amt": max(0, investment_amt),
        "status": "Success"
    })

if __name__ == '__main__':
    app.run(debug=True)