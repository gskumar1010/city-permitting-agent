# Llama Stack Demos on OpenDataHub

This repository contains practical examples and demos designed to get you started quickly building AI apps with [Llama Stack](https://github.com/meta-llama/llama-stack) on Kubernetes or OpenShift. Whether you're a cluster admin looking to deploy the right GenAI infrastructure or a developer eager to innovate with AI Agents, the content in this repo should help you get started.

## 🏗️ Repository Structure

This repository is designed as a **comprehensive demonstration platform** for building AI applications with Llama Stack. It follows a modular architecture with three main demonstration patterns:

### Core Architecture

```
city-permitting-agent/
├── demos/                    # Three main demo patterns
│   ├── a2a_llama_stack/     # Agent-to-Agent communication
│   ├── rag_agentic/         # RAG + Agent capabilities  
│   └── rag_eval/            # Evaluation framework
├── kubernetes/              # Complete deployment manifests
├── tests/                   # Evaluation and testing scripts
├── distribution/            # Container build configurations
└── images/                  # Documentation assets
```

### Three Demo Patterns

1. **A2A (Agent-to-Agent)** - Multi-agent systems where agents communicate and coordinate with each other through standardized message passing
2. **RAG Agentic** - Combines retrieval-augmented generation with agent capabilities, integrating Milvus vector database and Streamlit frontend
3. **Evaluation Framework** - Comprehensive testing and benchmarking of AI agent performance, including tool calling accuracy and response quality metrics

### Infrastructure Components

The repository includes complete Kubernetes/OpenShift deployment manifests:

- **llama-serve/**: vLLM model servers (GPU-accelerated)
- **llama-stack/**: Core Llama Stack orchestration server
- **mcp-servers/**: Model Context Protocol tool servers for GitHub, Slack, databases, web search, and K8s operations
- **streamlit-client/**: Web UI deployment
- **observability/**: Monitoring and metrics collection
- **kustomize/**: Deployment overlays for different environments

## 🛠️ Get Started

### Local Development Setup

For local development and testing, you can run the complete Llama Stack locally using Ollama and Podman. This is perfect for development, experimentation, and learning.

#### Prerequisites

Ensure you have the following installed on your macOS system:

- **Podman** ([Install Podman](https://podman.io/docs/installation)) - Container runtime
- **Python 3.12+** - Required for Llama Stack client
- **Ollama** ([Install Ollama](https://ollama.com/download)) - Local LLM inference
- **uv** - Fast Python package manager

Verify installations:
```bash
podman --version
python3 --version
ollama --version
```

#### Step-by-Step Local Stack Setup

**1. Install and Setup Dependencies**
```bash
# Install uv package manager
pip install uv

# Clone and setup the project
cd /path/to/city-permitting-agent
uv sync
source .venv/bin/activate
```

**2. Quick Setup (Recommended)**

Use the provided Makefile command to start everything:
```bash
make setup_local
```

This command will:
- Start Ollama with the Llama 3.2 3B model
- Pull and run the Llama Stack distribution container
- Configure all necessary networking and environment variables

**3. Manual Setup (Step-by-Step)**

If you prefer to understand each component:

```bash
# Step 1: Start Ollama with the model (runs in background)
ollama run llama3.2:3b-instruct-fp16 --keepalive 160m &

# Step 2: Create local directory for Llama Stack data
mkdir -p ~/.llama

# Step 3: Set environment variables
export INFERENCE_MODEL="meta-llama/Llama-3.2-3B-Instruct"
export LLAMA_STACK_PORT=8321
export LLAMA_STACK_ENDPOINT="http://localhost:8321"

# Step 4: Run Llama Stack server container
podman run -it -p 8321:8321 \
  -v ~/.llama:/root/.llama \
  --env INFERENCE_MODEL="$INFERENCE_MODEL" \
  --env OLLAMA_URL=http://host.containers.internal:11434 \
  localhost/distribution-ollama:0.2.7 \
  --port 8321
```

**4. Build and Run MCP Tools Server**

Model Context Protocol (MCP) servers provide tool integration:

```bash
# Build the MCP server container
make build_mcp

# Run MCP server (provides GitHub, Slack, web search tools)
make run_mcp_container
```

**5. Test Your Local Stack**

Run a simple agent to verify everything works:

```bash
# Activate virtual environment if not already active
source .venv/bin/activate

# Run a basic agent test
python tests/scripts/0_simple_agent.py

# Run agent with RAG capabilities
python tests/scripts/1_simple_agent_with_RAG.py
```

**6. Optional: Run Streamlit UI**

For a web interface to interact with your agents:

```bash
# Build the UI container
make build_ui

# Set required environment variables
export TAVILY_SEARCH_API_KEY="your-search-api-key"  # Optional for web search

# Run the Streamlit interface
make run_ui
```

Access the UI at: http://localhost:8501

#### Local Stack Architecture

When running locally, your stack consists of:

1. **Ollama** (Port 11434) - Serves the Llama 3.2 3B model
2. **Llama Stack Server** (Port 8321) - Orchestrates agents and tools
3. **MCP Server** (Port 8000) - Provides external tool integrations
4. **Streamlit UI** (Port 8501) - Web interface (optional)

#### Troubleshooting Local Setup

**Container Issues:**
```bash
# Check running containers
podman ps

# Check container logs
podman logs <container-name>

# Restart services
make setup_local
```

**Python Environment Issues:**
```bash
# Recreate virtual environment
rm -rf .venv
uv sync
source .venv/bin/activate
```

**Model Loading Issues:**
```bash
# Verify Ollama is running
ollama list

# Re-pull the model if needed
ollama pull llama3.2:3b-instruct-fp16
```

### Production Deployment on OpenShift

For production deployments with GPU acceleration and high availability:

#### Requirements

* OpenShift Cluster 4.17+
* 2 GPUs with a minimum of 40GB VRAM each

#### Deployment Instructions

1. Create a dedicated OpenShift project:
   ```bash
   oc new-project llama-serve
   ```

2. Apply the Kubernetes manifests:
   ```bash
   oc apply -k kubernetes/kustomize/overlay/all-models
   ```
   
   This will deploy:
   - vLLM model servers with GPU acceleration
   - Llama Stack orchestration server
   - MCP tool servers for enterprise integrations
   - Streamlit web interface
   - Observability and monitoring stack

## 🔄 Development Workflow

Once your local stack is running, you can develop and test AI applications:

### Running Demos

**A2A (Agent-to-Agent) Demo:**
```bash
# Navigate to A2A demo
cd demos/a2a_llama_stack

# Run multi-agent coordination example
python cli/multi_agent_client.py
```

**RAG Agentic Demo:**
```bash
# Navigate to RAG demo
cd demos/rag_agentic

# Start Jupyter for interactive development
jupyter notebook
```

**Evaluation and Testing:**
```bash
# Run comprehensive evaluation tests
cd tests/eval_tests
python tests.py --model-size 3B --num-tools 23

# Run specific agent tests
python tests/scripts/0_simple_agent.py
python tests/scripts/1_simple_agent_with_RAG.py
python tests/scripts/agent_with_mcp_ocp_slack.py
```

### Common Development Tasks

**Build Containers:**
```bash
make build_llamastack    # Build Llama Stack distribution
make build_mcp          # Build MCP server
make build_ui           # Build Streamlit UI
```

**Run Services:**
```bash
make run_mcp            # Run MCP server locally
make run_mcp_container  # Run MCP in container
make run_ui             # Run Streamlit UI
```

**Development Environment:**
```bash
# Restart local stack
make setup_local

# Check service status
podman ps
curl http://localhost:8321/health  # Check Llama Stack
curl http://localhost:8000/health  # Check MCP server
```

## 💡 Architecture Diagrams

### City Permitting Agent Architecture
Comprehensive architecture documentation for the AI-powered permit review system:
- **[📋 Detailed System Architecture](./docs/architecture-diagram.md)** - Complete system components, data flows, and integration points
- **[🏗️ High-Level Architecture Overview](./docs/architecture-overview.md)** - Simplified system overview with technology stack
- **[🔧 Technical Component Interactions](./docs/component-diagram.md)** - Detailed service-level architecture and API specifications

### Development & Deployment Architectures
Complete development-to-production flow showing how local development scales to enterprise deployment:
- **[System Overview Diagram](./docs/system-overview-diagram.md)** - Full development-to-production flow
- **[Local Development Architecture](./docs/local-development-architecture.md)** - Local stack components and ports
- **[OpenShift Production Architecture](./docs/openshift-production-architecture.md)** - Production deployment details

📚 **[View All Documentation](./docs/)** - Complete documentation index with guides and architecture diagrams

### Demo Implementation Architecture
The below diagram shows the secure Llama Stack application architecture deployed on OpenShift using MCP tools and [Milvus](https://milvus.io/) vector database for agentic and RAG workflows:

![Architecture Diagram](./images/architecture-diagram.jpg)

---

We're excited to see what you build with Llama Stack! If you have any questions or feedback, please don't hesitate to open an [issue](https://github.com/opendatahub-io/llama-stack-demos/issues). Happy building! 🎉
