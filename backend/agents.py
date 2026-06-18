import os
import json
import google.generativeai as genai
from typing import List, Dict, Any
from .schemas import (
    CalculateRequest, CalculateResponse, HistoryEntry, UserPreferences,
    RecommendationItem, RecommendResponse, GoalResponse, PredictResponse, PredictionInterval
)

# Configure Gemini if key is provided
GEMINI_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_KEY:
    genai.configure(api_key=GEMINI_KEY)

class CarbonCalculatorAgent:
    """
    Agent 1: Carbon Footprint Calculator
    Inputs: User activities
    Outputs: Emission values per category (kg CO2e per week)
    """
    def run(self, data: CalculateRequest) -> CalculateResponse:
        # 1. Transportation
        transport_factors = {
            "gasoline": 0.404,
            "diesel": 0.463,
            "hybrid": 0.200,
            "electric": 0.050
        }
        factor = transport_factors.get(data.fuel_type.lower(), 0.404)
        transport_emissions = data.miles_driven * factor

        # 2. Electricity (Monthly kWh converted to weekly: divide by 4.33)
        weekly_kwh = data.kwh_electricity / 4.33
        # Grid average factor: ~0.385 kg CO2 per kWh
        electricity_emissions = weekly_kwh * 0.385

        # Heating source flat rate
        heating_factors = {
            "natural_gas": 15.0,
            "electricity": 5.0,
            "fuel_oil": 25.0,
            "none": 0.0
        }
        heating_emissions = heating_factors.get(data.heating_source.lower(), 0.0)
        energy_emissions = electricity_emissions + heating_emissions

        # 3. Food habits
        # 2.5 kg CO2 per meat meal. Base vegetarian weekly offset: 10.0 kg CO2
        food_emissions = (data.meat_meals_per_week * 2.5) + 10.0

        # 4. Waste generation
        # Baseline waste footprint: 15.0 kg CO2 per week
        # Subtract recycling offset (recycled percentage reduces waste emissions up to 12.0 kg CO2)
        waste_emissions = max(3.0, 15.0 - (data.waste_recycled_percentage * 0.12))

        # Summarize
        breakdown = {
            "transportation": round(transport_emissions, 1),
            "electricity": round(energy_emissions, 1),
            "food": round(food_emissions, 1),
            "waste": round(waste_emissions, 1)
        }
        total_co2 = round(sum(breakdown.values()), 1)

        return CalculateResponse(total_co2=total_co2, breakdown=breakdown)


class CarbonAnalyzerAgent:
    """
    Agent 2: Carbon Analyzer
    Inputs: User emission history
    Outputs: Major contributors, analysis reports
    """
    def run(self, history: List[HistoryEntry]) -> Dict[str, Any]:
        if not history:
            return {
                "major_contributors": [],
                "averages": {"transportation": 0, "electricity": 0, "food": 0, "waste": 0},
                "total_avg": 0
            }

        # Calculate averages per category
        count = len(history)
        totals = {"transportation": 0.0, "electricity": 0.0, "food": 0.0, "waste": 0.0}
        total_sum = 0.0

        for entry in history:
            totals["transportation"] += entry.breakdown.transportation
            totals["electricity"] += entry.breakdown.electricity
            totals["food"] += entry.breakdown.food
            totals["waste"] += entry.breakdown.waste
            total_sum += entry.total_co2

        averages = {k: round(v / count, 1) for k, v in totals.items()}
        total_avg = round(total_sum / count, 1)

        # Sort contributors
        sorted_contributors = sorted(averages.items(), key=lambda x: x[1], reverse=True)
        # Select categories making up more than 25% of average total or top contributor
        major_contributors = [k for k, v in sorted_contributors if v > (total_avg * 0.25) or k == sorted_contributors[0][0]]

        return {
            "major_contributors": major_contributors,
            "averages": averages,
            "total_avg": total_avg
        }


class RecommendationGeneratorAgent:
    """
    Agent 3: Recommendation Generator
    Inputs: Output of Carbon Analyzer + preferences
    Outputs: Sustainability insights and actions
    """
    def run(self, analysis: Dict[str, Any], preferences: UserPreferences) -> RecommendResponse:
        major_cats = analysis.get("major_contributors", [])
        averages = analysis.get("averages", {})
        total_avg = analysis.get("total_avg", 0.0)

        # 1. Fallback Rule-Based Engine
        preset_tips = {
            "transportation": [
                RecommendationItem(
                    category="transportation",
                    action="Opt for walking or cycling for distances under 2 miles.",
                    impact_level="medium",
                    xp_reward=40,
                    co2_offset_kg=5.5
                ),
                RecommendationItem(
                    category="transportation",
                    action="Switch 2 car trips per week to public bus or train routes.",
                    impact_level="high",
                    xp_reward=60,
                    co2_offset_kg=12.2
                )
            ],
            "electricity": [
                RecommendationItem(
                    category="electricity",
                    action="Unplug unused phone chargers and appliances (vampire load).",
                    impact_level="low",
                    xp_reward=20,
                    co2_offset_kg=2.0
                ),
                RecommendationItem(
                    category="electricity",
                    action="Cold wash laundry and air dry clothes instead of using a dryer.",
                    impact_level="medium",
                    xp_reward=35,
                    co2_offset_kg=4.8
                )
            ],
            "food": [
                RecommendationItem(
                    category="food",
                    action="Adopt Meatless Mondays - replace beef with plant-based alternatives.",
                    impact_level="high",
                    xp_reward=50,
                    co2_offset_kg=10.0
                ),
                RecommendationItem(
                    category="food",
                    action="Buy seasonal produce from local farmer markets to cut transport emissions.",
                    impact_level="medium",
                    xp_reward=30,
                    co2_offset_kg=3.5
                )
            ],
            "waste": [
                RecommendationItem(
                    category="waste",
                    action="Compost organic kitchen waste to reduce methane release in landfills.",
                    impact_level="medium",
                    xp_reward=30,
                    co2_offset_kg=3.0
                ),
                RecommendationItem(
                    category="waste",
                    action="Bring your own reusable grocery bag to eliminate plastic wrap.",
                    impact_level="low",
                    xp_reward=15,
                    co2_offset_kg=1.5
                )
            ]
        }

        # Select relevant preset recommendations based on major contributors
        recommendations = []
        for cat in major_cats:
            recommendations.extend(preset_tips.get(cat, []))
        
        # Ensure we have at least some tips
        if not recommendations:
            recommendations.extend(preset_tips["transportation"])
            recommendations.extend(preset_tips["electricity"])

        # Default insights text
        insights_text = (
            f"Based on your footprint analysis, your weekly average is {total_avg} kg CO2e. "
            f"Your highest category is {major_cats[0] if major_cats else 'energy'}. "
            f"For a {preferences.persona}, focus on targeted swaps in {', '.join(major_cats[:2])} to maximize reduction."
        )

        # 2. Call Gemini API if available
        if GEMINI_KEY:
            try:
                model = genai.GenerativeModel("gemini-1.5-flash")
                prompt = (
                    f"You are the EcoTrack AI Sustainability Coach. Analyze this carbon footprint history: "
                    f"Weekly Average: {total_avg} kg CO2e. "
                    f"Averages: {json.dumps(averages)}. "
                    f"Major contributors: {', '.join(major_cats)}. "
                    f"User persona: {preferences.persona}. "
                    f"Diet preference: {preferences.dietPreference}. "
                    f"Generate a customized analysis in 3 sentences focusing on the biggest emissions source. "
                    f"Then provide 3 innovative, actionable eco-swaps for this persona. "
                    f"Output strictly in JSON format matching this schema:\n"
                    f"{{\n"
                    f"  \"insights\": \"Your analysis text here.\",\n"
                    f"  \"recommendations\": [\n"
                    f"    {{\"category\": \"string\", \"action\": \"string\", \"impact_level\": \"high/medium/low\", \"xp_reward\": int, \"co2_offset_kg\": float}}\n"
                    f"  ]\n"
                    f"}}"
                )
                response = model.generate_content(prompt)
                res_text = response.text.strip()
                # Clean markdown backticks if any
                if res_text.startswith("```json"):
                    res_text = res_text[7:-3].strip()
                elif res_text.startswith("```"):
                    res_text = res_text[3:-3].strip()

                parsed = json.loads(res_text)
                recs = [RecommendationItem(**item) for item in parsed.get("recommendations", [])]
                if recs:
                    return RecommendResponse(
                        major_contributors=major_cats,
                        insights=parsed.get("insights", insights_text),
                        recommendations=recs
                    )
            except Exception as e:
                # Log error and fallback
                print(f"Gemini API Recommendation failed: {e}")

        # Fallback response
        return RecommendResponse(
            major_contributors=major_cats,
            insights=insights_text,
            recommendations=recommendations
        )


class GoalGeneratorAgent:
    """
    Agent 4: Goal Generator
    Inputs: Current emissions, level, preferences
    Outputs: Weekly eco challenges
    """
    def run(self, category: str, user_level: int) -> GoalResponse:
        challenges_by_cat = {
            "transportation": [
                {"title": "Transit Pioneer", "desc": "Take public transit for 3 commutes this week.", "target": 3, "xp": 100},
                {"title": "Active Commuter", "desc": "Walk or bike 5 miles total instead of driving.", "target": 5, "xp": 150},
                {"title": "Carpool Champion", "desc": "Log 2 carpool trips to save fuel emissions.", "target": 2, "xp": 80}
            ],
            "electricity": [
                {"title": "Unplug Master", "desc": "Unplug household phantom load devices every night for 5 days.", "target": 5, "xp": 90},
                {"title": "Eco Thermostat", "desc": "Keep your thermostat offset by 2 degrees for 4 days.", "target": 4, "xp": 120},
                {"title": "Cold Wash Only", "desc": "Run 3 laundry cycles on cold wash settings.", "target": 3, "xp": 100}
            ],
            "food": [
                {"title": "Green Plate", "desc": "Eat 6 consecutive plant-based meals.", "target": 6, "xp": 120},
                {"title": "Local Foodie", "desc": "Prepare 3 meals using only local farm ingredients.", "target": 3, "xp": 80},
                {"title": "Zero Meat Weekend", "desc": "Go fully vegetarian for 2 days over the weekend.", "target": 2, "xp": 150}
            ],
            "waste": [
                {"title": "Sort Warrior", "desc": "Successfully compost and recycle all household waste for 7 days.", "target": 7, "xp": 100},
                {"title": "Zero Plastic Bag", "desc": "Avoid single-use plastic bags for 4 shopping trips.", "target": 4, "xp": 80},
                {"title": "Refuse and Reuse", "desc": "Use reusable travel mugs and bottles 5 times.", "target": 5, "xp": 110}
            ]
        }

        # Select challenge list
        chal_list = challenges_by_cat.get(category.lower(), challenges_by_cat["transportation"])
        # Rotate challenge based on level index
        idx = (user_level - 1) % len(chal_list)
        selected = chal_list[idx]

        # Call Gemini if key is provided
        if GEMINI_KEY:
            try:
                model = genai.GenerativeModel("gemini-1.5-flash")
                prompt = (
                    f"You are the EcoTrack AI Goal Generator. "
                    f"Generate a weekly eco-challenge for category '{category}' and user experience Level {user_level}. "
                    f"Create a catchy title, brief actionable description, a numerical target value (e.g. 3 times), "
                    f"and an appropriate Eco-XP reward between 50 and 200. "
                    f"Output strictly in JSON format matching this schema:\n"
                    f"{{\n"
                    f"  \"challenge_id\": \"string\",\n"
                    f"  \"title\": \"string\",\n"
                    f"  \"description\": \"string\",\n"
                    f"  \"target_value\": int,\n"
                    f"  \"xp_bonus\": int\n"
                    f"}}"
                )
                response = model.generate_content(prompt)
                res_text = response.text.strip()
                if res_text.startswith("```json"):
                    res_text = res_text[7:-3].strip()
                elif res_text.startswith("```"):
                    res_text = res_text[3:-3].strip()

                parsed = json.loads(res_text)
                return GoalResponse(
                    challenge_id=parsed.get("challenge_id", f"weekly_{category}_{user_level}"),
                    title=parsed.get("title", selected["title"]),
                    description=parsed.get("description", selected["desc"]),
                    target_value=parsed.get("target_value", selected["target"]),
                    xp_bonus=parsed.get("xp_bonus", selected["xp"])
                )
            except Exception as e:
                print(f"Gemini API Goal Generation failed: {e}")

        # Fallback
        return GoalResponse(
            challenge_id=f"weekly_{category}_{user_level}",
            title=selected["title"],
            description=selected["desc"],
            target_value=selected["target"],
            xp_bonus=selected["xp"]
        )


class FutureImpactPredictorAgent:
    """
    Agent 5: Future Impact Predictor
    Inputs: Baseline footprint, target reduction percentage
    Outputs: Projections (expected vs savings) for 1 month, 6 months, 1 year
    """
    def run(self, current_annual: float, target_reduction: float) -> PredictResponse:
        reduction_multiplier = target_reduction / 100.0

        # Calculations (Projections in kg CO2e)
        # 1 Month = 1/12 of annual
        one_month_expected = round(current_annual / 12.0, 1)
        one_month_savings = round(one_month_expected * reduction_multiplier, 1)

        # 6 Month = 1/2 of annual
        six_month_expected = round(current_annual / 2.0, 1)
        six_month_savings = round(six_month_expected * reduction_multiplier, 1)

        # 1 Year = full annual
        one_year_expected = round(current_annual, 1)
        one_year_savings = round(one_year_expected * reduction_multiplier, 1)

        predictions = {
            "one_month": PredictionInterval(expected=one_month_expected, savings=one_month_savings),
            "six_month": PredictionInterval(expected=six_month_expected, savings=six_month_savings),
            "one_year": PredictionInterval(expected=one_year_expected, savings=one_year_savings)
        }

        return PredictResponse(predictions=predictions)
