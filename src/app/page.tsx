'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Loader2, Send, Bot, User, Settings, Brain, Activity, Zap } from 'lucide-react';
import { AgentEngine } from '@/lib/agent/agent-engine';
import { allTools } from '@/lib/agent/tools';
import { LearningEngine } from '@/lib/agent/learning';
import { AgentConfig } from '@/lib/agent/types';

export default function Home() {
  const [messages, setMessages] = useState<Array<{role: string; content: string; timestamp: Date}>>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [agentState, setAgentState] = useState<any>(null);
  const [learningMetrics, setLearningMetrics] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const agentRef = useRef<AgentEngine | null>(null);
  const learningRef = useRef<LearningEngine | null>(null);

  useEffect(() => {
    // Initialize agent
    const config: AgentConfig = {
      name: 'Unlimited Agentic AI',
      description: 'An advanced AI agent with comprehensive capabilities',
      capabilities: [
        'Natural Language Processing',
        'Code Generation & Analysis',
        'File Operations',
        'Web Search & Scraping',
        'System Administration',
        'Deployment Management',
        'Communication',
        'Learning & Adaptation'
      ],
      safetyLevel: 'medium',
      learningEnabled: true,
      maxMemorySize: 1000,
      tools: allTools,
    };

    agentRef.current = new AgentEngine(config);
    learningRef.current = new LearningEngine();
    
    // Add welcome message
    setMessages([{
      role: 'assistant',
      content: 'Hello! I\'m your Unlimited Agentic AI assistant. I have comprehensive capabilities including file operations, web search, code generation, system administration, deployment management, and communication. How can I help you today?',
      timestamp: new Date(),
    }]);

    // Update agent state periodically
    const interval = setInterval(() => {
      if (agentRef.current) {
        setAgentState(agentRef.current.getState());
        if (learningRef.current) {
          setLearningMetrics(learningRef.current.getPerformanceMetrics());
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !agentRef.current) return;

    const userMessage = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await agentRef.current.processMessage(input);
      
      const assistantMessage = {
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Update learning
      if (learningRef.current && agentRef.current) {
        const state = agentRef.current.getState();
        const lastDecision = state.decisions[state.decisions.length - 1];
        if (lastDecision) {
          await learningRef.current.learnFromInteraction(
            userMessage,
            assistantMessage,
            lastDecision,
            state
          );
        }
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `I apologize, but I encountered an error: ${error.message}`,
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getToolCategoryColor = (category: string) => {
    const colors = {
      file: 'bg-blue-100 text-blue-800',
      web: 'bg-green-100 text-green-800',
      code: 'bg-purple-100 text-purple-800',
      system: 'bg-red-100 text-red-800',
      deployment: 'bg-yellow-100 text-yellow-800',
      communication: 'bg-indigo-100 text-indigo-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto p-4 max-w-7xl">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-xl opacity-75"></div>
              <Avatar className="relative border-2 border-white dark:border-slate-800">
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold">
                  <Brain className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Unlimited Agentic AI
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Advanced AI with comprehensive capabilities and adaptive learning
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Chat Interface */}
          <div className="lg:col-span-3">
            <Card className="h-[600px] flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Bot className="h-5 w-5" />
                      Agent Interface
                    </CardTitle>
                    <CardDescription>
                      Interact with your AI assistant
                    </CardDescription>
                  </div>
                  {agentState && (
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {agentState.performance.totalInteractions} interactions
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {Math.round(agentState.performance.learningProgress * 100)}% learned
                      </Badge>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col p-0">
                <ScrollArea className="flex-1 px-4 py-3">
                  <div className="space-y-4">
                    {messages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex gap-3 ${
                          message.role === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        {message.role === 'assistant' && (
                          <Avatar className="h-8 w-8 flex-shrink-0">
                            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                              <Bot className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div
                          className={`max-w-[80%] rounded-lg px-4 py-2 ${
                            message.role === 'user'
                              ? 'bg-blue-500 text-white'
                              : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                          <div
                            className={`text-xs mt-1 ${
                              message.role === 'user' ? 'text-blue-100' : 'text-slate-500'
                            }`}
                          >
                            {formatTime(message.timestamp)}
                          </div>
                        </div>
                        {message.role === 'user' && (
                          <Avatar className="h-8 w-8 flex-shrink-0">
                            <AvatarFallback className="bg-slate-200 dark:bg-slate-700">
                              <User className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex gap-3 justify-start">
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                            <Bot className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
                <div className="border-t border-slate-200 dark:border-slate-700 p-4">
                  <form onSubmit={handleSubmit} className="flex gap-2">
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Type your message..."
                      disabled={isLoading}
                      className="flex-1"
                    />
                    <Button type="submit" disabled={isLoading || !input.trim()}>
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Agent Status */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Activity className="h-4 w-4" />
                  Agent Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {agentState && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Interactions</span>
                      <Badge variant="secondary">{agentState.performance.totalInteractions}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Success Rate</span>
                      <Badge variant="secondary">
                        {agentState.performance.totalInteractions > 0
                          ? Math.round((agentState.performance.successfulActions / agentState.performance.totalInteractions) * 100)
                          : 0}%
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Avg Response</span>
                      <Badge variant="secondary">
                        {Math.round(agentState.performance.averageResponseTime)}ms
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Learning</span>
                      <Badge variant="secondary">
                        {Math.round(agentState.performance.learningProgress * 100)}%
                      </Badge>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Available Tools */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Zap className="h-4 w-4" />
                  Available Tools
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Array.from(new Set(allTools.map(tool => tool.category))).map(category => (
                    <div key={category} className="flex items-center justify-between">
                      <Badge className={getToolCategoryColor(category)}>
                        {category}
                      </Badge>
                      <span className="text-xs text-slate-500">
                        {allTools.filter(tool => tool.category === category).length}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Learning Metrics */}
            {learningMetrics && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Brain className="h-4 w-4" />
                    Learning Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Total Learned</span>
                    <Badge variant="secondary">{learningMetrics.totalInteractions}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Avg Confidence</span>
                    <Badge variant="secondary">
                      {Math.round(learningMetrics.averageConfidence * 100)}%
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Success Rate</span>
                    <Badge variant="secondary">
                      {Math.round(learningMetrics.successRate * 100)}%
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}