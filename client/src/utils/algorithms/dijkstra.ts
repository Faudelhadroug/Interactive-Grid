import type { Node, dijkstraArgs } from '../interface'

export default function dijkstraAlgo({ grid, startNode, endNode }: dijkstraArgs) {
  const unvisitedNodes: Node[] = getAllNodes(grid)
  startNode.distance = 0
  const visitedNodesInOrder: Node[] = []
  while (unvisitedNodes.length) {
    sortNodesByDistance(unvisitedNodes)
    const closestNode = unvisitedNodes.shift()!
    if (closestNode.isWall)
      continue
    if (closestNode.distance === Number.POSITIVE_INFINITY)
      break
    closestNode.isVisited = true
    visitedNodesInOrder.push(closestNode)
    if (closestNode === endNode)
      break
    updateUnvisitedNeighbors(closestNode, grid)
  }

  const nodesInShortestPathOrder: Node[] = []
  let currentNode = endNode

  while (currentNode !== null) {
    nodesInShortestPathOrder.unshift(currentNode)
    currentNode = currentNode.previousNode!
  }
  return { shortest: nodesInShortestPathOrder[nodesInShortestPathOrder.length - 1].isEnd && nodesInShortestPathOrder.length < 2 ? [] : nodesInShortestPathOrder, allVisited: visitedNodesInOrder }
}

function getAllNodes(tempGrid: Node[][]) {
  const nodes = []
  for (const row of tempGrid) {
    for (const node of row)
      nodes.push(node)
  }
  return nodes
}

function sortNodesByDistance(unvisitedNodes: Node[]) {
  unvisitedNodes.sort((nodeA: Node, nodeB: Node) => nodeA.distance - nodeB.distance)
}

function updateUnvisitedNeighbors(node: Node, grid: Node[][]) {
  const unvisitedNeighbors = getUnvisitedNeighbors(node, grid)
  for (const neighbor of unvisitedNeighbors) {
    neighbor.distance = node.distance + 1
    neighbor.previousNode = node
  }
}

function getUnvisitedNeighbors(node: Node, grid: Node[][]) {
  const neighbors = []
  const { col, row } = node
  if (row > 0)
    neighbors.push(grid[row - 1][col])
  if (row < grid.length - 1)
    neighbors.push(grid[row + 1][col])
  if (col > 0)
    neighbors.push(grid[row][col - 1])
  if (col < grid[0].length - 1)
    neighbors.push(grid[row][col + 1])
  return neighbors.filter(neighbor => !neighbor.isVisited)
}
