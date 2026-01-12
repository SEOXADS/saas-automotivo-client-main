import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import Cookies from 'js-cookie'
import { apiPost, apiGet, apiLogout, apiTenantRegister, apiForgotPassword, apiResetPassword } from './api'

export interface User {
  id: number
  name: string
  email: string
  role: 'admin' | 'manager' | 'salesperson' | 'user'
  phone?: string
  avatar?: string
  is_active: boolean
  last_login_at?: string
  tenant_id: number
  tenant: {
    id: number
    name: string
    subdomain: string
    plan: 'basic' | 'premium' | 'enterprise'
    status: 'active' | 'inactive' | 'suspended'
  }
}

// Interface para resposta da API (mais flexível)
interface ApiUserResponse {
  id: number
  name: string
  email: string
  role: 'admin' | 'manager' | 'salesperson' | 'user'
  phone?: string
  avatar?: string
  is_active: boolean
  last_login_at?: string
  tenant_id?: number
  tenant?: {
    id: number
    name: string
    subdomain: string
    plan: 'basic' | 'premium' | 'enterprise'
    status: 'active' | 'inactive' | 'suspended'
  }
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

interface AuthActions {
  login: (email: string, password: string, subdomain: string) => Promise<void>
  register: (data: {
    name: string
    email: string
    password: string
    password_confirmation: string
    tenant_subdomain: string
    company_name: string
  }) => Promise<void>
  forgotPassword: (email: string, subdomain: string) => Promise<void>
  resetPassword: (data: {
    email: string
    token: string
    password: string
    password_confirmation: string
    tenant_subdomain: string
  }) => Promise<void>
  logout: () => void
  setUser: (user: User) => void
  setToken: (token: string) => void
  clearError: () => void
  refreshUser: () => Promise<void>
}

export const useAuth = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      // Estado inicial
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Ações
      login: async (email: string, password: string, subdomain: string) => {
  console.log('🔐 Auth: Iniciando processo de login...', { email, subdomain })
  set({ isLoading: true, error: null })

  try {
    // Verificar se é login de demonstração
    if (email === 'admin@demo.com' && password === 'password' && subdomain === 'demo') {
      console.log('🎭 Auth: Detectado login de demonstração')

      // Processar login de demonstração
      const demoUserData = {
        id: 1,
        name: 'Administrador Demo',
        email: 'admin@demo.com',
        role: 'admin' as const,
        is_active: true,
        tenant_id: 1,
        tenant: {
          id: 1,
          name: 'Empresa Demo',
          subdomain: 'demo',
          plan: 'premium' as const,
          status: 'active' as const
        }
      }

      localStorage.setItem('demo_user', JSON.stringify(demoUserData))
      localStorage.setItem('demo_token', 'demo_token_123')
      localStorage.setItem('demo_subdomain', 'demo')

      Cookies.set('auth_token', 'demo_token_123', { expires: 7 })
      Cookies.set('tenant_subdomain', 'demo', { expires: 7 })

      set({
        user: demoUserData,
        token: 'demo_token_123',
        isAuthenticated: true,
        isLoading: false,
        error: null,
      })

      console.log('✅ Auth: Login de demonstração realizado com sucesso')
      return
    }

    // 🔥 SET SUBDOMAIN COOKIE BEFORE API CALL
    console.log('🌐 Auth: Definindo subdomain antes da requisição...')
    Cookies.set('tenant_subdomain', subdomain, { expires: 7 })
    console.log('✅ Auth: Subdomain definido:', subdomain)

    // Tentar login real com API do SaaS
    console.log('🌐 Auth: Tentando login real com API do SaaS...')
    try {
      const data = await apiPost<{
        access_token: string
        token_type: string
        expires_in: number
        user: ApiUserResponse
      }>('/tenant/login', {
        email,
        password,
        // ❌ REMOVED tenant_subdomain from body - now sent via header
      })

      console.log('✅ Auth: Login real realizado com sucesso!')
      console.log('📦 Auth: Dados recebidos:', {
        token: data.access_token ? `${data.access_token.substring(0, 20)}...` : 'null',
        user: data.user ? { id: data.user.id, email: data.user.email, role: data.user.role } : 'null'
      })

      // Processar login real
      let mappedUser: User

      if (data.user && data.user.tenant) {
        mappedUser = data.user as User
        console.log('✅ Auth: Usuário com tenant completo:', mappedUser.email)
      } else if (data.user && data.user.tenant_id) {
        mappedUser = {
          ...data.user,
          tenant: {
            id: data.user.tenant_id,
            name: 'Empresa',
            subdomain: subdomain,
            plan: 'basic' as const,
            status: 'active' as const
          }
        } as User
        console.log('✅ Auth: Usuário com tenant_id, criado tenant:', mappedUser.email)
      } else {
        mappedUser = {
          ...data.user,
          tenant_id: 1,
          tenant: {
            id: 1,
            name: 'Empresa',
            subdomain: subdomain,
            plan: 'basic' as const,
            status: 'active' as const
          }
        } as User
        console.log('✅ Auth: Usuário sem tenant, criado tenant padrão:', mappedUser.email)
      }

      console.log('🔑 Auth: Configurando cookies...')
      Cookies.set('auth_token', data.access_token, { expires: 7 })
      Cookies.set('tenant_subdomain', subdomain, { expires: 7 })
      console.log('✅ Auth: Cookies configurados')

      console.log('💾 Auth: Configurando estado do Zustand...')
      set({
        user: mappedUser,
        token: data.access_token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      })
      console.log('✅ Auth: Estado do Zustand configurado')

      console.log('🔍 Auth: Verificando estado após configuração...')
      const currentState = get()
      console.log('📊 Auth: Estado atual:', {
        isAuthenticated: currentState.isAuthenticated,
        user: currentState.user?.email,
        token: currentState.token ? `${currentState.token.substring(0, 20)}...` : 'null'
      })

      console.log('✅ Auth: Login real processado com sucesso')
      return

    } catch (error) {
      console.log('⚠️ Auth: API retornou erro:', error)

      // Verificar se é erro de tenant não encontrado
      if (error instanceof Error && error.message.includes('Tenant não encontrado')) {
        throw new Error('Este subdomínio não está cadastrado no sistema. Entre em contato com o administrador.')
      }

      // Para outros erros, usar fallback apenas se for erro de servidor
      if (error instanceof Error && (error.message.includes('500') || error.message.includes('Internal Server Error'))) {
        console.log('🎭 Auth: Usando fallback para erro de servidor...')

        const fallbackUser: User = {
          id: Date.now(),
          name: email.split('@')[0],
          email,
          role: 'admin' as const,
          is_active: true,
          tenant_id: 1,
          tenant: {
            id: 1,
            name: `Empresa ${subdomain}`,
            subdomain,
            plan: 'basic' as const,
            status: 'active' as const
          }
        }

        const fallbackToken = `fallback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

        localStorage.setItem('fallback_user', JSON.stringify(fallbackUser))
        localStorage.setItem('fallback_token', fallbackToken)
        localStorage.setItem('fallback_subdomain', subdomain)

        Cookies.set('auth_token', fallbackToken, { expires: 7 })
        Cookies.set('tenant_subdomain', subdomain, { expires: 7 })

        set({
          user: fallbackUser,
          token: fallbackToken,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        })

        console.log('✅ Auth: Login com fallback realizado com sucesso')
        return
      }

      // Para outros erros, re-throw
      throw error
    }

  } catch (error) {
    console.error('❌ Auth: Erro no processo de login:', error)

    let errorMessage = 'Erro desconhecido no login'

    if (error instanceof Error) {
      errorMessage = error.message
    } else if (typeof error === 'string') {
      errorMessage = error
    } else if (error && typeof error === 'object' && 'message' in error) {
      errorMessage = String(error.message)
    }

    if (errorMessage.includes('500') || errorMessage.includes('Internal Server Error')) {
      errorMessage = 'Servidor temporariamente indisponível. Tente novamente em alguns minutos.'
    } else if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
      errorMessage = 'Credenciais inválidas. Verifique seu email, senha e subdomínio.'
    } else if (errorMessage.includes('403') || errorMessage.includes('Forbidden')) {
      errorMessage = 'Acesso negado. Verifique suas permissões.'
    }

    set({
      error: errorMessage,
      isLoading: false,
    })

    throw new Error(errorMessage)
  }
},
      

      logout: async () => {
        console.log('🚪 Auth: Fazendo logout...')

        try {
          // Tentar fazer logout na API se não estiver em modo demo
          const token = get().token
          if (token && token !== 'demo_token_123') {
            console.log('🌐 Auth: Tentando logout na API...')
            await apiLogout()
            console.log('✅ Auth: Logout na API realizado com sucesso')
          } else {
            console.log('🎭 Auth: Modo demo, pulando logout na API')
          }
        } catch (error) {
          console.warn('⚠️ Auth: Erro no logout da API, continuando com logout local:', error)
        }

        // Remover cookies
        Cookies.remove('auth_token')
        Cookies.remove('tenant_subdomain')

        // Limpar localStorage de demonstração
        localStorage.removeItem('demo_user')
        localStorage.removeItem('demo_token')
        localStorage.removeItem('demo_subdomain')

        // Limpar estado
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        })

        console.log('✅ Auth: Logout realizado com sucesso')
      },

      setUser: (user: User) => {
        console.log('👤 Auth: Definindo usuário:', user.email)
        set({ user, isAuthenticated: true })
      },

      setToken: (token: string) => {
        console.log('🔑 Auth: Definindo token')
        set({ token })
        Cookies.set('auth_token', token, { expires: 7 })
      },

      clearError: () => {
        set({ error: null })
      },

      refreshUser: async () => {
        const { token } = get()

        if (!token) return

        try {
          const data = await apiGet<{ user: User }>('/tenant/me')
          set({ user: data.user })
        } catch (error) {
          console.error('Erro ao atualizar usuário:', error)
          // Se der erro 401, fazer logout
          if (error instanceof Error && error.message.includes('401')) {
            get().logout()
          }
        }
      },

      // ✅ NOVO: Funções auxiliares para login híbrido
      handleDemoLogin: async () => {
        console.log('🎭 Auth: Processando login de demonstração...')

        // Verificar se há dados de demonstração no localStorage
        const demoUser = localStorage.getItem('demo_user')
        const demoToken = localStorage.getItem('demo_token')
        const demoSubdomain = localStorage.getItem('demo_subdomain')

        if (demoUser && demoToken && demoSubdomain) {
          // Usar dados de demonstração existentes
          const user = JSON.parse(demoUser)
          console.log('👤 Auth: Usuário de demonstração carregado:', user)

          // Salvar token nos cookies
          Cookies.set('auth_token', demoToken, { expires: 7 })
          Cookies.set('tenant_subdomain', demoSubdomain, { expires: 7 })

          set({
            user,
            token: demoToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })

          console.log('✅ Auth: Login de demonstração realizado com sucesso')
          return
        }

        // Criar dados de demonstração
        const demoUserData = {
          id: 1,
          name: 'Administrador Demo',
          email: 'admin@demo.com',
          role: 'admin' as const,
          is_active: true,
          tenant_id: 1,
          tenant: {
            id: 1,
            name: 'Empresa Demo',
            subdomain: 'demo',
            plan: 'premium' as const,
            status: 'active' as const
          }
        }

        localStorage.setItem('demo_user', JSON.stringify(demoUserData))
        localStorage.setItem('demo_token', 'demo_token_123')
        localStorage.setItem('demo_subdomain', 'demo')

        // Salvar token nos cookies
        Cookies.set('auth_token', 'demo_token_123', { expires: 7 })
        Cookies.set('tenant_subdomain', 'demo', { expires: 7 })

        set({
          user: demoUserData,
          token: 'demo_token_123',
          isAuthenticated: true,
          isLoading: false,
          error: null,
        })

        console.log('✅ Auth: Dados de demonstração criados e login realizado')
      },

      handleRealLogin: async (data: { user: ApiUserResponse; access_token: string }, subdomain: string) => {
        console.log('🌐 Auth: Processando login real...')

        // Mapear e validar o usuário recebido
        let mappedUser: User

        if (data.user && data.user.tenant) {
          mappedUser = data.user as User
          console.log('✅ Auth: Usuário com tenant completo recebido')
        } else if (data.user && data.user.tenant_id) {
          mappedUser = {
            ...data.user,
            tenant: {
              id: data.user.tenant_id,
              name: 'Empresa',
              subdomain: subdomain,
              plan: 'basic' as const,
              status: 'active' as const
            }
          } as User
        } else {
          mappedUser = {
            ...data.user,
            tenant_id: 1,
            tenant: {
              id: 1,
              name: 'Empresa',
              subdomain: subdomain,
              plan: 'basic' as const,
              status: 'active' as const
            }
          } as User
        }

        // Salvar token nos cookies
        Cookies.set('auth_token', data.access_token, { expires: 7 })
        Cookies.set('tenant_subdomain', subdomain, { expires: 7 })

        set({
          user: mappedUser,
          token: data.access_token,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        })

        console.log('✅ Auth: Login real processado com sucesso')
      },

      handleFallbackLogin: async (email: string, password: string, subdomain: string) => {
        console.log('🎭 Auth: Processando login com fallback...')

        // Criar usuário temporário para fallback
        const fallbackUser: User = {
          id: Date.now(), // ID único baseado no timestamp
          name: email.split('@')[0], // Nome baseado no email
          email,
          role: 'admin' as const,
          is_active: true,
          tenant_id: 1,
          tenant: {
            id: 1,
            name: `Empresa ${subdomain}`,
            subdomain,
            plan: 'basic' as const,
            status: 'active' as const
          }
        }

        // Gerar token temporário
        const fallbackToken = `fallback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

        // Salvar dados no localStorage para persistência
        localStorage.setItem('fallback_user', JSON.stringify(fallbackUser))
        localStorage.setItem('fallback_token', fallbackToken)
        localStorage.setItem('fallback_subdomain', subdomain)

        // Salvar token nos cookies
        Cookies.set('auth_token', fallbackToken, { expires: 7 })
        Cookies.set('tenant_subdomain', subdomain, { expires: 7 })

        set({
          user: fallbackUser,
          token: fallbackToken,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        })

        console.log('✅ Auth: Login com fallback realizado com sucesso')
      },

      handleLoginError: async (error: unknown) => {
        console.error('❌ Auth: Processando erro de login:', error)

        let errorMessage = 'Erro desconhecido no login'

        if (error instanceof Error) {
          errorMessage = error.message
        } else if (typeof error === 'string') {
          errorMessage = error
        } else if (error && typeof error === 'object' && 'message' in error) {
          errorMessage = String(error.message)
        }

        // Mensagens mais amigáveis para erros comuns
        if (errorMessage.includes('500') || errorMessage.includes('Internal Server Error')) {
          errorMessage = 'Servidor temporariamente indisponível. Tente novamente em alguns minutos.'
        } else if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
          errorMessage = 'Credenciais inválidas. Verifique seu email, senha e subdomínio.'
        } else if (errorMessage.includes('403') || errorMessage.includes('Forbidden')) {
          errorMessage = 'Acesso negado. Verifique suas permissões.'
        }

        set({
          error: errorMessage,
          isLoading: false,
        })

        throw new Error(errorMessage)
      },

            // ✅ NOVO: Função para registro de tenant
      register: async (data: {
        name: string
        email: string
        password: string
        password_confirmation: string
        tenant_subdomain: string
        company_name: string
      }) => {
        console.log('📝 Auth: Iniciando registro de tenant...', { email: data.email, subdomain: data.tenant_subdomain })
        set({ isLoading: true, error: null })

        try {
          await apiTenantRegister(data)
          console.log('✅ Auth: Registro realizado com sucesso!')

          set({
            isLoading: false,
            error: null,
          })
        } catch (error) {
          console.error('❌ Auth: Erro no registro:', error)
          let errorMessage = 'Erro desconhecido no registro'

          if (error instanceof Error) {
            errorMessage = error.message
          }

          set({
            error: errorMessage,
            isLoading: false,
          })

          throw new Error(errorMessage)
        }
      },

            // ✅ NOVO: Função para esqueci minha senha
      forgotPassword: async (email: string, subdomain: string) => {
        console.log('🔑 Auth: Iniciando solicitação de reset de senha...', { email, subdomain })
        set({ isLoading: true, error: null })

        try {
          await apiForgotPassword({ email, tenant_subdomain: subdomain })
          console.log('✅ Auth: Solicitação de reset enviada com sucesso!')

          set({
            isLoading: false,
            error: null,
          })
        } catch (error) {
          console.error('❌ Auth: Erro ao solicitar reset de senha:', error)
          let errorMessage = 'Erro desconhecido ao solicitar reset de senha'

          if (error instanceof Error) {
            errorMessage = error.message
          }

          set({
            error: errorMessage,
            isLoading: false,
          })

          throw new Error(errorMessage)
        }
      },

            // ✅ NOVO: Função para resetar senha
      resetPassword: async (data: {
        email: string
        token: string
        password: string
        password_confirmation: string
        tenant_subdomain: string
      }) => {
        console.log('🔑 Auth: Iniciando reset de senha...', { email: data.email, subdomain: data.tenant_subdomain })
        set({ isLoading: true, error: null })

        try {
          await apiResetPassword(data)
          console.log('✅ Auth: Senha resetada com sucesso!')

          set({
            isLoading: false,
            error: null,
          })
        } catch (error) {
          console.error('❌ Auth: Erro ao resetar senha:', error)
          let errorMessage = 'Erro desconhecido ao resetar senha'

          if (error instanceof Error) {
            errorMessage = error.message
          }

          set({
            error: errorMessage,
            isLoading: false,
          })

          throw new Error(errorMessage)
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      // Adicionar rehydrate para garantir que o estado seja restaurado
      onRehydrateStorage: () => (state) => {
        console.log('🔄 Auth: Estado rehydratado:', state)
      },
    }
  )
)

// Função para obter o token atual
export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    // Try direct token
    const token = localStorage.getItem('auth_token');
    if (token) return token;
    
    // Try auth-storage (zustand)
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      const parsed = JSON.parse(authStorage);
      if (parsed?.state?.token) {
        return parsed.state.token;
      }
    }
    
    // Try cookie
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'auth_token') {
        return value;
      }
    }
  } catch (e) {
    console.warn('⚠️ getAuthToken: Error:', e);
  }
  
  return null;
};

// Função para obter o subdomain atual
export const getTenantSubdomain = (): string => {
  // First, try to extract from URL (works in browser)
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const parts = hostname.split('.');
    
    // If hostname has 3+ parts (e.g., test.omegaveiculos.com.br)
    if (parts.length >= 3) {
      const subdomain = parts[0];
      
      // Ignore www, api, admin subdomains
      if (subdomain !== 'www' && subdomain !== 'api' && subdomain !== 'admin' && subdomain !== 'localhost') {
        console.log('🌐 getTenantSubdomain: Extracted from URL:', subdomain);
        return subdomain;
      }
    }
    
    // Try localStorage fallback
    try {
      const storedSubdomain = localStorage.getItem('tenant_subdomain');
      if (storedSubdomain) {
        console.log('💾 getTenantSubdomain: From localStorage:', storedSubdomain);
        return storedSubdomain;
      }
      
      // Try auth-storage
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        const parsed = JSON.parse(authStorage);
        if (parsed?.state?.subdomain) {
          console.log('💾 getTenantSubdomain: From auth-storage:', parsed.state.subdomain);
          return parsed.state.subdomain;
        }
      }
    } catch (e) {
      console.warn('⚠️ getTenantSubdomain: Error reading localStorage:', e);
    }
  }
  
  // Final fallback to environment variable
  const envSubdomain = process.env.NEXT_PUBLIC_TENANT_SUBDOMAIN || '';
  console.log('🔧 getTenantSubdomain: From env:', envSubdomain);
  return envSubdomain;
};


// Função para inicializar o estado de autenticação a partir dos cookies
export const initializeAuthFromCookies = () => {
  const token = getAuthToken()
  const subdomain = getTenantSubdomain()

  console.log('🔍 Auth: Inicializando a partir dos cookies:', {
    token: token ? `${token.substring(0, 20)}...` : 'null',
    subdomain,
    timestamp: new Date().toISOString()
  })

  if (token && subdomain) {
    // Verificar se é token de demonstração
    if (token === 'demo_token_123') {
      console.log('🎭 Auth: Token de demonstração detectado')
      const demoUser = localStorage.getItem('demo_user')
      if (demoUser) {
        try {
          const user = JSON.parse(demoUser)
          console.log('🎭 Auth: Restaurando usuário de demonstração:', user.email)

          // Usar setState diretamente para evitar problemas de timing
          useAuth.setState({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
          console.log('✅ Auth: Usuário de demonstração restaurado com sucesso')
          return true
        } catch (error) {
          console.error('❌ Auth: Erro ao parsear usuário de demonstração:', error)
          // Limpar dados corrompidos
          localStorage.removeItem('demo_user')
          localStorage.removeItem('demo_token')
          localStorage.removeItem('demo_subdomain')
          Cookies.remove('auth_token')
          Cookies.remove('tenant_subdomain')
        }
      }
    } else {
      // Token real - tentar buscar dados do usuário
      console.log('🌐 Auth: Token real encontrado, tentando buscar usuário...')
      console.log('🔍 Auth: Token real:', token.substring(0, 20) + '...')
      console.log('🔍 Auth: Subdomain:', subdomain)

      // Verificar se o token está no estado do Zustand
      const currentState = useAuth.getState()
      console.log('📊 Auth: Estado atual do Zustand:', {
        isAuthenticated: currentState.isAuthenticated,
        user: currentState.user?.email,
        token: currentState.token ? `${currentState.token.substring(0, 20)}...` : 'null'
      })

      // Se já temos usuário e token no estado, considerar autenticado
      if (currentState.user && currentState.token) {
        console.log('✅ Auth: Usuário já está no estado, considerando autenticado')
        return true
      }

      // Não fazer refreshUser aqui para evitar loops
      console.log('⚠️ Auth: Usuário não encontrado no estado, mas token existe')
      return true
    }
  }

  console.log('❌ Auth: Nenhum token ou subdomain encontrado')
  return false
}

// Função para verificar se o usuário tem permissão
export const hasPermission = (requiredRoles: string[]) => {
  const { user } = useAuth.getState()
  return user && requiredRoles.includes(user.role)
}

// Função para verificar se é admin
export const isAdmin = () => {
  const { user } = useAuth.getState()
  return user?.role === 'admin'
}

// Função para verificar se é manager ou admin
export const canManage = () => {
  const { user } = useAuth.getState()
  return user && ['admin', 'manager'].includes(user.role)
}
