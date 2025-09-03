import { AgentMemory, AgentDecision, AgentMessage } from './types';

export class LearningEngine {
  private patterns: Map<string, any> = new Map();
  private performanceHistory: any[] = [];
  private adaptationRules: Map<string, any> = new Map();

  constructor() {
    this.initializePatterns();
    this.initializeAdaptationRules();
  }

  private initializePatterns(): void {
    // Initialize common patterns
    this.patterns.set('greeting', {
      patterns: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'],
      response: 'greeting',
      confidence: 0.9,
    });

    this.patterns.set('help_request', {
      patterns: ['help', 'assist', 'support', 'how do i', 'can you help'],
      response: 'help',
      confidence: 0.8,
    });

    this.patterns.set('file_operation', {
      patterns: ['read file', 'write file', 'delete file', 'create file', 'list files'],
      response: 'file',
      confidence: 0.7,
    });

    this.patterns.set('code_request', {
      patterns: ['generate code', 'write code', 'create function', 'implement', 'code'],
      response: 'code',
      confidence: 0.8,
    });

    this.patterns.set('system_command', {
      patterns: ['run command', 'execute', 'system', 'terminal', 'bash'],
      response: 'system',
      confidence: 0.7,
    });
  }

  private initializeAdaptationRules(): void {
    // Initialize adaptation rules
    this.adaptationRules.set('response_time_optimization', {
      condition: (context: any) => context.performance.averageResponseTime > 5000,
      action: 'reduce_complexity',
      priority: 1,
    });

    this.adaptationRules.set('success_rate_improvement', {
      condition: (context: any) => {
        const successRate = context.performance.successfulActions / context.performance.totalInteractions;
        return successRate < 0.8;
      },
      action: 'increase_safety_checks',
      priority: 2,
    });

    this.adaptationRules.set('memory_optimization', {
      condition: (context: any) => context.memory.length > 1000,
      action: 'cleanup_memory',
      priority: 3,
    });
  }

  async learnFromInteraction(
    message: AgentMessage,
    response: AgentMessage,
    decision: AgentDecision,
    context: any
  ): Promise<void> {
    // Extract patterns from the interaction
    const patterns = this.extractPatterns(message.content);
    
    // Update pattern recognition
    this.updatePatternRecognition(patterns, decision);
    
    // Analyze performance
    this.analyzePerformance(decision, context);
    
    // Adapt behavior based on performance
    await this.adaptBehavior(context);
    
    // Store learning insights
    this.storeLearningInsights(message, response, decision, patterns);
  }

  private extractPatterns(content: string): string[] {
    const patterns: string[] = [];
    const words = content.toLowerCase().split(/\s+/);
    
    // Extract n-grams
    for (let i = 0; i < words.length - 1; i++) {
      patterns.push(words[i] + ' ' + words[i + 1]);
    }
    
    // Extract trigrams
    for (let i = 0; i < words.length - 2; i++) {
      patterns.push(words[i] + ' ' + words[i + 1] + ' ' + words[i + 2]);
    }
    
    // Extract key phrases
    const keyPhrases = [
      'help me', 'how to', 'what is', 'can you', 'please',
      'thank you', 'i want', 'i need', 'show me', 'tell me'
    ];
    
    keyPhrases.forEach(phrase => {
      if (content.toLowerCase().includes(phrase)) {
        patterns.push(phrase);
      }
    });
    
    return patterns;
  }

  private updatePatternRecognition(patterns: string[], decision: AgentDecision): void {
    patterns.forEach(pattern => {
      if (!this.patterns.has(pattern)) {
        this.patterns.set(pattern, {
          patterns: [pattern],
          response: decision.type,
          confidence: 0.5,
          occurrences: 1,
        });
      } else {
        const patternData = this.patterns.get(pattern);
        patternData.occurrences = (patternData.occurrences || 0) + 1;
        
        // Update confidence based on successful decisions
        if (decision.confidence > 0.7) {
          patternData.confidence = Math.min(1, patternData.confidence + 0.1);
        } else {
          patternData.confidence = Math.max(0.1, patternData.confidence - 0.05);
        }
      }
    });
  }

  private analyzePerformance(decision: AgentDecision, context: any): void {
    const performance = {
      timestamp: new Date(),
      decisionType: decision.type,
      confidence: decision.confidence,
      responseTime: context.responseTime || 0,
      success: decision.confidence > 0.5,
    };
    
    this.performanceHistory.push(performance);
    
    // Keep only recent performance data
    if (this.performanceHistory.length > 1000) {
      this.performanceHistory = this.performanceHistory.slice(-1000);
    }
  }

  private async adaptBehavior(context: any): Promise<void> {
    const applicableRules = Array.from(this.adaptationRules.values())
      .filter(rule => rule.condition(context))
      .sort((a, b) => a.priority - b.priority);
    
    for (const rule of applicableRules) {
      await this.executeAdaptationRule(rule, context);
    }
  }

  private async executeAdaptationRule(rule: any, context: any): Promise<void> {
    switch (rule.action) {
      case 'reduce_complexity':
        // Reduce complexity of responses
        console.log('Adapting: Reducing response complexity');
        break;
        
      case 'increase_safety_checks':
        // Increase safety checks for tool execution
        console.log('Adapting: Increasing safety checks');
        break;
        
      case 'cleanup_memory':
        // Clean up old memories
        console.log('Adapting: Cleaning up memory');
        break;
        
      default:
        console.log(`Unknown adaptation action: ${rule.action}`);
    }
  }

  private storeLearningInsights(
    message: AgentMessage,
    response: AgentMessage,
    decision: AgentDecision,
    patterns: string[]
  ): void {
    const insight = {
      timestamp: new Date(),
      message: message.content,
      response: response.content,
      decision: decision,
      patterns: patterns,
      success: decision.confidence > 0.5,
    };
    
    // Store in memory (this would be integrated with the agent's memory system)
    console.log('Storing learning insight:', insight);
  }

  predictIntent(content: string): any {
    const patterns = this.extractPatterns(content);
    const predictions: any[] = [];
    
    patterns.forEach(pattern => {
      const patternData = this.patterns.get(pattern);
      if (patternData) {
        predictions.push({
          intent: patternData.response,
          confidence: patternData.confidence,
          pattern: pattern,
        });
      }
    });
    
    // Sort by confidence and return the best prediction
    predictions.sort((a, b) => b.confidence - a.confidence);
    
    return predictions.length > 0 ? predictions[0] : {
      intent: 'unknown',
      confidence: 0.1,
      pattern: 'none',
    };
  }

  getPerformanceMetrics(): any {
    if (this.performanceHistory.length === 0) {
      return {
        totalInteractions: 0,
        averageConfidence: 0,
        successRate: 0,
        averageResponseTime: 0,
      };
    }
    
    const totalInteractions = this.performanceHistory.length;
    const averageConfidence = this.performanceHistory.reduce((sum, p) => sum + p.confidence, 0) / totalInteractions;
    const successRate = this.performanceHistory.filter(p => p.success).length / totalInteractions;
    const averageResponseTime = this.performanceHistory.reduce((sum, p) => sum + p.responseTime, 0) / totalInteractions;
    
    return {
      totalInteractions,
      averageConfidence,
      successRate,
      averageResponseTime,
    };
  }

  getPatterns(): any[] {
    return Array.from(this.patterns.entries()).map(([key, value]) => ({
      pattern: key,
      ...value,
    }));
  }

  exportLearningData(): string {
    return JSON.stringify({
      patterns: Array.from(this.patterns.entries()),
      performanceHistory: this.performanceHistory,
      adaptationRules: Array.from(this.adaptationRules.entries()),
      timestamp: new Date().toISOString(),
    }, null, 2);
  }

  importLearningData(data: string): void {
    try {
      const imported = JSON.parse(data);
      
      if (imported.patterns) {
        this.patterns = new Map(imported.patterns);
      }
      
      if (imported.performanceHistory) {
        this.performanceHistory = imported.performanceHistory;
      }
      
      if (imported.adaptationRules) {
        this.adaptationRules = new Map(imported.adaptationRules);
      }
    } catch (error) {
      console.error('Failed to import learning data:', error);
    }
  }

  reset(): void {
    this.patterns.clear();
    this.performanceHistory = [];
    this.adaptationRules.clear();
    this.initializePatterns();
    this.initializeAdaptationRules();
  }
}