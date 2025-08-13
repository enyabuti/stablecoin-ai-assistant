# Claude Code + Roo Code Collaboration Guide

This guide explains how to effectively use both Claude Code and Roo Code together for maximum productivity on the Ferrow project.

## Overview

**Claude Code (Terminal-based)**: Best for system-level operations, deployment, testing, and complex analysis
**Roo Code (VS Code Extension)**: Best for in-editor coding, real-time assistance, and IDE-integrated workflows

## Complementary Strengths

### Claude Code Excels At:
- **System Operations**: Git operations, deployment, server management
- **Testing & Validation**: Running test suites, API testing, build verification
- **Architecture & Planning**: High-level system design, documentation creation
- **Complex Analysis**: Sequential thinking, structured problem-solving
- **Environment Setup**: Package installation, configuration, environment variables
- **Database Operations**: Migrations, seeding, schema updates
- **API Integration**: External service setup, webhook configuration

### Roo Code Excels At:
- **Real-time Coding**: Live code completion and suggestions
- **In-context Editing**: Making precise changes while viewing code
- **Quick Fixes**: Immediate bug fixes and optimizations
- **Component Development**: Building UI components interactively
- **Code Refactoring**: Restructuring code with IDE context
- **Debugging Assistance**: Interactive debugging and troubleshooting

## Recommended Workflow

### 1. Project Planning & Architecture (Claude Code)
```bash
# Use Claude Code for:
- System architecture planning
- Environment setup
- Package installation
- Initial project structure
- Documentation creation
```

### 2. Active Development (Roo Code)
```typescript
// Use Roo Code for:
- Writing component code
- Implementing business logic  
- Real-time code assistance
- Debugging and fixes
- Code completion and suggestions
```

### 3. Testing & Deployment (Claude Code)
```bash
# Use Claude Code for:
- Running test suites
- Build verification
- Deployment operations
- API testing
- Performance analysis
```

## Handoff Scenarios

### From Claude Code to Roo Code

**When Claude Code completes:**
- Architecture planning
- Environment setup
- Package installation
- Test structure creation
- Documentation

**Hand off to Roo Code for:**
- Detailed component implementation
- Business logic coding
- UI/UX development
- Real-time coding assistance

### From Roo Code to Claude Code

**When Roo Code completes:**
- Component development
- Feature implementation
- Bug fixes
- Code optimizations

**Hand off to Claude Code for:**
- Testing the changes
- Deployment preparation
- System integration
- Documentation updates

## Current Project Status

### What Claude Code Has Set Up:
✅ **Authentication System**: NextAuth with email magic links
✅ **MCP Integration**: Sequential Thinking + Magic UI services  
✅ **Test Infrastructure**: Vitest + React Testing Library
✅ **API Endpoints**: Chat processing, UI generation, rule parsing
✅ **Development Environment**: Local server running at http://localhost:3000
✅ **Database**: Prisma + Supabase configuration
✅ **Email Service**: Resend integration for magic links

### Ready for Roo Code Development:
🎯 **Component Enhancement**: Improve existing UI components
🎯 **Feature Implementation**: Add new automation rules functionality
🎯 **UI/UX Improvements**: Polish the chat interface and dashboard
🎯 **Business Logic**: Implement complex rule validation and execution
🎯 **Error Handling**: Add better error states and user feedback
🎯 **Performance**: Optimize component rendering and API calls

## Collaboration Commands

### Claude Code Preparation Commands
```bash
# Status check for Roo Code
npm run dev                    # Start development server
npm run test:unit              # Verify tests pass
npm run lint                   # Check code quality
npm run type-check             # Verify TypeScript types
git status                     # Check current changes
```

### Information for Roo Code Context
```typescript
// Current tech stack:
- Next.js 14 with App Router
- TypeScript + Tailwind CSS
- NextAuth.js for authentication  
- Prisma + Supabase for database
- MCP servers for AI enhancement
- Vitest + React Testing Library for testing

// Key directories:
- src/app/              # Next.js app router pages
- src/components/       # Reusable UI components  
- src/lib/             # Utilities and services
- src/lib/mcp/         # MCP service integration
- tests/               # Test files
```

## Communication Protocol

### When to Use Each Tool:

**Use Claude Code for:**
- "Run the test suite"
- "Deploy to production" 
- "Set up a new service"
- "Install dependencies"
- "Create documentation"
- "Analyze system architecture"

**Use Roo Code for:**
- "Fix this bug in the component"
- "Add a new feature to this file"
- "Optimize this function"
- "Help me write this component"
- "Debug this TypeScript error"
- "Refactor this code"

### Context Sharing:

**Claude Code provides to Roo Code:**
- System status and health
- Test results and coverage
- Architecture decisions
- Configuration details
- Deployment status

**Roo Code provides to Claude Code:**
- Code changes and new features
- Bug reports and fixes
- Implementation details
- Performance concerns
- Testing needs

## Best Practices

### 1. Clear Handoffs
Always communicate what has been completed and what needs to be done next.

### 2. Maintain Documentation
Keep this collaboration guide and project documentation updated.

### 3. Use Git Effectively
```bash
# Claude Code: Create descriptive commits
git add .
git commit -m "feat: Add MCP integration with Sequential Thinking and Magic UI"

# Roo Code: Work on feature branches for complex changes
git checkout -b feature/enhanced-chat-ui
```

### 4. Test Before Handoff
Always verify that the system is in a working state before handing off.

### 5. Share Context
Provide relevant information about current state, recent changes, and immediate goals.

## Current Development Priority

Based on the current state, here's what Roo Code should focus on next:

### High Priority:
1. **Chat Interface Enhancement**: Improve the MCP-enabled chat experience
2. **Rule Creation Flow**: Build intuitive rule creation components
3. **Dashboard Polish**: Enhance the main dashboard UI
4. **Error Handling**: Add better error states and loading indicators

### Medium Priority:
1. **Component Library**: Build reusable crypto-specific components
2. **Animation & Transitions**: Add smooth interactions
3. **Mobile Responsiveness**: Optimize for mobile devices
4. **Performance**: Optimize rendering and API calls

### Low Priority:
1. **Advanced Features**: Complex automation scenarios
2. **Analytics**: Detailed usage tracking
3. **Integrations**: Additional wallet providers
4. **Themes**: Dark/light mode variations

## Quick Start for Roo Code

1. **Open VS Code** in the project directory
2. **Start development server** (Claude Code has it running at http://localhost:3000)
3. **Check current status** in browser
4. **Begin development** on priority items above
5. **Use MCP features** by clicking the brain icon (🧠) in chat

The project is ready for collaborative development! 🚀