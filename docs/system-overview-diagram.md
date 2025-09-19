# System Overview Diagram

```mermaid
graph LR
    %% Development Phase
    subgraph "🖥️ Local Development"
        DEV[Developer<br/>MacBook/Workstation]
        subgraph "Local Stack"
            OLLAMA_LOCAL[Ollama<br/>Llama 3.2 3B]
            LS_LOCAL[Llama Stack<br/>:8321]
            MCP_LOCAL[MCP Tools<br/>:8000]
            UI_LOCAL[Streamlit UI<br/>:8501]
        end
        
        subgraph "Demo Apps"
            A2A_DEV[A2A Demo<br/>Agent Communication]
            RAG_DEV[RAG Demo<br/>Vector Search]
            EVAL_DEV[Evaluation<br/>Testing Suite]
        end
    end

    %% Repository
    subgraph "📦 Repository"
        GIT[Git Repository<br/>city-permitting-agent]
        subgraph "Code Structure"
            DEMOS[demos/<br/>A2A, RAG, Eval]
            K8S[kubernetes/<br/>Manifests]
            TESTS[tests/<br/>Scripts & Eval]
            DIST[distribution/<br/>Containers]
        end
    end

    %% CI/CD Pipeline
    subgraph "🚀 CI/CD"
        BUILD[Container Builds<br/>Podman/Docker]
        REGISTRY[Container Registry<br/>Images]
        DEPLOY[GitOps Deployment<br/>ArgoCD/Flux]
    end

    %% Production Environment
    subgraph "☁️ OpenShift Production"
        subgraph "GPU Infrastructure"
            GPU1[GPU Node 1<br/>A100 40GB<br/>vLLM Llama 70B]
            GPU2[GPU Node 2<br/>A100 40GB<br/>vLLM Llama 8B]
            SAFETY_GPU[Safety Model<br/>GPU Accelerated]
        end
        
        subgraph "Application Services"
            LS_PROD[Llama Stack<br/>3 replicas<br/>High Availability]
            MCP_PROD[MCP Services<br/>Enterprise Tools<br/>Auto-scaling]
            UI_PROD[Streamlit UI<br/>Load Balanced<br/>SSL/TLS]
        end
        
        subgraph "Data & Storage"
            MILVUS[Milvus Vector DB<br/>Persistent Storage]
            REDIS[Redis Cache<br/>Session Management]
            POSTGRES[PostgreSQL<br/>Metadata Store]
        end
        
        subgraph "Observability"
            METRICS[Prometheus<br/>Grafana<br/>Alerting]
        end
    end

    %% External Integrations
    subgraph "🌐 External Services"
        GITHUB[GitHub API<br/>Code Operations]
        SLACK[Slack API<br/>Notifications]  
        SEARCH[Tavily API<br/>Web Search]
        ENTERPRISE[Enterprise<br/>LDAP, SSO]
    end

    %% Development Flow
    DEV --> OLLAMA_LOCAL
    DEV --> LS_LOCAL
    DEV --> MCP_LOCAL
    DEV --> UI_LOCAL
    
    DEV --> A2A_DEV
    DEV --> RAG_DEV  
    DEV --> EVAL_DEV
    
    A2A_DEV --> LS_LOCAL
    RAG_DEV --> LS_LOCAL
    EVAL_DEV --> LS_LOCAL

    %% Repository Flow
    DEV --> GIT
    GIT --> DEMOS
    GIT --> K8S
    GIT --> TESTS
    GIT --> DIST

    %% CI/CD Flow
    GIT --> BUILD
    BUILD --> REGISTRY
    REGISTRY --> DEPLOY
    DEPLOY --> LS_PROD
    DEPLOY --> MCP_PROD
    DEPLOY --> UI_PROD

    %% Production Flow
    GPU1 --> LS_PROD
    GPU2 --> LS_PROD
    SAFETY_GPU --> LS_PROD
    
    LS_PROD --> MCP_PROD
    UI_PROD --> LS_PROD
    
    LS_PROD --> MILVUS
    MCP_PROD --> POSTGRES
    UI_PROD --> REDIS
    
    LS_PROD --> METRICS
    MCP_PROD --> METRICS
    UI_PROD --> METRICS

    %% External Connections
    MCP_LOCAL --> GITHUB
    MCP_LOCAL --> SLACK
    MCP_LOCAL --> SEARCH
    
    MCP_PROD --> GITHUB
    MCP_PROD --> SLACK
    MCP_PROD --> SEARCH
    MCP_PROD --> ENTERPRISE

    %% Styling
    classDef development fill:#e3f2fd
    classDef repository fill:#f3e5f5  
    classDef cicd fill:#e8f5e8
    classDef production fill:#fff3e0
    classDef external fill:#ffebee
    
    class DEV,OLLAMA_LOCAL,LS_LOCAL,MCP_LOCAL,UI_LOCAL,A2A_DEV,RAG_DEV,EVAL_DEV development
    class GIT,DEMOS,K8S,TESTS,DIST repository
    class BUILD,REGISTRY,DEPLOY cicd
    class GPU1,GPU2,SAFETY_GPU,LS_PROD,MCP_PROD,UI_PROD,MILVUS,REDIS,POSTGRES,METRICS production
    class GITHUB,SLACK,SEARCH,ENTERPRISE external
```

## Development to Production Flow

### 🖥️ Local Development
**Quick Start**: `make setup_local`
- **Ollama** serves Llama 3.2 3B model locally
- **Llama Stack** orchestrates agents and tools (:8321)
- **MCP Server** provides tool integrations (:8000)  
- **Streamlit UI** for interactive development (:8501)

### 📦 Repository Structure
**Three Demo Patterns**:
- **A2A**: Multi-agent communication systems
- **RAG**: Retrieval-augmented generation with vector search
- **Evaluation**: Performance testing and benchmarking

**Complete K8s Manifests**: Production-ready deployment configurations

### 🚀 CI/CD Pipeline  
**Container-Native Approach**:
- Build containers with `make build_*` commands
- Push to container registry
- Deploy via GitOps (ArgoCD/Flux) or direct `oc apply`

### ☁️ Production Environment
**Enterprise-Grade Deployment**:
- **GPU Acceleration**: NVIDIA A100 GPUs for model inference
- **High Availability**: Multiple replicas with load balancing
- **Scalability**: Horizontal pod autoscaling
- **Security**: RBAC, network policies, SSL/TLS
- **Observability**: Full monitoring and alerting stack

### 🌐 External Integrations
**Standardized via MCP Protocol**:
- GitHub for code operations
- Slack for notifications
- Web search capabilities  
- Enterprise systems (LDAP, SSO)

## Key Benefits

✅ **Seamless Development Experience**: Same APIs and patterns from laptop to production  
✅ **Complete Container Stack**: Everything runs in containers for consistency  
✅ **GPU-Optimized**: Designed for high-performance AI inference  
✅ **Enterprise Ready**: Security, monitoring, and scalability built-in  
✅ **Extensible**: Easy to add new tools and models via MCP protocol  

## Port Mapping Reference

| Service | Local Port | Production |
|---------|------------|-----------|
| Llama Stack | :8321 | Load Balanced |
| Ollama/vLLM | :11434 | GPU Nodes |
| MCP Tools | :8000 | Auto-scaled |
| Streamlit UI | :8501 | HTTPS Route |