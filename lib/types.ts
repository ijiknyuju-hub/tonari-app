export type NodeStatus = 'cooked' | 'want' | 'suggested'
export type NodeType = 'base' | 'variation' | 'adjacent'

export interface RecipeNode {
  id: string
  name: string
  status: NodeStatus
  type: NodeType
  parentId: string | null
  reason: string
  position: { x: number; y: number }
  createdAt: string
}

export interface RecipeEdge {
  id: string
  source: string
  target: string
  label: string
  edgeType: 'variation' | 'adjacent'
}

export interface AppState {
  nodes: RecipeNode[]
  edges: RecipeEdge[]
  lastUpdated: string
}
