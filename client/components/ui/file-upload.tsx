"use client"

import * as React from "react"
import { useDropzone } from "react-dropzone"
import { Upload, X, File, ImageIcon, FileText, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

/**
 * Interface para arquivos carregados
 */
interface UploadedFile {
  id: string
  file: File
  preview?: string
  progress: number
  status: "uploading" | "success" | "error"
  error?: string
}

/**
 * Props do componente FileUpload
 */
interface FileUploadProps {
  accept?: Record<string, string[]>
  maxFiles?: number
  maxSize?: number
  onFilesChange?: (files: UploadedFile[]) => void
  onUpload?: (files: File[]) => Promise<void>
  className?: string
  disabled?: boolean
  multiple?: boolean
  showPreview?: boolean
}

/**
 * Componente de upload de arquivos com drag & drop
 * Suporta múltiplos arquivos, preview de imagens e validação
 */
export function FileUpload({
  accept = {
    "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
    "application/pdf": [".pdf"],
    "text/*": [".txt", ".doc", ".docx"],
  },
  maxFiles = 5,
  maxSize = 5 * 1024 * 1024, // 5MB
  onFilesChange,
  onUpload,
  className,
  disabled = false,
  multiple = true,
  showPreview = true,
}: FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = React.useState<UploadedFile[]>([])
  const [isUploading, setIsUploading] = React.useState(false)

  /**
   * Configuração do dropzone
   */
  const { getRootProps, getInputProps, isDragActive, isDragReject, fileRejections } = useDropzone({
    accept,
    maxFiles: multiple ? maxFiles : 1,
    maxSize,
    multiple,
    disabled: disabled || isUploading,
    onDrop: handleFileDrop,
  })

  /**
   * Manipula o drop de arquivos
   */
  async function handleFileDrop(acceptedFiles: File[]) {
    if (acceptedFiles.length === 0) return

    // Cria objetos de arquivo com preview
    const newFiles: UploadedFile[] = acceptedFiles.map((file) => ({
      id: crypto.randomUUID(),
      file,
      preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
      progress: 0,
      status: "uploading",
    }))

    // Atualiza a lista de arquivos
    const updatedFiles = multiple ? [...uploadedFiles, ...newFiles] : newFiles

    setUploadedFiles(updatedFiles)
    onFilesChange?.(updatedFiles)

    // Simula upload ou chama função de upload personalizada
    if (onUpload) {
      setIsUploading(true)
      try {
        await onUpload(acceptedFiles)
        // Marca todos como sucesso
        setUploadedFiles((prev) =>
          prev.map((f) => (newFiles.some((nf) => nf.id === f.id) ? { ...f, status: "success", progress: 100 } : f)),
        )
      } catch (error) {
        // Marca como erro
        setUploadedFiles((prev) =>
          prev.map((f) =>
            newFiles.some((nf) => nf.id === f.id) ? { ...f, status: "error", error: "Erro no upload" } : f,
          ),
        )
      } finally {
        setIsUploading(false)
      }
    } else {
      // Simula progresso de upload
      simulateUpload(newFiles)
    }
  }

  /**
   * Simula o progresso de upload
   */
  function simulateUpload(files: UploadedFile[]) {
    files.forEach((file) => {
      const interval = setInterval(() => {
        setUploadedFiles((prev) =>
          prev.map((f) => {
            if (f.id === file.id && f.progress < 100) {
              const newProgress = Math.min(f.progress + Math.random() * 30, 100)
              return {
                ...f,
                progress: newProgress,
                status: newProgress === 100 ? "success" : "uploading",
              }
            }
            return f
          }),
        )
      }, 200)

      // Para a simulação quando completa
      setTimeout(() => clearInterval(interval), 2000)
    })
  }

  /**
   * Remove um arquivo da lista
   */
  function removeFile(id: string) {
    setUploadedFiles((prev) => {
      const file = prev.find((f) => f.id === id)
      if (file?.preview) {
        URL.revokeObjectURL(file.preview)
      }
      const updated = prev.filter((f) => f.id !== id)
      onFilesChange?.(updated)
      return updated
    })
  }

  /**
   * Obtém o ícone baseado no tipo do arquivo
   */
  function getFileIcon(file: File) {
    if (file.type.startsWith("image/")) {
      return <ImageIcon className="h-4 w-4" />
    }
    if (file.type === "application/pdf") {
      return <FileText className="h-4 w-4" />
    }
    return <File className="h-4 w-4" />
  }

  /**
   * Formata o tamanho do arquivo
   */
  function formatFileSize(bytes: number) {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  // Limpa previews quando o componente é desmontado
  React.useEffect(() => {
    return () => {
      uploadedFiles.forEach((file) => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview)
        }
      })
    }
  }, [])

  return (
    <div className={cn("space-y-4", className)}>
      {/* === ÁREA DE DROP === */}
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
          "hover:border-primary/50 hover:bg-primary/5",
          isDragActive && "border-primary bg-primary/10",
          isDragReject && "border-destructive bg-destructive/10",
          disabled && "opacity-50 cursor-not-allowed",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
        )}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center gap-2">
          <Upload className={cn("h-8 w-8", isDragActive ? "text-primary" : "text-muted-foreground")} />

          <div className="text-sm">
            {isDragActive ? (
              <p className="text-primary font-medium">Solte os arquivos aqui...</p>
            ) : (
              <div>
                <p className="font-medium">Clique para selecionar ou arraste arquivos aqui</p>
                <p className="text-muted-foreground mt-1">
                  {multiple ? `Até ${maxFiles} arquivos` : "1 arquivo"} • Máximo {formatFileSize(maxSize)} cada
                </p>
              </div>
            )}
          </div>

          {/* Tipos aceitos */}
          <div className="flex flex-wrap gap-1 mt-2">
            {Object.keys(accept).map((type) => (
              <Badge key={type} variant="secondary" className="text-xs">
                {type.split("/")[1] || type}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* === ERROS DE VALIDAÇÃO === */}
      {fileRejections.length > 0 && (
        <div className="space-y-2">
          {fileRejections.map(({ file, errors }) => (
            <div
              key={file.name}
              className="flex items-center gap-2 p-2 bg-destructive/10 border border-destructive/20 rounded"
            >
              <AlertCircle className="h-4 w-4 text-destructive" />
              <div className="flex-1 text-sm">
                <p className="font-medium">{file.name}</p>
                <p className="text-destructive">{errors.map((e) => e.message).join(", ")}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* === LISTA DE ARQUIVOS === */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Arquivos ({uploadedFiles.length})</h4>

          <div className="space-y-2">
            {uploadedFiles.map((uploadedFile) => (
              <div key={uploadedFile.id} className="flex items-center gap-3 p-3 border rounded-lg bg-card">
                {/* Preview ou ícone */}
                <div className="flex-shrink-0">
                  {showPreview && uploadedFile.preview ? (
                    <img
                      src={uploadedFile.preview || "/placeholder.svg"}
                      alt={uploadedFile.file.name}
                      className="h-10 w-10 object-cover rounded"
                    />
                  ) : (
                    <div className="h-10 w-10 bg-muted rounded flex items-center justify-center">
                      {getFileIcon(uploadedFile.file)}
                    </div>
                  )}
                </div>

                {/* Informações do arquivo */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{uploadedFile.file.name}</p>
                  <p className="text-xs text-muted-foreground">{formatFileSize(uploadedFile.file.size)}</p>

                  {/* Barra de progresso */}
                  {uploadedFile.status === "uploading" && (
                    <Progress value={uploadedFile.progress} className="h-1 mt-2" />
                  )}

                  {/* Erro */}
                  {uploadedFile.status === "error" && uploadedFile.error && (
                    <p className="text-xs text-destructive mt-1">{uploadedFile.error}</p>
                  )}
                </div>

                {/* Status e ações */}
                <div className="flex items-center gap-2">
                  {uploadedFile.status === "success" && (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      Concluído
                    </Badge>
                  )}

                  {uploadedFile.status === "error" && <Badge variant="destructive">Erro</Badge>}

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => removeFile(uploadedFile.id)}
                    disabled={isUploading}
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Remover arquivo</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
