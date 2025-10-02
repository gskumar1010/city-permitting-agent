# OpenShift Production Architecture Diagram

```mermaid
graph TB
    %% External Access
    subgraph "External Access"
        ROUTE[OpenShift Routes<br/>External Traffic]
        LB[Load Balancer<br/>High Availability]
    end

    %% OpenShift Platform
    subgraph "OpenShift Cluster"
        subgraph "llama-serve Namespace"
            %% Frontend Layer
            subgraph "Frontend Layer"
                STREAMLIT[Streamlit Service<br/>3 replicas<br/>Web UI]
                NGINX[NGINX Ingress<br/>SSL Termination]
            end
            
            %% Application Layer  
            subgraph "Application Layer"
                LS_SVC[Llama Stack Service<br/>3 replicas<br/>Agent Orchestration]
                MCP_SVC[MCP Services<br/>GitHub, Slack, K8s Tools<br/>Horizontal Pod Autoscaling]
            end
            
            %% Model Inference Layer
            subgraph "Model Inference Layer (GPU Nodes)"
                VLLM1[vLLM Server 1<br/>Llama 3.2 70B<br/>A100 40GB GPU]
                VLLM2[vLLM Server 2<br/>Llama 3.1 8B<br/>A100 40GB GPU]
                SAFETY[Safety Model<br/>Moderation & Filtering<br/>GPU Accelerated]
            end
            
            %% Data Layer
            subgraph "Data Layer"
                MILVUS[Milvus Vector DB<br/>Persistent Volume<br/>RAG Knowledge Base]
                REDIS[Redis Cache<br/>Session Management]
                POSTGRES[PostgreSQL<br/>Metadata & Logging]
            end
        end
        
        %% Observability
        subgraph "Monitoring Namespace" 
            PROM[Prometheus<br/>Metrics Collection]
            GRAFANA[Grafana<br/>Dashboards]
            ALERT[AlertManager<br/>Notifications]
            JAEGER[Jaeger<br/>Distributed Tracing]
        end
        
        %% Infrastructure
        subgraph "Infrastructure"
            GPU_NODES[GPU Worker Nodes<br/>NVIDIA A100<br/>40GB VRAM each]
            CPU_NODES[CPU Worker Nodes<br/>Application Workloads]
            STORAGE[OpenShift Data Foundation<br/>Persistent Storage]
        end
    end

    %% External Services
    subgraph "External Services"
        GITHUB_API[GitHub API<br/>Code Operations]
        SLACK_API[Slack API<br/>Notifications]
        TAVILY[Tavily Search API<br/>Web Search]
        ENTERPRISE[Enterprise Systems<br/>LDAP, SSO, etc.]
    end

    %% Connections - External
    ROUTE --> NGINX
    LB --> ROUTE
    
    %% Connections - Frontend to App
    NGINX --> STREAMLIT
    STREAMLIT --> LS_SVC
    
    %% Connections - Application Layer
    LS_SVC --> VLLM1
    LS_SVC --> VLLM2  
    LS_SVC --> SAFETY
    LS_SVC --> MCP_SVC
    
    %% Connections - Data Layer
    LS_SVC --> REDIS
    MCP_SVC --> MILVUS
    MCP_SVC --> POSTGRES
    STREAMLIT --> MILVUS
    
    %% Connections - External APIs
    MCP_SVC --> GITHUB_API
    MCP_SVC --> SLACK_API
    MCP_SVC --> TAVILY
    MCP_SVC --> ENTERPRISE
    
    %% Connections - Infrastructure
    VLLM1 --> GPU_NODES
    VLLM2 --> GPU_NODES
    SAFETY --> GPU_NODES
    LS_SVC --> CPU_NODES
    MCP_SVC --> CPU_NODES
    STREAMLIT --> CPU_NODES
    
    MILVUS --> STORAGE
    REDIS --> STORAGE  
    POSTGRES --> STORAGE
    
    %% Connections - Observability
    PROM --> LS_SVC
    PROM --> VLLM1
    PROM --> VLLM2
    PROM --> MCP_SVC
    GRAFANA --> PROM
    ALERT --> PROM
    JAEGER --> LS_SVC
    
    %% Styling
    classDef external fill:#ffebee
    classDef frontend fill:#e8eaf6
    classDef application fill:#e3f2fd
    classDef inference fill:#e8f5e8
    classDef data fill:#fff3e0
    classDef monitoring fill:#f3e5f5
    classDef infrastructure fill:#fafafa
    classDef externalServices fill:#fff8e1
    
    class ROUTE,LB external
    class STREAMLIT,NGINX frontend
    class LS_SVC,MCP_SVC application
    class VLLM1,VLLM2,SAFETY inference
    class MILVUS,REDIS,POSTGRES data
    class PROM,GRAFANA,ALERT,JAEGER monitoring
    class GPU_NODES,CPU_NODES,STORAGE infrastructure
    class GITHUB_API,SLACK_API,TAVILY,ENTERPRISE externalServices
```

## Production Deployment Features

### High Availability
- **Multiple Replicas** - All services run with 3+ replicas
- **Load Balancing** - OpenShift Routes with automatic load balancing
- **Auto-scaling** - Horizontal Pod Autoscaler based on CPU/memory
- **Health Checks** - Liveness and readiness probes for all services

### GPU Acceleration  
- **Dedicated GPU Nodes** - NVIDIA A100 GPUs with 40GB VRAM each
- **Multiple Model Servers** - Different model sizes for different use cases
- **Safety Model** - Dedicated moderation and content filtering
- **GPU Resource Management** - Kubernetes GPU scheduling and sharing

### Enterprise Integration
- **Security** - RBAC, NetworkPolicies, Pod Security Standards
- **Monitoring** - Full observability stack with Prometheus and Grafana
- **Logging** - Centralized logging with OpenShift Logging
- **Storage** - Enterprise persistent storage with OpenShift Data Foundation

### Scalability
- **Horizontal Scaling** - Independent scaling of each component
- **Resource Quotas** - Proper resource limits and requests
- **Network Policies** - Micro-segmentation and security
- **Rolling Updates** - Zero-downtime deployments

## Resource Requirements

### GPU Nodes (Minimum 2 nodes)
- **GPU**: NVIDIA A100 40GB or equivalent
- **CPU**: 16+ cores per node
- **Memory**: 128GB+ RAM per node
- **Storage**: 1TB+ NVMe SSD per node

### CPU Nodes (Minimum 3 nodes)
- **CPU**: 8+ cores per node  
- **Memory**: 32GB+ RAM per node
- **Storage**: 500GB+ SSD per node

### Network Requirements
- **Bandwidth**: 10Gbps+ cluster networking
- **External**: Dedicated egress for API calls
- **Security**: Firewall rules for external integrations

## Deployment Commands

```bash
# Create namespace
oc new-project llama-serve

# Deploy all components
oc apply -k kubernetes/kustomize/overlay/all-models

# Monitor deployment
oc get pods -w

# Check GPU allocation
oc describe nodes -l node-role.kubernetes.io/gpu=

# Access services
oc get routes
```