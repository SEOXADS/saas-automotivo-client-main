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

/*function getTenantSubdomain(request: NextRequest): string | null {
  const host = request.headers.get('host') || ''
  const parts = host.split('.')
  console.log("HOST", host);
  console.log("Parts", parts);
  
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
  
    console.log("envSubdomain", envSubdomain);
  if (host.includes('localhost')) {
    return process.env.DEV_TENANT_SUBDOMAIN || 'omegaveiculos'
  }

  return null
}
*/

function getTenantSubdomain(request: NextRequest): string | null {
  // 1. Check X-Forwarded-Host first (for reverse proxy/Docker scenarios)
  const forwardedHost = request.headers.get('x-forwarded-host');
  const host = forwardedHost || request.headers.get('host') || '';
  
  console.log("X-Forwarded-Host:", forwardedHost);
  console.log("HOST:", host);
  
  // 2. Remove port if present
  const hostWithoutPort = host.split(':')[0];
  const parts = hostWithoutPort.split('.');
  
  console.log("Parts:", parts);
  
  // 3. For .com.br domains: subdomain.domain.com.br = 4 parts
  //    For .com domains: subdomain.domain.com = 3 parts
  //    Adjust threshold based on your TLD
  const minPartsForSubdomain = hostWithoutPort.endsWith('.com.br') ? 4 : 3;
  
  if (parts.length >= minPartsForSubdomain) {
    const subdomain = parts[0].toLowerCase();
    
    // Skip reserved subdomains
    const reserved = ['www', 'api', 'admin', 'app', 'omegaveiculos'];
    
    if (!reserved.includes(subdomain)) {
      console.log("Detected subdomain:", subdomain);
      return subdomain;
    }
  }
  
  // 4. Fallback: Check custom header (useful if set by nginx/traefik)
  const tenantHeader = request.headers.get('x-tenant-subdomain');
  if (tenantHeader) {
    console.log("Using X-Tenant-Subdomain header:", tenantHeader);
    return tenantHeader;
  }
  
  // 5. Fallback: Environment variable
  const envSubdomain = process.env.TENANT_SUBDOMAIN;
  if (envSubdomain) {
    console.log("Using TENANT_SUBDOMAIN env:", envSubdomain);
    return envSubdomain;
  }
  
  // 6. Localhost fallback for development
  if (host.includes('localhost')) {
    return process.env.DEV_TENANT_SUBDOMAIN || 'omegaveiculos';
  }

  console.log("No subdomain found");
  return null;
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
