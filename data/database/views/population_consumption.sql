DROP VIEW IF EXISTS population_consumption;
CREATE VIEW population_consumption AS

SELECT a.financial_year, b.state, b.population, cast(b.energy_consumption_pj AS float) as energy_consumption_pj 
FROM financial_year a

INNER JOIN state_consumption b
ON a.year_id = b.year_id;

select * from population_consumption 