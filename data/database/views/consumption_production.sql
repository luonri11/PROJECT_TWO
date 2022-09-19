DROP VIEW IF EXISTS consumption_production;
CREATE VIEW consumption_production AS
SELECT a.state,
MAX(c.financial_year) AS financial_year, 
cast (SUM(a.energy_production_gwh) AS INT) AS energy_production_gwh,
cast(AVG(b.energy_consumption_pj*227.778) As INT) As energy_consumption_gwh
FROM state_production a
RIGHT JOIN state_consumption b
ON a.state = b.state AND a.year_id = b.year_id
LEFT JOIN financial_year c
ON a.year_id = c.year_id
GROUP BY a.state, a.year_id
ORDER BY a.year_id, a.state;

SELECT * FROM consumption_production