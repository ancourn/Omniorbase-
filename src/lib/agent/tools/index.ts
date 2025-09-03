import { fileTools } from './file-tools';
import { webTools } from './web-tools';
import { codeTools } from './code-tools';
import { systemTools } from './system-tools';
import { deploymentTools } from './deployment-tools';
import { communicationTools } from './communication-tools';

export const allTools = [
  ...fileTools,
  ...webTools,
  ...codeTools,
  ...systemTools,
  ...deploymentTools,
  ...communicationTools,
];

export const getToolsByCategory = (category: string) => {
  return allTools.filter(tool => tool.category === category);
};

export const getToolById = (id: string) => {
  return allTools.find(tool => tool.id === id);
};

export const getToolCategories = () => {
  const categories = [...new Set(allTools.map(tool => tool.category))];
  return categories;
};