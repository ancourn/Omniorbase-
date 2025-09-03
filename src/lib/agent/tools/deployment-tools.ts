import { AgentTool } from '../types';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export const deploymentTools: AgentTool[] = [
  {
    id: 'deploy_docker',
    name: 'Docker Deployment',
    description: 'Deploy applications using Docker',
    category: 'deployment',
    parameters: {
      action: { type: 'string', description: 'Action (build, run, push, stop, remove)' },
      imageName: { type: 'string', description: 'Docker image name' },
      dockerfile: { type: 'string', description: 'Dockerfile path (for build)', optional: true },
      context: { type: 'string', description: 'Build context path', optional: true },
      ports: { type: 'string', description: 'Port mapping (e.g., "8080:80")', optional: true },
      environment: { type: 'object', description: 'Environment variables', optional: true },
    },
    safetyCheck: (params) => {
      if (!params.action || !params.imageName) {
        return false;
      }
      const validActions = ['build', 'run', 'push', 'stop', 'remove'];
      return validActions.includes(params.action);
    },
    execute: async (params) => {
      try {
        let command;
        
        switch (params.action) {
          case 'build':
            command = `docker build`;
            if (params.dockerfile) {
              command += ` -f ${params.dockerfile}`;
            }
            if (params.context) {
              command += ` ${params.context}`;
            } else {
              command += ' .';
            }
            command += ` -t ${params.imageName}`;
            break;
            
          case 'run':
            command = `docker run -d`;
            if (params.ports) {
              command += ` -p ${params.ports}`;
            }
            if (params.environment) {
              Object.entries(params.environment).forEach(([key, value]) => {
                command += ` -e ${key}="${value}"`;
              });
            }
            command += ` ${params.imageName}`;
            break;
            
          case 'push':
            command = `docker push ${params.imageName}`;
            break;
            
          case 'stop':
            command = `docker stop ${params.imageName}`;
            break;
            
          case 'remove':
            command = `docker rmi ${params.imageName}`;
            break;
        }
        
        const { stdout, stderr } = await execAsync(command);
        
        return {
          success: true,
          action: params.action,
          imageName: params.imageName,
          output: stdout,
          error: stderr || null,
        };
      } catch (error) {
        return {
          success: false,
          action: params.action,
          imageName: params.imageName,
          error: error.message,
        };
      }
    },
  },
  {
    id: 'deploy_kubernetes',
    name: 'Kubernetes Deployment',
    description: 'Deploy applications to Kubernetes',
    category: 'deployment',
    parameters: {
      action: { type: 'string', description: 'Action (apply, delete, get, describe)' },
      manifest: { type: 'string', description: 'Kubernetes manifest file or YAML content' },
      namespace: { type: 'string', description: 'Kubernetes namespace', optional: true },
      resource: { type: 'string', description: 'Resource type/name (for get/describe)', optional: true },
    },
    safetyCheck: (params) => {
      if (!params.action || !params.manifest) {
        return false;
      }
      const validActions = ['apply', 'delete', 'get', 'describe'];
      return validActions.includes(params.action);
    },
    execute: async (params) => {
      try {
        const fs = await import('fs').then(m => m.promises);
        
        let command = 'kubectl';
        
        if (params.namespace) {
          command += ` -n ${params.namespace}`;
        }
        
        switch (params.action) {
          case 'apply':
          case 'delete':
            // Check if manifest is a file path or YAML content
            let manifestPath = params.manifest;
            if (!params.manifest.endsWith('.yaml') && !params.manifest.endsWith('.yml')) {
              // Write YAML content to temporary file
              manifestPath = '/tmp/k8s-manifest.yaml';
              await fs.writeFile(manifestPath, params.manifest);
            }
            command += ` ${params.action} -f ${manifestPath}`;
            break;
            
          case 'get':
          case 'describe':
            command += ` ${params.action}`;
            if (params.resource) {
              command += ` ${params.resource}`;
            }
            break;
        }
        
        const { stdout, stderr } = await execAsync(command);
        
        return {
          success: true,
          action: params.action,
          manifest: params.manifest,
          namespace: params.namespace,
          output: stdout,
          error: stderr || null,
        };
      } catch (error) {
        return {
          success: false,
          action: params.action,
          manifest: params.manifest,
          error: error.message,
        };
      }
    },
  },
  {
    id: 'deploy_serverless',
    name: 'Serverless Deployment',
    description: 'Deploy serverless functions',
    category: 'deployment',
    parameters: {
      platform: { type: 'string', description: 'Platform (aws-lambda, google-functions, azure-functions)' },
      action: { type: 'string', description: 'Action (deploy, invoke, logs, remove)' },
      functionName: { type: 'string', description: 'Function name' },
      code: { type: 'string', description: 'Function code or file path' },
      runtime: { type: 'string', description: 'Runtime environment', optional: true },
      handler: { type: 'string', description: 'Function handler', optional: true },
    },
    safetyCheck: (params) => {
      if (!params.platform || !params.action || !params.functionName || !params.code) {
        return false;
      }
      const validPlatforms = ['aws-lambda', 'google-functions', 'azure-functions'];
      const validActions = ['deploy', 'invoke', 'logs', 'remove'];
      return validPlatforms.includes(params.platform) && validActions.includes(params.action);
    },
    execute: async (params) => {
      try {
        // This is a placeholder implementation
        // In a real implementation, you would use the respective cloud SDKs
        
        return {
          success: true,
          platform: params.platform,
          action: params.action,
          functionName: params.functionName,
          message: `Serverless ${params.action} would be executed here for ${params.platform}`,
        };
      } catch (error) {
        return {
          success: false,
          platform: params.platform,
          action: params.action,
          functionName: params.functionName,
          error: error.message,
        };
      }
    },
  },
  {
    id: 'deploy_git',
    name: 'Git Deployment',
    description: 'Deploy using Git operations',
    category: 'deployment',
    parameters: {
      action: { type: 'string', description: 'Action (clone, push, pull, checkout)' },
      repository: { type: 'string', description: 'Git repository URL' },
      branch: { type: 'string', description: 'Branch name', optional: true },
      directory: { type: 'string', description: 'Target directory', optional: true },
      message: { type: 'string', description: 'Commit message (for push)', optional: true },
    },
    safetyCheck: (params) => {
      if (!params.action || !params.repository) {
        return false;
      }
      const validActions = ['clone', 'push', 'pull', 'checkout'];
      return validActions.includes(params.action);
    },
    execute: async (params) => {
      try {
        const { exec } = await import('child_process');
        const { promisify } = await import('util');
        const execAsync = promisify(exec);
        
        let command = 'git';
        
        switch (params.action) {
          case 'clone':
            command += ` clone ${params.repository}`;
            if (params.directory) {
              command += ` ${params.directory}`;
            }
            break;
            
          case 'push':
            command += ` push origin ${params.branch || 'main'}`;
            break;
            
          case 'pull':
            command += ` pull origin ${params.branch || 'main'}`;
            break;
            
          case 'checkout':
            command += ` checkout ${params.branch || 'main'}`;
            break;
        }
        
        const { stdout, stderr } = await execAsync(command);
        
        return {
          success: true,
          action: params.action,
          repository: params.repository,
          branch: params.branch,
          output: stdout,
          error: stderr || null,
        };
      } catch (error) {
        return {
          success: false,
          action: params.action,
          repository: params.repository,
          error: error.message,
        };
      }
    },
  },
  {
    id: 'deploy_monitor',
    name: 'Deployment Monitoring',
    description: 'Monitor deployment status and health',
    category: 'deployment',
    parameters: {
      type: { type: 'string', description: 'Monitoring type (docker, kubernetes, health)' },
      target: { type: 'string', description: 'Target to monitor (container name, service name, URL)' },
      interval: { type: 'number', description: 'Check interval in seconds (default: 30)', optional: true },
      duration: { type: 'number', description: 'Monitoring duration in seconds (default: 300)', optional: true },
    },
    execute: async (params) => {
      try {
        const interval = params.interval || 30;
        const duration = params.duration || 300;
        const samples = Math.floor(duration / interval);
        
        const results = [];
        
        for (let i = 0; i < samples; i++) {
          const timestamp = new Date().toISOString();
          let status;
          let metrics;
          
          switch (params.type) {
            case 'docker':
              const { exec } = await import('child_process');
              const { promisify } = await import('util');
              const execAsync = promisify(exec);
              
              try {
                const { stdout } = await execAsync(`docker inspect --format='{{.State.Status}}' ${params.target}`);
                status = stdout.trim();
                
                const { stdout: statsOutput } = await execAsync(`docker stats ${params.target} --no-stream --format "{{.CPUPerc}},{{.MemUsage}}"`);
                const [cpu, mem] = statsOutput.trim().split(',');
                metrics = { cpu, mem };
              } catch (error) {
                status = 'error';
                metrics = { error: error.message };
              }
              break;
              
            case 'kubernetes':
              // Placeholder for Kubernetes monitoring
              status = 'running';
              metrics = { pods: 3, cpu: '50m', memory: '128Mi' };
              break;
              
            case 'health':
              const fetch = (await import('node-fetch')).default;
              try {
                const response = await fetch(params.target);
                status = response.ok ? 'healthy' : 'unhealthy';
                metrics = {
                  statusCode: response.status,
                  responseTime: Date.now(),
                };
              } catch (error) {
                status = 'unreachable';
                metrics = { error: error.message };
              }
              break;
          }
          
          results.push({ timestamp, status, metrics });
          
          if (i < samples - 1) {
            await new Promise(resolve => setTimeout(resolve, interval * 1000));
          }
        }
        
        return {
          success: true,
          type: params.type,
          target: params.target,
          interval,
          duration,
          samples: results.length,
          results,
        };
      } catch (error) {
        return {
          success: false,
          type: params.type,
          target: params.target,
          error: error.message,
        };
      }
    },
  },
];