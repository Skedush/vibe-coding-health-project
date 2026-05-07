import { useState, useEffect, useCallback, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Form, Input, Button, Card, message, Spin, Alert } from 'antd'
import { useEntryInfoDetail, useAddUserEntry } from '@/api/request'
import { CATEGORY_TYPE } from '@/types/api'
import type { Entry } from '@/types/api'
import { processTreeStructure } from '@/utils/entry'
import { PageContainer } from '@/components/PageContainer'
import { PageTitle } from '@/components/PageTitle'
import { BasicFields } from './components/BasicFields'
import { MedicalFields } from './components/MedicalFields'
import { SymptomSelector } from './components/SymptomSelector'

const { TextArea } = Input

interface FormValues {
  name: string
  phone: string
  address?: string
  gender: string
  age?: string
  height?: string
  weight?: string
  waistline?: string
  systolic_pressure?: string
  diastolic_pressure?: string
  blood_sugar?: string
  remark?: string
}

/**
 * 健康自检表单页面组件
 * 负责收集用户基本信息、医学指标和症状选择
 */
export default function FillForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [form] = Form.useForm<FormValues>()
  const entryId = id ? Number(id) : null

  // 症状选择状态管理
  const [category, setCategory] = useState<number | null>(null)
  const [checkList, setCheckList] = useState<Entry[]>([])
  const [entryIds, setEntryIds] = useState<number[]>([])
  
  // 通过 useMemo 计算已选症状数量，避免冗余状态
  const entryNum = useMemo(() => entryIds.length, [entryIds])

  // 获取表单模板详情
  const { data: entryInfoDetail, isLoading } = useEntryInfoDetail(entryId || 0)
  const addMutation = useAddUserEntry()

  // 计算树形结构的症状列表，使用 useMemo 缓存计算结果
  const collectionList = useMemo(() => {
    if (!entryInfoDetail || entryInfoDetail.category_id !== CATEGORY_TYPE.TREE_STRUCTURE) {
      return []
    }
    return entryInfoDetail.entrys ? processTreeStructure(entryInfoDetail.entrys) : []
  }, [entryInfoDetail])

  // 初始化和更新表单模板数据
  useEffect(() => {
    if (!entryInfoDetail) {
      setCategory(null)
      setCheckList([])
      return
    }

    setCategory(entryInfoDetail.category_id || null)

    // 非树形结构时，直接使用条目列表
    if (entryInfoDetail.category_id !== CATEGORY_TYPE.TREE_STRUCTURE) {
      setCheckList(entryInfoDetail.entrys || [])
    } else {
      setCheckList([])
    }
  }, [entryInfoDetail])

  /**
   * 处理症状选择变化（兼容复选框和树形组件）
   * @param selectedIds 已选中的症状ID数组
   */
  const handleEntrySelect = useCallback((selectedIds: number[]) => {
    setEntryIds(selectedIds)
  }, [])

  /**
   * 构建提交参数对象
   * @param values 表单值
   * @returns 格式化后的提交参数
   */
  const buildSubmitParams = (values: FormValues) => ({
    entry_info_id: entryId ?? undefined,
    name: values.name,
    phone: values.phone,
    address: values.address || '',
    gender: values.gender || '1',
    age: values.age || '',
    height: values.height || '',
    weight: values.weight || '',
    waistline: values.waistline || '',
    systolic_pressure: values.systolic_pressure || '',
    diastolic_pressure: values.diastolic_pressure || '',
    blood_sugar: values.blood_sugar || '',
    remark: values.remark || '',
    entry_ids: entryIds,
  })

  /**
   * 表单提交处理
   * @param values 表单值
   */
  const onFinish = async (values: FormValues) => {
    if (!entryId) {
      message.error('错误，请用复制或者转发的连接进入本页面')
      return
    }

    if (entryIds.length < 3) {
      message.warning('您不到3个症状，非常健康！')
      return
    }

    try {
      const params = buildSubmitParams(values)
      await addMutation.mutateAsync(params)
      message.success('提交成功')
      navigate(`/dashboard/success?num=${entryNum}`)
    } catch {
      message.error('提交失败')
    }
  }

  /**
   * 重置表单和症状选择状态
   */
  const onReset = () => {
    form.resetFields()
    setEntryIds([])
  }

  if (!id) {
    return (
      <PageContainer>
        <Card>
          <Alert message="错误，请用复制或者转发的连接进入本页面" type="error" showIcon />
        </Card>
      </PageContainer>
    )
  }

  const title = entryInfoDetail?.title_name || ''

  return (
    <PageContainer>
      <Card title={<PageTitle title="自检系统" subtitle={title} />}>
        <Spin spinning={isLoading} tip="加载中,等待3-10秒...">
          <Form<FormValues>
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{ gender: '1' }}
          >
            <BasicFields />

            <MedicalFields />

            <SymptomSelector
              category={category}
              checkList={checkList}
              collectionList={collectionList}
              entryIds={entryIds}
              onSelect={handleEntrySelect}
            />

            <Form.Item>
              <Alert message={`您共选择了 ${entryNum} 个症状`} type="success" showIcon />
            </Form.Item>

            <Form.Item name="remark" label="其他症状|手术史|疾病">
              <TextArea
                placeholder="其他症状|手术史|疾病（最难受、最想调的症状和最难改、最想改的习惯）"
                rows={3}
              />
            </Form.Item>

            <Form.Item>
              <div className="flex gap-2">
                <Button type="primary" htmlType="submit" loading={addMutation.isPending}>
                  提交
                </Button>
                <Button onClick={onReset}>重置</Button>
              </div>
            </Form.Item>
          </Form>
        </Spin>
      </Card>
    </PageContainer>
  )
}