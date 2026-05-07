import ReactECharts from 'echarts-for-react'
import type { Entryship } from '@/types/api'

interface PieChartProps {
  data: Entryship[]
}

export function PieChart({ data }: PieChartProps) {
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b} : {c} ({d}%)',
    },
    legend: {
      type: 'scroll',
      data: data.map((item) => item.title),
    },
    series: [
      {
        type: 'pie',
        radius: '60%',
        data: data.map((item) => ({
          name: item.title,
          value: item.number || 0,
        })),
      },
    ],
  }

  return <ReactECharts option={option} className="h-80" />
}
