import type { Node, dfsArgs } from '../interface'

export default function dfsAlgo({ grid, startNode, endNode }: dfsArgs): any {
  const stack = [startNode]
  const visitedSet = new Set()
  const result: Node[] = []
  const neighborsStart = getNeighbors(startNode, grid)
  while (stack.length) {
    const vertex = stack.pop()
    if (!visitedSet.has(vertex) && vertex?.isWall === false) {
      if (neighborsStart.includes(vertex))
        result.length = 1
      visitedSet.add(vertex)
      result.push(vertex)
      if (vertex === endNode)
        break
      const neighbors = getNeighbors(vertex, grid)
      for (const neighbor of neighbors)
        stack.push(neighbor)
    }
    if (stack.length === 0 && !vertex?.isEnd)
      return { shortest: [], allVisited: Array.from(visitedSet) }
  }

  return { shortest: result, allVisited: Array.from(visitedSet) }
}

function getNeighbors(node: Node, grid: Node[][]) {
  const row = node.row
  const col = node.col
  const neighbors = []
  if (row > 0)
    neighbors.push(grid[row - 1][col])
  if (row < grid.length - 1)
    neighbors.push(grid[row + 1][col])
  if (col > 0)
    neighbors.push(grid[row][col - 1])
  if (col < grid[0].length - 1)
    neighbors.push(grid[row][col + 1])
  return neighbors.filter(n => !n.isWall) // Filtrer les murs
}
