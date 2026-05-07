import { useState, useRef, useCallback, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { Card, Spin, Modal, Button } from 'antd'
import { useResultInfo, useResultGroups } from '@/api/request'
import { usePermission, useShareImage } from '@/hooks'
import { PageContainer } from '@/components/PageContainer'
import { ShareModal } from '@/components/ShareModal'
import { BasicInfo } from './components/BasicInfo'
import { SuggestionForm } from './components/SuggestionForm'
import { SymptomCard } from './components/SymptomCard'
import { PieChart } from './components/PieChart'
import { GraphChart } from './components/GraphChart'
import type { EntryGroup } from '@/types/api'

// 图表模态框状态类型
interface ChartModalState {
  type: 'pie' | 'graph' | null
  data?: EntryGroup
}

export default function Result() {
  const { id } = useParams<{ id: string }>()
  const { isStaff } = usePermission()
  const { data: resultInfo, isLoading: infoLoading, refetch } = useResultInfo(Number(id))
  const { data: resultGroups, isLoading: groupsLoading } = useResultGroups(Number(id))
  const resultRef = useRef<HTMLDivElement>(null)

  // 图表模态框状态管理
  const [chartModal, setChartModal] = useState<ChartModalState>({
    type: null,
    data: undefined,
  })

  const showPieModal = useCallback((group: EntryGroup) => {
    setChartModal({ type: 'pie', data: group })
  }, [])

  const showGraphModal = useCallback(() => {
    setChartModal({ type: 'graph' })
  }, [])

  const hideChartModal = useCallback(() => {
    setChartModal({ type: null })
  }, [])

  const { picture, isModalOpen, generateImage, downloadImage, closeModal } = useShareImage()

  const isLoading = useMemo(() => infoLoading || groupsLoading, [infoLoading, groupsLoading])

  const handleGenerateShareImage = useCallback(async () => {
    if (!resultRef.current) return
    const shareBtn = document.querySelector('.share-btn') as HTMLElement
    if (shareBtn) shareBtn.style.display = 'none'
    await generateImage(resultRef.current)
    if (shareBtn) shareBtn.style.display = ''
  }, [resultRef, generateImage])

  const handleDownloadImage = useCallback(() => {
    downloadImage(`健康报告_${new Date().toLocaleDateString()}.jpg`)
  }, [downloadImage])

  const renderRemarkCard = useMemo(() => {
    if (!resultInfo?.remark && !resultInfo?.suggestion) return null
    return (
      <Card title="备注与意见" size="small" className="mt-4">
        {resultInfo.remark && (
          <div className="mb-2">
            <b>备注：</b>
            {resultInfo.remark}
          </div>
        )}
        {resultInfo.suggestion && (
          <div className="text-green-600 font-bold whitespace-pre-wrap">
            <b>参考意见：</b>
            {resultInfo.suggestion}
          </div>
        )}
      </Card>
    )
  }, [resultInfo?.remark, resultInfo?.suggestion])

  const renderHealthAnalysis = useMemo(() => {
    if (!resultGroups?.groups?.length) return null
    return (
      <Card title="健康分析" size="small" className="mt-4">
        {resultGroups.groups.map((group, index) => (
          <SymptomCard
            key={group.category.id}
            group={group}
            index={index}
            onPieClick={() => showPieModal(group)}
            onGraphClick={showGraphModal}
          />
        ))}
      </Card>
    )
  }, [resultGroups?.groups, showPieModal, showGraphModal])

  if (isLoading) {
    return <Spin tip="分析中，稍等5-10秒..." />
  }

  if (!resultInfo) {
    return <div>未找到结果</div>
  }

  return (
    <PageContainer>
      <div ref={resultRef}>
        <BasicInfo result={resultInfo} isStaff={isStaff} />

        {renderRemarkCard}

        <SuggestionForm result={resultInfo} onSuccess={refetch} />

        {renderHealthAnalysis}

        <div className="text-center mt-4 share-btn">
          <Button onClick={handleGenerateShareImage}>分享</Button>
        </div>
      </div>

      <Modal
        title={`${chartModal.data?.category.name || ''}统计`}
        open={chartModal.type === 'pie'}
        onCancel={hideChartModal}
        footer={null}
        width="80%"
        centered
        destroyOnHidden
      >
        {chartModal.data && <PieChart data={chartModal.data.entrys} />}
      </Modal>

      <Modal
        title="总关系图"
        open={chartModal.type === 'graph'}
        onCancel={hideChartModal}
        footer={null}
        width="90%"
        centered
        destroyOnHidden
      >
        <GraphChart data={resultGroups?.groups || []} graphData={resultGroups?.graph} />
      </Modal>

      <ShareModal
        open={isModalOpen}
        picture={picture}
        onClose={closeModal}
        onDownload={handleDownloadImage}
        title="分享图片查看"
      />
    </PageContainer>
  )
}
