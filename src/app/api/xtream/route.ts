import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, params } = body;
    
    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }
    
    console.log('Proxying request to:', url);
    console.log('With params:', params);
    
    const response = await axios.get(url, { params });
    
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Proxy error:', error);
    
    const status = error.response?.status || 500;
    const errorMessage = error.response?.data || error.message || 'Unknown error';
    
    return NextResponse.json(
      { error: errorMessage },
      { status }
    );
  }
}