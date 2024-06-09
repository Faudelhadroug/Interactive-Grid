import type { Ref } from 'vue'

export interface Node {
  row: number
  col: number
  htmlNode: HTMLElement
  isStart: boolean
  isEnd: boolean
  isWall: boolean
  isVisited: boolean
  distance: number
  neighbors: Node[]
  previousNode: null | Node
  parent?: Node
  f: number
  g: number
  h: number
}

export interface CreateNode { row: number, col: number, isWall: boolean, htmlNode: HTMLElement, isStart: boolean, isEnd: boolean }

export interface aStarArgs {
  rows: number
  columns: number
  grid: Ref<Node[][]>
  start: Node
  end: Node
}

export interface dijkstraArgs {
  grid: Node[][]
  startNode: Node
  endNode: Node
}

export interface dfsArgs {
  grid: Node[][]
  startNode: Node
  endNode: Node
}
