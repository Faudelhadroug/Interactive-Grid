import { ref } from 'vue'
import type { Ref } from 'vue'

interface Node {
  row: number
  col: number
  htmlNode: HTMLElement
  isStart: boolean
  isEnd: boolean
  isWall: boolean
  isVisited: boolean
  distance: number
  neighbors: Node[]
  previousNode?: null | Node[]
  parent?: Node
  f: number
  g: number
  h: number
}

const openSet: Ref<Node[]> = ref([])
const closedSet: Ref<Node[]> = ref([])
const path: Ref<Node[]> = ref([])

function heuristic(firstPosition: Node, secondPosition: Node) {
  const d1 = Math.abs(secondPosition.row - firstPosition.row)
  const d2 = Math.abs(secondPosition.col - firstPosition.col)
  return d1 + d2
}
function updateNeighbors(node: Node, rows: number, columns: number, grid: Ref<Node[][]>) {
  const row = node.row
  const col = node.col
  if (row < rows - 1)
    node.neighbors.push(grid.value[row + 1][col])

  if (row > 0)
    node.neighbors.push(grid.value[row - 1][col])

  if (col < columns - 1)
    node.neighbors.push(grid.value[row][col + 1])

  if (col > 0)
    node.neighbors.push(grid.value[row][col - 1])
}

interface aStarArgs {
  rows: number
  columns: number
  grid: Ref<Node[][]>
  start: Node
  end: Node
}
export default async function aStarAlgo({ rows, columns, grid, start, end }: aStarArgs): Promise<Node[]> {
  //* A star base used https://dev.to/codesphere/pathfinding-with-javascript-the-a-algorithm-3jlb
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < columns; j++)
      updateNeighbors(grid.value[i][j], rows, columns, grid)
  }
  openSet.value = []
  openSet.value.push(start)
  closedSet.value = []
  path.value = []

  while (openSet.value.length > 0) {
    let lowestIndex = 0
    for (let i = 0; i < openSet.value.length; i++) {
      if (openSet.value[i].f < openSet.value[lowestIndex].f)
        lowestIndex = i
    }
    const current = openSet.value[lowestIndex]
    if (current === end) {
      let temp = current
      path.value.push(temp)
      while (temp.parent !== undefined) {
        path.value.push(temp.parent)
        temp = temp.parent
      }
      return path.value.reverse()
    }

    openSet.value.splice(lowestIndex, 1)
    closedSet.value.push(current)

    const neighbors = current.neighbors

    for (let i = 0; i < neighbors.length; i++) {
      const neighbor = neighbors[i]

      if (!closedSet.value.includes(neighbor)) {
        const possibleG = current.g + 1

        if (!openSet.value.includes(neighbor) && !neighbor.isWall)
          openSet.value.push(neighbor)

        else if (possibleG >= neighbor.g)
          continue

        neighbor.g = possibleG
        neighbor.h = heuristic(neighbor, end)
        neighbor.f = neighbor.g + neighbor.h
        neighbor.parent = current
      }
    }
  }
  // No solution
  // eslint-disable-next-line no-alert
  alert('0 path possible')
  return []
}
