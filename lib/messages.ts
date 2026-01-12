// Interface para mensagens de erro do backend
export interface ErrorMessage {
  status_code: number
  message: string
  module: string
}

// Interface para resposta de versão
export interface VersionResponse {
  data: {
    version_hash: string
  }
}

// Interface para resposta de mensagens
export interface MessagesResponse {
  data: {
    messages: ErrorMessage[]
    version_hash: string
  }
}

/**
 * Verifica se há alterações nas mensagens de um módulo
 * @param module - Nome do módulo (ex: 'vehicles', 'leads', 'users')
 * @returns Promise<boolean> - true se há alterações
 */
export const checkMessagesVersion = async (module: string): Promise<boolean> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/public/messages/${module}/version`)
    if (!response.ok) return false

    const data: VersionResponse = await response.json()
    const currentHash = localStorage.getItem(`${module}_messages_hash`)

    return currentHash !== data.data.version_hash
  } catch (error) {
    console.error(`❌ Erro ao verificar versão das mensagens do módulo ${module}:`, error)
    return false
  }
}

/**
 * Baixa mensagens atualizadas de um módulo
 * @param module - Nome do módulo
 * @returns Promise<boolean> - true se baixou com sucesso
 */
export const downloadMessages = async (module: string): Promise<boolean> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/public/messages/${module}`)
    if (!response.ok) return false

    const data: MessagesResponse = await response.json()

    localStorage.setItem(`${module}_messages`, JSON.stringify(data.data.messages))
    localStorage.setItem(`${module}_messages_hash`, data.data.version_hash)

    console.log(`✅ Mensagens do módulo ${module} baixadas com sucesso`)
    return true
  } catch (error) {
    console.error(`❌ Erro ao baixar mensagens do módulo ${module}:`, error)
    return false
  }
}

/**
 * Obtém mensagem de erro específica para um status code
 * @param module - Nome do módulo
 * @param statusCode - Código de status HTTP
 * @returns Promise<string | null> - Mensagem de erro ou null se não encontrada
 */
export const getErrorMessage = async (module: string, statusCode: number): Promise<string | null> => {
  try {
    // Verificar se há alterações nas mensagens
    const hasChanges = await checkMessagesVersion(module)

    if (hasChanges) {
      // Baixar mensagens atualizadas
      const downloaded = await downloadMessages(module)
      if (!downloaded) return null
    }

    // Obter mensagem específica para o status code
    const messages = JSON.parse(localStorage.getItem(`${module}_messages`) || '[]') as ErrorMessage[]
    const errorMessage = messages.find((msg: ErrorMessage) => msg.status_code === statusCode)

    return errorMessage ? errorMessage.message : null
  } catch (error) {
    console.error(`❌ Erro ao obter mensagem de erro do módulo ${module}:`, error)
    return null
  }
}

/**
 * Inicializa o sistema de mensagens para um módulo
 * @param module - Nome do módulo
 * @returns Promise<void>
 */
export const initializeMessages = async (module: string): Promise<void> => {
  try {
    console.log(`🔍 Inicializando mensagens para o módulo ${module}...`)

    // Verificar se já existe hash local
    const currentHash = localStorage.getItem(`${module}_messages_hash`)

    if (!currentHash) {
      // Primeira vez, baixar mensagens
      console.log(`📥 Primeira inicialização do módulo ${module}, baixando mensagens...`)
      await downloadMessages(module)
    } else {
      // Verificar se há alterações
      const hasChanges = await checkMessagesVersion(module)
      if (hasChanges) {
        console.log(`🔄 Atualizações encontradas para o módulo ${module}, baixando...`)
        await downloadMessages(module)
      } else {
        console.log(`✅ Mensagens do módulo ${module} estão atualizadas`)
      }
    }
  } catch (error) {
    console.error(`❌ Erro ao inicializar mensagens do módulo ${module}:`, error)
  }
}
