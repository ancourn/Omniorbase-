import { AgentState, AgentMessage, AgentDecision, AgentMemory, AgentTool, AgentConfig } from './types';
import { v4 as uuidv4 } from 'uuid';

export class AgentEngine {
  private state: AgentState;
  private tools: Map<string, AgentTool> = new Map();

  constructor(config: AgentConfig) {
    this.state = {
      config,
      messages: [],
      memory: [],
      decisions: [],
      performance: {
        totalInteractions: 0,
        successfulActions: 0,
        averageResponseTime: 0,
        learningProgress: 0,
      },
    };

    // Initialize tools
    config.tools.forEach(tool => {
      this.tools.set(tool.id, tool);
    });
  }

  async processMessage(message: string): Promise<string> {
    const startTime = Date.now();
    
    // Add user message to history
    const userMessage: AgentMessage = {
      id: uuidv4(),
      role: 'user',
      content: message,
      timestamp: new Date(),
    };
    this.state.messages.push(userMessage);

    // Analyze and make decision
    const decision = await this.makeDecision(message);
    this.state.decisions.push(decision);

    // Execute decision
    let response: string;
    try {
      switch (decision.type) {
        case 'tool_execution':
          response = await this.executeTool(decision.action);
          break;
        case 'response_generation':
          response = await this.generateResponse(message);
          break;
        case 'planning':
          response = await this.createPlan(message);
          break;
        case 'learning':
          response = await this.learnFromInteraction(message);
          break;
        default:
          response = await this.generateResponse(message);
      }

      // Update performance metrics
      const responseTime = Date.now() - startTime;
      this.updatePerformance(responseTime, true);

      // Add assistant message to history
      const assistantMessage: AgentMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        metadata: { decisionId: decision.id, responseTime },
      };
      this.state.messages.push(assistantMessage);

      // Store in memory
      this.storeMemory({
        id: uuidv4(),
        type: 'conversation',
        content: { userMessage, assistantMessage, decision },
        timestamp: new Date(),
      });

      return response;
    } catch (error) {
      this.updatePerformance(Date.now() - startTime, false);
      return `I encountered an error: ${error.message}`;
    }
  }

  private async makeDecision(message: string): Promise<AgentDecision> {
    const context = this.getContext();
    
    // Analyze message intent
    const intent = await this.analyzeIntent(message, context);
    
    // Determine best action
    const action = await this.determineBestAction(intent, context);
    
    return {
      id: uuidv4(),
      type: action.type,
      confidence: action.confidence,
      reasoning: action.reasoning,
      action: action.action,
      timestamp: new Date(),
    };
  }

  private async analyzeIntent(message: string, context: any): Promise<any> {
    // Use AI to analyze message intent
    const prompt = `
      Analyze the following user message and determine their intent:
      Message: "${message}"
      Context: ${JSON.stringify(context)}
      
      Return a JSON object with:
      - intent: primary intent (e.g., "file_operation", "web_search", "code_generation", "system_command", "deployment", "communication")
      - entities: extracted entities or parameters
      - urgency: low/medium/high
      - complexity: simple/medium/complex
    `;

    try {
      const ZAI = await import('z-ai-web-dev-sdk');
      const zai = await ZAI.create();
      const completion = await zai.chat.completions.create({
        messages: [{ role: 'system', content: prompt }],
        temperature: 0.3,
      });
      
      return JSON.parse(completion.choices[0].message.content);
    } catch (error) {
      // Fallback to basic intent analysis
      return {
        intent: 'response_generation',
        entities: {},
        urgency: 'medium',
        complexity: 'simple',
      };
    }
  }

  private async determineBestAction(intent: any, context: any): Promise<any> {
    const { intent: primaryIntent, entities, urgency, complexity } = intent;
    
    // Find relevant tools
    const relevantTools = Array.from(this.tools.values()).filter(
      tool => tool.category === primaryIntent.replace('_operation', '').replace('_search', '').replace('_generation', '')
    );

    if (relevantTools.length > 0 && this.state.config.safetyLevel !== 'high') {
      return {
        type: 'tool_execution',
        confidence: 0.8,
        reasoning: `Found ${relevantTools.length} relevant tools for intent: ${primaryIntent}`,
        action: { toolId: relevantTools[0].id, parameters: entities },
      };
    }

    if (complexity === 'complex' && this.state.config.learningEnabled) {
      return {
        type: 'planning',
        confidence: 0.7,
        reasoning: 'Complex request requires planning',
        action: { intent, entities },
      };
    }

    return {
      type: 'response_generation',
      confidence: 0.6,
      reasoning: 'Default response generation',
      action: { message: context.messages[context.messages.length - 1]?.content || '' },
    };
  }

  private async executeTool(action: any): Promise<string> {
    const { toolId, parameters } = action;
    const tool = this.tools.get(toolId);
    
    if (!tool) {
      return `Tool not found: ${toolId}`;
    }

    // Safety check
    if (tool.safetyCheck && !tool.safetyCheck(parameters)) {
      return `Safety check failed for tool: ${tool.name}`;
    }

    try {
      const result = await tool.execute(parameters);
      
      // Store tool result in memory
      this.storeMemory({
        id: uuidv4(),
        type: 'tool_result',
        content: { toolId, parameters, result },
        timestamp: new Date(),
      });

      return `Successfully executed ${tool.name}. Result: ${JSON.stringify(result, null, 2)}`;
    } catch (error) {
      return `Error executing ${tool.name}: ${error.message}`;
    }
  }

  private async generateResponse(message: string): Promise<string> {
    const context = this.getContext();
    
    try {
      const ZAI = await import('z-ai-web-dev-sdk');
      const zai = await ZAI.create();
      
      const systemPrompt = `
        You are an advanced AI assistant with comprehensive capabilities.
        Context: ${JSON.stringify(context)}
        
        Provide a helpful, accurate, and detailed response to the user's message.
        If you need to use tools, mention that explicitly.
      `;

      const completion = await zai.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message },
        ],
        temperature: 0.7,
      });

      return completion.choices[0].message.content;
    } catch (error) {
      return `I understand your message: "${message}". However, I'm having trouble generating a response right now. Please try again.`;
    }
  }

  private async createPlan(message: string): Promise<string> {
    return `I'll create a plan to handle your complex request: "${message}"\n\nThis requires multiple steps. Let me break it down:\n1. Analyze requirements\n2. Identify necessary tools\n3. Execute step-by-step\n4. Validate results\n\nWould you like me to proceed with this plan?`;
  }

  private async learnFromInteraction(message: string): Promise<string> {
    // Implement learning logic here
    this.state.performance.learningProgress += 0.1;
    
    this.storeMemory({
      id: uuidv4(),
      type: 'learning',
      content: { message, timestamp: new Date() },
      timestamp: new Date(),
    });

    return `I'm learning from this interaction to better serve you in the future.`;
  }

  private getContext(): any {
    return {
      recentMessages: this.state.messages.slice(-10),
      memory: this.state.memory.slice(-20),
      performance: this.state.performance,
      availableTools: Array.from(this.tools.keys()),
    };
  }

  private storeMemory(memory: AgentMemory): void {
    this.state.memory.push(memory);
    
    // Maintain memory size limit
    if (this.state.memory.length > this.state.config.maxMemorySize) {
      this.state.memory = this.state.memory.slice(-this.state.config.maxMemorySize);
    }
  }

  private updatePerformance(responseTime: number, successful: boolean): void {
    this.state.performance.totalInteractions++;
    if (successful) {
      this.state.performance.successfulActions++;
    }
    
    // Update average response time
    const currentAvg = this.state.performance.averageResponseTime;
    const total = this.state.performance.totalInteractions;
    this.state.performance.averageResponseTime = (currentAvg * (total - 1) + responseTime) / total;
  }

  getState(): AgentState {
    return { ...this.state };
  }

  addTool(tool: AgentTool): void {
    this.tools.set(tool.id, tool);
    this.state.config.tools.push(tool);
  }

  removeTool(toolId: string): void {
    this.tools.delete(toolId);
    this.state.config.tools = this.state.config.tools.filter(t => t.id !== toolId);
  }

  getTools(): AgentTool[] {
    return Array.from(this.tools.values());
  }

  clearMemory(): void {
    this.state.memory = [];
  }

  exportState(): string {
    return JSON.stringify(this.state, null, 2);
  }

  importState(stateJson: string): void {
    try {
      const importedState = JSON.parse(stateJson);
      this.state = importedState;
      
      // Rebuild tools map
      this.tools.clear();
      importedState.config.tools.forEach((tool: AgentTool) => {
        this.tools.set(tool.id, tool);
      });
    } catch (error) {
      throw new Error('Invalid state format');
    }
  }
}