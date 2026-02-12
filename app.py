from flask import Flask, render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy
import datetime
import os

app = Flask(__name__)

# ================= DATABASE CONFIG =================

app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get(
    "DATABASE_URL",
    "sqlite:///database.db"
)

# Render PostgreSQL fix
if app.config['SQLALCHEMY_DATABASE_URI'].startswith("postgres://"):
    app.config['SQLALCHEMY_DATABASE_URI'] = app.config['SQLALCHEMY_DATABASE_URI'].replace(
        "postgres://", "postgresql://", 1
    )

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# ================= DATABASE MODEL =================

class InvestmentRecord(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    salary = db.Column(db.Float)
    expenses = db.Column(db.Float)
    investment = db.Column(db.Float)
    date = db.Column(db.DateTime, default=datetime.datetime.utcnow)

# Create tables
with app.app_context():
    db.create_all()

# ================= ROUTES =================

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/calculate', methods=['POST'])
def calculate():
    data = request.json

    salary = float(data.get('salary', 0))

    home_needs = sum([float(v) for v in data.get('homeNeeds', {}).values()])
    misc = sum([float(v) for v in data.get('misc', {}).values()])

    total_expenses = home_needs + misc
    investment_amt = salary - total_expenses

    new_record = InvestmentRecord(
        salary=salary,
        expenses=total_expenses,
        investment=max(0, investment_amt)
    )

    db.session.add(new_record)
    db.session.commit()

    return jsonify({
        "total_expenses": total_expenses,
        "investment_amt": max(0, investment_amt),
        "status": "Success"
    })

# ================= ADMIN VIEW =================

@app.route('/admin/records')
def admin_records():
    records = InvestmentRecord.query.order_by(InvestmentRecord.date.desc()).all()
    return render_template('records.html', records=records)

# ================= Test Run =================
@app.route("/test-insert")
def test_insert():
    r = InvestmentRecord(
        salary=50000,
        expenses=20000,
        investment=30000
    )
    db.session.add(r)
    db.session.commit()
    return "TEST INSERT OK"

# ================= RUN =================

if __name__ == '__main__':
    app.run(debug=True)