import { useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { Card, Spin, Modal, Button, message } from 'antd'
import { useResult } from '@/api/request'
import { useAuthStore } from '@/stores/authStore'
import { PageContainer } from '@/components/PageContainer'
import { BasicInfo } from './components/BasicInfo'
import { SuggestionForm } from './components/SuggestionForm'
import { SymptomCard } from './components/SymptomCard'
import { PieChart } from './components/PieChart'
import { GraphChart } from './components/GraphChart'
import type { Entryship, CategorySimple } from '@/types/api'
import domtoimage from 'dom-to-image'

interface EntryGroup {
  category: CategorySimple
  entrys: Entryship[]
}

// 条目点击跳转
const navEntry = (entry: Entryship) => {
  const { remark, title, category } = entry
  if (remark) {
    // 安全校验：只允许打开 http/https 协议的 URL
    try {
      const url = new URL(remark)
      if (url.protocol === 'http:' || url.protocol === 'https:') {
        window.open(remark)
      } else {
        message.error('不支持的链接协议')
      }
    } catch {
      message.error('链接格式无效')
    }
  } else if (category?.child_link) {
    const protocol = category.protocol || 'https://'
    const url = `${protocol}${category.child_link}${encodeURIComponent(title)}`
    window.open(url)
  }
}

// 卡片标题点击跳转
const navCategory = (category: CategorySimple) => {
  const protocol = category.protocol || 'https://'
  if (category.link) {
    window.open(`${protocol}${category.link}`)
  }
}

export default function Result() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuthStore()
  const { data: result, isLoading, refetch } = useResult(Number(id))
  const resultRef = useRef<HTMLDivElement>(null)

  const [pieModalVisible, setPieModalVisible] = useState(false)
  const [graphModalVisible, setGraphModalVisible] = useState(false)
  const [imgModalVisible, setImgModalVisible] = useState(false)
  const [selectedPieData, setSelectedPieData] = useState<EntryGroup | null>(null)
  const [picture, setPicture] = useState('')

  // 将 entryship 数据按 category 分组
  const entryGroups: EntryGroup[] = []
  if (result?.entryship) {
    result.entryship.forEach((item) => {
      // 1. 处理顶级条目 - 按 category 分组，但顶级条目不参与 number 计算
      const existingGroup = entryGroups.find((g) => g.category.id === item.category?.id)
      if (existingGroup) {
        existingGroup.entrys.push(item)
      } else if (item.category) {
        entryGroups.push({
          category: item.category,
          entrys: [item],
        })
      }

      // 2. 处理嵌套的 entrys - 按嵌套条目的 category 分组，number 累加
      if (item.entrys) {
        item.entrys.forEach((subItem) => {
          const existingSubGroup = entryGroups.find((g) => g.category.id === subItem.category?.id)
          if (existingSubGroup) {
            // 检查是否已存在该 entry
            const existingEntry = existingSubGroup.entrys.find((e) => e.id === subItem.id)
            if (existingEntry) {
              existingEntry.number = (existingEntry.number || 0) + 1
            } else {
              existingSubGroup.entrys.push({ ...subItem, number: 1 })
            }
          } else if (subItem.category) {
            entryGroups.push({
              category: subItem.category,
              entrys: [{ ...subItem, number: 1 }],
            })
          }
        })
      }
    })

    // 按 number 降序排序
    entryGroups.forEach((group) => {
      group.entrys.sort((a, b) => (b.number || 0) - (a.number || 0))
    })
  }

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

  if (!result) {
    return <div>未找到结果</div>
  }

  return (
    <PageContainer>
      <div ref={resultRef}>
        <BasicInfo result={result} isStaff={isStaff} />

        {(result.remark || result.suggestion) && (
          <Card title="备注与意见" size="small" className="mt-4">
            {result.remark && (
              <div className="mb-2">
                <b>备注：</b>{result.remark}
              </div>
            )}
            {result.suggestion && (
              <div className="text-green-600 font-bold whitespace-pre-wrap">
                <b>参考意见：</b>{result.suggestion}
              </div>
            )}
          </Card>
        )}

        <SuggestionForm result={result} onSuccess={refetch} />

        {entryGroups.length > 0 && (
          <Card title="健康分析" size="small" className="mt-4">
            {entryGroups.map((group, index) => (
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
        <GraphChart data={entryGroups} />
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
