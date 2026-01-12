interface ToastProps {
  title: string
  description?: string
  variant?: 'default' | 'destructive' | 'success'
}

export const toast = ({ title, description, variant = 'default' }: ToastProps) => {
  // Por enquanto, vamos usar console.log até implementarmos um toast visual
  const emoji = variant === 'destructive' ? '❌' : variant === 'success' ? '✅' : 'ℹ️'
  console.log(`${emoji} ${title}${description ? `: ${description}` : ''}`)

  // TODO: Implementar toast visual com biblioteca ou componente customizado
}
