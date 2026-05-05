import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Form,
  Input,
  Button,
  Card,
  message,
  Spin,
  Radio,
  Checkbox,
  Tree,
  Alert,
} from 'antd'
import { useEntryInfoDetail, useAddUserEntry } from '@/api/request'
import { PageContainer } from '@/components/PageContainer'
import { PageTitle } from '@/components/PageTitle'
import type { Entry } from '@/types/api'

const { TextArea } = Input

interface CollectionItem {
  title: string
  checkList: Entry[]
}

export default function FillForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<number | null>(null)
  const [checkList, setCheckList] = useState<Entry[]>([])
  const [collectionList, setCollectionList] = useState<CollectionItem[]>([])
  const [entryIds, setEntryIds] = useState<number[]>([])
  const [entryNum, setEntryNum] = useState(0)

  const entryId = id ? Number(id) : null

  const { data: entryInfoDetail, isLoading } = useEntryInfoDetail(entryId || 0)
  const addMutation = useAddUserEntry()

  // 处理 API 返回的数据，设置 category 和对应的症状列表
  useEffect(() => {
    if (entryInfoDetail) {
      setTitle(entryInfoDetail.title_name || '')
      setCategory(entryInfoDetail.category_id || null)

      // category === 6 是树形结构，需要按 title 分组
      if (entryInfoDetail.category_id === 6 && entryInfoDetail.entrys) {
        const collectionObj: Record<string, CollectionItem> = {}
        let preTitle = ''

        entryInfoDetail.entrys.forEach((item: Entry) => {
          // 格式: "title|titleName"，用 | 分割
          const titleArray = item.title.split('|')
          const groupTitle = titleArray[0]
          const entryTitle = titleArray[1] || item.title

          // 创建新的 item 对象，使用处理后的 title
          const processedItem = { ...item, title: entryTitle }

          if (groupTitle !== preTitle) {
            if (preTitle !== '') {
              // 不做任何操作，collectionObj 会在最后统一转换
            }
            if (!collectionObj[groupTitle]) {
              collectionObj[groupTitle] = { title: groupTitle, checkList: [] }
            }
            collectionObj[groupTitle].checkList.push(processedItem)
            preTitle = groupTitle
          } else {
            collectionObj[groupTitle].checkList.push(processedItem)
          }
        })

        // 转换为数组
        const result: CollectionItem[] = Object.values(collectionObj)
        setCollectionList(result)
      } else if (entryInfoDetail.entrys) {
        // category === 3 或其他，使用平铺的 checkbox 列表
        setCheckList(entryInfoDetail.entrys)
      }
    }
  }, [entryInfoDetail])

  // 处理 checkbox 变化
  const handleCheckedChange = (checkedIds: number[]) => {
    setEntryIds(checkedIds)
    setEntryNum(checkedIds.length)
  }

  // 处理树形节点选择变化
  const handleNodeCheck = (checkedKeys: React.Key[]) => {
    const validKeys = checkedKeys.filter((key) => key !== undefined) as number[]
    setEntryIds(validKeys)
    setEntryNum(validKeys.length)
  }

  // 提交表单
  const onFinish = async (values: Record<string, string>) => {
    if (!entryId) {
      message.error('错误，请用复制或者转发的连接进入本页面')
      return
    }

    // 校验至少选择 3 个症状
    if (entryIds.length < 3) {
      message.warning('您不到3个症状，非常健康！')
      return
    }

    try {
      await addMutation.mutateAsync({
        entry_info_id: entryId,
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
      } as any)
      message.success('提交成功')
      navigate(`/dashboard/success?num=${entryNum}`)
    } catch {
      message.error('提交失败')
    }
  }

  // 重置表单
  const onReset = () => {
    form.resetFields()
    setEntryIds([])
    setEntryNum(0)
  }

  // 没有 id 参数时显示提示
  if (!id) {
    return (
      <PageContainer>
        <Card>
          <Alert message="错误，请用复制或者转发的连接进入本页面" type="error" showIcon />
        </Card>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <Card title={<PageTitle title="自检系统" subtitle={title} />}>
        <Spin spinning={isLoading} tip="加载中,等待3-10秒...">
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ gender: '1' }}
        >
          {/* 基础信息 */}
          <Form.Item
            name="name"
            label="姓名"
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Input placeholder="姓名.必填" maxLength={50} />
          </Form.Item>

          <Form.Item
            name="phone"
            label="ID"
            rules={[{ required: true, message: '请输入ID' }]}
          >
            <Input placeholder="ID.必填" maxLength={50} />
          </Form.Item>

          <Form.Item name="address" label="地址">
            <TextArea placeholder="地址" rows={2} />
          </Form.Item>

          {/* 性别 */}
          <Form.Item
            name="gender"
            label="性别"
            rules={[{ required: true, message: '请选择性别' }]}
          >
            <Radio.Group>
              <Radio value="1">男</Radio>
              <Radio value="0">女</Radio>
            </Radio.Group>
          </Form.Item>

          {/* 基础指标 */}
          <div className="flex flex-wrap gap-4">
            <Form.Item name="age" label="年龄" className="flex-1 min-w-[45%]">
              <Input placeholder="年龄" />
            </Form.Item>

            <Form.Item name="height" label="身高" className="flex-1 min-w-[45%]">
              <Input placeholder="身高cm" suffix="cm" />
            </Form.Item>

            <Form.Item name="weight" label="体重" className="flex-1 min-w-[45%]">
              <Input placeholder="体重kg" suffix="kg" />
            </Form.Item>

            <Form.Item name="waistline" label="腰围" className="flex-1 min-w-[45%]">
              <Input placeholder="腰围cm" suffix="cm" />
            </Form.Item>

            <Form.Item name="systolic_pressure" label="收缩压" className="flex-1 min-w-[45%]">
              <Input placeholder="收缩压mmHg" suffix="mmHg" />
            </Form.Item>

            <Form.Item name="diastolic_pressure" label="舒张压" className="flex-1 min-w-[45%]">
              <Input placeholder="舒张压mmHg" suffix="mmHg" />
            </Form.Item>

            <Form.Item name="blood_sugar" label="血糖" className="flex-1 min-w-[45%]">
              <Input placeholder="血糖mmol/L" suffix="mmol/L" />
            </Form.Item>
          </div>

          {/* category === 3: checkbox 列表形式 */}
          {category === 3 && checkList.length > 0 && (
            <Form.Item
              label="症状"
              required
              validateStatus={entryIds.length === 0 ? 'error' : ''}
              help={entryIds.length === 0 ? '请选择症状' : ''}
            >
              <Checkbox.Group
                value={entryIds}
                onChange={(checkedValues) => handleCheckedChange(checkedValues as number[])}
              >
                {checkList.map((item) => (
                  <div key={item.id}>
                    <Checkbox value={item.id}>{item.title}</Checkbox>
                  </div>
                ))}
              </Checkbox.Group>
            </Form.Item>
          )}

          {/* category === 6: 树形结构形式 */}
          {category === 6 && collectionList.length > 0 && (
            <Form.Item
              label="症状"
              required
              validateStatus={entryIds.length === 0 ? 'error' : ''}
              help={entryIds.length === 0 ? '请选择症状' : ''}
            >
              <Tree
                checkable
                defaultExpandAll
                checkedKeys={entryIds}
                onCheck={(checked) => {
                  if (Array.isArray(checked)) {
                    handleNodeCheck(checked)
                  }
                }}
                treeData={collectionList.map((group) => ({
                  title: group.title,
                  key: group.title,
                  children: group.checkList.map((item) => ({
                    title: item.title,
                    key: item.id,
                  })),
                }))}
              />
            </Form.Item>
          )}

          {/* 症状数量提示 */}
          <Form.Item>
            <Alert message={`您共选择了 ${entryNum} 个症状`} type="success" showIcon />
          </Form.Item>

          {/* 备注 */}
          <Form.Item name="remark" label="其他症状|手术史|疾病">
            <TextArea
              placeholder="其他症状|手术史|疾病（最难受、最想调的症状和最难改、最想改的习惯）"
              rows={3}
            />
          </Form.Item>

          {/* 提交按钮 */}
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
