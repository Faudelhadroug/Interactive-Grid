import { onMounted, ref } from 'vue'
import type { Ref } from 'vue'

const rows: number = 20
const columns: number = 40

const graph: Node[][] = []
const cellsWithWall: HTMLElement[] = []

export function useCalculCell(rowNb: number, columnNb: number): number {
  return columnNb + (columns * (rowNb - 1)) - 1
}

export function useGridInformations(cells: Ref<HTMLElement[]>) {
  const baseCellStart: Ref<undefined | Node> = ref(undefined)
  const baseCellEnd: Ref<undefined | Node> = ref(undefined)

  onMounted(() => {
    const { start, end } = initStartAndEnd(cells)
    baseCellStart.value = start
    baseCellEnd.value = end
  })

  return {
    rows,
    columns,
    graph,
    baseCellStart,
    baseCellEnd,
  }
}

function initStartAndEnd(cells: Ref<HTMLElement[]>) {
  const { randomStart, randomEnd } = generateRandomStartAndEnd()
  const randomStartRow = Number(randomStart.split('-')[0])
  const randomStartColumn = Number(randomStart.split('-')[1])

  const randomEndRow = Number(randomEnd.split('-')[0])
  const randomEndColumn = Number(randomEnd.split('-')[1])

  for (let i = 1; i < rows + 1; i++) {
    const currentRow: Node[] = []
    for (let j = 1; j < columns + 1; j++) {
      const row = i
      const column = j
      const nbCell = useCalculCell(row, column)
      const elementNode: HTMLElement = cells.value[nbCell]
      //* -1 Because we start iteration at 1 instead of 0, and we want that to avoid * by 0
      currentRow.push(createNode({ row: row - 1, col: column - 1, isWall: elementNode.className.includes('wall'), htmlNode: elementNode, isStart: false, isEnd: false }))
    }
    graph.push(currentRow)
  }

  graph[randomStartRow][randomStartColumn].isStart = true
  graph[randomStartRow][randomStartColumn].htmlNode.classList.add('start')

  graph[randomEndRow][randomEndColumn].isEnd = true
  graph[randomEndRow][randomEndColumn].htmlNode.classList.add('end')

  return { start: graph[randomStartRow][randomStartColumn], end: graph[randomEndRow][randomEndColumn] }
}
function generateRandomStartAndEnd() {
  const min: number = 1
  const areaDivisionStart: number = 4
  const randomStartRow = Math.floor(Math.random() * (rows - min) + min)
  const randomStartColumn = Math.floor(Math.random() * (columns / areaDivisionStart - min) + min)

  const areaDivisionEnd: number = 2
  const minEnd = columns / areaDivisionEnd
  const randomEndRow = Math.floor(Math.random() * (rows - min) + min)
  const randomEndColumn = Math.floor(Math.random() * (columns - minEnd) + minEnd)

  const randomStart = `${randomStartRow}-${randomStartColumn}`
  const randomEnd = `${randomEndRow}-${randomEndColumn}`
  return { randomStart, randomEnd }
}

interface CreateNode { row: number, col: number, isWall: boolean, htmlNode: HTMLElement, isStart: boolean, isEnd: boolean }
interface Node {
  row: number
  col: number
  htmlNode: HTMLElement
  isStart: boolean
  isEnd: boolean
  isWall: boolean
  isVisited: boolean
  previousNode: null | Node[]
  distance: number
}
function createNode({ row, col, isWall = false, htmlNode, isStart = false, isEnd = false }: CreateNode): Node {
  return {
    row,
    col,
    htmlNode,
    isStart,
    isEnd,
    isWall,
    isVisited: false,
    previousNode: null,
    distance: Number.POSITIVE_INFINITY,
  }
}

export function useChangeClassWall(row: number, column: number): void {
  const cellElement = graph[row][column].htmlNode
  if (cellElement.className.includes('start') || cellElement.className.includes('end') || cellElement.className.includes('visited'))
    return
  if (cellElement.className.includes('wall')) {
    cellElement.classList.remove('wall')
    cellsWithWall.splice(cellsWithWall.findIndex(el => el.id === cellElement.id), 1)
    return
  }
  cellElement.classList.add('wall')
  cellsWithWall.push(cellElement)
}

export function useReplaceWallClassName(element: HTMLElement, nameOfClass: string, wallElement: HTMLElement) {
  element.classList.remove(nameOfClass)
  wallElement.classList.remove('wall')
  wallElement.classList.add(nameOfClass)
  cellsWithWall.splice(cellsWithWall.findIndex(el => el.id === wallElement.id), 1)
}

export function useClearWall() {
  const totalWall = cellsWithWall.length
  for (let i = totalWall - 1; i > -1; i--) {
    cellsWithWall[i].classList.remove('wall')
    cellsWithWall.splice(i, 1)
  }
}
export function useHandleClickHolding(row: number, column: number, holdingTouch: boolean) {
  if (holdingTouch)
    useChangeClassWall(row, column)
}
