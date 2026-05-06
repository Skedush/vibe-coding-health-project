import { Form, Checkbox, Tree } from 'antd'
import type { Entry } from '@/types/api'

interface CollectionItem {
  title: string
  checkList: Entry[]
}

interface Props {
  category: number | null
  checkList: Entry[]
  collectionList: CollectionItem[]
  entryIds: number[]
  onCheckedChange: (checkedIds: number[]) => void
  onNodeCheck: (checkedKeys: React.Key[]) => void
}

export const SymptomSelector = ({
  category,
  checkList,
  collectionList,
  entryIds,
  onCheckedChange,
  onNodeCheck,
}: Props) => {
  // category === 3: checkbox 列表形式
  if (category === 3 && checkList.length > 0) {
    return (
      <Form.Item
        label="症状"
        required
        validateStatus={entryIds.length === 0 ? 'error' : ''}
        help={entryIds.length === 0 ? '请选择症状' : ''}
      >
        <Checkbox.Group
          value={entryIds}
          onChange={(checkedValues) => onCheckedChange(checkedValues as number[])}
        >
          {checkList.map((item) => (
            <div key={item.id}>
              <Checkbox value={item.id}>{item.title}</Checkbox>
            </div>
          ))}
        </Checkbox.Group>
      </Form.Item>
    )
  }

  // category === 6: 树形结构形式
  if (category === 6 && collectionList.length > 0) {
    return (
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
              onNodeCheck(checked)
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
    )
  }

  return null
}
