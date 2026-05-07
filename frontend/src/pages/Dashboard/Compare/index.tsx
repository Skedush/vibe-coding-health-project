import { useRef, useMemo, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { Card, Spin, Descriptions, Button, Tag, Tooltip } from 'antd'
import { useResultCompare, useEntryInfoDetail } from '@/api/request'
import { usePermission, useShareImage } from '@/hooks'
import { PageContainer } from '@/components/PageContainer'
import { ShareModal } from '@/components/ShareModal'
import type { Entry } from '@/types/api'

export default function Compare() {
  const { id, oneId, twoId } = useParams<{ id: string; oneId: string; twoId: string }>()
  const { isStaff } = usePermission()
  const resultRef = useRef<HTMLDivElement>(null)

  const { data: entryInfo, isLoading: entryInfoLoading } = useEntryInfoDetail(Number(id))
  const { data: compare1, isLoading: loading1 } = useResultCompare(Number(oneId))
  const { data: compare2, isLoading: loading2 } = useResultCompare(Number(twoId))

  const {
    picture,
    isModalOpen,
    generateImage,
    downloadImage,
    closeModal,
  } = useShareImage()

  const isLoading = useMemo(
    () => entryInfoLoading || loading1 || loading2,
    [entryInfoLoading, loading1, loading2]
  )

  const perIds = useMemo(() => compare1?.entry_ids || [], [compare1?.entry_ids])
  const thisIds = useMemo(() => compare2?.entry_ids || [], [compare2?.entry_ids])

  const getCardGridClassName = useCallback(
    (entryId: number) => {
      const inPer = perIds.includes(entryId)
      const inThis = thisIds.includes(entryId)
      if (inPer && inThis) return 'bg-red-500 text-white'
      if (inPer) return 'bg-blue-500 text-white'
      if (inThis) return 'bg-orange-400 text-white'
      return 'bg-gray-100 text-gray-800'
    },
    [perIds, thisIds]
  )

  const handleGenerateShareImage = useCallback(async () => {
    if (!resultRef.current) return
    const shareBtn = document.querySelector('.share-btn') as HTMLElement
    if (shareBtn) shareBtn.style.display = 'none'
    await generateImage(resultRef.current)
    if (shareBtn) shareBtn.style.display = ''
  }, [resultRef, generateImage])

  const handleDownloadImage = useCallback(() => {
    downloadImage(`对比报告_${new Date().toLocaleDateString()}.jpg`)
  }, [downloadImage])

  const perCommit = compare1
  const thisCommit = compare2
  const allEntrys: Entry[] = entryInfo?.entrys || []

  const renderRemark = useMemo(() => {
    if (!perCommit?.remark && !thisCommit?.remark) return null
    return (
      <div className="mt-4">
        <b>备注或其他症状：</b>
        <div className="flex flex-col">
          <span className="text-blue-600">{perCommit?.remark || '-'}</span>
          <span className="text-orange-500">{thisCommit?.remark || '-'}</span>
        </div>
      </div>
    )
  }, [perCommit?.remark, thisCommit?.remark])

  const renderHealthAnalysis = useMemo(() => {
    if (!allEntrys.length) return null
    return (
      <Card title="健康分析" className="mt-4">
        <div className="flex flex-wrap">
          {allEntrys.map((entry) => (
            <Tooltip key={entry.id} title={entry.title} trigger="click">
              <div className={`w-1/5 text-center p-4 ${getCardGridClassName(entry.id)}`}>
                <div className="truncate">{entry.title}</div>
              </div>
            </Tooltip>
          ))}
        </div>
      </Card>
    )
  }, [allEntrys, getCardGridClassName])

  if (isLoading) {
    return <Spin tip="请求数据中，稍等3-10秒..." />
  }

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
                  <span className="text-blue-600">
                    {perCommit?.gender === '1' ? '男' : '女'}
                  </span>
                  <span className="text-orange-500">
                    {thisCommit?.gender === '1' ? '男' : '女'}
                  </span>
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
                  <span className="text-blue-600">
                    {perCommit?.diastolic_pressure || '-'}
                  </span>
                  <span className="text-orange-500">
                    {thisCommit?.diastolic_pressure || '-'}
                  </span>
                </div>
              </Descriptions.Item>
            </Descriptions>
          )}

          {renderRemark}
        </Card>

        {renderHealthAnalysis}

        <div className="text-center mt-4 share-btn">
          <Button onClick={handleGenerateShareImage}>分享</Button>
        </div>
      </div>

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
