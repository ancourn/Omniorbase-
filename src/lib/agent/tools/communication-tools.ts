import { AgentTool } from '../types';

export const communicationTools: AgentTool[] = [
  {
    id: 'comm_email',
    name: 'Send Email',
    description: 'Send email messages',
    category: 'communication',
    parameters: {
      to: { type: 'string', description: 'Recipient email address' },
      subject: { type: 'string', description: 'Email subject' },
      body: { type: 'string', description: 'Email body' },
      cc: { type: 'string', description: 'CC recipients (comma-separated)', optional: true },
      bcc: { type: 'string', description: 'BCC recipients (comma-separated)', optional: true },
      attachments: { type: 'array', description: 'List of file paths to attach', optional: true },
    },
    safetyCheck: (params) => {
      if (!params.to || !params.subject || !params.body) {
        return false;
      }
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(params.to);
    },
    execute: async (params) => {
      try {
        // This is a placeholder implementation
        // In a real implementation, you would use nodemailer or similar
        
        return {
          success: true,
          to: params.to,
          subject: params.subject,
          message: 'Email would be sent here (placeholder implementation)',
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        return {
          success: false,
          to: params.to,
          error: error.message,
        };
      }
    },
  },
  {
    id: 'comm_slack',
    name: 'Send Slack Message',
    description: 'Send messages to Slack channels',
    category: 'communication',
    parameters: {
      channel: { type: 'string', description: 'Slack channel name or ID' },
      message: { type: 'string', description: 'Message to send' },
      webhook: { type: 'string', description: 'Slack webhook URL', optional: true },
      attachments: { type: 'array', description: 'Message attachments', optional: true },
    },
    safetyCheck: (params) => {
      if (!params.channel || !params.message) {
        return false;
      }
      return true;
    },
    execute: async (params) => {
      try {
        // This is a placeholder implementation
        // In a real implementation, you would use @slack/web-api
        
        return {
          success: true,
          channel: params.channel,
          message: params.message,
          timestamp: new Date().toISOString(),
          note: 'Slack message would be sent here (placeholder implementation)',
        };
      } catch (error) {
        return {
          success: false,
          channel: params.channel,
          error: error.message,
        };
      }
    },
  },
  {
    id: 'comm_webhook',
    name: 'Send Webhook',
    description: 'Send data to webhook endpoints',
    category: 'communication',
    parameters: {
      url: { type: 'string', description: 'Webhook URL' },
      method: { type: 'string', description: 'HTTP method (default: POST)', optional: true },
      data: { type: 'object', description: 'Data to send' },
      headers: { type: 'object', description: 'Additional headers', optional: true },
    },
    safetyCheck: (params) => {
      if (!params.url || !params.data) {
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
        const fetch = (await import('node-fetch')).default;
        
        const options: any = {
          method: params.method || 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...params.headers,
          },
          body: JSON.stringify(params.data),
        };
        
        const response = await fetch(params.url, options);
        const result = await response.text();
        
        return {
          success: true,
          url: params.url,
          method: params.method || 'POST',
          status: response.status,
          response: result,
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        return {
          success: false,
          url: params.url,
          error: error.message,
        };
      }
    },
  },
  {
    id: 'comm_sms',
    name: 'Send SMS',
    description: 'Send SMS messages',
    category: 'communication',
    parameters: {
      to: { type: 'string', description: 'Recipient phone number' },
      message: { type: 'string', description: 'SMS message' },
      provider: { type: 'string', description: 'SMS provider (twilio, aws-sns)', optional: true },
    },
    safetyCheck: (params) => {
      if (!params.to || !params.message) {
        return false;
      }
      // Basic phone number validation
      const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
      return phoneRegex.test(params.to) && params.message.length <= 160;
    },
    execute: async (params) => {
      try {
        // This is a placeholder implementation
        // In a real implementation, you would use Twilio or AWS SNS SDK
        
        return {
          success: true,
          to: params.to,
          message: params.message,
          provider: params.provider || 'twilio',
          timestamp: new Date().toISOString(),
          note: 'SMS would be sent here (placeholder implementation)',
        };
      } catch (error) {
        return {
          success: false,
          to: params.to,
          error: error.message,
        };
      }
    },
  },
  {
    id: 'comm_discord',
    name: 'Send Discord Message',
    description: 'Send messages to Discord channels',
    category: 'communication',
    parameters: {
      webhook: { type: 'string', description: 'Discord webhook URL' },
      message: { type: 'string', description: 'Message to send' },
      username: { type: 'string', description: 'Bot username', optional: true },
      avatar: { type: 'string', description: 'Bot avatar URL', optional: true },
      embeds: { type: 'array', description: 'Message embeds', optional: true },
    },
    safetyCheck: (params) => {
      if (!params.webhook || !params.message) {
        return false;
      }
      try {
        new URL(params.webhook);
        return true;
      } catch {
        return false;
      }
    },
    execute: async (params) => {
      try {
        const fetch = (await import('node-fetch')).default;
        
        const payload: any = {
          content: params.message,
        };
        
        if (params.username) {
          payload.username = params.username;
        }
        
        if (params.avatar) {
          payload.avatar_url = params.avatar;
        }
        
        if (params.embeds) {
          payload.embeds = params.embeds;
        }
        
        const response = await fetch(params.webhook, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
        
        const result = await response.text();
        
        return {
          success: response.ok,
          webhook: params.webhook,
          message: params.message,
          status: response.status,
          response: result,
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        return {
          success: false,
          webhook: params.webhook,
          error: error.message,
        };
      }
    },
  },
  {
    id: 'comm_telegram',
    name: 'Send Telegram Message',
    description: 'Send messages via Telegram Bot API',
    category: 'communication',
    parameters: {
      token: { type: 'string', description: 'Bot token' },
      chat_id: { type: 'string', description: 'Chat ID' },
      message: { type: 'string', description: 'Message to send' },
      parse_mode: { type: 'string', description: 'Parse mode (HTML, Markdown)', optional: true },
    },
    safetyCheck: (params) => {
      if (!params.token || !params.chat_id || !params.message) {
        return false;
      }
      return true;
    },
    execute: async (params) => {
      try {
        const fetch = (await import('node-fetch')).default;
        
        const url = `https://api.telegram.org/bot${params.token}/sendMessage`;
        
        const payload: any = {
          chat_id: params.chat_id,
          text: params.message,
        };
        
        if (params.parse_mode) {
          payload.parse_mode = params.parse_mode;
        }
        
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
        
        const result = await response.json();
        
        return {
          success: result.ok,
          chat_id: params.chat_id,
          message: params.message,
          message_id: result.result?.message_id,
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        return {
          success: false,
          chat_id: params.chat_id,
          error: error.message,
        };
      }
    },
  },
  {
    id: 'comm_api',
    name: 'API Communication',
    description: 'Make API calls to external services',
    category: 'communication',
    parameters: {
      url: { type: 'string', description: 'API endpoint URL' },
      method: { type: 'string', description: 'HTTP method' },
      headers: { type: 'object', description: 'Request headers', optional: true },
      body: { type: 'object', description: 'Request body', optional: true },
      auth: { type: 'object', description: 'Authentication configuration', optional: true },
    },
    safetyCheck: (params) => {
      if (!params.url || !params.method) {
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
        const fetch = (await import('node-fetch')).default;
        
        const options: any = {
          method: params.method,
          headers: {
            'Content-Type': 'application/json',
            ...params.headers,
          },
        };
        
        if (params.body) {
          options.body = JSON.stringify(params.body);
        }
        
        if (params.auth) {
          if (params.auth.type === 'bearer') {
            options.headers.Authorization = `Bearer ${params.auth.token}`;
          } else if (params.auth.type === 'basic') {
            const credentials = Buffer.from(`${params.auth.username}:${params.auth.password}`).toString('base64');
            options.headers.Authorization = `Basic ${credentials}`;
          }
        }
        
        const response = await fetch(params.url, options);
        const contentType = response.headers.get('content-type');
        
        let data;
        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
        } else {
          data = await response.text();
        }
        
        return {
          success: response.ok,
          url: params.url,
          method: params.method,
          status: response.status,
          statusText: response.statusText,
          data,
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        return {
          success: false,
          url: params.url,
          error: error.message,
        };
      }
    },
  },
];