/**
 * PetMate 组件库
 * 基于设计系统的统一组件
 */

import { forwardRef, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode } from 'react'

// ============ Button 组件 ============

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  fullWidth?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className = '',
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2'

    const variantStyles = {
      primary: 'bg-orange-500 text-white hover:bg-orange-600 focus:ring-orange-500 disabled:bg-orange-300',
      secondary: 'bg-purple-500 text-white hover:bg-purple-600 focus:ring-purple-500 disabled:bg-purple-300',
      outline: 'border-2 border-orange-500 text-orange-500 hover:bg-orange-50 focus:ring-orange-500 disabled:border-orange-200 disabled:text-orange-200',
      ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500 disabled:text-gray-400',
      danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500 disabled:bg-red-300',
    }

    const sizeStyles = {
      sm: 'h-8 px-4 text-sm gap-1.5',
      md: 'h-10 px-5 text-base gap-2',
      lg: 'h-12 px-6 text-lg gap-2.5',
    }

    const widthStyle = fullWidth ? 'w-full' : ''

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${className}`}
        {...props}
      >
        {isLoading ? (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : leftIcon ? (
          <span className="flex-shrink-0">{leftIcon}</span>
        ) : null}
        {children}
        {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
      </button>
    )
  }
)

Button.displayName = 'Button'

// ============ Input 组件 ============

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  size?: 'sm' | 'md' | 'lg'
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      size = 'md',
      className = '',
      ...props
    },
    ref
  ) => {
    const sizeStyles = {
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-4 text-base',
      lg: 'h-12 px-5 text-lg',
    }

    const inputStyles = `w-full rounded-lg border bg-white transition-all duration-200 
      focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500
      disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed
      ${error ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : 'border-gray-200'}
      ${leftIcon ? 'pl-10' : ''} ${rightIcon ? 'pr-10' : ''}
      ${sizeStyles[size]} ${className}`

    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {leftIcon}
            </div>
          )}
          <input ref={ref} className={inputStyles} {...props} />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
        {helperText && !error && (
          <p className="text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

// ============ Card 组件 ============

interface CardProps {
  children: ReactNode
  variant?: 'default' | 'outlined' | 'elevated' | 'interactive'
  padding?: 'sm' | 'md' | 'lg' | 'none'
  hover?: boolean
  className?: string
  onClick?: () => void
}

export function Card({
  children,
  variant = 'default',
  padding = 'md',
  hover = false,
  className = '',
  onClick,
}: CardProps) {
  const baseStyles = 'rounded-xl bg-white'

  const variantStyles = {
    default: 'shadow-card',
    outlined: 'border border-gray-200',
    elevated: 'shadow-floating',
    interactive: 'shadow-card hover:shadow-lg cursor-pointer transition-shadow duration-200',
  }

  const paddingStyles = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  }

  const hoverStyles = hover ? 'hover:shadow-lg cursor-pointer transition-shadow duration-200' : ''

  return (
    <div
      className={`${baseStyles} ${variantStyles[variant]} ${paddingStyles[padding]} ${hoverStyles} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
    >
      {children}
    </div>
  )
}

// ============ Badge 组件 ============

interface BadgeProps {
  children: ReactNode
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
  size?: 'sm' | 'md'
  className?: string
}

export function Badge({ children, variant = 'default', size = 'md', className = '' }: BadgeProps) {
  const baseStyles = 'inline-flex items-center font-medium rounded-full'

  const variantStyles = {
    default: 'bg-gray-100 text-gray-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
    error: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700',
  }

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  }

  return (
    <span className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}>
      {children}
    </span>
  )
}

// ============ Progress 组件 ============

interface ProgressProps {
  value: number
  max?: number
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'success' | 'warning' | 'error'
  className?: string
}

export function Progress({
  value,
  max = 100,
  showLabel = false,
  size = 'md',
  variant = 'default',
  className = '',
}: ProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100))

  const sizeStyles = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  }

  const variantStyles = {
    default: 'bg-orange-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
  }

  return (
    <div className={className}>
      {showLabel && (
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>{value}/{max}</span>
          <span>{percentage}%</span>
        </div>
      )}
      <div className={`w-full rounded-full bg-gray-200 ${sizeStyles[size]}`}>
        <div
          className={`${sizeStyles[size]} rounded-full ${variantStyles[variant]} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

// ============ Spinner 组件 ============

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  const sizeStyles = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  }

  return (
    <svg
      className={`animate-spin ${sizeStyles[size]} ${className}`}
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  )
}

// ============ EmptyState 组件 ============

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({ icon, title, description, action, className = '' }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 ${className}`}>
      {icon && (
        <div className="w-16 h-16 mb-4 flex items-center justify-center rounded-full bg-gray-100 text-gray-400">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-gray-500 text-center max-w-sm mb-4">{description}</p>
      )}
      {action}
    </div>
  )
}

// ============ Toast 组件 ============

interface ToastProps {
  message: string
  type?: 'success' | 'error' | 'warning' | 'info'
  onClose?: () => void
}

export function Toast({ message, type = 'info', onClose }: ToastProps) {
  const typeStyles = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500',
  }

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  }

  return (
    <div className={`fixed bottom-4 left-1/2 -translate-x-1/2 ${typeStyles[type]} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50`}>
      <span className="text-lg">{icons[type]}</span>
      <span>{message}</span>
      {onClose && (
        <button onClick={onClose} className="ml-2 hover:opacity-80">
          ✕
        </button>
      )}
    </div>
  )
}