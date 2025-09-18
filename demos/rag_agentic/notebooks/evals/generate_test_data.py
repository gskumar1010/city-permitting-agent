
# Test Data Generation for City Permitting Agent Evaluation

import json
import random
from typing import Dict, List

def generate_test_applications() -> List[Dict]:
    """Generate synthetic test applications for evaluation"""

    # Field options and probabilities
    field_options = {
        "business_license": ["present", "missing", "expired", "pending"],
        "food_safety_inspection": ["passed", "failed", "pending", "expired"],
        "affidavit_of_commissary": ["attached", "missing", "incomplete"],
        "zoning_permit": ["approved", "denied", "pending", "missing"],
        "fire_department_inspection": ["passed", "failed", "pending", "not_required"],
        "insurance_certificate": ["valid", "expired", "missing", "insufficient_coverage"],
        "waste_disposal_plan": ["approved", "missing", "incomplete"],
        "water_connection_permit": ["approved", "missing", "pending"]
    }

    # Generate test cases with known expected outcomes
    test_applications = []

    # Perfect applications (should be low risk)
    for i in range(20):
        app = {
            "id": f"perfect_{i:03d}",
            "business_license": "present",
            "food_safety_inspection": "passed", 
            "affidavit_of_commissary": "attached",
            "zoning_permit": "approved",
            "fire_department_inspection": "passed",
            "insurance_certificate": "valid",
            "waste_disposal_plan": "approved",
            "water_connection_permit": "approved",
            "expected_completeness": 100,
            "expected_compliance": 95,
            "expected_risk": "Low"
        }
        test_applications.append(app)

    # Incomplete applications (should be medium to high risk)
    for i in range(30):
        app = {
            "id": f"incomplete_{i:03d}",
            "expected_completeness": 0,
            "expected_compliance": 0,
            "expected_risk": "High"
        }

        # Randomly include/exclude required fields
        required_fields = ["business_license", "food_safety_inspection", "affidavit_of_commissary", "zoning_permit"]
        included_count = 0

        for field in field_options:
            if field in required_fields:
                if random.random() > 0.3:  # 70% chance to include required fields
                    app[field] = random.choice([opt for opt in field_options[field] if opt not in ["missing"]])
                    included_count += 1
                else:
                    app[field] = "missing"
            else:
                if random.random() > 0.5:  # 50% chance for optional fields
                    app[field] = random.choice(field_options[field])
                else:
                    app[field] = "missing"

        # Calculate expected scores based on included fields
        app["expected_completeness"] = int((included_count / len(required_fields)) * 100)

        if app["expected_completeness"] >= 80:
            app["expected_compliance"] = random.randint(70, 90)
            app["expected_risk"] = "Medium"
        else:
            app["expected_compliance"] = random.randint(30, 70)
            app["expected_risk"] = "High"

        test_applications.append(app)

    # Edge cases
    edge_cases = [
        {
            "id": "edge_001_empty",
            "expected_completeness": 0,
            "expected_compliance": 0,
            "expected_risk": "High"
        },
        {
            "id": "edge_002_expired_docs",
            "business_license": "expired",
            "food_safety_inspection": "expired",
            "affidavit_of_commissary": "attached",
            "zoning_permit": "approved",
            "fire_department_inspection": "passed",
            "expected_completeness": 60,
            "expected_compliance": 40,
            "expected_risk": "High"
        },
        {
            "id": "edge_003_mixed_status",
            "business_license": "present",
            "food_safety_inspection": "pending",
            "affidavit_of_commissary": "incomplete",
            "zoning_permit": "denied",
            "fire_department_inspection": "failed",
            "expected_completeness": 40,
            "expected_compliance": 30,
            "expected_risk": "High"
        }
    ]

    test_applications.extend(edge_cases)

    return test_applications

def generate_rag_test_queries() -> List[Dict]:
    """Generate test queries for RAG system evaluation"""

    return [
        {
            "query": "What documents are required for food truck permit?",
            "expected_docs": ["food_truck_requirements.pdf", "permit_checklist.pdf"],
            "category": "requirements",
            "expected_answer_keywords": ["business license", "food safety", "zoning", "fire inspection"]
        },
        {
            "query": "Denver food truck zoning restrictions",
            "expected_docs": ["zoning_regulations.pdf", "mobile_food_permits.pdf"],
            "category": "zoning",
            "expected_answer_keywords": ["residential zones", "commercial districts", "distance requirements"]
        },
        {
            "query": "Fire safety requirements for mobile food units",
            "expected_docs": ["fire_safety_code.pdf", "mobile_unit_standards.pdf"],
            "category": "safety",
            "expected_answer_keywords": ["fire extinguisher", "propane safety", "ventilation", "inspection"]
        },
        {
            "query": "Health department inspection checklist",
            "expected_docs": ["health_inspection_guide.pdf", "food_safety_standards.pdf"],
            "category": "health",
            "expected_answer_keywords": ["temperature control", "sanitization", "food handling", "storage"]
        },
        {
            "query": "Insurance requirements for food truck business",
            "expected_docs": ["insurance_requirements.pdf", "liability_coverage.pdf"],
            "category": "insurance",
            "expected_answer_keywords": ["general liability", "commercial auto", "workers compensation"]
        }
    ]

def generate_performance_test_data() -> Dict:
    """Generate data for performance testing"""

    # Small, medium, and large applications for load testing
    test_data = {
        "small_applications": [],
        "medium_applications": [],
        "large_applications": []
    }

    # Small applications (minimal fields)
    for i in range(100):
        app = {
            "id": f"small_{i:03d}",
            "business_license": random.choice(["present", "missing"]),
            "food_safety_inspection": random.choice(["passed", "failed", "pending"])
        }
        test_data["small_applications"].append(app)

    # Medium applications (moderate fields)
    for i in range(50):
        app = {
            "id": f"medium_{i:03d}",
            "business_license": "present",
            "food_safety_inspection": "passed",
            "affidavit_of_commissary": "attached",
            "zoning_permit": random.choice(["approved", "pending"]),
            "fire_department_inspection": "passed",
            "insurance_certificate": "valid"
        }
        test_data["medium_applications"].append(app)

    # Large applications (all possible fields)
    for i in range(20):
        app = {
            "id": f"large_{i:03d}",
            "business_license": "present",
            "food_safety_inspection": "passed",
            "affidavit_of_commissary": "attached", 
            "zoning_permit": "approved",
            "fire_department_inspection": "passed",
            "insurance_certificate": "valid",
            "waste_disposal_plan": "approved",
            "water_connection_permit": "approved",
            "signage_permit": "approved",
            "noise_permit": "approved",
            "sidewalk_permit": "approved",
            "additional_documents": ["menu", "floor_plan", "equipment_specs"]
        }
        test_data["large_applications"].append(app)

    return test_data

# Generate all test data
if __name__ == "__main__":
    # Generate test applications
    test_apps = generate_test_applications()
    with open('test_applications.json', 'w') as f:
        json.dump(test_apps, f, indent=2)

    # Generate RAG test queries
    rag_queries = generate_rag_test_queries()
    with open('rag_test_queries.json', 'w') as f:
        json.dump(rag_queries, f, indent=2)

    # Generate performance test data
    perf_data = generate_performance_test_data()
    with open('performance_test_data.json', 'w') as f:
        json.dump(perf_data, f, indent=2)

    print(f"Generated {len(test_apps)} test applications")
    print(f"Generated {len(rag_queries)} RAG test queries")
    print(f"Generated performance test data with {sum(len(v) for v in perf_data.values())} applications")
