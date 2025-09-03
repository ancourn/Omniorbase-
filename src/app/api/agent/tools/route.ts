import { NextRequest, NextResponse } from 'next/server';
import { systemToolsServer } from '@/lib/agent/tools/server/system-tools-server';

export async function POST(request: NextRequest) {
  try {
    const { toolId, parameters } = await request.json();
    
    // Find the tool
    const tool = systemToolsServer.find(t => t.id === toolId);
    
    if (!tool) {
      return NextResponse.json(
        { success: false, error: 'Tool not found' },
        { status: 404 }
      );
    }
    
    // Execute safety check
    if (tool.safetyCheck && !tool.safetyCheck(parameters)) {
      return NextResponse.json(
        { success: false, error: 'Safety check failed' },
        { status: 400 }
      );
    }
    
    // Execute the tool
    const result = await tool.execute(parameters);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error executing server tool:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Return list of available server tools
  const toolsList = systemToolsServer.map(tool => ({
    id: tool.id,
    name: tool.name,
    description: tool.description,
    category: tool.category,
    parameters: tool.parameters,
  }));
  
  return NextResponse.json({
    success: true,
    tools: toolsList,
  });
}