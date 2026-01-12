import Swal from 'sweetalert2'
import { SweetAlertOptions } from '@/types'

// Função para mostrar alerta de sucesso
export const showSuccess = (message: string, title: string = 'Sucesso!') => {
  return Swal.fire({
    title,
    text: message,
    icon: 'success',
    confirmButtonText: 'OK',
    timer: 3000,
    timerProgressBar: true,
    allowOutsideClick: true
  })
}

// Função para mostrar alerta de erro
export const showError = (message: string, title: string = 'Erro!') => {
  return Swal.fire({
    title,
    text: message,
    icon: 'error',
    confirmButtonText: 'OK',
    allowOutsideClick: true
  })
}

// Função para mostrar alerta de aviso
export const showWarning = (message: string, title: string = 'Atenção!') => {
  return Swal.fire({
    title,
    text: message,
    icon: 'warning',
    confirmButtonText: 'OK',
    allowOutsideClick: true
  })
}

// Função para mostrar alerta de informação
export const showInfo = (message: string, title: string = 'Informação') => {
  return Swal.fire({
    title,
    text: message,
    icon: 'info',
    confirmButtonText: 'OK',
    allowOutsideClick: true
  })
}

// Função para mostrar confirmação
export const showConfirm = (
  message: string,
  title: string = 'Confirmar',
  confirmText: string = 'Sim',
  cancelText: string = 'Não'
) => {
  return Swal.fire({
    title,
    text: message,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    allowOutsideClick: false
  })
}

// Função para mostrar alerta customizado
export const showCustomAlert = (options: SweetAlertOptions) => {
  return Swal.fire(options)
}

// Função para mostrar loading
export const showLoading = (message: string = 'Carregando...') => {
  return Swal.fire({
    title: message,
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading()
    }
  })
}

// Função para fechar alerta
export const closeAlert = () => {
  Swal.close()
}
