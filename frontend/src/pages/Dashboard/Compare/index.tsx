import { useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { Card, Spin, Descriptions, Button, Modal, Tag, Tooltip, message } from 'antd'
import { useResultCompare, useEntryInfoDetail } from '@/api/request'
import { useAuthStore } from '@/stores/authStore'
import domtoimage from 'dom-to-image'
import type { Entry } from '@/types/api'
import { PageContainer } from '@/components/PageContainer'

export default function Compare() {
  const { id, oneId, twoId } = useParams<{ id: string; oneId: string; twoId: string }>()
  const { user } = useAuthStore()
  const resultRef = useRef<HTMLDivElement>(null)

  const { data: entryInfo, isLoading: entryInfoLoading } = useEntryInfoDetail(Number(id))
  const { data: compare1, isLoading: loading1 } = useResultCompare(Number(oneId))
  const { data: compare2, isLoading: loading2 } = useResultCompare(Number(twoId))

  const [imgModalVisible, setImgModalVisible] = useState(false)
  const [picture, setPicture] = useState('')

  const isLoading = entryInfoLoading || loading1 || loading2

  const perIds = compare1?.entry_ids || []
  const thisIds = compare2?.entry_ids || []

  // 获取卡片样式类名
  const getCardGridClassName = (entryId: number) => {
    const inPer = perIds.includes(entryId)
    const inThis = thisIds.includes(entryId)
    if (inPer && inThis) return 'bg-red-500 text-white'
    if (inPer) return 'bg-blue-500 text-white'
    if (inThis) return 'bg-orange-400 text-white'
    return ''
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
    return <Spin tip="请求数据中，稍等3-10秒..." />
  }

  const perCommit = compare1
  const thisCommit = compare2

  // 所有条目模板来自 entryInfo.entrys
  const allEntrys: Entry[] = entryInfo?.entrys || []

  return (
    <PageContainer>
      <div ref={resultRef}>
        <Card title={entryInfo?.category?.name || '健康症状自检表'}>
          <div className="flex justify-center gap-5 mb-4">
          <Tag color="#108ee9">上次</Tag>
          <Tag color="#f09000">近次</Tag>
          <Tag color="#FF0000">两次都有</Tag>
        </div>

        <div className="flex gap-5 mb-4 text-gray-600">
          <div>
            提交时间：
            <div className="flex flex-col">
              <span className="text-blue-600">
                {perCommit?.created ? new Date(perCommit.created).toLocaleString() : '-'}
              </span>
              <span className="text-orange-500">
                {thisCommit?.created ? new Date(thisCommit.created).toLocaleString() : '-'}
              </span>
            </div>
          </div>
        </div>

        {isStaff && (
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="姓名">
              <div className="flex flex-col">
                <span className="text-blue-600">{perCommit?.name || '-'}</span>
                <span className="text-orange-500">{thisCommit?.name || '-'}</span>
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="手机">
              <div className="flex flex-col">
                <span className="text-blue-600">{perCommit?.phone || '-'}</span>
                <span className="text-orange-500">{thisCommit?.phone || '-'}</span>
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="年龄">
              <div className="flex flex-col">
                <span className="text-blue-600">{perCommit?.age || '-'}</span>
                <span className="text-orange-500">{thisCommit?.age || '-'}</span>
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="性别">
              <div className="flex flex-col">
                <span className="text-blue-600">{perCommit?.gender === '1' ? '男' : '女'}</span>
                <span className="text-orange-500">{thisCommit?.gender === '1' ? '男' : '女'}</span>
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="身高">
              <div className="flex flex-col">
                <span className="text-blue-600">{perCommit?.height || '-'}</span>
                <span className="text-orange-500">{thisCommit?.height || '-'}</span>
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="体重">
              <div className="flex flex-col">
                <span className="text-blue-600">{perCommit?.weight || '-'}</span>
                <span className="text-orange-500">{thisCommit?.weight || '-'}</span>
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="腰围">
              <div className="flex flex-col">
                <span className="text-blue-600">{perCommit?.waistline || '-'}</span>
                <span className="text-orange-500">{thisCommit?.waistline || '-'}</span>
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="血糖">
              <div className="flex flex-col">
                <span className="text-blue-600">{perCommit?.blood_sugar || '-'}</span>
                <span className="text-orange-500">{thisCommit?.blood_sugar || '-'}</span>
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="收缩压">
              <div className="flex flex-col">
                <span className="text-blue-600">{perCommit?.systolic_pressure || '-'}</span>
                <span className="text-orange-500">{thisCommit?.systolic_pressure || '-'}</span>
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="舒张压">
              <div className="flex flex-col">
                <span className="text-blue-600">{perCommit?.diastolic_pressure || '-'}</span>
                <span className="text-orange-500">{thisCommit?.diastolic_pressure || '-'}</span>
              </div>
            </Descriptions.Item>
          </Descriptions>
        )}

        {(perCommit?.remark || thisCommit?.remark) && (
          <div className="mt-4">
            <b>备注或其他症状：</b>
            <div className="flex flex-col">
              <span className="text-blue-600">{perCommit?.remark || '-'}</span>
              <span className="text-orange-500">{thisCommit?.remark || '-'}</span>
            </div>
          </div>
        )}
      </Card>

      <Card title="健康分析" className="mt-4">
        <div className="flex flex-wrap">
          {allEntrys.map((entry) => (
            <Tooltip key={entry.id} title={entry.title} trigger="click">
              <div
                className={`w-1/5 text-center p-4 ${getCardGridClassName(entry.id)}`}
              >
                <div className="truncate">{entry.title}</div>
              </div>
            </Tooltip>
          ))}
        </div>
      </Card>

      <div className="text-center mt-4 share-btn">
        <Button onClick={domToImage}>分享</Button>
      </div>

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
    </div>
  </PageContainer>
)
}
