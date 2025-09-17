# Step 3: Generate major code blocks for the City Permitting Agent notebook
nb_code = []

# 1. Imports and Environment
nb_code.append('''\
# Environment Setup
!pip install llama-stack-sdk pymilvus requests openai
import os
import requests
from llama_stack_sdk import LlamaStack, ResponsesAPI
from pymilvus import Collection, CollectionSchema, FieldSchema, DataType, connections
import json
''')

# 2. Load Permit Requirements
nb_code.append('''\
# Load Denver City Permitting Requirements (example HTML scrape)
requirements_url = "https://denvergov.org/Government/Agencies-Departments-Offices/Agencies-Departments-Offices-Directory/Public-Health-Environment/Public-Health-Investigations/Food-Safety/Restaurant-Food-Establishment-Compliance?lang_update=638764492352867006"
response = requests.get(requirements_url)
city_requirements = response.text  # In practice, use BeautifulSoup to parse
''')

# 3. Embedding and Vector Storage
nb_code.append('''\
# Connect to Milvus and create permit requirements collection
connections.connect(host='localhost', port='19530')  # Example config
fields = [
    FieldSchema(name="requirement_id", dtype=DataType.INT64, is_primary=True),
    FieldSchema(name="requirement_text", dtype=DataType.STRING, max_length=2048),
    FieldSchema(name="embedding", dtype=DataType.FLOAT_VECTOR, dim=1536)
]
schema = CollectionSchema(fields, description="Denver Food Truck Permit Requirements")
collection = Collection("city_permit_requirements", schema)
# Would generate embeddings for each requirement and insert
''')

# 4. Scorecard Logic
nb_code.append('''\
# Define scoring functions
REQUIRED_FIELDS = ["Business License", "Food Safety Inspection", "Affidavit of Commissary", "Zoning Permit", "Fire Department Inspection"]

def completeness_score(application):
    completed = sum(1 for field in REQUIRED_FIELDS if application.get(field))
    return round(100 * completed / len(REQUIRED_FIELDS))

def compliance_score(application, city_requirements):
    # Placeholder: match fields/items in application to requirements
    compliant = sum(1 for rule in city_requirements.split("\n") if any(rule.lower() in v.lower() for v in application.values()))
    return round(100 * compliant / len(city_requirements.split("\n")))

def risk_level(application, city_requirements):
    # Placeholder: Determine if high-risk violations or missing critical fields
    risk = "Low"
    if completeness_score(application) < 80:
        risk = "High"
    elif compliance_score(application, city_requirements) < 80:
        risk = "Medium"
    return risk
''')

# 5. Llama 3.2-8b-Instruct Model Configuration
nb_code.append('''\
# Set up LlamaStack and ResponsesAPI
llama = LlamaStack(api_endpoint="http://llamastack-url:8321", model="llama-3.2-8b-instruct")
responses_api = ResponsesAPI(llama)
''')

# 6. RAG Pipeline
nb_code.append('''\
# Retriever logic
prompt = "Review the following food truck permit application for completeness and compliance."
retrieved_context = "..." # Actually, would query Milvus for best matching requirements
augmented_prompt = prompt + "\nContext:\n" + retrieved_context
llama_response = responses_api.complete(prompt=augmented_prompt)
''')

# 7. Pre-Screening Agent
nb_code.append('''\
# Example application input
application = {
    "Business License": "present",
    "Food Safety Inspection": "passed",
    "Affidavit of Commissary": "attached",
    "Zoning Permit": "missing",
    "Fire Department Inspection": "passed"
}
comp_score = completeness_score(application)
comply_score = compliance_score(application, city_requirements)
risk = risk_level(application, city_requirements)
print(f"Completeness: {comp_score}%, Compliance: {comply_score}%, Risk: {risk}")
''')

# 8. Human-in-the-Loop
nb_code.append('''\
# Log results for human review
review_log = []
review_log.append({
    "application": application,
    "scores": {
        "completeness": comp_score,
        "compliance": comply_score,
        "risk": risk
    },
    "llama_summary": llama_response
})
print(json.dumps(review_log, indent=2))
''')

# 9. Audit Trail
nb_code.append('''\
# Record audit trail
import datetime
audit_entry = {
    "time": datetime.datetime.now().isoformat(),
    "application": application,
    "decision": "forward for review" if risk != "Low" else "auto-approved"
}
audit_trail = []
audit_trail.append(audit_entry)
''')

# 10. Output Report
nb_code.append('''\
# Generate report
report = {
    "errors": [f for f in REQUIRED_FIELDS if not application.get(f)],
    "risks": risk,
    "compliance_gaps": [r for r in city_requirements.split("\n") if r and not any(r.lower() in v.lower() for v in application.values())]
}
print(json.dumps(report, indent=2))
''')

# Combine all notebook sections
notebook_code = "".join(nb_code)
with open('city_permitting_agent_notebook.py', 'w') as f:
    f.write(notebook_code)
print("Jupyter notebook code exported as .py file.")