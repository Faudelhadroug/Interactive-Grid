<script setup lang="ts">
import type { Ref } from 'vue'
import { onMounted, ref } from 'vue'

const holdingTouch = ref(false)

const rows: number = 20
const columns: number = 40
const cells: Ref<[]> = ref([])
const cellsWithWall: HTMLElement[] = []
const cellStart: Ref<HTMLElement | undefined> = ref()
const cellEnd: Ref<HTMLElement | undefined> = ref()
// const cellsAvailable: HTMLElement[] = []
const cellsVisited: HTMLElement[] = []

const renderingSolution: Ref<boolean> = ref(false)

const openSet: Ref<GridPoint[]> = ref([])
const closedSet: Ref<GridPoint[]> = ref([])
const path: Ref<GridPoint[]> = ref([])

const grid: Ref<any[]> = ref(Array.from({ length: rows })) // Array.from({ length: columns })

interface GridPoint {
  x: number
  y: number
  available: boolean
  f: number
  g: number
  h: number
  neighbors: GridPoint[]
  parent?: GridPoint
}
function createGridPoint(x: number, y: number): GridPoint {
  return {
    x,
    y,
    available: true,
    f: 0,
    g: 0,
    h: 0,
    neighbors: [],
    parent: undefined,
  }
}

function updateNeighbors(gridPoint: GridPoint) {
  const x = gridPoint.x
  const y = gridPoint.y
  if (x < rows - 1)
    gridPoint.neighbors.push(grid.value[x + 1][y])

  if (x > 0)
    gridPoint.neighbors.push(grid.value[x - 1][y])

  if (y < columns - 1)
    gridPoint.neighbors.push(grid.value[x][y + 1])

  if (y > 0)
    gridPoint.neighbors.push(grid.value[x][y - 1])
}
function heuristic(firstPosition: GridPoint, secondPosition: GridPoint) {
  const d1 = Math.abs(secondPosition.x - firstPosition.x)
  const d2 = Math.abs(secondPosition.y - firstPosition.y)

  return d1 + d2
}

function aStarAlgoInit() {
  clearVisited()
  for (let i = 0; i < rows; i++) {
    grid.value[i] = Array.from({ length: columns })
    for (let j = 0; j < columns; j++)
      grid.value[i][j] = createGridPoint(i, j)
  }
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < columns; j++)
      updateNeighbors(grid.value[i][j])
  }

  for (let i = 0; i < cellsWithWall.length; i++) {
    const rowWallNb = Number.parseInt(cellsWithWall[i].id.split('-')[0])
    const columnWallNb = Number.parseInt(cellsWithWall[i].id.split('-')[1])
    grid.value[rowWallNb][columnWallNb].available = false
  }
  const rowNb = Number.parseInt(cellStart.value!.id.split('-')[0])
  const columnNb = Number.parseInt(cellStart.value!.id.split('-')[1])
  const start: GridPoint = grid.value[rowNb][columnNb]
  openSet.value = []
  openSet.value.push(start)
  closedSet.value = []
  path.value = []
}
async function aStarAlgo() {
  renderingSolution.value = true
  aStarAlgoInit()
  //* A star base used https://dev.to/codesphere/pathfinding-with-javascript-the-a-algorithm-3jlb
  while (openSet.value.length > 0) {
    let lowestIndex = 0
    for (let i = 0; i < openSet.value.length; i++) {
      if (openSet.value[i].f < openSet.value[lowestIndex].f)
        lowestIndex = i
    }
    const current = openSet.value[lowestIndex]

    const rowNb = Number.parseInt(cellEnd.value!.id.split('-')[0])
    const columnNb = Number.parseInt(cellEnd.value!.id.split('-')[1])
    const endGridPoint = grid.value[rowNb][columnNb]
    if (current === endGridPoint) {
      let temp = current
      path.value.push(temp)
      while (temp.parent !== undefined) {
        path.value.push(temp.parent)
        temp = temp.parent
      }
      path.value.reverse()
      function markCellsPath(i: number) {
        if (i < path.value.length - 1) {
          const tempRow = path.value[i].x
          const tempColumn = path.value[i].y
          const calculCell = tempColumn + (columns * (tempRow))
          const actualCell: HTMLElement = cells.value[calculCell]
          actualCell.classList.add('path')
          cellsVisited.push(cells.value[calculCell])
          setTimeout(() => {
            markCellsPath(i + 1)
          }, 50)
        }
      }
      markCellsPath(1)
      return
    }

    openSet.value.splice(lowestIndex, 1)
    closedSet.value.push(current)

    const neighbors = current.neighbors

    for (let i = 0; i < neighbors.length; i++) {
      const neighbor = neighbors[i]

      if (!closedSet.value.includes(neighbor)) {
        const possibleG = current.g + 1

        if (!openSet.value.includes(neighbor) && neighbor.available)
          openSet.value.push(neighbor)

        else if (possibleG >= neighbor.g)
          continue

        neighbor.g = possibleG
        neighbor.h = heuristic(neighbor, endGridPoint)
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
function calculCell(rowNb: number, columnNb: number): number {
  return columnNb + (columns * (rowNb - 1)) - 1
}
function dijkstraAlgo() {
  renderingSolution.value = true
  clearVisited()
  const START_NODE_ROW = cellStart.value && cellStart!.value.id.split('-')[0]
  const START_NODE_COL = cellStart.value && cellStart!.value.id.split('-')[1]
  const END_NODE_ROW = cellEnd.value && cellEnd!.value.id.split('-')[0]
  const END_NODE_COL = cellEnd.value && cellEnd!.value.id.split('-')[1]

  function createNode(row: number, col: number, isWall = false) {
    return {
      row,
      col,
      isStart: row === Number.parseInt(START_NODE_ROW!) && col === Number.parseInt(START_NODE_COL!),
      isEnd: row === Number.parseInt(END_NODE_ROW!) && col === Number.parseInt(END_NODE_COL!),
      distance: Number.POSITIVE_INFINITY,
      isVisited: false,
      isWall,
      previousNode: null,
    }
  }

  function getAllNodes(tempGrid: any) {
    const nodes = []
    for (const row of tempGrid) {
      for (const node of row)
        nodes.push(node)
    }
    return nodes
  }

  function sortNodesByDistance(unvisitedNodes: any) {
    unvisitedNodes.sort((nodeA: any, nodeB: any) => nodeA.distance - nodeB.distance)
  }

  function updateUnvisitedNeighbors(node: any, grid: any) {
    const unvisitedNeighbors = getUnvisitedNeighbors(node, grid)
    for (const neighbor of unvisitedNeighbors) {
      neighbor.distance = node.distance + 1
      neighbor.previousNode = node
    }
  }

  function getUnvisitedNeighbors(node: any, grid: any) {
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

  // Graph with neighbor)
  const graph = []
  for (let i = 1; i < rows + 1; i++) {
    const currentRow = []
    for (let j = 1; j < columns + 1; j++) {
      const row = i
      const column = j
      const elementNode: HTMLElement = cells.value[calculCell(row, column)]
      //* -1 Because we start iteration at 1 instead of 0
      currentRow.push(createNode(row - 1, column - 1, elementNode.className.includes('wall')))
    }
    graph.push(currentRow)
  }

  const startNode = graph[Number.parseInt(START_NODE_ROW!)][Number.parseInt(START_NODE_COL!)]
  const endNode = graph[Number.parseInt(END_NODE_ROW!)][Number.parseInt(END_NODE_COL!)]
  const unvisitedNodes = getAllNodes(graph)

  startNode.distance = 0
  const visitedNodesInOrder: any = []
  while (unvisitedNodes.length) {
    sortNodesByDistance(unvisitedNodes)
    const closestNode = unvisitedNodes.shift()
    if (closestNode.isWall)
      continue
    if (closestNode.distance === Number.POSITIVE_INFINITY)
      break
    closestNode.isVisited = true
    visitedNodesInOrder.push(closestNode)
    if (closestNode === endNode)
      break
    updateUnvisitedNeighbors(closestNode, graph)
  }

  const nodesInShortestPathOrder: any = []
  let currentNode = endNode

  while (currentNode !== null) {
    nodesInShortestPathOrder.unshift(currentNode)
    currentNode = currentNode.previousNode!
  }

  async function markCellsVisited() {
    for (let i = 1; i < visitedNodesInOrder.length; i++) {
      const tempRow: number = visitedNodesInOrder[i].row
      const tempColumn: number = visitedNodesInOrder[i].col
      const calculCell: number = tempColumn + (columns * (tempRow))
      const actualCell: HTMLElement = cells.value[calculCell]

      if (i === visitedNodesInOrder.length - 1) {
        await new Promise<void>(resolve => setTimeout(() => {
          console.log('short')
          animateShortestPath()
          resolve()
        }, 100))
        return
      }

      await new Promise<void>(resolve => setTimeout(() => {
        actualCell.classList.add('visited')
        cellsVisited.push(actualCell)
        resolve()
      }, 100))
    }
  }
  async function animateShortestPath() {
    for (let i = 1; i < nodesInShortestPathOrder.length; i++) {
      const tempRow: number = nodesInShortestPathOrder[i].row
      const tempColumn: number = nodesInShortestPathOrder[i].col
      const calculCell: number = tempColumn + (columns * (tempRow))
      const actualCell: HTMLElement = cells.value[calculCell]

      await new Promise<void>(resolve => setTimeout(() => {
        actualCell.classList.add('path')
        cellsVisited.push(actualCell)
        resolve()
      }, 100))
    }
  }

  markCellsVisited()

  // if (!nodesInShortestPathOrder[i].isEnd) {
}

function dfsAlgo() {
  renderingSolution.value = true
  clearVisited()
  const START_NODE_ROW = cellStart.value && cellStart!.value.id.split('-')[0]
  const START_NODE_COL = cellStart.value && cellStart!.value.id.split('-')[1]
  const END_NODE_ROW = cellEnd.value && cellEnd!.value.id.split('-')[0]
  const END_NODE_COL = cellEnd.value && cellEnd!.value.id.split('-')[1]

  function createNode(row: number, col: number, isWall = false) {
    return {
      row,
      col,
      isStart: row === Number.parseInt(START_NODE_ROW!) && col === Number.parseInt(START_NODE_COL!),
      isEnd: row === Number.parseInt(END_NODE_ROW!) && col === Number.parseInt(END_NODE_COL!),
      distance: Number.POSITIVE_INFINITY,
      isVisited: false,
      isWall,
      previousNode: null,
    }
  }

  function getAllNodes(tempGrid: any) {
    const nodes = []
    for (const row of tempGrid) {
      for (const node of row)
        nodes.push(node)
    }
    return nodes
  }

  function updateUnvisitedNeighbors(node: any, grid: any) {
    const unvisitedNeighbors = getUnvisitedNeighbors(node, grid)
    for (const neighbor of unvisitedNeighbors)
      neighbor.previousNode = node
  }

  function getUnvisitedNeighbors(node: any, grid: any) {
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

  const graph = []
  for (let i = 1; i < rows + 1; i++) {
    const currentRow = []
    for (let j = 1; j < columns + 1; j++) {
      const row = i
      const column = j
      const elementNode: HTMLElement = cells.value[calculCell(row, column)]
      //* -1 Because we start iteration at 1 instead of 0
      currentRow.push(createNode(row - 1, column - 1, elementNode.className.includes('wall')))
    }
    graph.push(currentRow)
  }

  const startNode = graph[Number.parseInt(START_NODE_ROW!)][Number.parseInt(START_NODE_COL!)]
  const endNode = graph[Number.parseInt(END_NODE_ROW!)][Number.parseInt(END_NODE_COL!)]

  const stack = [startNode]
  const visitedSet = new Set()
  const result: any = []
  const neighborsStart = getNeighbors(startNode, graph)
  console.log(neighborsStart)
  while (stack.length) {
    const vertex = stack.pop()
    if (!visitedSet.has(vertex) && vertex?.isWall === false) {
      // if(neighborsStart.includes(vertex))
      //   result.length = 0
      visitedSet.add(vertex)
      result.push(vertex)
      if (vertex === endNode)
        break
      const neighbors = getNeighbors(vertex, graph)
      for (const neighbor of neighbors)
        stack.push(neighbor)
    }
    if (stack.length === 0 && !vertex?.isEnd) {
      renderingSolution.value = false
      return alert('0 path possible')
    }
  }

  function getNeighbors(node, graph) {
    const row = node.row
    const col = node.col
    const neighbors = []
    if (row > 0)
      neighbors.push(graph[row - 1][col])
    if (row < graph.length - 1)
      neighbors.push(graph[row + 1][col])
    if (col > 0)
      neighbors.push(graph[row][col - 1])
    if (col < graph[0].length - 1)
      neighbors.push(graph[row][col + 1])
    return neighbors.filter(n => !n.isWall) // Filtrer les murs
  }

  // return result
  const visited: any = Array.from(visitedSet)
  async function markCellsVisited() {
    for (let i = 1; i < visited.length; i++) {
      const tempRow: number = visited[i].row
      const tempColumn: number = visited[i].col
      const calculCell: number = tempColumn + (columns * (tempRow))
      const actualCell: HTMLElement = cells.value[calculCell]

      if (i === visited.length - 1) {
        await new Promise<void>(resolve => setTimeout(() => {
          console.log('short')
          animateShortestPath()
          resolve()
        }, 10))
        return
      }

      await new Promise<void>(resolve => setTimeout(() => {
        actualCell.classList.add('visited')
        cellsVisited.push(actualCell)
        resolve()
      }, 10))
    }
  }
  async function animateShortestPath() {
    for (let i = 0; i < result.length; i++) {
      const tempRow: number = result[i].row
      const tempColumn: number = result[i].col
      const calculCell: number = tempColumn + (columns * (tempRow))
      const actualCell: HTMLElement = cells.value[calculCell]

      await new Promise<void>(resolve => setTimeout(() => {
        actualCell.classList.add('path')
        cellsVisited.push(actualCell)
        resolve()
      }, 10))
    }
  }

  markCellsVisited()
  renderingSolution.value = false
}

onMounted(() => {
  initStartAndEnd()
})
function initStartAndEnd() {
  const { randomStart, randomEnd } = generateRandomStartAndEnd()

  const startElement = document.getElementById(randomStart)!
  startElement!.classList.add('start')
  cellStart.value = startElement

  const endElement = document.getElementById(randomEnd)!
  endElement!.classList.add('end')
  cellEnd.value = endElement

}
function generateRandomStartAndEnd() {
  const min = 1
  const randomStartRow = Math.floor(Math.random() * (rows - min) + min)
  const randomStartColumn = Math.floor(Math.random() * (columns / 4 - min) + min)

  const minEnd = columns / 2
  const randomEndRow = Math.floor(Math.random() * (rows - min) + min)
  const randomEndColumn = Math.floor(Math.random() * (columns - minEnd) + minEnd)

  const randomStart = `${randomStartRow}-${randomStartColumn}`
  const randomEnd = `${randomEndRow}-${randomEndColumn}`
  return { randomStart, randomEnd }
}

function changeClassWall(row: number, column: number) {
  if (renderingSolution.value)
    return
  const element = document.getElementById(`${row - 1}-${column - 1}`)!
  if (element.className.includes('start') || element.className.includes('end') || element.className.includes('visited'))
    return
  if (element.className.includes('wall')) {
    element.classList.remove('wall')
    // grid.value[row - 1][column - 1].available = true
    cellsWithWall.splice(cellsWithWall.findIndex(el => el.id === element.id), 1)
    // cellsAvailable.push(element)
    return
  }
  element.classList.add('wall')
  // grid.value[row - 1][column - 1].available = false
  cellsWithWall.push(element)
  // cellsAvailable.splice(cellsAvailable.findIndex(el => el.id === element.id), 1)
}
function handleClickHolding(row: number, column: number) {
  if (holdingTouch.value)
    changeClassWall(row, column)
}

function clearWall() {
  const totalWall = cellsWithWall.length
  for (let i = totalWall - 1; i > -1; i--) {
    cellsWithWall[i].classList.remove('wall')
    // grid.value[Number.parseInt(cellsWithWall[i].id.split('-')[0])][Number.parseInt(cellsWithWall[i].id.split('-')[1])].available = true
    // cellsAvailable.push(cellsWithWall[i])
    cellsWithWall.splice(i, 1)
  }
}

function clearVisited() {
  const totalVisited = cellsVisited.length
  if (totalVisited > 0) {
    for (let i = totalVisited - 1; i > -1; i--) {
      cellsVisited[i].classList.remove('visited')
      cellsVisited[i].classList.remove('path')
      cellsVisited.splice(i, 1)
    }
  }
}

function isDraggable(row: number, column: number) {
  const cellNb: HTMLElement = cells.value[column + (columns * (row - 1)) - 1]
  if (cellNb === cellStart.value)
    return true
  if (cellNb === cellEnd.value)
    return true
  return false
}

function handleDragStart(event: DragEvent, itemData: number) {
  holdingTouch.value = false
  event.dataTransfer!.setData('application/json', JSON.stringify(itemData))
}

function handleDrop(event: DragEvent, targetCellNb: number) {
  holdingTouch.value = false
  const itemData = JSON.parse(event.dataTransfer!.getData('application/json'))
  const cellMoved: HTMLElement = cells.value[itemData]
  const targetCell: HTMLElement = cells.value[targetCellNb]

  switch (cellMoved) {
    case cellStart.value:
      handleCellStartMove(cellMoved, targetCell)
      break
    case cellEnd.value:
      handleCellEndMove(cellMoved, targetCell)
      break
    default:
      break
  }
  clearVisited()
}

function inverseClassName(element1: HTMLElement, class1: string, element2: HTMLElement, class2: string) {
  element1.classList.remove(class1)
  element2.classList.remove(class2)
  element1.classList.add(class2)
  element2.classList.add(class1)
}

function replaceWallClassName(element: HTMLElement, nameOfClass: string, wallElement: HTMLElement) {
  element.classList.remove(nameOfClass)
  wallElement.classList.remove('wall')
  wallElement.classList.add(nameOfClass)
  cellsWithWall.splice(cellsWithWall.findIndex(el => el.id === wallElement.id), 1)
  // cellsAvailable.splice(cellsAvailable.findIndex(el => el.id === element.id), 1)
}

function transfertClassName(element: HTMLElement, nameOfClass: string, element2: HTMLElement) {
  element.classList.remove(nameOfClass)
  element2.classList.add(nameOfClass)
  // cellsAvailable.splice(cellsAvailable.findIndex(el => el.id === element2.id), 1)
  // cellsAvailable.push(element)
}

function handleCellStartMove(cellMoved: HTMLElement, targetCell: HTMLElement) {
  if (targetCell === cellEnd.value) {
    inverseClassName(cellMoved, 'start', targetCell, 'end')
    cellStart.value = targetCell
    cellEnd.value = cellMoved
    return
  }
  if (targetCell.className.includes('wall')) {
    replaceWallClassName(cellMoved, 'start', targetCell)
    cellStart.value = targetCell
    return
  }
  transfertClassName(cellMoved, 'start', targetCell)
  cellStart.value = targetCell
}
function handleCellEndMove(cellMoved: HTMLElement, targetCell: HTMLElement) {
  if (targetCell === cellStart.value) {
    inverseClassName(cellMoved, 'end', targetCell, 'start')
    cellStart.value = cellMoved
    cellEnd.value = targetCell
    return
  }
  if (targetCell.className.includes('wall')) {
    replaceWallClassName(cellMoved, 'end', targetCell)
    cellEnd.value = targetCell
    return
  }
  transfertClassName(cellMoved, 'end', targetCell)
  cellEnd.value = targetCell
}
</script>

<template>
  <div class="bg-blue-300 w-screen">
    <h1 class="font-bold text-3xl select-none text-center py-4">
      Interactive grid
    </h1>
    <!-- GRID -->
    <div class="bg-yellow-200 p-[1rem] space-x-[5rem] flex justify-center">
      <button @click="clearWall()">
        Clear all wall
      </button>
      <button @click="clearVisited()">
        Clear visited path
      </button>
      <!-- <button @click="randomizeStartAndEnd()">
        Randomize start and end
      </button> -->
      <button @click="aStarAlgo()">
        A* search algo
      </button>
      <button @click="dijkstraAlgo()">
        Dijkstra algo
      </button>
      <button @click="dfsAlgo()">
        DFS algo
      </button>
    </div>
    <div class="bg-red-200 h-screen select-none p-[0.5rem] md:p-[3rem]" @touchstart="holdingTouch = true" @touchend="holdingTouch = false" @mouseup="holdingTouch = false" @mousedown="holdingTouch = true">
      <p class="text-center underline text-3xl pb-[1rem]">
        This project is still in developement and is subject to change (Preferably use a desktop)
      </p>
      <div class="flex justify-center space-x-[2rem] pb-[1rem]">
        <p class="flex items-center">
          Start <span class="start w-4 h-4 inline-block ml-1" />
        </p>
        <p class="flex items-center">
          End <span class="end w-4 h-4 inline-block ml-1" />
        </p>
        <p class="flex items-center">
          Wall <span class="wall w-4 h-4 inline-block ml-1" />
        </p>
        <p class="flex items-center">
          Visited  <span class="visited w-4 h-4 inline-block ml-1" />
        </p>
        <p class="flex items-center">
          Path  <span class="path w-4 h-4 inline-block ml-1" />
        </p>
      </div>
      <table class="flex justify-center flex-nowrap">
        <tbody>
          <tr v-for="row in rows" :id="`${row - 1}`" :key="`row${row - 1}`">
            <td
              v-for="column in columns" :id="`${row - 1}-${column - 1}`"
              :key="`${row}-${column}`"
              ref="cells"
              class="outline outline-1 w-[70px] md:w-[30px] h-[25px] md:h-[30px]"
              :class="[]"
              :draggable="renderingSolution ? false : isDraggable(row, column)"
              @dragstart="handleDragStart($event, column + (columns * (row - 1)) - 1)"
              @drop="handleDrop($event, column + (columns * (row - 1)) - 1)"
              @dragover.prevent
              @mousedown="changeClassWall(row, column)"
              @mouseover="handleClickHolding(row, column)"
            >
              <!-- {{ column + (columns * (row - 1)) - 1 }} -->
              <!-- {{ `${row - 1}-${column - 1}` }} -->
            </td><td />
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style>
.wall {
  background-color: rgb(164, 0, 0);
}
.start {
  background-color: rgb(13, 96, 221)
}
.end {
  background-color: rgb(195, 191, 3);
}
.visited {
  background-color: rgb(44, 157, 33)
}

.path {
  background-color: rgb(174, 93, 209)
}
</style>
