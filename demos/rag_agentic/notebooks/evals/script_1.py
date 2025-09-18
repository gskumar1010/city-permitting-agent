# Generate Python test implementation code for the evaluation framework
test_code = '''
# City Permitting Agent - Evaluation Test Suite
import pytest
import json
import time
import numpy as np
from typing import Dict, List, Tuple
from sklearn.metrics import precision_score, recall_score, f1_score, mean_absolute_error
from sentence_transformers import SentenceTransformer
import requests

class PermitAgentEvaluator:
    """Comprehensive evaluation suite for City Permitting Agent"""
    
    def __init__(self, agent_endpoint: str, knowledge_base_path: str):
        self.agent_endpoint = agent_endpoint
        self.knowledge_base_path = knowledge_base_path
        self.sentence_model = SentenceTransformer('all-MiniLM-L6-v2')
        
    def load_test_data(self, test_file: str) -> List[Dict]:
        """Load test cases from JSON file"""
        with open(test_file, 'r') as f:
            return json.load(f)
    
    def call_agent(self, application: Dict) -> Dict:
        """Call the permitting agent with an application"""
        response = requests.post(
            f"{self.agent_endpoint}/evaluate_permit",
            json={"application": application}
        )
        return response.json()

# Test Class 1: Functional Accuracy Tests
class TestFunctionalAccuracy:
    """Test core functionality and accuracy of permit evaluation"""
    
    @pytest.fixture
    def evaluator(self):
        return PermitAgentEvaluator(
            agent_endpoint="http://localhost:8000",
            knowledge_base_path="./permit_requirements.json"
        )
    
    @pytest.fixture
    def test_applications(self):
        return [
            {
                "id": "test_001",
                "business_license": "present",
                "food_safety_inspection": "passed",
                "affidavit_of_commissary": "attached",
                "zoning_permit": "missing",
                "fire_department_inspection": "passed",
                "expected_completeness": 80,
                "expected_compliance": 75,
                "expected_risk": "Medium"
            },
            {
                "id": "test_002", 
                "business_license": "present",
                "food_safety_inspection": "passed",
                "affidavit_of_commissary": "attached",
                "zoning_permit": "approved",
                "fire_department_inspection": "passed",
                "expected_completeness": 100,
                "expected_compliance": 95,
                "expected_risk": "Low"
            }
        ]
    
    def test_completeness_accuracy(self, evaluator, test_applications):
        """Test accuracy of completeness scoring"""
        errors = []
        
        for app in test_applications:
            result = evaluator.call_agent(app)
            predicted_completeness = result["scores"]["completeness"]
            expected_completeness = app["expected_completeness"]
            
            error = abs(predicted_completeness - expected_completeness)
            errors.append(error)
            
            # Assert within 10% tolerance
            assert error <= 10, f"Completeness error too high for {app['id']}: {error}%"
        
        mean_error = np.mean(errors)
        assert mean_error <= 5, f"Mean completeness error too high: {mean_error}%"
    
    def test_compliance_accuracy(self, evaluator, test_applications):
        """Test accuracy of compliance scoring"""
        predicted_scores = []
        expected_scores = []
        
        for app in test_applications:
            result = evaluator.call_agent(app)
            predicted_scores.append(result["scores"]["compliance"])
            expected_scores.append(app["expected_compliance"])
        
        mae = mean_absolute_error(expected_scores, predicted_scores)
        assert mae <= 5, f"Compliance scoring MAE too high: {mae}"
    
    def test_risk_classification(self, evaluator, test_applications):
        """Test risk level classification accuracy"""
        predictions = []
        ground_truth = []
        
        for app in test_applications:
            result = evaluator.call_agent(app)
            predictions.append(result["scores"]["risk"])
            ground_truth.append(app["expected_risk"])
        
        # Convert to numeric for sklearn metrics
        risk_mapping = {"Low": 0, "Medium": 1, "High": 2}
        pred_numeric = [risk_mapping[p] for p in predictions]
        true_numeric = [risk_mapping[t] for t in ground_truth]
        
        accuracy = np.mean(np.array(pred_numeric) == np.array(true_numeric))
        assert accuracy >= 0.8, f"Risk classification accuracy too low: {accuracy}"

# Test Class 2: Performance & Efficiency Tests  
class TestPerformanceEfficiency:
    """Test system performance and resource efficiency"""
    
    @pytest.fixture
    def evaluator(self):
        return PermitAgentEvaluator(
            agent_endpoint="http://localhost:8000",
            knowledge_base_path="./permit_requirements.json"
        )
    
    def test_response_latency(self, evaluator):
        """Test response time performance"""
        test_app = {
            "business_license": "present",
            "food_safety_inspection": "passed",
            "affidavit_of_commissary": "attached",
            "zoning_permit": "approved",
            "fire_department_inspection": "passed"
        }
        
        latencies = []
        for _ in range(10):
            start_time = time.time()
            evaluator.call_agent(test_app)
            latencies.append(time.time() - start_time)
        
        p95_latency = np.percentile(latencies, 95)
        mean_latency = np.mean(latencies)
        
        assert p95_latency <= 10, f"P95 latency too high: {p95_latency}s"
        assert mean_latency <= 5, f"Mean latency too high: {mean_latency}s"
    
    def test_throughput(self, evaluator):
        """Test system throughput under load"""
        test_app = {
            "business_license": "present",
            "food_safety_inspection": "passed",
            "affidavit_of_commissary": "attached",
            "zoning_permit": "approved", 
            "fire_department_inspection": "passed"
        }
        
        start_time = time.time()
        num_requests = 50
        
        for _ in range(num_requests):
            evaluator.call_agent(test_app)
        
        total_time = time.time() - start_time
        throughput = num_requests / total_time * 3600  # requests per hour
        
        assert throughput >= 100, f"Throughput too low: {throughput} req/hour"

# Test Class 3: RAG System Evaluation
class TestRAGPerformance:
    """Test retrieval and generation quality"""
    
    @pytest.fixture
    def evaluator(self):
        return PermitAgentEvaluator(
            agent_endpoint="http://localhost:8000",
            knowledge_base_path="./permit_requirements.json"
        )
    
    def test_retrieval_relevance(self, evaluator):
        """Test relevance of retrieved permit requirements"""
        test_queries = [
            {
                "query": "food truck zoning requirements",
                "expected_docs": ["zoning_regulations.pdf", "mobile_food_permits.pdf"],
                "min_relevance_score": 0.8
            },
            {
                "query": "fire safety inspection checklist", 
                "expected_docs": ["fire_safety_code.pdf", "inspection_requirements.pdf"],
                "min_relevance_score": 0.8
            }
        ]
        
        for test_case in test_queries:
            # This would call the RAG retrieval component directly
            retrieved_docs = evaluator.retrieve_documents(test_case["query"])
            
            # Calculate relevance score using semantic similarity
            relevance_scores = []
            for doc in retrieved_docs[:5]:  # Top 5 results
                if doc["filename"] in test_case["expected_docs"]:
                    relevance_scores.append(1.0)
                else:
                    # Use semantic similarity as fallback
                    similarity = evaluator.calculate_semantic_similarity(
                        test_case["query"], doc["content"]
                    )
                    relevance_scores.append(similarity)
            
            precision_at_5 = np.mean(relevance_scores)
            assert precision_at_5 >= test_case["min_relevance_score"], \
                f"Retrieval precision too low: {precision_at_5}"
    
    def test_generation_quality(self, evaluator):
        """Test quality of generated explanations"""
        test_cases = [
            {
                "application": {
                    "business_license": "missing",
                    "food_safety_inspection": "pending"
                },
                "expected_explanation": "Business license is required for all food service establishments. Food safety inspection must be completed before permit approval."
            }
        ]
        
        for test_case in test_cases:
            result = evaluator.call_agent(test_case["application"])
            generated_explanation = result["explanation"]
            expected_explanation = test_case["expected_explanation"]
            
            # Calculate semantic similarity
            similarity = evaluator.sentence_model.encode([generated_explanation, expected_explanation])
            cosine_sim = np.dot(similarity[0], similarity[1]) / (
                np.linalg.norm(similarity[0]) * np.linalg.norm(similarity[1])
            )
            
            assert cosine_sim >= 0.7, f"Generated explanation similarity too low: {cosine_sim}"
    
    def test_hallucination_detection(self, evaluator):
        """Test for AI hallucinations in responses"""
        test_app = {
            "business_license": "present",
            "food_safety_inspection": "passed"
        }
        
        result = evaluator.call_agent(test_app)
        explanation = result["explanation"]
        
        # Check if explanation contains facts not in knowledge base
        knowledge_base = evaluator.load_knowledge_base()
        hallucination_score = evaluator.detect_hallucinations(explanation, knowledge_base)
        
        assert hallucination_score <= 0.05, f"Hallucination rate too high: {hallucination_score}"

# Test Class 4: Robustness & Edge Cases
class TestRobustness:
    """Test system robustness and edge case handling"""
    
    @pytest.fixture
    def evaluator(self):
        return PermitAgentEvaluator(
            agent_endpoint="http://localhost:8000",
            knowledge_base_path="./permit_requirements.json"
        )
    
    def test_malformed_input_handling(self, evaluator):
        """Test handling of malformed applications"""
        malformed_inputs = [
            {},  # Empty application
            {"invalid_field": "test"},  # Unknown fields
            {"business_license": None},  # Null values
            {"business_license": ""},  # Empty strings
        ]
        
        for malformed_input in malformed_inputs:
            try:
                result = evaluator.call_agent(malformed_input)
                # Should handle gracefully, not crash
                assert "error" in result or "scores" in result
            except Exception as e:
                pytest.fail(f"Agent crashed on malformed input: {e}")
    
    def test_consistency(self, evaluator):
        """Test consistency of results across multiple runs"""
        test_app = {
            "business_license": "present",
            "food_safety_inspection": "passed",
            "affidavit_of_commissary": "attached",
            "zoning_permit": "missing",
            "fire_department_inspection": "passed"
        }
        
        results = []
        for _ in range(5):
            result = evaluator.call_agent(test_app)
            results.append(result["scores"])
        
        # Check consistency of scores (within 5% variance)
        completeness_scores = [r["completeness"] for r in results]
        compliance_scores = [r["compliance"] for r in results]
        
        completeness_std = np.std(completeness_scores)
        compliance_std = np.std(compliance_scores)
        
        assert completeness_std <= 5, f"Completeness scores too inconsistent: {completeness_std}"
        assert compliance_std <= 5, f"Compliance scores too inconsistent: {compliance_std}"

# Integration Test
class TestIntegration:
    """End-to-end integration tests"""
    
    def test_end_to_end_workflow(self):
        """Test complete permit evaluation workflow"""
        evaluator = PermitAgentEvaluator(
            agent_endpoint="http://localhost:8000",
            knowledge_base_path="./permit_requirements.json"
        )
        
        # Sample complete workflow
        application = {
            "business_name": "Best Food Truck",
            "business_license": "BL-2024-001",
            "food_safety_inspection": "passed",
            "affidavit_of_commissary": "attached",
            "zoning_permit": "approved",
            "fire_department_inspection": "passed",
            "insurance_certificate": "valid"
        }
        
        # Call agent
        result = evaluator.call_agent(application)
        
        # Verify all required fields in response
        required_fields = ["scores", "explanation", "recommendations", "risk_assessment"]
        for field in required_fields:
            assert field in result, f"Missing required field: {field}"
        
        # Verify score ranges
        assert 0 <= result["scores"]["completeness"] <= 100
        assert 0 <= result["scores"]["compliance"] <= 100
        assert result["scores"]["risk"] in ["Low", "Medium", "High"]
        
        # Verify explanation quality (non-empty, reasonable length)
        assert len(result["explanation"]) > 50, "Explanation too short"
        assert len(result["explanation"]) < 1000, "Explanation too long"

if __name__ == "__main__":
    # Run tests
    pytest.main([__file__, "-v", "--tb=short"])
'''

with open('city_permitting_agent_tests.py', 'w') as f:
    f.write(test_code)

print("Comprehensive test suite created!")