DROP VIEW IF EXISTS state_production_view;
CREATE VIEW state_production_view AS
SELECT fuel_source.fuel_source,
fuel_source.renewable,
state_production.state,
CAST(state_production.energy_production_gwh AS float) AS energy_production_gwh,
financial_year.financial_year
FROM fuel_source
    JOIN state_production ON fuel_source.fuel_id = state_production.fuel_id
    JOIN financial_year ON financial_year.year_id = state_production.year_id;

SELECT * from state_production_view