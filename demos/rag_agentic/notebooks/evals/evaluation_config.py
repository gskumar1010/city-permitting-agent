
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
