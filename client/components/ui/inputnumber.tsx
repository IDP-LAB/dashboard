import * as React from "react"

import { cn } from "@/lib/utils"

// Omitimos 'onChange' das props padrão do input, pois vamos redefini-lo.
export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  positive?: boolean
  // Nosso novo onChange passará um número ou undefined (para o caso de estar vazio)
  onChange?: (value: number | undefined) => void
}

const InputNumber = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, positive, value, onChange, ...props }, ref) => {
    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      // Impede a digitação do sinal de menos se 'positive' for verdadeiro
      if (positive && event.key === "-") {
        event.preventDefault()
      }

      // Chama qualquer onKeyDown passado nas props
      props.onKeyDown?.(event)
    }

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const stringValue = event.target.value
      
      // Se o campo estiver vazio, chamamos o onChange com 'undefined'
      // para representar um estado vazio, em vez de 0.
      if (stringValue === "") {
        onChange?.(undefined)
        return
      }

      // Converte o valor para um número de ponto flutuante
      const numericValue = parseFloat(stringValue)

      // Se a conversão resultar em um número válido, chama o onChange
      if (!isNaN(numericValue)) {
        onChange?.(numericValue)
      }
    }

    return (
      <input
        type="number"
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        value={value === undefined ? "" : value} // Garante que o input fique vazio se o valor for undefined
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        min={positive ? "0" : undefined}
        {...props}
      />
    )
  }
)
InputNumber.displayName = "InputNumber"

export { InputNumber }