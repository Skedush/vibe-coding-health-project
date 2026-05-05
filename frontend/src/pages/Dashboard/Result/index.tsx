import { useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { Card, Spin, Modal, Button, message } from 'antd'
import { useResultInfo, useResultGroups } from '@/api/request'
import { useAuthStore } from '@/stores/authStore'
import { PageContainer } from '@/components/PageContainer'
import { BasicInfo } from './components/BasicInfo'
import { SuggestionForm } from './components/SuggestionForm'
import { SymptomCard } from './components/SymptomCard'
import { PieChart } from './components/PieChart'
import { GraphChart } from './components/GraphChart'
import type { ResultInfo, ResultGroups, EntryGroup } from '@/types/api'
import domtoimage from 'dom-to-image'

export default function Result() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuthStore()
  const { data: resultInfo, isLoading: infoLoading, refetch } = useResultInfo(Number(id))
  const { data: resultGroups, isLoading: groupsLoading } = useResultGroups(Number(id))
  const isLoading = infoLoading || groupsLoading
  const resultRef = useRef<HTMLDivElement>(null)

  const [pieModalVisible, setPieModalVisible] = useState(false)
  const [graphModalVisible, setGraphModalVisible] = useState(false)
  const [imgModalVisible, setImgModalVisible] = useState(false)
  const [selectedPieData, setSelectedPieData] = useState<EntryGroup | null>(null)
  const [picture, setPicture] = useState('')

  const showPieModal = (group: EntryGroup) => {
    setSelectedPieData(group)
    setPieModalVisible(true)
  }

  const showGraphModal = () => {
    setGraphModalVisible(true)
  }

  const domToImage = async () => {
    if (!resultRef.current) return
    try {
      const shareBtn = document.querySelector('.share-btn') as HTMLElement
      if (shareBtn) shareBtn.style.display = 'none'
      const dataUrl = await domtoimage.toJpeg(resultRef.current, { quality: 1 })
      if (shareBtn) shareBtn.style.display = ''
      setPicture(dataUrl)
      setImgModalVisible(true)
    } catch {
      message.error('生成分享图片失败')
    }
  }

  const isStaff = user?.is_staff

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

        {(resultInfo.remark || resultInfo.suggestion) && (
          <Card title="备注与意见" size="small" className="mt-4">
            {resultInfo.remark && (
              <div className="mb-2">
                <b>备注：</b>{resultInfo.remark}
              </div>
            )}
            {resultInfo.suggestion && (
              <div className="text-green-600 font-bold whitespace-pre-wrap">
                <b>参考意见：</b>{resultInfo.suggestion}
              </div>
            )}
          </Card>
        )}

        <SuggestionForm result={resultInfo} onSuccess={refetch} />

        {resultGroups?.groups && resultGroups.groups.length > 0 && (
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
        )}

        <div className="text-center mt-4 share-btn">
          <Button onClick={domToImage}>分享</Button>
        </div>
      </div>

      {/* 饼图弹窗 */}
      <Modal
        title={`${selectedPieData?.category.name || ''}统计`}
        open={pieModalVisible}
        onCancel={() => setPieModalVisible(false)}
        footer={null}
        width="80%"
        centered
      >
        {selectedPieData && <PieChart data={selectedPieData.entrys} />}
      </Modal>

      {/* 雷达图弹窗 */}
      <Modal
        title="总关系图"
        open={graphModalVisible}
        onCancel={() => setGraphModalVisible(false)}
        footer={null}
        width="90%"
        bodyStyle={{ height: '70vh' }}
        centered
      >
        <GraphChart data={resultGroups?.groups || []} />
      </Modal>

      {/* 图片弹窗 */}
      <Modal
        title="分享图片查看"
        open={imgModalVisible}
        onCancel={() => setImgModalVisible(false)}
        footer={null}
        width="80%"
        centered
      >
        {picture && <img src={picture} alt="分享图片" className="w-full" />}
      </Modal>
    </PageContainer>
  )
}
