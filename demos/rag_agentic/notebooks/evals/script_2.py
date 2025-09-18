# Generate test data and configuration files for the evaluation
test_data_config = '''
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
'''

with open('generate_test_data.py', 'w') as f:
    f.write(test_data_config)

print("Test data generation script created!")

# Create evaluation configuration
eval_config = '''
# Evaluation Configuration for City Permitting Agent

# Test Configuration
TEST_CONFIG = {
    "agent_endpoint": "http://localhost:8000",
    "knowledge_base_path": "./permit_requirements.json",
    "test_data_path": "./test_applications.json",
    "rag_queries_path": "./rag_test_queries.json",
    "performance_data_path": "./performance_test_data.json",
    
    # Performance thresholds
    "performance_thresholds": {
        "max_response_time_p95": 10.0,  # seconds
        "max_response_time_mean": 5.0,  # seconds
        "min_throughput": 100,  # requests per hour
        "max_memory_usage": 2048,  # MB
        "max_cost_per_request": 0.50,  # USD
    },
    
    # Accuracy thresholds
    "accuracy_thresholds": {
        "min_completeness_accuracy": 0.95,
        "max_compliance_mae": 5.0,
        "min_risk_classification_accuracy": 0.80,
        "min_retrieval_precision_at_5": 0.80,
        "min_generation_similarity": 0.70,
        "max_hallucination_rate": 0.05,
    },
    
    # Test data configuration
    "test_data_config": {
        "num_perfect_apps": 20,
        "num_incomplete_apps": 30,
        "num_edge_cases": 10,
        "num_performance_tests": 100,
    }
}

# Evaluation report template
REPORT_TEMPLATE = {
    "test_run_id": "",
    "timestamp": "",
    "overall_status": "",
    "summary": {
        "total_tests": 0,
        "passed_tests": 0,
        "failed_tests": 0,
        "pass_rate": 0.0
    },
    "performance_metrics": {
        "mean_response_time": 0.0,
        "p95_response_time": 0.0,
        "throughput": 0.0,
        "resource_usage": {}
    },
    "accuracy_metrics": {
        "completeness_accuracy": 0.0,
        "compliance_mae": 0.0,
        "risk_classification_accuracy": 0.0,
        "retrieval_precision": 0.0,
        "generation_quality": 0.0,
        "hallucination_rate": 0.0
    },
    "detailed_results": [],
    "recommendations": []
}
'''

with open('evaluation_config.py', 'w') as f:
    f.write(eval_config)

print("Evaluation configuration created!")

# Generate sample requirements JSON
requirements_json = '''
{
  "permit_requirements": [
    {
      "id": "REQ_001",
      "category": "business_licensing",
      "title": "Business License",
      "description": "Valid business license issued by Denver Department of Licensing",
      "required": true,
      "documents": ["Business License Certificate"],
      "validation_criteria": ["License must be current", "License type must match business activity"]
    },
    {
      "id": "REQ_002", 
      "category": "health_safety",
      "title": "Food Safety Inspection",
      "description": "Current food safety inspection certificate from Denver Health Department",
      "required": true,
      "documents": ["Food Safety Inspection Certificate"],
      "validation_criteria": ["Inspection must be within last 12 months", "No critical violations"]
    },
    {
      "id": "REQ_003",
      "category": "operations",
      "title": "Affidavit of Commissary",
      "description": "Signed affidavit confirming commissary kitchen arrangement",
      "required": true,
      "documents": ["Commissary Affidavit", "Commissary License"],
      "validation_criteria": ["Commissary must be licensed", "Agreement must be current"]
    },
    {
      "id": "REQ_004",
      "category": "zoning",
      "title": "Zoning Permit",
      "description": "Authorization to operate in designated zones",
      "required": true,
      "documents": ["Zoning Permit", "Location Authorization"],
      "validation_criteria": ["Must specify approved operating zones", "No residential zone restrictions"]
    },
    {
      "id": "REQ_005",
      "category": "safety",
      "title": "Fire Department Inspection",
      "description": "Fire safety inspection and approval for mobile food unit",
      "required": true,
      "documents": ["Fire Inspection Certificate"],
      "validation_criteria": ["All safety equipment approved", "Propane systems certified"]
    }
  ],
  "compliance_rules": [
    {
      "rule_id": "RULE_001",
      "description": "All required documents must be present and current",
      "impact": "High",
      "validation": "Document presence and expiration date check"
    },
    {
      "rule_id": "RULE_002", 
      "description": "Commissary kitchen must be within 25 miles of operating area",
      "impact": "Medium",
      "validation": "Distance calculation from commissary address"
    },
    {
      "rule_id": "RULE_003",
      "description": "Food truck must have valid commercial auto insurance",
      "impact": "High", 
      "validation": "Insurance certificate verification"
    }
  ]
}
'''

with open('permit_requirements.json', 'w') as f:
    f.write(requirements_json)

print("Sample permit requirements JSON created!")
print("\nAll evaluation files generated successfully!")