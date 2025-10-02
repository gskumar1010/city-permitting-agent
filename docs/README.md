# Documentation

Welcome to the Llama Stack Demos documentation! This folder contains comprehensive guides and architecture diagrams to help you understand and work with this repository.

## 📋 Getting Started

- **[Main README](../README.md)** - Project overview, setup instructions, and development workflow
- **[Local Setup Guide](../local_setup_guide.md)** - Detailed local development environment setup
- **[WARP.md](../WARP.md)** - AI agent guidance for working with this codebase

## 🏗️ Architecture Diagrams

### City Permitting Agent Architecture
Comprehensive architecture documentation for the AI-powered permit review system:
- **[📋 Detailed System Architecture](./architecture-diagram.md)** - Complete system components, data flows, and integration points
- **[🏗️ High-Level Architecture Overview](./architecture-overview.md)** - Simplified system overview with technology stack
- **[🔧 Technical Component Interactions](./component-diagram.md)** - Detailed service-level architecture and API specifications

### Development & Deployment Architectures
#### System Overview
- **[System Overview Diagram](./system-overview-diagram.md)** - Complete development-to-production flow showing how local development scales to enterprise deployment

#### Local Development
- **[Local Development Architecture](./local-development-architecture.md)** - Detailed view of the local development stack with all components, ports, and connections

#### Production Deployment
- **[OpenShift Production Architecture](./openshift-production-architecture.md)** - Enterprise OpenShift deployment with GPU acceleration, high availability, and monitoring

## 📁 Repository Structure

```
city-permitting-agent/
├── docs/                        # 📚 Documentation (you are here)
│   ├── README.md               # This documentation index
│   ├── system-overview-diagram.md
│   ├── local-development-architecture.md
│   └── openshift-production-architecture.md
├── demos/                      # 🎯 Demo applications
│   ├── a2a_llama_stack/       # Agent-to-Agent communication
│   ├── rag_agentic/           # RAG + Agent capabilities
│   └── rag_eval/              # Evaluation framework
├── kubernetes/                 # ☸️ K8s/OpenShift manifests
├── tests/                      # 🧪 Testing and evaluation
├── distribution/               # 📦 Container configurations
└── images/                     # 🖼️ Documentation assets
```

## 🚀 Quick Navigation

### For Developers
1. Start with the [Main README](../README.md) for project overview
2. Follow [Local Setup Guide](../local_setup_guide.md) for environment setup
3. Review [Local Development Architecture](./local-development-architecture.md) for system understanding
4. Check [WARP.md](../WARP.md) for AI agent development guidance

### For DevOps/Platform Teams  
1. Review [System Overview Diagram](./system-overview-diagram.md) for complete picture
2. Study [OpenShift Production Architecture](./openshift-production-architecture.md) for deployment planning
3. Examine `kubernetes/` directory for deployment manifests
4. Review resource requirements and scaling considerations

### For Architects
**Application Architecture:**
1. Review [High-Level Architecture Overview](./architecture-overview.md) for city permitting agent system design
2. Study [Detailed System Architecture](./architecture-diagram.md) for complete component breakdown
3. Examine [Technical Component Interactions](./component-diagram.md) for service-level details

**Infrastructure Architecture:**
1. Start with [System Overview Diagram](./system-overview-diagram.md) for development-to-production flow
2. Deep dive into [OpenShift Production Architecture](./openshift-production-architecture.md) for production design
3. Review [Local Development Architecture](./local-development-architecture.md) for development workflow understanding

## 🔗 External Resources

- **[Llama Stack](https://github.com/meta-llama/llama-stack)** - Core Llama Stack framework
- **[vLLM](https://docs.vllm.ai/en/latest/)** - High-performance LLM inference
- **[Model Context Protocol](https://modelcontextprotocol.io/)** - Standardized tool integration
- **[OpenShift](https://docs.openshift.com/)** - Enterprise Kubernetes platform
- **[Streamlit](https://streamlit.io/)** - Python web app framework