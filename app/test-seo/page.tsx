'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import SEOWrapper from '@/components/SEOWrapper'

export default function TestSEOPage() 
{
  const pathname = usePathname();
  const [tenantId] = useState(1); // Replace with actual tenant ID

  return (
    <SEOWrapper
      tenantId={tenantId}
      defaultTitle="Página de Teste SEO - Default"
      defaultDescription="Esta é a descrição padrão que deve ser substituída pelo SEO personalizado."
    >
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            🧪 Página de Teste SEO
          </h1>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold text-blue-800 mb-2">
              URL Atual: <code className="bg-blue-100 px-2 py-1 rounded">{pathname}</code>
            </h2>
            <p className="text-blue-700">
              Configure SEO personalizado para esta URL no painel de administração.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Como Testar:</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>Vá para o painel de Configurações → SEO Personalizado</li>
              <li>Clique em "Nova Configuração"</li>
              <li>Em "URL da Página", digite: <code className="bg-gray-100 px-2 py-1 rounded">/test-seo</code></li>
              <li>Preencha o título e descrição personalizados</li>
              <li>Salve e volte para esta página</li>
              <li>Abra as Ferramentas do Desenvolvedor (F12)</li>
              <li>Vá para Elements e verifique as tags &lt;meta&gt; no &lt;head&gt;</li>
            </ol>
          </div>

          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-800 mb-2">⚡ Verificação Rápida</h3>
            <p className="text-yellow-700 mb-3">
              Abra o console do navegador (F12 → Console) para ver os logs do SEOWrapper.
            </p>
            <button
              onClick={() => {
                console.log('🔄 Recarregando página para testar SEO...');
                window.location.reload();
              }}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded font-medium"
            >
              Recarregar Página
            </button>
          </div>

          <SEODebugPanel />
        </div>
      </div>
    </SEOWrapper>
  );
}

// Component to display current SEO meta tags
function SEODebugPanel() {
  const [metaTags, setMetaTags] = useState<{name: string, content: string}[]>([]);

  useEffect(() => {
    // Read meta tags after component mounts
    const timer = setTimeout(() => {
      const metas = document.querySelectorAll('meta');
      const tags: {name: string, content: string}[] = [];
      
      metas.forEach(meta => {
        const name = meta.getAttribute('name') || meta.getAttribute('property') || '';
        const content = meta.getAttribute('content') || '';
        if (name && content) {
          tags.push({ name, content });
        }
      });
      
      // Also get title
      const title = document.querySelector('title');
      if (title) {
        tags.unshift({ name: 'title', content: title.textContent || '' });
      }
      
      setMetaTags(tags);
    }, 1000); // Wait for SEOWrapper to update

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
  console.log('🔍 Page mounted - checking meta tags...');
  
  // Check meta tags after a delay
  const timer = setTimeout(() => {
    const title = document.title;
    const metaDesc = document.querySelector('meta[name="description"]');
    
    console.log('📋 Current meta tags:', {
      title,
      description: metaDesc?.getAttribute('content'),
      time: new Date().toISOString()
    });
    
    // Force update of debug panel
    const metas = document.querySelectorAll('meta');
    const tags: {name: string, content: string}[] = [];
    
    metas.forEach(meta => {
      const name = meta.getAttribute('name') || meta.getAttribute('property') || '';
      const content = meta.getAttribute('content') || '';
      if (name && content) {
        tags.push({ name, content });
      }
    });
    
    const titleElement = document.querySelector('title');
    if (titleElement) {
      tags.unshift({ name: 'title', content: titleElement.textContent || '' });
    }
    
    console.log('📋 All meta tags found:', tags);
  }, 2000); // Give SEOWrapper time to update

  return () => clearTimeout(timer);
}, []);

  return (
    <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-4">
      <h3 className="font-semibold text-gray-800 mb-4">📋 Meta Tags Atuais:</h3>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {metaTags.map((tag, index) => (
          <div key={index} className="flex border-b border-gray-200 pb-2">
            <span className="font-mono text-sm text-blue-600 w-48 flex-shrink-0">
              {tag.name}
            </span>
            <span className="text-sm text-gray-700 truncate">
              {tag.content}
            </span>
          </div>
        ))}
      </div>
      <button
        onClick={() => {
          const metas = document.querySelectorAll('meta');
          const tags: {name: string, content: string}[] = [];
          metas.forEach(meta => {
            const name = meta.getAttribute('name') || meta.getAttribute('property') || '';
            const content = meta.getAttribute('content') || '';
            if (name && content) tags.push({ name, content });
          });
          const title = document.querySelector('title');
          if (title) tags.unshift({ name: 'title', content: title.textContent || '' });
          setMetaTags(tags);
        }}
        className="mt-4 bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded text-sm"
      >
        🔄 Atualizar Lista
      </button>
    </div>
  );
}
