# MCP Integration Setup Guide

This document explains how Sequential MCP and Magic MCP have been integrated into the Ferrow application.

## Overview

Ferrow now includes two powerful MCP (Model Context Protocol) servers:

1. **Sequential Thinking MCP** - Enhanced reasoning and problem-solving capabilities
2. **Magic MCP** - AI-powered UI component generation (free tier)

## What's Implemented

### Sequential Thinking MCP
- **Purpose**: Provides structured, step-by-step analysis for complex crypto automation rules
- **Package**: `@modelcontextprotocol/server-sequential-thinking`
- **Features**:
  - Break down complex user requests into logical steps
  - Risk analysis for crypto transactions
  - Multi-stage reasoning (exploration, analysis, synthesis, conclusion)
  - Intelligent recommendations based on sequential thoughts

### Magic MCP (Free Tier)
- **Purpose**: AI-powered UI component generation for React/TypeScript
- **Package**: `@smithery/cli`
- **Features**:
  - Generate React components from natural language descriptions
  - Crypto-specific component templates
  - Logo and icon search functionality
  - 100 free generations per month
  - Tailwind CSS styling integration

## Implementation Details

### File Structure
```
src/lib/mcp/
├── index.ts                 # MCP service manager and aggregator
├── sequential-thinking.ts   # Sequential thinking service implementation
└── magic-ui.ts             # Magic UI service implementation

src/app/api/mcp/
├── chat/route.ts           # API endpoint for chat processing with MCP
└── ui/route.ts             # API endpoint for UI generation

mcp-config.json             # MCP server configuration for Claude Desktop
```

### Key Components

#### 1. MCP Service Manager (`src/lib/mcp/index.ts`)
- Aggregates both MCP services
- Processes chat messages with enhanced reasoning
- Determines when to trigger UI generation
- Provides contextual responses with metadata

#### 2. Enhanced ChatComposer (`src/components/ChatComposer.tsx`)
- Brain icon toggle for MCP features
- Context-aware suggestions when MCP is enabled
- Integration with MCP processing pipeline
- Fallback to regular chat if MCP fails

#### 3. API Endpoints
- **`/api/mcp/chat`**: Process messages with sequential thinking
- **`/api/mcp/ui`**: Generate UI components and search logos
- **`GET /api/mcp/chat`**: Check MCP service status

## Usage Examples

### Sequential Thinking Analysis
```bash
curl -X POST http://localhost:3000/api/mcp/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Send $100 USDC to Alice when ETH price goes above $2500"}'
```

Response includes:
- Structured breakdown of the request
- Risk analysis and considerations
- Suggested implementation approach
- Alternative strategies

### UI Component Generation
```bash
curl -X POST http://localhost:3000/api/mcp/ui \
  -H "Content-Type: application/json" \
  -d '{"description": "Generate a wallet connect button", "type": "wallet-connect"}'
```

Response includes:
- Generated React/TypeScript component code
- Tailwind CSS styling
- Usage statistics for free tier tracking

### Service Status Check
```bash
curl -X GET http://localhost:3000/api/mcp/chat
```

Returns current status of both MCP services and usage statistics.

## Configuration

### Environment Variables
```env
# Optional: Magic MCP API key for enhanced features
MAGIC_API_KEY=your_api_key_here

# Optional: Disable thought logging for Sequential MCP
DISABLE_THOUGHT_LOGGING=false

# Optional: Set max history size for Sequential MCP  
MAX_HISTORY_SIZE=1000
```

### Claude Desktop Configuration
To use these MCP servers with Claude Desktop, add to your configuration:

```json
{
  "mcpServers": {
    "sequential-thinking": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-sequential-thinking"],
      "env": {
        "DISABLE_THOUGHT_LOGGING": "false",
        "MAX_HISTORY_SIZE": "1000"
      }
    },
    "magic-mcp": {
      "command": "npx", 
      "args": ["-y", "@smithery/cli", "magic-mcp"],
      "env": {
        "MAGIC_API_KEY": ""
      }
    }
  }
}
```

## User Interface Features

### MCP Toggle
- Click the brain icon (🧠) in the chat composer to toggle MCP features
- When enabled, see enhanced suggestions and reasoning capabilities
- Visual indicators show when MCP processing is active

### Enhanced Suggestions
When MCP is enabled, the chat composer shows context-aware suggestions:
- "Analyze: Send $100 USDC when ETH price drops 10%"
- "Generate a transaction status component"
- "Create rule: DCA $50 into ETH weekly"
- "Design a portfolio balance card"

### Component Generation
- Request UI components using natural language
- Examples:
  - "Generate a crypto wallet connect button component"
  - "Create a price chart widget"
  - "Design a transaction form with validation"

## Free Tier Limitations

### Magic MCP Free Tier
- **Limit**: 100 component generations per month
- **Features**: Full access to all generation capabilities
- **Tracking**: Usage statistics available via API
- **Reset**: Monthly cycle

### Sequential Thinking
- **Limit**: None (open source)
- **Features**: Full reasoning and analysis capabilities
- **Performance**: Local processing, no API limits

## Benefits for Ferrow

### Enhanced User Experience
1. **Intelligent Rule Analysis**: Break down complex automation requests
2. **Risk Assessment**: Automatic identification of potential issues
3. **UI Generation**: Rapid prototyping of new interface components
4. **Context Awareness**: Smarter responses based on user intent

### Developer Productivity
1. **Component Templates**: Generate boilerplate code for common patterns
2. **Reasoning Documentation**: Structured thought processes for complex logic
3. **Error Prevention**: Analysis identifies potential issues before implementation
4. **Rapid Iteration**: Quick UI mockups and component generation

## Monitoring and Debugging

### Service Status
Check MCP service health:
```bash
curl http://localhost:3000/api/mcp/chat
```

### Usage Tracking
Monitor Magic MCP usage:
```bash
curl http://localhost:3000/api/mcp/ui
```

### Logging
- Sequential thinking processes are logged with detailed step information
- UI generation attempts are tracked with success/failure metrics
- All MCP requests include error handling and fallback mechanisms

## Future Enhancements

### Planned Features
1. **Custom Component Templates**: Ferrow-specific component library
2. **Advanced Rule Analysis**: Integration with market data for real-time analysis
3. **UI Theme Integration**: Automatic application of Ferrow design system
4. **Performance Optimization**: Caching and request optimization

### Upgrade Paths
1. **Magic MCP Pro**: Unlimited generations and advanced features
2. **Custom MCP Servers**: Domain-specific reasoning for crypto operations
3. **Enhanced Integration**: Deeper integration with Ferrow's automation engine

## Troubleshooting

### Common Issues

1. **MCP Services Not Starting**
   - Check Node.js version (requires 18+)
   - Verify package installation: `npm list @modelcontextprotocol/server-sequential-thinking`

2. **UI Generation Failing**
   - Verify network connectivity
   - Check usage limits haven't been exceeded
   - Review error logs in browser console

3. **Sequential Thinking Errors**
   - Check session management (sessions expire after inactivity)
   - Verify thought processing pipeline
   - Review console logs for detailed error information

### Support
- Check console logs for detailed error information
- Test individual MCP endpoints using curl commands above
- Verify environment variables are properly set

## Security Considerations

1. **API Keys**: Store Magic MCP API keys securely in environment variables
2. **Input Validation**: All user inputs are validated before MCP processing
3. **Error Handling**: Graceful degradation when MCP services are unavailable
4. **Rate Limiting**: Respect free tier limits to avoid service interruption

This integration provides Ferrow with cutting-edge AI capabilities while maintaining the reliability and security standards expected in a crypto automation platform.