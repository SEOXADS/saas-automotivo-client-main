import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Get tenant subdomain from various sources
    const subdomain = getTenantSubdomain(request)
    
    if (!subdomain) {
      console.warn('No tenant subdomain found, using default robots.txt')
      return getDefaultRobotsTxt()
    }

    // Fetch from backend
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
    const response = await fetch(
      `${backendUrl}/robots/serve?tenant=${subdomain}`,
      {
        headers: {
          'Accept': 'text/plain',
        },
        next: { revalidate: 3600 } // Cache for 1 hour
      }
    )

    if (response.ok) {
      const content = await response.text()
      return new NextResponse(content, {
        status: 200,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        },
      })
    }

    // If backend returns error, use default
    console.warn(`Backend returned ${response.status} for robots.txt`)
    return getDefaultRobotsTxt()

  } catch (error) {
    console.error('Error fetching robots.txt from backend:', error)
    return getDefaultRobotsTxt()
  }
}

/**
 * Extract tenant subdomain from request
 */
function getTenantSubdomain(request: NextRequest): string | null {
  // 1. Try from hostname (e.g., omegaveiculos.webcarros.app.br)
  const host = request.headers.get('host') || ''
  const parts = host.split('.')
  
  // For subdomains like omegaveiculos.webcarros.app.br
  if (parts.length >= 4) {
    const subdomain = parts[0]
    if (subdomain !== 'www' && subdomain !== 'api' && subdomain !== 'admin') {
      return subdomain
    }
  }
  
  // 2. Try from custom domain lookup
  // If you have custom domains like omegaveiculos.com.br
  // You'd need to add logic here or call your backend to resolve it
  
  // 3. Try from environment variable (for single-tenant deployments)
  const envSubdomain = process.env.TENANT_SUBDOMAIN
  if (envSubdomain) {
    return envSubdomain
  }
  
  // 4. For development: check for a specific tenant
  if (host.includes('localhost')) {
    // You can hardcode for dev or use env var
    return process.env.DEV_TENANT_SUBDOMAIN || 'omegaveiculos'
  }

  return null
}

/**
 * Default robots.txt fallback
 */
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
