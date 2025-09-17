
# City Permitting Agent - Architecture & Design Document

## System Overview

The City Permitting Agent is an AI-powered system that automates the initial review of permit applications
for food truck establishments. It uses Red Hat OpenShift AI, Llama Stack, Model Context Protocol (MCP),
and Retrieval Augmented Generation (RAG) to provide intelligent permit review capabilities.

## Architecture Components

### 1. Core Infrastructure
- **Red Hat OpenShift AI**: Container orchestration and ML model serving platform
- **Llama Stack**: Unified AI runtime for managing inference, RAG, and agent workflows
- **Model Context Protocol (MCP)**: Standardized protocol for AI-external system integration
- **Vector Database**: Milvus for storing permit requirement embeddings

### 2. Model Layer
- **Primary Model**: Llama-3.2-8b-instruct
- **Embedding Model**: For document vectorization and semantic search
- **Model Serving**: vLLM runtime on OpenShift AI

### 3. Data Layer
- **Knowledge Base**: Denver permit requirements and regulations
- **Vector Store**: Milvus database for RAG retrieval
- **Permit Applications**: Structured input data for validation

### 4. Agent Layer
- **Single Agent Design**: One unified agent using Llama Stack Responses API
- **Scorecard System**: Automated scoring mechanism for compliance assessment
- **Human-in-the-Loop**: Review and approval workflow

## Data Flow Architecture

1. **Input**: Permit application submitted by user
2. **Document Processing**: Extract and structure application data
3. **RAG Retrieval**: Query vector database for relevant permit requirements
4. **Agent Processing**: Llama agent analyzes application against requirements
5. **Scorecard Generation**: Generate compliance score and recommendations
6. **Output**: Structured report with gaps, errors, and next steps

## Scoring System Design

The agent will evaluate applications across multiple dimensions:
- **Completeness Score** (0-100): Percentage of required fields completed
- **Compliance Score** (0-100): Alignment with regulatory requirements
- **Risk Assessment** (Low/Medium/High): Potential regulatory issues
- **Priority Level** (1-5): Urgency for human review

## Technology Integration Points

### OpenShift AI Integration
- Model deployment and serving
- Resource scaling and management
- GPU acceleration for inference

### Llama Stack Integration
- Unified API for inference and RAG
- Vector database management
- Model context handling

### MCP Integration
- Standardized tool integration
- External system connectivity
- Permit database access

## Security & Compliance
- Token-based authentication
- Role-based access control
- Audit logging for all decisions
- Data privacy compliance
