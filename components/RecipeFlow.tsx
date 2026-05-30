'use client'

import { useMemo } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  type Edge,
  type Node,
} from 'reactflow'
import 'reactflow/dist/style.css'
import RecipeNode from '@/components/RecipeNode'
import { getLayoutedElements } from '@/lib/layout'
import type { RecipeEdge, RecipeNode as RecipeNodeData } from '@/lib/types'

interface RecipeFlowProps {
  nodes: RecipeNodeData[]
  edges: RecipeEdge[]
  onNodeCooked: (nodeId: string) => void
}

const nodeTypes = {
  recipeNode: RecipeNode,
}

export default function RecipeFlow({ nodes, edges, onNodeCooked }: RecipeFlowProps) {
  const { nodes: flowNodes, edges: flowEdges } = useMemo(() => {
    const reactFlowNodes: Node<RecipeNodeData>[] = nodes.map((node) => ({
      id: node.id,
      type: 'recipeNode',
      data: node,
      position: node.position,
    }))

    const reactFlowEdges: Edge[] = edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.label,
      type: 'smoothstep',
      animated: false,
      style: edge.edgeType === 'adjacent' ? { strokeDasharray: '6,3' } : undefined,
      labelStyle: { fontSize: 10, fill: '#999' },
    }))

    return getLayoutedElements(reactFlowNodes, reactFlowEdges)
  }, [edges, nodes])

  return (
    <ReactFlowProvider>
      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        nodeTypes={nodeTypes}
        nodesDraggable={false}
        nodesConnectable={false}
        fitView
        onNodeClick={(_, node) => {
          const data = node.data as RecipeNodeData

          if (data.status === 'suggested' || data.status === 'want') {
            onNodeCooked(data.id)
          }
        }}
      >
        <Background color="#E5E7EB" gap={18} />
        <Controls />
        <MiniMap pannable zoomable nodeStrokeWidth={3} />
      </ReactFlow>
    </ReactFlowProvider>
  )
}
