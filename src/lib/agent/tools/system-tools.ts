import { AgentTool } from '../types';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as os from 'os';

const execAsync = promisify(exec);

export const systemTools: AgentTool[] = [
  {
    id: 'system_execute',
    name: 'Execute Command',
    description: 'Execute system commands',
    category: 'system',
    parameters: {
      command: { type: 'string', description: 'Command to execute' },
      timeout: { type: 'number', description: 'Timeout in milliseconds (default: 30000)', optional: true },
      cwd: { type: 'string', description: 'Working directory', optional: true },
    },
    safetyCheck: (params) => {
      if (!params.command || typeof params.command !== 'string') {
        return false;
      }
      // Prevent dangerous commands
      const dangerousPatterns = [
        /^rm\s+-rf\s+\//,
        /^dd\s+if=/,
        /^mkfs\./,
        /^fdisk/,
        /^format/,
        /^del\s+[A-Z]:\\/,
        /^rmdir\/s\/q/,
        /^shutdown/,
        /^reboot/,
        /^halt/,
        /^passwd/,
        /^su\s+/,
        /^sudo\s+/,
        /^chmod\s+777/,
        /^chown\s+root/,
      ];
      return !dangerousPatterns.some(pattern => pattern.test(params.command.trim()));
    },
    execute: async (params) => {
      try {
        const timeout = params.timeout || 30000;
        const options: any = { timeout };
        
        if (params.cwd) {
          options.cwd = params.cwd;
        }
        
        const { stdout, stderr } = await execAsync(params.command, options);
        
        return {
          success: true,
          command: params.command,
          stdout,
          stderr: stderr || null,
          exitCode: 0,
        };
      } catch (error) {
        return {
          success: false,
          command: params.command,
          error: error.message,
          exitCode: error.code || -1,
          stderr: error.stderr || null,
        };
      }
    },
  },
  {
    id: 'system_info',
    name: 'System Information',
    description: 'Get system information',
    category: 'system',
    parameters: {
      type: { type: 'string', description: 'Type of info (os, memory, cpu, disk, network, all)', optional: true },
    },
    execute: async (params) => {
      try {
        const type = params.type || 'all';
        const info: any = {};
        
        if (type === 'all' || type === 'os') {
          info.os = {
            platform: os.platform(),
            type: os.type(),
            release: os.release(),
            hostname: os.hostname(),
            arch: os.arch(),
            uptime: os.uptime(),
          };
        }
        
        if (type === 'all' || type === 'memory') {
          const totalMem = os.totalmem();
          const freeMem = os.freemem();
          info.memory = {
            total: totalMem,
            free: freeMem,
            used: totalMem - freeMem,
            usage: ((totalMem - freeMem) / totalMem * 100).toFixed(2) + '%',
          };
        }
        
        if (type === 'all' || type === 'cpu') {
          info.cpu = {
            count: os.cpus().length,
            model: os.cpus()[0].model,
            speed: os.cpus()[0].speed,
            loadAverage: os.loadavg(),
          };
        }
        
        if (type === 'all' || type === 'disk') {
          try {
            const { stdout } = await execAsync('df -h');
            info.disk = stdout;
          } catch (error) {
            info.disk = 'Disk information not available';
          }
        }
        
        if (type === 'all' || type === 'network') {
          const networkInterfaces = os.networkInterfaces();
          info.network = {};
          
          for (const [name, addresses] of Object.entries(networkInterfaces)) {
            if (addresses) {
              info.network[name] = addresses.map(addr => ({
                address: addr.address,
                netmask: addr.netmask,
                family: addr.family,
                mac: addr.mac,
                internal: addr.internal,
              }));
            }
          }
        }
        
        return {
          success: true,
          type,
          info,
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },
  },
  {
    id: 'system_process',
    name: 'Process Management',
    description: 'Manage system processes',
    category: 'system',
    parameters: {
      action: { type: 'string', description: 'Action (list, kill, info)' },
      pid: { type: 'number', description: 'Process ID (for kill/info)', optional: true },
      filter: { type: 'string', description: 'Filter processes by name', optional: true },
    },
    safetyCheck: (params) => {
      if (!params.action || !['list', 'kill', 'info'].includes(params.action)) {
        return false;
      }
      // Prevent killing critical system processes
      if (params.action === 'kill' && params.pid) {
        const criticalPids = [1, 2]; // init/systemd processes
        return !criticalPids.includes(params.pid);
      }
      return true;
    },
    execute: async (params) => {
      try {
        switch (params.action) {
          case 'list':
            const { stdout } = await execAsync('ps aux');
            const processes = stdout.split('\n').slice(1).filter(line => line.trim());
            
            let filteredProcesses = processes;
            if (params.filter) {
              filteredProcesses = processes.filter(line => 
                line.toLowerCase().includes(params.filter.toLowerCase())
              );
            }
            
            return {
              success: true,
              action: 'list',
              processes: filteredProcesses.slice(0, 50), // Limit to 50 processes
              total: filteredProcesses.length,
            };
            
          case 'kill':
            if (!params.pid) {
              return { success: false, error: 'PID is required for kill action' };
            }
            
            try {
              await execAsync(`kill ${params.pid}`);
              return {
                success: true,
                action: 'kill',
                pid: params.pid,
                message: `Process ${params.pid} terminated`,
              };
            } catch (error) {
              return {
                success: false,
                action: 'kill',
                pid: params.pid,
                error: `Failed to kill process ${params.pid}: ${error.message}`,
              };
            }
            
          case 'info':
            if (!params.pid) {
              return { success: false, error: 'PID is required for info action' };
            }
            
            try {
              const { stdout } = await execAsync(`ps -p ${params.pid} -o pid,ppid,cmd,%mem,%cpu,etime`);
              return {
                success: true,
                action: 'info',
                pid: params.pid,
                info: stdout,
              };
            } catch (error) {
              return {
                success: false,
                action: 'info',
                pid: params.pid,
                error: `Process ${params.pid} not found or access denied`,
              };
            }
            
          default:
            return { success: false, error: 'Invalid action' };
        }
      } catch (error) {
        return { success: false, error: error.message };
      }
    },
  },
  {
    id: 'system_filesystem',
    name: 'Filesystem Operations',
    description: 'Perform filesystem operations',
    category: 'system',
    parameters: {
      action: { type: 'string', description: 'Action (disk_usage, mount_points, file_types)' },
      path: { type: 'string', description: 'Path for disk usage', optional: true },
    },
    execute: async (params) => {
      try {
        switch (params.action) {
          case 'disk_usage':
            const path = params.path || '.';
            const { stdout: duOutput } = await execAsync(`du -sh "${path}"`);
            return {
              success: true,
              action: 'disk_usage',
              path,
              usage: duOutput.trim(),
            };
            
          case 'mount_points':
            const { stdout: mountOutput } = await execAsync('mount -t proc,sysfs,tmpfs,devtmpfs');
            return {
              success: true,
              action: 'mount_points',
              mountPoints: mountOutput.split('\n').filter(line => line.trim()),
            };
            
          case 'file_types':
            const { stdout: typeOutput } = await execAsync('find / -type f -name "*.conf" -o -name "*.config" -o -name "*.ini" -o -name "*.yaml" -o -name "*.yml" -o -name "*.json" 2>/dev/null | head -20');
            return {
              success: true,
              action: 'file_types',
              configFiles: typeOutput.split('\n').filter(line => line.trim()),
            };
            
          default:
            return { success: false, error: 'Invalid action' };
        }
      } catch (error) {
        return { success: false, error: error.message };
      }
    },
  },
  {
    id: 'system_monitor',
    name: 'System Monitor',
    description: 'Monitor system resources',
    category: 'system',
    parameters: {
      metric: { type: 'string', description: 'Metric to monitor (cpu, memory, disk, network)', optional: true },
      interval: { type: 'number', description: 'Monitoring interval in seconds (default: 1)', optional: true },
      duration: { type: 'number', description: 'Monitoring duration in seconds (default: 10)', optional: true },
    },
    execute: async (params) => {
      try {
        const metric = params.metric || 'cpu';
        const interval = params.interval || 1;
        const duration = params.duration || 10;
        const samples = Math.floor(duration / interval);
        
        const results = [];
        
        for (let i = 0; i < samples; i++) {
          const timestamp = new Date().toISOString();
          let value;
          
          switch (metric) {
            case 'cpu':
              const { stdout: cpuOutput } = await execAsync("top -bn1 | grep 'Cpu(s)' | awk '{print $2}' | cut -d'%' -f1");
              value = parseFloat(cpuOutput) || 0;
              break;
              
            case 'memory':
              const { stdout: memOutput } = await execAsync("free | grep Mem | awk '{printf \"%.2f\", $3/$2 * 100.0}'");
              value = parseFloat(memOutput) || 0;
              break;
              
            case 'disk':
              const { stdout: diskOutput } = await execAsync("df -h / | tail -1 | awk '{print $5}' | cut -d'%' -f1");
              value = parseFloat(diskOutput) || 0;
              break;
              
            case 'network':
              const { stdout: netOutput } = await execAsync("cat /proc/net/dev | grep eth0 | awk '{print $2,$10}'");
              const [rx, tx] = netOutput.trim().split(' ');
              value = { rx: parseInt(rx) || 0, tx: parseInt(tx) || 0 };
              break;
              
            default:
              value = 0;
          }
          
          results.push({ timestamp, value });
          
          if (i < samples - 1) {
            await new Promise(resolve => setTimeout(resolve, interval * 1000));
          }
        }
        
        return {
          success: true,
          metric,
          interval,
          duration,
          samples: results.length,
          results,
        };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },
  },
];