import ReactECharts from 'echarts-for-react'
import type { Entryship, GraphData } from '@/types/api'

interface EntryGroup {
  category: { id: number; name: string; show_count?: number }
  entrys: Entryship[]
}

interface GraphChartProps {
  data: EntryGroup[] | null
  graphData?: GraphData | null
}

export function GraphChart({ data, graphData }: GraphChartProps) {
  if (!data || data.length === 0) {
    return <ReactECharts option={{}} style={{ height: '400px' }} />
  }

  // 优先使用后端返回的 graphData
  if (graphData && graphData.nodes && graphData.nodes.length > 0) {
    const option = {
      color: [
        '#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de',
        '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc', '#669999',
        '#FF0000', '#006666',
      ],
      legend: {
        type: 'scroll',
        data: graphData.categories.map((a) => a.name),
      },
      tooltip: {},
      animationDurationUpdate: 1500,
      animationEasingUpdate: 'quinticInOut',
      series: [
        {
          scaleLimit: { min: 0.5, max: 5 },
          nodeScaleRatio: 1,
          symbol: 'pin',
          type: 'graph',
          layout: 'force',
          animation: true,
          roam: true,
          legendHoverLink: false,
          label: {
            show: true,
            position: 'right',
            formatter: '{b}',
          },
          draggable: true,
          data: graphData.nodes,
          categories: graphData.categories,
          force: {
            edgeLength: [40, 5],
            layoutAnimation: true,
            repulsion: 20,
            gravity: 0.1,
            friction: 0.1,
          },
          edges: graphData.links,
          emphasis: {
            focus: 'adjacency',
            blurScope: 'global',
            lineStyle: {
              width: 10,
            },
          },
        },
      ],
    }
    return (
      <ReactECharts
        option={option}
        style={{ width: '100%', height: '65vh', backgroundColor: 'none', margin: 0 }}
      />
    )
  }

  // 降级：使用旧的 groups 转换逻辑（兼容）
  const categories: any[] = []
  const links: any[] = []
  const nodes: any[] = []

  // 按老项目 getGraphData 逻辑处理 entryGroups
  data.forEach((item: EntryGroup, index: number) => {
    categories.push(item.category)
    if (item.entrys && item.entrys.length > 0) {
      item.entrys.forEach((entry: any) => {
        const showCount = entry.category?.show_count ?? 0
        if ((entry.number ?? 0) > showCount || !entry.number) {
          nodes.push({
            name: entry.title,
            category: index,
            value: entry.number || '',
            id: String(entry.id),
            symbolSize:
              entry.number > 80 ? 100 : entry.number < 10 ? 10 : entry.number || 30,
          })
        }

        if (entry.entrys && entry.entrys.length > 0) {
          entry.entrys.forEach((subEntry: any) => {
            links.push({
              source: String(entry.id),
              target: String(subEntry.id),
              label: {
                show: false,
              },
              ignoreForceLayout: true,
            })
          })
        }
      })
    }
  })

  const option = {
    color: [
      '#5470c6',
      '#91cc75',
      '#fac858',
      '#ee6666',
      '#73c0de',
      '#3ba272',
      '#fc8452',
      '#9a60b4',
      '#ea7ccc',
      '#669999',
      '#FF0000',
      '#006666',
    ],
    legend: {
      type: 'scroll',
      data: categories.map((a: any) => a.name),
    },
    tooltip: {},
    animationDurationUpdate: 1500,
    animationEasingUpdate: 'quinticInOut',
    series: [
      {
        scaleLimit: { min: 0.5, max: 5 },
        nodeScaleRatio: 1,
        symbol: 'pin',
        type: 'graph',
        layout: 'force',
        animation: true,
        roam: true,
        legendHoverLink: false,
        label: {
          show: true,
          position: 'right',
          formatter: '{b}',
        },
        draggable: true,
        data: nodes,
        categories: categories,
        force: {
          edgeLength: [40, 5],
          layoutAnimation: true,
          repulsion: 20,
          gravity: 0.1,
          friction: 0.1,
        },
        edges: links,
        emphasis: {
          focus: 'adjacency',
          blurScope: 'global',
          lineStyle: {
            width: 10,
          },
        },
      },
    ],
  }

  return (
    <ReactECharts
      option={option}
      style={{ width: '100%', height: '65vh', backgroundColor: 'none', margin: 0 }}
    />
  )
}
