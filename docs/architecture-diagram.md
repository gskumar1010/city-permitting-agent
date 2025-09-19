# City Permitting Agent - System Architecture Diagram

```mermaid
graph TB
    %% User Interface Layer
    subgraph "User Interface Layer"
        UI[Web Interface/API]
        APP[Permit Application Input]
    end

    %% Application Processing Layer
    subgraph "Application Processing Layer"
        PROC[Document Processor]
        VALID[Data Validator]
        STRUCT[Structure Extractor]
    end

    %% AI/ML Layer
    subgraph "Red Hat OpenShift AI Platform"
        subgraph "Llama Stack Runtime"
            AGENT[City Permitting Agent<br/>Llama-3.2-8b-instruct]
            RAG[RAG Engine]
            RESP[Responses API]
        end
        
        subgraph "Model Serving (vLLM)"
            LLM[LLM Inference Engine]
            EMB[Embedding Model]
        end
    end

    %% Data & Knowledge Layer
    subgraph "Data & Knowledge Layer"
        subgraph "Vector Database (Milvus)"
            VEC[Permit Requirements<br/>Embeddings]
            REG[Regulation Vectors]
        end
        
        subgraph "Knowledge Base"
            KB[Denver Permit<br/>Requirements]
            RULES[City Regulations]
            PROC_DOC[Process Documentation]
        end
    end

    %% Integration Layer
    subgraph "Model Context Protocol (MCP) Layer"
        MCP_SERVER[MCP Server]
        TOOLS[Integration Tools]
        EXT_SYS[External Systems]
    end

    %% Scoring & Assessment
    subgraph "Assessment Engine"
        SCORE[Scorecard System]
        COMP[Completeness Score<br/>0-100]
        COMPL[Compliance Score<br/>0-100]
        RISK[Risk Assessment<br/>Low/Med/High]
        PRIO[Priority Level<br/>1-5]
    end

    %% Human Review Layer
    subgraph "Human-in-the-Loop"
        REV[Review Dashboard]
        APPROVE[Approval Workflow]
        AUDIT[Audit Logging]
    end

    %% Output Layer
    subgraph "Output Layer"
        REPORT[Structured Report]
        GAPS[Gap Analysis]
        ERRORS[Error Identification]
        NEXT[Next Steps]
    end

    %% Data Flow Connections
    APP --> PROC
    PROC --> VALID
    VALID --> STRUCT
    STRUCT --> AGENT

    %% Knowledge retrieval
    AGENT --> RAG
    RAG --> VEC
    VEC -.-> KB
    KB --> EMB
    EMB --> VEC

    %% Model interactions
    AGENT --> LLM
    AGENT --> RESP
    RAG --> EMB

    %% MCP integrations
    AGENT --> MCP_SERVER
    MCP_SERVER --> TOOLS
    TOOLS --> EXT_SYS

    %% Assessment flow
    AGENT --> SCORE
    SCORE --> COMP
    SCORE --> COMPL
    SCORE --> RISK
    SCORE --> PRIO

    %% Human review
    SCORE --> REV
    REV --> APPROVE
    APPROVE --> AUDIT

    %% Output generation
    SCORE --> REPORT
    REPORT --> GAPS
    REPORT --> ERRORS
    REPORT --> NEXT

    %% Final output to UI
    REPORT --> UI
    REV --> UI

    %% Styling
    classDef userLayer fill:#e1f5fe
    classDef processLayer fill:#f3e5f5
    classDef aiLayer fill:#e8f5e8
    classDef dataLayer fill:#fff3e0
    classDef mcpLayer fill:#fce4ec
    classDef assessLayer fill:#f1f8e9
    classDef humanLayer fill:#e0f2f1
    classDef outputLayer fill:#f9fbe7

    class UI,APP userLayer
    class PROC,VALID,STRUCT processLayer
    class AGENT,RAG,RESP,LLM,EMB aiLayer
    class VEC,REG,KB,RULES,PROC_DOC dataLayer
    class MCP_SERVER,TOOLS,EXT_SYS mcpLayer
    class SCORE,COMP,COMPL,RISK,PRIO assessLayer
    class REV,APPROVE,AUDIT humanLayer
    class REPORT,GAPS,ERRORS,NEXT outputLayer
```

## System Flow Description

### 1. Input Processing (Steps 1-3)
```
Permit Application → Document Processing → Data Validation → Structure Extraction
```

### 2. AI Analysis (Steps 4-5)
```
Structured Data → Llama Agent → RAG Retrieval → Knowledge Base Query → Assessment
```

### 3. Scoring & Output (Step 6)
```
Agent Analysis → Scorecard Generation → Structured Report → Human Review Interface
```

## Key Integration Points

### OpenShift AI Platform
- **Model Deployment**: vLLM serves Llama-3.2-8b-instruct model
- **Resource Management**: GPU acceleration and auto-scaling
- **Container Orchestration**: Kubernetes-native deployment

### Llama Stack Components
- **Responses API**: Unified interface for agent interactions
- **RAG Engine**: Integrated retrieval-augmented generation
- **Vector Management**: Seamless Milvus integration

### Model Context Protocol (MCP)
- **Tool Integration**: Standardized external system access
- **API Connectivity**: Database and permit system integration
- **Context Management**: Maintains conversation and application state

## Data Architecture

### Vector Database Schema (Milvus)
```
Collection: permit_requirements
├── vector_field: requirement_embedding (768 dims)
├── id_field: requirement_id
├── metadata_fields:
    ├── category (zoning, safety, health, etc.)
    ├── jurisdiction (city, county, state)
    ├── priority_level (1-5)
    └── last_updated (timestamp)
```

### Knowledge Base Structure
```
Denver Permit Requirements/
├── zoning_requirements/
├── health_safety_codes/
├── fire_department_rules/
├── business_license_reqs/
└── food_service_regulations/
```

## Security & Compliance Architecture

### Authentication Flow
```
User → OAuth2/OIDC → OpenShift AI → RBAC → Agent Access
```

### Audit Trail
```
All Decisions → Audit Service → Compliance Database → Reporting Dashboard
```

## Deployment Architecture

### OpenShift Resources
```yaml
# Core Components
- Deployment: llama-stack-server
- Deployment: milvus-vector-db  
- Deployment: mcp-server
- Service: agent-api-service
- Route: public-access-route
```

### Resource Requirements
- **GPU Nodes**: 2x A100 (40GB VRAM each)
- **CPU/Memory**: 32 cores, 128GB RAM
- **Storage**: 1TB SSD for vector database

## Monitoring & Observability

### Key Metrics
- **Response Time**: Agent processing latency
- **Accuracy**: Scoring system precision
- **Throughput**: Applications processed per hour
- **Resource Utilization**: GPU/CPU usage patterns

### Alerting
- Model inference failures
- Vector database connectivity issues
- Score accuracy degradation
- System resource exhaustion