import { AgentTool } from '../types';
import { promises as fs } from 'fs';
import path from 'path';

export const fileTools: AgentTool[] = [
  {
    id: 'file_read',
    name: 'Read File',
    description: 'Read the contents of a file',
    category: 'file',
    parameters: {
      filepath: { type: 'string', description: 'Absolute path to the file' },
      encoding: { type: 'string', description: 'File encoding (default: utf8)', optional: true },
    },
    safetyCheck: (params) => {
      if (!params.filepath || typeof params.filepath !== 'string') {
        return false;
      }
      // Basic security check - prevent reading sensitive files
      const sensitivePatterns = [
        /\/etc\/passwd/,
        /\/etc\/shadow/,
        /\.env$/,
        /private.*key/i,
        /secret/i,
      ];
      return !sensitivePatterns.some(pattern => pattern.test(params.filepath));
    },
    execute: async (params) => {
      try {
        const encoding = params.encoding || 'utf8';
        const content = await fs.readFile(params.filepath, encoding);
        return { success: true, content, encoding };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },
  },
  {
    id: 'file_write',
    name: 'Write File',
    description: 'Write content to a file',
    category: 'file',
    parameters: {
      filepath: { type: 'string', description: 'Absolute path to the file' },
      content: { type: 'string', description: 'Content to write' },
      encoding: { type: 'string', description: 'File encoding (default: utf8)', optional: true },
      mode: { type: 'string', description: 'Write mode: overwrite or append', optional: true },
    },
    safetyCheck: (params) => {
      if (!params.filepath || !params.content) {
        return false;
      }
      // Prevent writing to system files
      const systemPaths = [
        '/etc/',
        '/usr/',
        '/bin/',
        '/sbin/',
        '/boot/',
        '/lib/',
        '/proc/',
        '/sys/',
      ];
      return !systemPaths.some(sysPath => params.filepath.startsWith(sysPath));
    },
    execute: async (params) => {
      try {
        const encoding = params.encoding || 'utf8';
        const mode = params.mode || 'overwrite';
        
        // Ensure directory exists
        const dir = path.dirname(params.filepath);
        await fs.mkdir(dir, { recursive: true });
        
        if (mode === 'append') {
          await fs.appendFile(params.filepath, params.content, encoding);
        } else {
          await fs.writeFile(params.filepath, params.content, encoding);
        }
        
        return { success: true, filepath: params.filepath, mode };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },
  },
  {
    id: 'file_list',
    name: 'List Directory',
    description: 'List files and directories in a path',
    category: 'file',
    parameters: {
      path: { type: 'string', description: 'Directory path to list' },
      recursive: { type: 'boolean', description: 'List recursively', optional: true },
      pattern: { type: 'string', description: 'File pattern to match', optional: true },
    },
    safetyCheck: (params) => {
      if (!params.path || typeof params.path !== 'string') {
        return false;
      }
      // Basic security check
      return !params.path.includes('..') && !params.path.startsWith('/etc');
    },
    execute: async (params) => {
      try {
        const recursive = params.recursive || false;
        const pattern = params.pattern || '*';
        
        if (recursive) {
          const files = [];
          const walkDir = async (dir) => {
            const items = await fs.readdir(dir, { withFileTypes: true });
            for (const item of items) {
              const fullPath = path.join(dir, item.name);
              if (item.isDirectory()) {
                await walkDir(fullPath);
              } else {
                if (pattern === '*' || item.name.includes(pattern)) {
                  files.push(fullPath);
                }
              }
            }
          };
          await walkDir(params.path);
          return { success: true, files, count: files.length };
        } else {
          const items = await fs.readdir(params.path, { withFileTypes: true });
          const result = items.map(item => ({
            name: item.name,
            path: path.join(params.path, item.name),
            isDirectory: item.isDirectory(),
            isFile: item.isFile(),
          }));
          return { success: true, items: result, count: result.length };
        }
      } catch (error) {
        return { success: false, error: error.message };
      }
    },
  },
  {
    id: 'file_delete',
    name: 'Delete File',
    description: 'Delete a file or directory',
    category: 'file',
    parameters: {
      path: { type: 'string', description: 'Path to delete' },
      recursive: { type: 'boolean', description: 'Delete directory recursively', optional: true },
    },
    safetyCheck: (params) => {
      if (!params.path || typeof params.path !== 'string') {
        return false;
      }
      // Prevent deletion of system files
      const protectedPaths = [
        '/',
        '/etc',
        '/usr',
        '/bin',
        '/sbin',
        '/boot',
        '/lib',
        '/proc',
        '/sys',
        '/home',
        '/root',
      ];
      return !protectedPaths.some(protected => params.path.startsWith(protected));
    },
    execute: async (params) => {
      try {
        const stats = await fs.stat(params.path);
        if (stats.isDirectory()) {
          await fs.rm(params.path, { recursive: params.recursive || false });
        } else {
          await fs.unlink(params.path);
        }
        return { success: true, deleted: params.path };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },
  },
  {
    id: 'file_search',
    name: 'Search in Files',
    description: 'Search for text patterns in files',
    category: 'file',
    parameters: {
      path: { type: 'string', description: 'Directory to search in' },
      pattern: { type: 'string', description: 'Text pattern to search for' },
      filePattern: { type: 'string', description: 'File pattern to include', optional: true },
      caseSensitive: { type: 'boolean', description: 'Case sensitive search', optional: true },
    },
    safetyCheck: (params) => {
      if (!params.path || !params.pattern) {
        return false;
      }
      return !params.path.includes('..') && !params.path.startsWith('/etc');
    },
    execute: async (params) => {
      try {
        const results = [];
        const caseSensitive = params.caseSensitive || false;
        const filePattern = params.filePattern || '*';
        const searchPattern = caseSensitive ? params.pattern : params.pattern.toLowerCase();
        
        const searchInFile = async (filePath) => {
          try {
            const content = await fs.readFile(filePath, 'utf8');
            const searchContent = caseSensitive ? content : content.toLowerCase();
            
            const lines = content.split('\n');
            const matches = [];
            
            lines.forEach((line, index) => {
              const searchLine = caseSensitive ? line : line.toLowerCase();
              if (searchLine.includes(searchPattern)) {
                matches.push({
                  lineNumber: index + 1,
                  line: line.trim(),
                });
              }
            });
            
            if (matches.length > 0) {
              results.push({
                file: filePath,
                matches,
                matchCount: matches.length,
              });
            }
          } catch (error) {
            // Skip files that can't be read
          }
        };
        
        const searchInDir = async (dir) => {
          const items = await fs.readdir(dir, { withFileTypes: true });
          for (const item of items) {
            const fullPath = path.join(dir, item.name);
            if (item.isDirectory()) {
              await searchInDir(fullPath);
            } else if (item.isFile() && (filePattern === '*' || item.name.includes(filePattern))) {
              await searchInFile(fullPath);
            }
          }
        };
        
        await searchInDir(params.path);
        
        return {
          success: true,
          results,
          totalMatches: results.reduce((sum, r) => sum + r.matchCount, 0),
          filesSearched: results.length,
        };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },
  },
  {
    id: 'file_copy',
    name: 'Copy File',
    description: 'Copy a file or directory',
    category: 'file',
    parameters: {
      source: { type: 'string', description: 'Source path' },
      destination: { type: 'string', description: 'Destination path' },
      recursive: { type: 'boolean', description: 'Copy directory recursively', optional: true },
    },
    safetyCheck: (params) => {
      if (!params.source || !params.destination) {
        return false;
      }
      // Basic security checks
      return !params.source.includes('..') && !params.destination.includes('..');
    },
    execute: async (params) => {
      try {
        const { exec } = await import('child_process');
        const { promisify } = await import('util');
        const execAsync = promisify(exec);
        
        let command;
        if (params.recursive) {
          command = `cp -r "${params.source}" "${params.destination}"`;
        } else {
          command = `cp "${params.source}" "${params.destination}"`;
        }
        
        await execAsync(command);
        return { success: true, source: params.source, destination: params.destination };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },
  },
  {
    id: 'file_move',
    name: 'Move File',
    description: 'Move or rename a file or directory',
    category: 'file',
    parameters: {
      source: { type: 'string', description: 'Source path' },
      destination: { type: 'string', description: 'Destination path' },
    },
    safetyCheck: (params) => {
      if (!params.source || !params.destination) {
        return false;
      }
      return !params.source.includes('..') && !params.destination.includes('..');
    },
    execute: async (params) => {
      try {
        await fs.rename(params.source, params.destination);
        return { success: true, source: params.source, destination: params.destination };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },
  },
];