from backend.agents import CarbonCalculatorAgent, CarbonAnalyzerAgent, FutureImpactPredictorAgent
from backend.schemas import CalculateRequest, HistoryEntry, CarbonRecordBreakdown

def test_carbon_calculator_gasoline():
    agent = CarbonCalculatorAgent()
    req = CalculateRequest(
        miles_driven=100.0,
        fuel_type="gasoline",
        kwh_electricity=200.0,
        heating_source="electricity",
        meat_meals_per_week=5,
        waste_recycled_percentage=50
    )
    res = agent.run(req)
    
    # 1. Transportation: 100 * 0.404 = 40.4
    # 2. Electricity: (200 / 4.33) * 0.385 + 5.0 (heating) = 17.78 + 5.0 = 22.78
    # 3. Food: 5 * 2.5 + 10.0 = 22.5
    # 4. Waste: max(3.0, 15.0 - 50 * 0.12) = 15.0 - 6.0 = 9.0
    # Expected sum = 40.4 + 22.8 (rounded) + 22.5 + 9.0 = 94.7
    assert res.total_co2 > 0.0
    assert res.breakdown["transportation"] == 40.4
    assert res.breakdown["food"] == 22.5
    assert res.breakdown["waste"] == 9.0


def test_carbon_calculator_electric():
    agent = CarbonCalculatorAgent()
    req = CalculateRequest(
        miles_driven=100.0,
        fuel_type="electric",
        kwh_electricity=0.0,
        heating_source="none",
        meat_meals_per_week=0,
        waste_recycled_percentage=100
    )
    res = agent.run(req)
    # 1. Transportation: 100 * 0.05 = 5.0
    # 2. Electricity: 0 + 0 = 0
    # 3. Food: 0 * 2.5 + 10 = 10.0
    # 4. Waste: max(3.0, 15.0 - 12.0) = 3.0
    # Total = 5.0 + 0 + 10.0 + 3.0 = 18.0
    assert res.breakdown["transportation"] == 5.0
    assert res.breakdown["electricity"] == 0.0
    assert res.breakdown["food"] == 10.0
    assert res.breakdown["waste"] == 3.0
    assert res.total_co2 == 18.0


def test_carbon_analyzer():
    agent = CarbonAnalyzerAgent()
    history = [
        HistoryEntry(
            date="2026-06-01",
            total_co2=100.0,
            breakdown=CarbonRecordBreakdown(transportation=70.0, electricity=15.0, food=10.0, waste=5.0)
        ),
        HistoryEntry(
            date="2026-06-08",
            total_co2=120.0,
            breakdown=CarbonRecordBreakdown(transportation=80.0, electricity=20.0, food=15.0, waste=5.0)
        )
    ]
    res = agent.run(history)
    
    # Averages:
    # Transportation: 75.0
    # Electricity: 17.5
    # Food: 12.5
    # Waste: 5.0
    # Total Avg: 110.0
    # Major contributors (threshold > 110.0 * 0.25 = 27.5): transportation
    assert "transportation" in res["major_contributors"]
    assert "waste" not in res["major_contributors"]
    assert res["averages"]["transportation"] == 75.0
    assert res["total_avg"] == 110.0


def test_future_predictor():
    agent = FutureImpactPredictorAgent()
    res = agent.run(4800.0, 15.0) # 4800 kg baseline, 15% reduction
    
    # 1 month expected: 4800 / 12 = 400.0
    # 1 month savings: 400 * 0.15 = 60.0
    assert res.predictions["one_month"].expected == 400.0
    assert res.predictions["one_month"].savings == 60.0
    
    # 1 year expected: 4800.0
    # 1 year savings: 4800.0 * 0.15 = 720.0
    assert res.predictions["one_year"].expected == 4800.0
    assert res.predictions["one_year"].savings == 720.0
