# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a **Llama Stack Demos** repository containing practical examples for building AI applications with Llama Stack on Kubernetes/OpenShift. The project demonstrates three main architectures:

1. **A2A (Agent-to-Agent)** - Multi-agent communication patterns
2. **RAG Agentic** - Retrieval Augmented Generation with agent capabilities  
3. **Evaluation Framework** - Testing and benchmarking AI agents

## Development Environment Setup

### Python Environment
```bash
# Install uv package manager
pip install uv

# Sync dependencies and activate environment
uv sync
source .venv/bin/activate
```

### Local Development Stack
```bash
# Quick setup for local development (runs Ollama + Llama Stack)
make setup_local

# Or manually:
ollama run llama3.2:3b-instruct-fp16 --keepalive 160m &
podman run -it -p 8321:8321 -v ~/.llama:/root/.llama localhost/distribution-ollama:0.2.7 --port 8321 --env INFERENCE_MODEL="meta-llama/Llama-3.2-3B-Instruct" --env OLLAMA_URL=http://host.containers.internal:11434
```

## Common Commands

### Container Builds
```bash
# Build Llama Stack container
make build_llamastack

# Build MCP (Model Context Protocol) server
make build_mcp

# Build Streamlit UI
make build_ui
```

### Running Services
```bash
# Run MCP server locally
make run_mcp

# Run MCP server in container
make run_mcp_container

# Run Streamlit UI
make run_ui
```

### Testing
```bash
# Run evaluation tests
cd tests/eval_tests
python tests.py

# Run specific demo scripts
python tests/scripts/0_simple_agent.py
python tests/scripts/1_simple_agent_with_RAG.py
```

## Architecture Components

### Core Stack
- **Llama Stack Server**: Central orchestration layer for AI models and tools
- **vLLM**: High-performance LLM inference engine
- **MCP Servers**: Model Context Protocol servers for tool integration
- **Kubernetes/OpenShift**: Container orchestration platform

### Key Directories
- `demos/` - Example applications showcasing different AI patterns
- `kubernetes/` - Deployment manifests for all stack components
- `tests/` - Evaluation scripts and benchmarking tools
- `distribution/` - Container build configurations

### Agent Architecture Patterns

#### A2A Pattern (`demos/a2a_llama_stack/`)
- **A2ATool.py**: Client tool wrapper for agent communication
- **A2AFleet.py**: Multi-agent fleet management
- **task_manager.py**: Task orchestration across agents
- Agents communicate via standardized message passing

#### RAG Agentic Pattern (`demos/rag_agentic/`)
- Combines retrieval-augmented generation with agent capabilities
- Integrates with Milvus vector database
- Uses Streamlit for interactive frontend

### MCP Tool Integration
MCP (Model Context Protocol) servers provide standardized tool access:
- GitHub integration
- Slack messaging
- Database connections
- Web search capabilities
- OpenShift/Kubernetes operations

## OpenShift Deployment

### Prerequisites
- OpenShift Cluster 4.17+
- 2 GPUs with minimum 40GB VRAM each

### Quick Deploy
```bash
# Create project
oc new-project llama-serve

# Deploy all components
oc apply -k kubernetes/kustomize/overlay/all-models
```

## Environment Variables

### Local Development
```bash
export INFERENCE_MODEL="meta-llama/Llama-3.2-3B-Instruct"
export LLAMA_STACK_PORT=8321
export LLAMA_STACK_ENDPOINT="http://localhost:8321"
```

### Remote/Production
```bash
export REMOTE_BASE_URL="https://your-llama-stack-server"
export REMOTE_MCP_URL="https://your-mcp-server/sse"
export TAVILY_SEARCH_API_KEY="your-search-api-key"
```

## File Structure Patterns

### Demo Structure
Each demo follows this pattern:
```
demos/[demo-name]/
├── agents/           # Agent configurations
├── cli/             # Command-line interfaces  
├── [Demo]Tool.py    # Main tool implementations
└── config files     # Agent and tool configurations
```

### Kubernetes Manifests
```
kubernetes/
├── llama-serve/     # vLLM model servers
├── llama-stack/     # Core Llama Stack server
├── mcp-servers/     # Tool integration servers
├── streamlit-client/ # Web UI
└── kustomize/       # Deployment overlays
```

## Testing and Evaluation

### Test Categories
- **Tool Evaluation**: Tests tool calling accuracy across different model configurations
- **Agent Scripts**: End-to-end agent workflow demonstrations
- **Performance Metrics**: Response time, accuracy, and resource utilization

### Running Evaluations
```bash
cd tests/eval_tests
python tests.py --model-size 3B --num-tools 23
```

## Key Technologies
- **Python 3.12+** with uv package management
- **Llama Stack Client** for AI model interaction
- **Podman/Docker** for containerization
- **Kubernetes/OpenShift** for orchestration
- **Streamlit** for web interfaces
- **Jupyter** for analysis and experimentation