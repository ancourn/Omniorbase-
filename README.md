# Unlimited Agentic AI System

A comprehensive, extensible AI agent system with advanced decision-making capabilities, learning mechanisms, and a wide range of tools for various domains including software development, system administration, web operations, and more.

## 🌟 Features

### Core Capabilities
- **Advanced Decision-Making Engine**: Multi-strategy AI-powered decision making with adaptive learning
- **Comprehensive Tool System**: 50+ specialized tools across 6 categories
- **Learning & Adaptation**: Continuous improvement from interactions
- **Performance Monitoring**: Real-time metrics and health monitoring
- **Extensible Architecture**: Easy to add new tools and capabilities

### Tool Categories
1. **File Operations**: Read, write, search, analyze, and organize files
2. **Web Tools**: Search, fetch, validate, and extract web content
3. **Code Generation**: Multi-language support with analysis, debugging, and optimization
4. **System Operations**: Command execution, process management, and monitoring
5. **Deployment**: Multi-environment deployment with monitoring
6. **Communication**: Email, messaging, API, and webhook management

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ancourn/Omniorbase-.git
   cd Omniorbase-
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up the database**
   ```bash
   npm run db:push
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000` to access the AI agent interface.

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Main application interface
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── lib/
│   ├── agent/             # Core agent system
│   │   ├── types.ts       # Type definitions
│   │   ├── agent-engine.ts # Main agent engine
│   │   ├── learning.ts    # Learning mechanisms
│   │   ├── monitoring.ts  # Performance monitoring
│   │   └── tools/         # Tool implementations
│   │       ├── file-tools.ts
│   │       ├── web-tools.ts
│   │       ├── code-tools.ts
│   │       ├── system-tools.ts
│   │       ├── deployment-tools.ts
│   │       ├── communication-tools.ts
│   │       └── index.ts
│   ├── db.ts              # Database client
│   ├── socket.ts          # Socket.io configuration
│   └── utils.ts           # Utility functions
├── components/
│   └── ui/                # shadcn/ui components
├── hooks/                 # Custom React hooks
└── prisma/
    └── schema.prisma      # Database schema
```

## 🔧 Configuration

### Environment Variables
Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# AI SDK (if needed)
ZAI_API_KEY="your-zai-api-key"
```

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
npm run db:push      # Push schema to database
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run migrations
npm run db:reset     # Reset database
```

## 🎯 Usage Guide

### Interacting with the AI Agent

1. **Chat Interface**: Use the main chat interface to communicate with the AI agent
2. **Tool Execution**: The agent can automatically execute tools based on your requests
3. **Monitoring**: View real-time performance metrics and system status
4. **Learning**: The agent learns from interactions to improve over time

### Example Interactions

```bash
# File operations
"Read the contents of src/app/page.tsx"
"Create a new file called test.js with console.log('Hello')"

# Web operations
"Search for information about Next.js 15"
"Fetch content from https://api.github.com"

# Code generation
"Generate a Python function to calculate fibonacci"
"Analyze this JavaScript code for performance issues"

# System operations
"Show system information"
"List running processes"

# Deployment
"Build a Docker image for this project"
"Deploy to Kubernetes"
```

## 🛠️ Development

### Adding New Tools

1. **Create a new tool file** in `src/lib/agent/tools/`
2. **Implement the tool interface**:
   ```typescript
   export const newTool: AgentTool = {
     id: 'tool_id',
     name: 'Tool Name',
     description: 'Tool description',
     category: 'category',
     parameters: { /* parameter definitions */ },
     safetyCheck: (params) => { /* safety validation */ },
     execute: async (params) => { /* tool logic */ },
   };
   ```
3. **Add the tool** to the export in `src/lib/agent/tools/index.ts`

### Extending the Agent

The agent architecture is designed to be extensible:

- **Decision Making**: Modify `src/lib/agent/agent-engine.ts` to add new decision strategies
- **Learning**: Enhance `src/lib/agent/learning.ts` to add new learning mechanisms
- **Monitoring**: Extend `src/lib/agent/monitoring.ts` for additional metrics

## 📊 Performance Monitoring

The system includes comprehensive performance monitoring:

- **Response Time**: Track agent response times
- **Success Rate**: Monitor tool execution success rates
- **Memory Usage**: Track memory consumption
- **CPU Usage**: Monitor CPU utilization
- **Error Rates**: Track error frequencies

Access monitoring data through the UI or programmatically via the `MonitoringService` class.

## 🔒 Security Features

### Safety Checks
- **Tool Validation**: All tools include safety checks before execution
- **Parameter Validation**: Input validation for all tool parameters
- **Path Security**: Protection against directory traversal and sensitive file access
- **Command Safety**: Prevention of dangerous system commands

### Configuration
- **Safety Levels**: Configurable safety levels (low, medium, high)
- **Permission-based Operations**: Tools require appropriate permissions
- **Audit Logging**: All operations are logged for accountability

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Include type definitions for all new code
- Add comprehensive JSDoc comments
- Implement proper error handling
- Include safety checks for new tools
- Write tests for new functionality

## 📈 Roadmap

### Phase 1: Core System ✅
- [x] Agent engine with decision-making capabilities
- [x] Comprehensive tool system
- [x] Learning and adaptation mechanisms
- [x] Interactive user interface
- [x] Performance monitoring

### Phase 2: Enhanced Features
- [ ] Advanced AI integration with multiple models
- [ ] Real-time collaboration features
- [ ] Advanced analytics dashboard
- [ ] Plugin system for third-party tools
- [ ] Multi-agent coordination

### Phase 3: Enterprise Features
- [ ] Advanced security and authentication
- [ ] Scalability improvements
- [ ] Enterprise deployment options
- [ ] Advanced monitoring and alerting
- [ ] API for external integrations

## 🐛 Troubleshooting

### Common Issues

**Port Already in Use**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

**Database Issues**
```bash
# Reset database
npm run db:reset

# Regenerate Prisma client
npm run db:generate
```

**Build Errors**
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

### Getting Help

- Check the [PROJECT_MANIFEST.md](./PROJECT_MANIFEST.md) for current implementation status
- Review the issues section for known problems
- Create a new issue for bugs or feature requests

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js 15](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- AI capabilities powered by [ZAI SDK](https://z-ai.com/)
- Database management with [Prisma](https://prisma.io/)
- Styling with [Tailwind CSS](https://tailwindcss.com/)

---

**Note**: A backup snapshot was created before pushing to GitHub: `unlimited-agentic-ai-backup-20250903-005348.tar.gz`