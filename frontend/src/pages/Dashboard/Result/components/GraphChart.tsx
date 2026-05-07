import ReactECharts from 'echarts-for-react';
import type { Entryship, GraphData } from '@/types/api';

interface EntryGroup {
  category: { id: number; name: string; show_count?: number }
  entrys: Entryship[]
}

interface GraphChartProps {
  data: EntryGroup[] | null
  graphData?: GraphData | null
}

// 图表颜色配置
const CHART_COLORS = [
  '#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de',
  '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc', '#669999',
  '#FF0000', '#006666',
]

// 图表基础配置
const getBaseChartOption = () => ({
  color: CHART_COLORS,
  tooltip: {},
  animationDurationUpdate: 1500,
  animationEasingUpdate: 'quinticInOut',
})

// 图表系列配置
const getGraphSeries = (
  nodes: any[],
  links: any[],
  categories: any[],
) => ({
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
  categories,
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
})

// 转换数据为图表格式
const transformDataToChartFormat = (data: EntryGroup[]) => {
  const categories: any[] = []
  const links: any[] = []
  const nodes: any[] = []

  data.forEach((item, index) => {
    categories.push(item.category)
    if (item.entrys && item.entrys.length > 0) {
      item.entrys.forEach((entry) => {
        const showCount = entry.category?.show_count ?? 0
        if ((entry.number ?? 0) > showCount || !entry.number) {
          nodes.push({
            name: entry.title,
            category: index,
            value: entry.number || '',
            id: String(entry.id),
            symbolSize: (entry.number ?? 0) > 80 ? 100 : (entry.number ?? 0) < 10 ? 10 : entry.number || 30,
          })
        }

        if (entry.entrys && entry.entrys.length > 0) {
          entry.entrys.forEach((subEntry) => {
            links.push({
              source: String(entry.id),
              target: String(subEntry.id),
              label: { show: false },
              ignoreForceLayout: true,
            })
          })
        }
      })
    }
  })

  return { categories, links, nodes }
}

export function GraphChart({ data, graphData }: GraphChartProps) {
  if (!data || data.length === 0) {
    return <ReactECharts option={{}} style={{ height: '400px' }} />
  }

  // 优先使用后端返回的 graphData
  if (graphData && graphData.nodes && graphData.nodes.length > 0) {
    const option = {
      ...getBaseChartOption(),
      legend: {
        type: 'scroll',
        data: graphData.categories.map((a) => a.name),
      },
      series: [getGraphSeries(graphData.nodes, graphData.links, graphData.categories)],
    }
    return (
      <ReactECharts
        option={option}
        style={{ width: '100%', height: '65vh', backgroundColor: 'none', margin: 0 }}
      />
    )
  }

  // 降级：使用 groups 转换逻辑
  const { categories, links, nodes } = transformDataToChartFormat(data)

  const option = {
    ...getBaseChartOption(),
    legend: {
      type: 'scroll',
      data: categories.map((a) => a.name),
    },
    series: [getGraphSeries(nodes, links, categories)],
  }

  return (
    <ReactECharts
      option={option}
      style={{ width: '100%', height: '65vh', backgroundColor: 'none', margin: 0 }}
    />
  )
}
