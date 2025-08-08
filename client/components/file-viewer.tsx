"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog"
import { 
  Download, 
  Eye, 
  FileText, 
  Image as ImageIcon, 
  Loader2,
  X,
  ZoomIn,
  ZoomOut,
  RotateCw
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useSession } from "@/stores/auth"

interface FileViewerProps {
  file: {
    id: number
    filename: string
    mimeType: string
    size: number
    type: 'photo' | 'document'
  }
  itemId?: number
  groupUuid?: string
}

export function FileViewer({ file, itemId, groupUuid }: FileViewerProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(0)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isLoadingPreview, setIsLoadingPreview] = useState(false)
  const [zoom, setZoom] = useState(100)
  const [rotation, setRotation] = useState(0)
  const { toast } = useToast()
  const accessToken = useSession((state) => state.accessToken)

  // Verificar se o arquivo pode ser visualizado
  const isImage = file.mimeType.startsWith('image/')
  const isPDF = file.mimeType === 'application/pdf'
  const isText = file.mimeType.startsWith('text/') || 
                 file.mimeType === 'application/json' ||
                 file.mimeType === 'application/javascript'
  const canPreview = isImage || isPDF || isText

  const getFileIcon = () => {
    if (isImage) return <ImageIcon className="h-5 w-5 text-blue-500" />
    return <FileText className="h-5 w-5 text-gray-500" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const buildFileUrl = (preview: boolean = false) => {
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3500'
    const previewParam = preview ? '?preview=true' : ''
    
    if (groupUuid) {
      return `${baseUrl}/group/${groupUuid}/files/${file.id}/download${previewParam}`
    } else if (itemId) {
      return `${baseUrl}/item/${itemId}/files/${file.id}/download${previewParam}`
    } else {
      throw new Error('Nem itemId nem groupUuid foi fornecido')
    }
  }

  const downloadFile = async () => {
    if (!accessToken) {
      toast({
        title: "Erro de autenticação",
        description: "Token de acesso não encontrado",
        variant: "destructive"
      })
      return
    }

    try {
      setIsDownloading(true)
      setDownloadProgress(0)

      const response = await fetch(buildFileUrl(false), {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Erro HTTP ${response.status}: ${response.statusText}`)
      }

      const blob = await response.blob()
      
      // Simular progresso
      for (let i = 0; i <= 100; i += 20) {
        setDownloadProgress(i)
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      // Fazer download
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = file.filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: "Download concluído",
        description: `O arquivo "${file.filename}" foi baixado com sucesso.`,
      })
    } catch (error) {
      console.error('Erro no download:', error)
      toast({
        title: "Erro no download",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      })
    } finally {
      setIsDownloading(false)
      setDownloadProgress(0)
    }
  }

  const loadPreview = async () => {
    if (!canPreview || !accessToken) return

    try {
      setIsLoadingPreview(true)

      const response = await fetch(buildFileUrl(true), {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Erro HTTP ${response.status}: ${response.statusText}`)
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      setPreviewUrl(url)
    } catch (error) {
      console.error('Erro no preview:', error)
      toast({
        title: "Erro na visualização",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      })
    } finally {
      setIsLoadingPreview(false)
    }
  }

  const openPreview = () => {
    setIsPreviewOpen(true)
    if (!previewUrl) {
      loadPreview()
    }
  }

  const closePreview = () => {
    setIsPreviewOpen(false)
    if (previewUrl) {
      window.URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
    setZoom(100)
    setRotation(0)
  }

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 300))
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 25))
  const handleRotate = () => setRotation(prev => (prev + 90) % 360)

  const renderPreviewContent = () => {
    if (isLoadingPreview) {
      return (
        <div className="flex flex-col items-center justify-center p-12 space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-lg text-muted-foreground">Carregando arquivo...</p>
        </div>
      )
    }

    if (!previewUrl) {
      return (
        <div className="flex items-center justify-center p-12">
          <p className="text-muted-foreground">Erro ao carregar visualização</p>
        </div>
      )
    }

    if (isImage) {
      return (
        <div className="flex flex-col">
          {/* Controles de imagem */}
          <div className="flex items-center justify-center gap-2 p-4 border-b bg-gray-50">
            <Button variant="outline" size="sm" onClick={handleZoomOut} disabled={zoom <= 25}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[50px] text-center">{zoom}%</span>
            <Button variant="outline" size="sm" onClick={handleZoomIn} disabled={zoom >= 300}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleRotate}>
              <RotateCw className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Container da imagem */}
          <div className="flex items-center justify-center p-6 bg-gray-100 min-h-[60vh] overflow-auto">
            <img
              src={previewUrl}
              alt={file.filename}
              style={{
                transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain'
              }}
              className="transition-transform duration-200 shadow-lg"
            />
          </div>
        </div>
      )
    }

    if (isPDF) {
      return (
        <div className="h-[80vh]">
          <iframe
            src={previewUrl}
            className="w-full h-full border-0"
            title={file.filename}
          />
        </div>
      )
    }

    if (isText) {
      return (
        <div className="h-[80vh] overflow-auto">
          <iframe
            src={previewUrl}
            className="w-full h-full border-0"
            title={file.filename}
          />
        </div>
      )
    }

    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-muted-foreground">Visualização não disponível para este tipo de arquivo</p>
      </div>
    )
  }

  return (
    <>
      {/* Botões de ação */}
      <div className="flex items-center gap-1">
        {canPreview && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={openPreview}
            disabled={isDownloading}
          >
            <Eye className="h-4 w-4" />
          </Button>
        )}
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={downloadFile}
          disabled={isDownloading}
        >
          {isDownloading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Modal de download com progresso */}
      <Dialog open={isDownloading} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Baixando arquivo</DialogTitle>
            <DialogDescription>
              Aguarde enquanto o arquivo é baixado...
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 px-2">
            <div className="flex items-center space-x-4">
              {getFileIcon()}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.filename}</p>
                <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
              </div>
            </div>
            <div className="space-y-3">
              <Progress value={downloadProgress} className="w-full h-2" />
              <p className="text-sm text-center text-muted-foreground font-medium">{downloadProgress}%</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de visualização */}
      <Dialog open={isPreviewOpen} onOpenChange={closePreview}>
        <DialogContent className="max-w-6xl max-h-[95vh] p-0">
          <DialogHeader className="p-4 pb-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getFileIcon()}
                <div>
                  <DialogTitle className="text-lg font-semibold">{file.filename}</DialogTitle>
                  <p className="text-sm text-muted-foreground">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={downloadFile}
                  disabled={isDownloading}
                >
                  {isDownloading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  Baixar
                </Button>
                <Button variant="ghost" size="sm" onClick={closePreview}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <DialogDescription className="sr-only">
              Visualização do arquivo {file.filename}
            </DialogDescription>
          </DialogHeader>
          
          <div className="overflow-hidden">
            {renderPreviewContent()}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
} 