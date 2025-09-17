
# City Permitting Agent - Jupyter Notebook

## 1. Environment Setup
- Install required packages (llama-stack-sdk, openai, milvus, requests)
- Connect to OpenShift AI environment

## 2. Load Repository of Denver Food Truck Permit Requirements
- Ingest requirements from City repository (PDF/HTML parsing)
- Vectorize requirements using embedding model
- Store vectors in Milvus

## 3. Define Scorecard Logic
- List required fields, regulatory checkpoints, and compliance rules
- Create completeness, compliance, and risk assessment functions

## 4. Set up Llama 3.2-8b-instruct Model
- Deploy on vLLM via OpenShift
- Test responses API for text generation

## 5. Implement RAG Pipeline
- Query Milvus for relevant permit requirements
- Augment prompt for Llama model with retrieved context

## 6. Application Pre-Screening Agent
- Extract user application data
- Score completeness and compliance against repository
- Rank submission for human review

## 7. Human-In-The-Loop Workflow
- Log automated recommendations
- Allow manual approval/rejection

## 8. End-to-End Example
- Demo with sample food truck application input

## 9. Logging & Audit Trail
- Record all decisions and recommendations

## 10. Recommendations & Output
- Generate report: errors, risks, and compliance gaps
