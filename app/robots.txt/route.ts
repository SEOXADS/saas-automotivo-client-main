import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const subdomain = getTenantSubdomain(request)
    
    if (!subdomain) {
      console.warn('No tenant subdomain found, using default robots.txt')
      return getDefaultRobotsTxt()
    }

    const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api')
      .replace('localhost', '127.0.0.1')
    
    const apiUrl = baseUrl.endsWith('/') 
      ? `${baseUrl}tenant/robots-txt/preview`
      : `${baseUrl}/tenant/robots-txt/preview`
    
    console.log("FETCHING URL:", apiUrl)
    
    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',  // FIX 3: Expect JSON response
        'X-Tenant-Subdomain': subdomain,  // Pass tenant info via header
      },
      cache: 'no-store',  // Disable cache for debugging (change later)
    })

    console.log("Response status:", response.status)

    if (response.ok) {
      const data = await response.json()
      
      if (data.success && data.content) {
        console.log("Got content from backend:", data.content.substring(0, 50) + "...")
        
        return new NextResponse(data.content, {
          status: 200,
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'public, max-age=3600, s-maxage=3600',
          },
        })
      }
    }

    console.warn(`Backend returned ${response.status} for robots.txt`)
    return getDefaultRobotsTxt()

  } catch (error) {
    console.error('Error fetching robots.txt from backend:', error)
    return getDefaultRobotsTxt()
  }
}

function getTenantSubdomain(request: NextRequest): string | null {
  const host = request.headers.get('host') || ''
  const parts = host.split('.')
  
  if (parts.length >= 4) {
    const subdomain = parts[0]
    if (subdomain !== 'www' && subdomain !== 'api' && subdomain !== 'admin') {
      return subdomain
    }
  }
  
  const envSubdomain = process.env.TENANT_SUBDOMAIN
  if (envSubdomain) {
    return envSubdomain
  }
  
  if (host.includes('localhost')) {
    return process.env.DEV_TENANT_SUBDOMAIN || 'omegaveiculos'
  }

  return null
}

function getDefaultRobotsTxt(): NextResponse {
  const defaultContent = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /_next/
Disallow: /settings/
Disallow: /dashboard/

# Sitemap
Sitemap: ${process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'}/sitemap.xml
`

  return new NextResponse(defaultContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
