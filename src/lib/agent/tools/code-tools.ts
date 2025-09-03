import { AgentTool } from '../types';

export const codeTools: AgentTool[] = [
  {
    id: 'code_generate',
    name: 'Generate Code',
    description: 'Generate code in various programming languages',
    category: 'code',
    parameters: {
      language: { type: 'string', description: 'Programming language' },
      requirements: { type: 'string', description: 'Code requirements or description' },
      framework: { type: 'string', description: 'Framework (optional)', optional: true },
      style: { type: 'string', description: 'Code style preferences', optional: true },
    },
    execute: async (params) => {
      try {
        const ZAI = await import('z-ai-web-dev-sdk');
        const zai = await ZAI.create();
        
        const prompt = `
          Generate ${params.language} code that meets the following requirements:
          ${params.requirements}
          
          ${params.framework ? `Framework: ${params.framework}` : ''}
          ${params.style ? `Style: ${params.style}` : ''}
          
          Provide clean, well-commented, and production-ready code.
        `;
        
        const completion = await zai.chat.completions.create({
          messages: [{ role: 'system', content: prompt }],
          temperature: 0.3,
        });
        
        return {
          success: true,
          language: params.language,
          code: completion.choices[0].message.content,
          requirements: params.requirements,
        };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },
  },
  {
    id: 'code_analyze',
    name: 'Analyze Code',
    description: 'Analyze code for issues, patterns, and improvements',
    category: 'code',
    parameters: {
      code: { type: 'string', description: 'Code to analyze' },
      language: { type: 'string', description: 'Programming language' },
      focus: { type: 'string', description: 'Analysis focus (performance, security, style, etc.)', optional: true },
    },
    execute: async (params) => {
      try {
        const ZAI = await import('z-ai-web-dev-sdk');
        const zai = await ZAI.create();
        
        const prompt = `
          Analyze the following ${params.language} code:
          ${params.code}
          
          ${params.focus ? `Focus on: ${params.focus}` : 'Provide comprehensive analysis'}
          
          Include:
          - Code quality assessment
          - Potential issues or bugs
          - Performance considerations
          - Security concerns
          - Improvement suggestions
          - Best practices recommendations
        `;
        
        const completion = await zai.chat.completions.create({
          messages: [{ role: 'system', content: prompt }],
          temperature: 0.3,
        });
        
        return {
          success: true,
          language: params.language,
          analysis: completion.choices[0].message.content,
          focus: params.focus,
        };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },
  },
  {
    id: 'code_debug',
    name: 'Debug Code',
    description: 'Help debug and fix code issues',
    category: 'code',
    parameters: {
      code: { type: 'string', description: 'Code with issues' },
      error: { type: 'string', description: 'Error message or description of the problem' },
      language: { type: 'string', description: 'Programming language' },
    },
    execute: async (params) => {
      try {
        const ZAI = await import('z-ai-web-dev-sdk');
        const zai = await ZAI.create();
        
        const prompt = `
          Help debug the following ${params.language} code:
          
          Code:
          ${params.code}
          
          Error/Problem:
          ${params.error}
          
          Provide:
          1. Root cause analysis
          2. Step-by-step debugging approach
          3. Fixed code
          4. Prevention strategies
        `;
        
        const completion = await zai.chat.completions.create({
          messages: [{ role: 'system', content: prompt }],
          temperature: 0.3,
        });
        
        return {
          success: true,
          language: params.language,
          debugInfo: completion.choices[0].message.content,
          error: params.error,
        };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },
  },
  {
    id: 'code_refactor',
    name: 'Refactor Code',
    description: 'Refactor code to improve structure and maintainability',
    category: 'code',
    parameters: {
      code: { type: 'string', description: 'Code to refactor' },
      language: { type: 'string', description: 'Programming language' },
      goals: { type: 'string', description: 'Refactoring goals', optional: true },
    },
    execute: async (params) => {
      try {
        const ZAI = await import('z-ai-web-dev-sdk');
        const zai = await ZAI.create();
        
        const prompt = `
          Refactor the following ${params.language} code:
          ${params.code}
          
          ${params.goals ? `Goals: ${params.goals}` : 'Improve code structure, readability, and maintainability'}
          
          Provide:
          1. Analysis of current code issues
          2. Refactored code
          3. Explanation of changes made
          4. Benefits of the refactoring
        `;
        
        const completion = await zai.chat.completions.create({
          messages: [{ role: 'system', content: prompt }],
          temperature: 0.3,
        });
        
        return {
          success: true,
          language: params.language,
          refactoredCode: completion.choices[0].message.content,
          goals: params.goals,
        };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },
  },
  {
    id: 'code_document',
    name: 'Generate Documentation',
    description: 'Generate documentation for code',
    category: 'code',
    parameters: {
      code: { type: 'string', description: 'Code to document' },
      language: { type: 'string', description: 'Programming language' },
      style: { type: 'string', description: 'Documentation style (JSDoc, etc.)', optional: true },
    },
    execute: async (params) => {
      try {
        const ZAI = await import('z-ai-web-dev-sdk');
        const zai = await ZAI.create();
        
        const prompt = `
          Generate comprehensive documentation for the following ${params.language} code:
          ${params.code}
          
          ${params.style ? `Documentation style: ${params.style}` : 'Use appropriate documentation style'}
          
          Include:
          - Function/class descriptions
          - Parameter documentation
          - Return value documentation
          - Usage examples
          - Important notes or warnings
        `;
        
        const completion = await zai.chat.completions.create({
          messages: [{ role: 'system', content: prompt }],
          temperature: 0.3,
        });
        
        return {
          success: true,
          language: params.language,
          documentation: completion.choices[0].message.content,
          style: params.style,
        };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },
  },
  {
    id: 'code_optimize',
    name: 'Optimize Code',
    description: 'Optimize code for better performance',
    category: 'code',
    parameters: {
      code: { type: 'string', description: 'Code to optimize' },
      language: { type: 'string', description: 'Programming language' },
      target: { type: 'string', description: 'Optimization target (speed, memory, etc.)', optional: true },
    },
    execute: async (params) => {
      try {
        const ZAI = await import('z-ai-web-dev-sdk');
        const zai = await ZAI.create();
        
        const prompt = `
          Optimize the following ${params.language} code for better performance:
          ${params.code}
          
          ${params.target ? `Optimization target: ${params.target}` : 'Optimize for general performance'}
          
          Provide:
          1. Performance analysis
          2. Optimized code
          3. Explanation of optimizations
          4. Expected performance improvements
        `;
        
        const completion = await zai.chat.completions.create({
          messages: [{ role: 'system', content: prompt }],
          temperature: 0.3,
        });
        
        return {
          success: true,
          language: params.language,
          optimizedCode: completion.choices[0].message.content,
          target: params.target,
        };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },
  },
  {
    id: 'code_translate',
    name: 'Translate Code',
    description: 'Translate code from one programming language to another',
    category: 'code',
    parameters: {
      code: { type: 'string', description: 'Code to translate' },
      fromLanguage: { type: 'string', description: 'Source language' },
      toLanguage: { type: 'string', description: 'Target language' },
    },
    execute: async (params) => {
      try {
        const ZAI = await import('z-ai-web-dev-sdk');
        const zai = await ZAI.create();
        
        const prompt = `
          Translate the following ${params.fromLanguage} code to ${params.toLanguage}:
          ${params.code}
          
          Provide:
          1. Translated code
          2. Explanation of key differences and adaptations
          3. Any language-specific considerations
        `;
        
        const completion = await zai.chat.completions.create({
          messages: [{ role: 'system', content: prompt }],
          temperature: 0.3,
        });
        
        return {
          success: true,
          fromLanguage: params.fromLanguage,
          toLanguage: params.toLanguage,
          translatedCode: completion.choices[0].message.content,
        };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },
  },
];