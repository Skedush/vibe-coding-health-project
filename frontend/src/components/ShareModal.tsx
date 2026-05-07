import { Modal, Button } from 'antd'

interface ShareModalProps {
  open: boolean
  picture: string
  onClose: () => void
  onDownload: () => void
  title?: string
}

export const ShareModal = ({
  open,
  picture,
  onClose,
  onDownload,
  title = '分享图片查看',
}: ShareModalProps) => {
  return (
    <Modal
      title={title}
      open={open}
      onCancel={onClose}
      footer={
        <div className="flex justify-end gap-2">
          <Button onClick={onDownload}>下载图片</Button>
        </div>
      }
      width="80%"
      centered
      destroyOnHidden
    >
      {picture && <img src={picture} alt="分享图片" className="w-full" />}
    </Modal>
  )
}