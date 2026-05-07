import { memo, useMemo, useCallback, useState } from 'react'
import { Form, Checkbox, Tree } from 'antd'
import { CATEGORY_TYPE } from '@/types/api'
import type { Entry } from '@/types/api'
import type { CollectionItem } from '@/utils/entry'

interface Props {
  category: number | null
  checkList: Entry[]
  collectionList: CollectionItem[]
  entryIds: number[]
  onSelect: (checkedIds: number[]) => void
}

const generateTreeData = (collectionList: CollectionItem[]) => {
  return collectionList.map((group, groupIndex) => ({
    title: group.title,
    key: `group-${groupIndex}`,
    children: group.checkList.map((item) => ({
      title: item.title,
      key: item.id,
    })),
  }))
}

const SymptomSelectorComponent = ({
  category,
  checkList,
  collectionList,
  entryIds,
  onSelect,
}: Props) => {
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([])

  const treeData = useMemo(() => generateTreeData(collectionList), [collectionList])

  const handleNodeCheck = useCallback(
    (_checkedKeys: React.Key[] | { checked: React.Key[]; halfChecked: React.Key[] }) => {
      const checkedKeys = Array.isArray(_checkedKeys) ? _checkedKeys : _checkedKeys.checked || []
      const symptomIds = checkedKeys.filter((key): key is number => typeof key === 'number')
      onSelect(symptomIds)
    },
    [onSelect],
  )

  const handleCheckboxChange = useCallback(
    (checkedValues: any) => {
      onSelect(checkedValues as number[])
    },
    [onSelect],
  )

  const handleExpand = useCallback((newExpandedKeys: React.Key[]) => {
    setExpandedKeys(newExpandedKeys)
  }, [])

  if (category !== CATEGORY_TYPE.TREE_STRUCTURE && checkList.length > 0) {
    return (
      <Form.Item
        label="症状"
        required
        validateStatus={entryIds.length === 0 ? 'error' : ''}
        help={entryIds.length === 0 ? '请选择症状' : ''}
      >
        <Checkbox.Group value={entryIds} onChange={handleCheckboxChange}>
          {checkList.map((item) => (
            <div key={item.id}>
              <Checkbox value={item.id}>{item.title}</Checkbox>
            </div>
          ))}
        </Checkbox.Group>
      </Form.Item>
    )
  }

  if (category === CATEGORY_TYPE.TREE_STRUCTURE && collectionList.length > 0) {
    return (
      <Form.Item
        label="症状"
        required
        validateStatus={entryIds.length === 0 ? 'error' : ''}
        help={entryIds.length === 0 ? '请选择症状' : ''}
      >
        <div className="border border-gray-300 rounded-md p-3 bg-gray-50">
          <Tree
            checkable
            virtual
            selectable={false}
            height={350}
            itemHeight={28}
            checkedKeys={entryIds}
            expandedKeys={expandedKeys}
            onExpand={handleExpand}
            onCheck={handleNodeCheck}
            treeData={treeData}
            defaultExpandAll={false}
            checkStrictly={false}
            showIcon={false}
            className="bg-white"
          />
        </div>
      </Form.Item>
    )
  }

  return null
}

SymptomSelectorComponent.displayName = 'SymptomSelector'

export const SymptomSelector = memo(SymptomSelectorComponent)
