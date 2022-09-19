DROP VIEW IF EXISTS industry_consumption_view;

CREATE VIEW industry_consumption_view AS

SELECT a.state, c.financial_year, CAST(a.energy_consumption_pj AS float) AS energy_consumption_pj, b.industry
FROM industry_consumption a

INNER JOIN industries b
ON a.industry_id = b.industry_id

INNER JOIN financial_year c
ON a.year_id = c.year_id;

SELECT * FROM industry_consumption_view