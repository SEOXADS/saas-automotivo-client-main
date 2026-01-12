interface PlaceholderLogoProps {
  text: string
  width?: number
  height?: number
  className?: string
  alt?: string
}

export default function PlaceholderLogo({
  text,
  width = 200,
  height = 80,
  className = "img-fluid",
  alt = "Logo placeholder"
}: PlaceholderLogoProps) {
  const generateSVG = () => {
    const svgContent = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#1e40af;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#grad)" rx="8"/>
        <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${Math.max(12, Math.floor(width / 15))}"
              fill="white" text-anchor="middle" dy=".3em" font-weight="600">
          ${text}
        </text>
      </svg>
    `
    return `data:image/svg+xml;base64,${btoa(svgContent)}`
  }

  return (
    <img
      src={generateSVG()}
      alt={alt}
      className={className}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        objectFit: 'contain'
      }}
    />
  )
}
