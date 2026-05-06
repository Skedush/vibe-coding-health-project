import { Form, Checkbox, Tree } from 'antd'
import { CATEGORY_TYPE } from '@/types/api'
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
  // category === CATEGORY_TYPE.CHECKBOX_LIST: checkbox 列表形式（虚拟滚动）
  if (category === CATEGORY_TYPE.CHECKBOX_LIST && checkList.length > 0) {
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
          <div
            style={{
              height: Math.min(checkList.length * 32, 300),
              overflow: 'auto',
            }}
          >
            <div
              style={{
                height: `${checkList.length * 32}px`,
                position: 'relative',
              }}
            >
              {checkList.map((item, index) => (
                <div
                  key={item.id}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '32px',
                    transform: `translateY(${index * 32}px)`,
                  }}
                >
                  <Checkbox value={item.id}>{item.title}</Checkbox>
                </div>
              ))}
            </div>
          </div>
        </Checkbox.Group>
      </Form.Item>
    )
  }

  // category === CATEGORY_TYPE.TREE_STRUCTURE: 树形结构形式
  if (category === CATEGORY_TYPE.TREE_STRUCTURE && collectionList.length > 0) {
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
