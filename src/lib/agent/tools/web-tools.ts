import { AgentTool } from '../types';
import { promises as fs } from 'fs';
import path from 'path';

export const webTools: AgentTool[] = [
  {
    id: 'web_search',
    name: 'Web Search',
    description: 'Search the web for information',
    category: 'web',
    parameters: {
      query: { type: 'string', description: 'Search query' },
      num: { type: 'number', description: 'Number of results (default: 10)', optional: true },
    },
    execute: async (params) => {
      try {
        const ZAI = await import('z-ai-web-dev-sdk');
        const zai = await ZAI.create();
        
        const searchResult = await zai.functions.invoke("web_search", {
          query: params.query,
          num: params.num || 10,
        });
        
        return {
          success: true,
          results: searchResult,
          query: params.query,
          resultCount: searchResult.length,
        };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },
  },
  {
    id: 'web_fetch',
    name: 'Fetch Web Content',
    description: 'Fetch content from a URL',
    category: 'web',
    parameters: {
      url: { type: 'string', description: 'URL to fetch' },
      method: { type: 'string', description: 'HTTP method (default: GET)', optional: true },
      headers: { type: 'object', description: 'HTTP headers', optional: true },
      body: { type: 'string', description: 'Request body', optional: true },
    },
    safetyCheck: (params) => {
      if (!params.url || typeof params.url !== 'string') {
        return false;
      }
      // Basic URL validation
      try {
        new URL(params.url);
        return true;
      } catch {
        return false;
      }
    },
    execute: async (params) => {
      try {
        const fetch = (await import('node-fetch')).default;
        
        const options: any = {
          method: params.method || 'GET',
          headers: params.headers || {},
        };
        
        if (params.body) {
          options.body = params.body;
        }
        
        const response = await fetch(params.url, options);
        const contentType = response.headers.get('content-type');
        
        let content;
        if (contentType && contentType.includes('application/json')) {
          content = await response.json();
        } else {
          content = await response.text();
        }
        
        return {
          success: true,
          url: params.url,
          status: response.status,
          statusText: response.statusText,
          contentType,
          content,
        };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },
  },
  {
    id: 'web_scrape',
    name: 'Web Scraping',
    description: 'Extract structured data from web pages',
    category: 'web',
    parameters: {
      url: { type: 'string', description: 'URL to scrape' },
      selector: { type: 'string', description: 'CSS selector to extract', optional: true },
      attribute: { type: 'string', description: 'Attribute to extract (default: text)', optional: true },
    },
    safetyCheck: (params) => {
      if (!params.url || typeof params.url !== 'string') {
        return false;
      }
      try {
        new URL(params.url);
        return true;
      } catch {
        return false;
      }
    },
    execute: async (params) => {
      try {
        // For now, return a placeholder since we don't have a scraping library
        return {
          success: true,
          message: 'Web scraping would be implemented here',
          url: params.url,
          selector: params.selector,
          attribute: params.attribute,
        };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },
  },
  {
    id: 'web_validate',
    name: 'Validate URL',
    description: 'Validate and analyze a URL',
    category: 'web',
    parameters: {
      url: { type: 'string', description: 'URL to validate' },
    },
    execute: async (params) => {
      try {
        const url = new URL(params.url);
        
        return {
          success: true,
          valid: true,
          protocol: url.protocol,
          hostname: url.hostname,
          port: url.port,
          pathname: url.pathname,
          search: url.search,
          hash: url.hash,
        };
      } catch (error) {
        return {
          success: false,
          valid: false,
          error: error.message,
        };
      }
    },
  },
  {
    id: 'web_extract_links',
    name: 'Extract Links',
    description: 'Extract all links from a web page',
    category: 'web',
    parameters: {
      url: { type: 'string', description: 'URL to extract links from' },
      filter: { type: 'string', description: 'Filter links by pattern', optional: true },
    },
    safetyCheck: (params) => {
      if (!params.url || typeof params.url !== 'string') {
        return false;
      }
      try {
        new URL(params.url);
        return true;
      } catch {
        return false;
      }
    },
    execute: async (params) => {
      try {
        // Placeholder implementation
        return {
          success: true,
          message: 'Link extraction would be implemented here',
          url: params.url,
          filter: params.filter,
          links: [],
        };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },
  },
  {
    id: 'web_download',
    name: 'Download File',
    description: 'Download a file from a URL',
    category: 'web',
    parameters: {
      url: { type: 'string', description: 'URL to download from' },
      destination: { type: 'string', description: 'Local file path to save to' },
    },
    safetyCheck: (params) => {
      if (!params.url || !params.destination) {
        return false;
      }
      try {
        new URL(params.url);
        return true;
      } catch {
        return false;
      }
    },
    execute: async (params) => {
      try {
        // Ensure directory exists
        const dir = path.dirname(params.destination);
        await fs.mkdir(dir, { recursive: true });
        
        const fetch = (await import('node-fetch')).default;
        const response = await fetch(params.url);
        const buffer = await response.buffer();
        
        await fs.writeFile(params.destination, buffer);
        
        return {
          success: true,
          url: params.url,
          destination: params.destination,
          size: buffer.length,
          contentType: response.headers.get('content-type'),
        };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },
  },
];