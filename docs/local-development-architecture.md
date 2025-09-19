# Local Development Architecture Diagram

```mermaid
graph TB
    %% User Interface Layer
    subgraph "User Interface"
        UI[Streamlit UI<br/>:8501]
        CLI[CLI Scripts<br/>Python/Jupyter]
        TESTS[Test Scripts<br/>Evaluation Suite]
    end

    %% Core Services Layer
    subgraph "Core Services (Local)"
        LS[Llama Stack Server<br/>:8321<br/>Agent Orchestration]
        OLLAMA[Ollama<br/>:11434<br/>Llama 3.2 3B Model]
        MCP[MCP Server<br/>:8000<br/>Tool Integration]
    end

    %% Container Runtime
    subgraph "Container Runtime"
        PODMAN[Podman<br/>Container Management]
        LSC[llamastack/distribution-ollama<br/>Container]
        MCPC[mcp_server:latest<br/>Container]
        UIC[streamlit_client:latest<br/>Container]
    end

    %% Tools and Integrations
    subgraph "External Tools (via MCP)"
        GITHUB[GitHub<br/>API Integration]
        SLACK[Slack<br/>Messaging]
        WEB[Web Search<br/>Tavily API]
        DB[Databases<br/>SQL/NoSQL]
        K8S[Kubernetes/OpenShift<br/>Operations]
    end

    %% Demo Applications
    subgraph "Demo Applications"
        A2A[A2A Demo<br/>Agent-to-Agent<br/>Communication]
        RAG[RAG Agentic<br/>Retrieval + Agents<br/>+ Milvus Vector DB]
        EVAL[Evaluation Framework<br/>Performance Testing<br/>Tool Accuracy]
    end

    %% Data Storage
    subgraph "Data Storage"
        LLAMA_DATA[~/.llama<br/>Model Data & Config]
        VECTOR_DB[Milvus Vector DB<br/>RAG Knowledge Base]
    end

    %% Connections
    UI --> LS
    CLI --> LS
    TESTS --> LS
    
    LS --> OLLAMA
    LS --> MCP
    
    OLLAMA --> LSC
    MCP --> MCPC
    UI --> UIC
    
    PODMAN --> LSC
    PODMAN --> MCPC  
    PODMAN --> UIC
    
    MCP --> GITHUB
    MCP --> SLACK
    MCP --> WEB
    MCP --> DB
    MCP --> K8S
    
    A2A --> LS
    RAG --> LS
    RAG --> VECTOR_DB
    EVAL --> LS
    
    LSC --> LLAMA_DATA
    
    %% Styling
    classDef userInterface fill:#e1f5fe
    classDef coreServices fill:#f3e5f5
    classDef containers fill:#fff3e0
    classDef tools fill:#e8f5e8
    classDef demos fill:#fff8e1
    classDef storage fill:#fce4ec
    
    class UI,CLI,TESTS userInterface
    class LS,OLLAMA,MCP coreServices
    class PODMAN,LSC,MCPC,UIC containers
    class GITHUB,SLACK,WEB,DB,K8S tools
    class A2A,RAG,EVAL demos
    class LLAMA_DATA,VECTOR_DB storage
```

## Component Details

### Core Services
- **Llama Stack Server** (:8321) - Central orchestration for agents, tools, and models
- **Ollama** (:11434) - Local LLM inference serving Llama 3.2 3B model
- **MCP Server** (:8000) - Model Context Protocol server providing standardized tool access

### Container Runtime
- **Podman** - Manages all containerized services
- **Distribution Container** - Pre-built Llama Stack with Ollama integration
- **MCP Container** - Tool integration server
- **UI Container** - Streamlit web interface

### Demo Applications
- **A2A (Agent-to-Agent)** - Multi-agent coordination and communication
- **RAG Agentic** - Retrieval-augmented generation with agent capabilities
- **Evaluation Framework** - Performance testing and tool accuracy measurement

### External Integrations
All external tools accessed through standardized MCP (Model Context Protocol):
- GitHub API operations
- Slack messaging
- Web search capabilities  
- Database connections
- Kubernetes/OpenShift management

## Port Mapping
- **8321** - Llama Stack Server (main API)
- **11434** - Ollama model server
- **8000** - MCP tools server
- **8501** - Streamlit web UI

## Quick Start Commands
```bash
# Start entire local stack
make setup_local

# Build and run MCP tools
make build_mcp && make run_mcp_container

# Launch web UI
make build_ui && make run_ui

# Test with simple agent
python tests/scripts/0_simple_agent.py
```