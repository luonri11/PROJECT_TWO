import json
from flask import Flask, jsonify, render_template
from requests import session
import sqlalchemy
from sqlalchemy import inspect
from sqlalchemy import create_engine
import pandas as pd
import psycopg2
import sys

def getview(view_name):
    con = psycopg2.connect("host='localhost' dbname='australian_energy_db' user='postgres' password='postgres'")  
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


app = Flask(__name__)

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
