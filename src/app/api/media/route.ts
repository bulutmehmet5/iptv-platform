import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl.searchParams.get('url');
    
    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }
    
    console.log('Proxying media request to:', url);
    
    const response = await axios.get(url, {
      responseType: 'stream',
    });
    
    // Create a readable stream from the response
    const stream = response.data;
    
    // Get content type from response headers
    const contentType = response.headers['content-type'] || 'application/octet-stream';
    const contentLength = response.headers['content-length'];
    
    // Create headers for the response
    const headers = new Headers();
    headers.set('Content-Type', contentType);
    
    if (contentLength) {
      headers.set('Content-Length', contentLength);
    }
    
    // Add CORS headers
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type');
    
    // Return the stream as the response
    return new NextResponse(stream, {
      headers,
      status: 200,
    });
  } catch (error: any) {
    console.error('Media proxy error:', error);
    
    const status = error.response?.status || 500;
    const errorMessage = error.response?.data || error.message || 'Unknown error';
    
    return NextResponse.json(
      { error: errorMessage },
      { status }
    );
  }
}