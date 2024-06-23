import type { Node, dfsArgs } from '../interface'

export default function dfsAlgo({ grid, startNode, endNode }: dfsArgs): any {
  const stack: Array<{ node: Node, path: Node[] }> = [{ node: startNode, path: [] }]
  const visitedMap = new Map<Node, Node | null>()

  while (stack.length > 0) {
    const { node, path } = stack.pop()!
    if (!visitedMap.has(node) && node?.isWall === false) {
      visitedMap.set(node, null)
      path.push(node)
      if (node === endNode)
        return { shortest: path, allVisited: Array.from(visitedMap.keys()) }
      const neighbors = getNeighbors(node, grid)
      for (const neighbor of neighbors) {
        if (!visitedMap.has(neighbor))
          stack.push({ node: neighbor, path: [...path] })
      }
    }
  }

  return { shortest: [], allVisited: Array.from(visitedMap.keys()) }
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
