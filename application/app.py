# import dbm
# import json
import os
from flask import Flask, jsonify, render_template
# from requests import session

# from sqlalchemy import inspect
# from sqlalchemy import create_engine

import psycopg2
# import sys

app = Flask(__name__)

user = 'typurkwdxvrwvj'
password = '57913999518e3f51b5d1c72db2370f8966ed6798f4e447f4951283656a1cf9c3'
host = 'ec2-34-200-205-45.compute-1.amazonaws.com'
port = '5432'
name = 'd89dik6s50rruf'

from flask_sqlalchemy import SQLAlchemy
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', '') or "postgresql://postgres:postgres@localhost:5432/australian_energy_db"

# Remove tracking modifications
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

def getview(view_name):
    # con = psycopg2.connect("host='localhost' dbname='australian_energy_db' user='postgres' password='postgres'")
    con = psycopg2.connect(f"host='{host}' dbname='{name}' user='{user}' password='{password}'")
    cur = con.cursor()
    cur.execute(f'select * from  {view_name}')
    view = cur.fetchall()
    headings = [x[0] for x in cur.description]
    d3_view=[]
    for array in view:
        row = dict(zip(headings, array))
        d3_view.append(row)
    cur.close()

    return d3_view

@app.route("/")
def home():
    return render_template("base.html")

@app.route("/stateproduction")
def stateproduction():
    return render_template("state_production.html")

@app.route("/api/stateproduction")
def state_production_api():
    view_name = "state_production_view"
    d3_view = getview(view_name)
    return jsonify(d3_view)

@app.route("/consumptionproduction")
def consumptionproduction():
    return render_template("consumption_production.html")

@app.route("/api/consumptionproduction")
def consumption_production_api():
    view_name = "consumption_production"
    d3_view = getview(view_name)
    return jsonify(d3_view)

@app.route("/industryconsumption")
def industryconsumption():
    return render_template("industry_consumption.html")

@app.route("/api/industryconsumption")
def industry_consumption_api():
    view_name = "industry_consumption_view"
    d3_view = getview(view_name)
    return jsonify(d3_view)

@app.route("/populationconsumption")
def populationconsumption():
    return render_template("population_consumption.html")

@app.route("/api/populationconsumption")
def population_consumption_api():
    view_name = "population_consumption"
    d3_view = getview(view_name)
    return jsonify(d3_view)
    
if __name__ == "__main__":
    app.run(debug=True)
