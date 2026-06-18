from fastapi.testclient import TestClient
from backend.main import app
import pytest

client = TestClient(app)

def test_api_missing_token():
    # Endpoints are protected. A request without bearer token should fail.
    response = client.post("/api/calculate", json={})
    assert response.status_code == 403  # HTTPBearer returns 403 when Authorization header is absent


def test_api_invalid_token():
    response = client.post(
        "/api/calculate",
        headers={"Authorization": ""},
        json={}
    )
    assert response.status_code == 403


def test_calculate_endpoint():
    payload = {
        "miles_driven": 50.0,
        "fuel_type": "gasoline",
        "kwh_electricity": 100.0,
        "heating_source": "natural_gas",
        "meat_meals_per_week": 3,
        "waste_recycled_percentage": 20
    }
    response = client.post(
        "/api/calculate",
        headers={"Authorization": "Bearer mock-student-uid"},
        json=payload
    )
    assert response.status_code == 200
    data = response.json()
    assert "total_co2" in data
    assert "breakdown" in data
    assert data["breakdown"]["transportation"] == round(50 * 0.404, 1)


def test_calculate_input_validation():
    # Negative miles_driven should fail validation
    payload = {
        "miles_driven": -10.0,
        "fuel_type": "gasoline",
        "kwh_electricity": 100.0,
        "heating_source": "natural_gas",
        "meat_meals_per_week": 3,
        "waste_recycled_percentage": 20
    }
    response = client.post(
        "/api/calculate",
        headers={"Authorization": "Bearer mock-student-uid"},
        json=payload
    )
    assert response.status_code == 422 # Pydantic raising validation error


def test_predict_endpoint():
    payload = {
        "current_annual_baseline": 3000.0,
        "target_reduction_percentage": 10.0
    }
    response = client.post(
        "/api/predict",
        headers={"Authorization": "Bearer mock-student-uid"},
        json=payload
    )
    assert response.status_code == 200
    data = response.json()
    assert "predictions" in data
    assert data["predictions"]["one_month"]["expected"] == 250.0
    assert data["predictions"]["one_month"]["savings"] == 25.0


def test_chat_endpoint():
    payload = {"message": "How do I save electricity?"}
    response = client.post(
        "/api/chat",
        headers={"Authorization": "Bearer mock-student-uid"},
        json=payload
    )
    assert response.status_code == 200
    data = response.json()
    assert "response" in data
    assert "electricity" in data["response"].lower() or "power" in data["response"].lower() or "conservation" in data["response"].lower()


def test_scan_bill_mock_file():
    # Send a mock receipt file to test upload
    files = {"file": ("bill_350.pdf", b"mock file content", "application/pdf")}
    data = {"doc_type": "electricity"}
    response = client.post(
        "/api/scan-bill",
        headers={"Authorization": "Bearer mock-student-uid"},
        files=files,
        data=data
    )
    assert response.status_code == 200
    res_data = response.json()
    assert res_data["doc_type"] == "electricity"
    assert res_data["consumption_value"] == 350.0  # Filename parsing extracts 350
    assert res_data["unit"] == "kWh"
