# Setup Instructions

## 🚀 Quick Start Guide

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Step 1: Clone the Repository
```bash
git clone https://github.com/ancourn/Omniorbase-.git
cd Omniorbase-
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Set Up Database
```bash
npm run db:push
```

### Step 4: Start Development Server
```bash
npm run dev
```

### Step 5: Access the Application
Open your browser and navigate to `http://localhost:3000`

## 🔧 Environment Setup

### Create Environment File
Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# AI SDK (optional)
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
│   ├── db.ts              # Database client
│   ├── socket.ts          # Socket.io configuration
│   └── utils.ts           # Utility functions
├── components/
│   └── ui/                # shadcn/ui components
├── hooks/                 # Custom React hooks
└── prisma/
    └── schema.prisma      # Database schema
```

## 🎯 Key Features

### Agent Capabilities
- **Natural Language Processing**: Understand and respond to user requests
- **Tool Execution**: Automatically execute relevant tools based on requests
- **Learning & Adaptation**: Improve performance over time
- **Safety Checks**: All operations include safety validation

### Available Tools
- **File Operations**: Read, write, search, and organize files
- **Web Tools**: Search, fetch, and analyze web content
- **Code Generation**: Generate and analyze code in multiple languages
- **System Operations**: Execute commands and monitor system resources
- **Deployment**: Manage Docker, Kubernetes, and serverless deployments
- **Communication**: Send emails, messages, and handle webhooks

## 🛠️ Development

### Adding New Tools
1. Create a new tool file in `src/lib/agent/tools/`
2. Implement the `AgentTool` interface
3. Add the tool to `src/lib/agent/tools/index.ts`

### Extending the Agent
- Modify `src/lib/agent/agent-engine.ts` for decision-making logic
- Enhance `src/lib/agent/learning.ts` for learning mechanisms
- Extend `src/lib/agent/monitoring.ts` for additional metrics

## 🔒 Security Features

- **Safety Checks**: All tools include validation before execution
- **Path Security**: Protection against unauthorized file access
- **Command Safety**: Prevention of dangerous system commands
- **Configurable Safety Levels**: Low, medium, and high safety modes

## 📊 Performance Monitoring

The system includes real-time monitoring of:
- Response times
- Success rates
- Memory usage
- CPU utilization
- Error rates

## 🐛 Troubleshooting

### Common Issues
- **Port Already in Use**: `lsof -ti:3000 | xargs kill -9`
- **Database Issues**: `npm run db:reset`
- **Build Errors**: `rm -rf .next && npm run build`

### Getting Help
- Check the [PROJECT_MANIFEST.md](./PROJECT_MANIFEST.md) for implementation details
- Review the [README.md](./README.md) for comprehensive documentation
- Create issues on GitHub for bugs or feature requests

## 📝 Backup Information

A backup snapshot was created before pushing to GitHub:
- **File**: `unlimited-agentic-ai-backup-20250903-005348.tar.gz`
- **Location**: `/home/z/`
- **Size**: ~341MB
- **Contents**: Complete project snapshot

### Recovery Instructions
```bash
# Extract backup
tar -xzf unlimited-agentic-ai-backup-20250903-005348.tar.gz
cd my-project

# Restore dependencies
npm install

# Restart development server
npm run dev
```

## 🚀 Ready to Use

The system is now ready for immediate use! You can:
1. Interact with the AI agent through the web interface
2. Execute various tools and commands
3. Monitor performance and learning progress
4. Extend the system with new capabilities
5. Deploy to production environments

Enjoy building with your Unlimited Agentic AI System! 🎉