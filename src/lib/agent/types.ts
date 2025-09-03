export interface AgentMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface AgentTool {
  id: string;
  name: string;
  description: string;
  category: 'file' | 'web' | 'code' | 'system' | 'deployment' | 'communication';
  parameters: Record<string, any>;
  execute: (params: any) => Promise<any>;
  safetyCheck?: (params: any) => boolean;
}

export interface AgentDecision {
  id: string;
  type: 'tool_execution' | 'response_generation' | 'planning' | 'learning';
  confidence: number;
  reasoning: string;
  action: any;
  timestamp: Date;
}

export interface AgentMemory {
  id: string;
  type: 'conversation' | 'tool_result' | 'learning' | 'pattern';
  content: any;
  timestamp: Date;
  relevance?: number;
}

export interface AgentConfig {
  name: string;
  description: string;
  capabilities: string[];
  safetyLevel: 'low' | 'medium' | 'high';
  learningEnabled: boolean;
  maxMemorySize: number;
  tools: AgentTool[];
}

export interface AgentState {
  config: AgentConfig;
  messages: AgentMessage[];
  memory: AgentMemory[];
  decisions: AgentDecision[];
  performance: {
    totalInteractions: number;
    successfulActions: number;
    averageResponseTime: number;
    learningProgress: number;
  };
}