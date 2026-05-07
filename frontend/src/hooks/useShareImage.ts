import { useState, useCallback } from 'react'
import { toJpeg } from 'html-to-image'
import { message } from 'antd'

interface UseShareImageReturn {
  picture: string
  isModalOpen: boolean
  generateImage: (element: HTMLElement) => Promise<void>
  downloadImage: (filename?: string) => void
  closeModal: () => void
}

export const useShareImage = (): UseShareImageReturn => {
  const [picture, setPicture] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const generateImage = useCallback(async (element: HTMLElement) => {
    try {
      const dataUrl = await toJpeg(element, { quality: 1 })
      setPicture(dataUrl)
      setIsModalOpen(true)
    } catch {
      message.error('生成分享图片失败')
    }
  }, [])

  const downloadImage = useCallback((filename?: string) => {
    if (!picture) return
    const link = document.createElement('a')
    link.download = filename || `分享图片_${new Date().toLocaleDateString()}.jpg`
    link.href = picture
    link.click()
  }, [picture])

  const closeModal = useCallback(() => {
    setIsModalOpen(false)
  }, [])

  return {
    picture,
    isModalOpen,
    generateImage,
    downloadImage,
    closeModal,
  }
}