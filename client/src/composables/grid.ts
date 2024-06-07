import { onMounted, ref } from 'vue'
import type { Ref } from 'vue'
interface CreateNode { row: number, col: number, isWall: boolean, htmlNode: HTMLElement, isStart: boolean, isEnd: boolean }
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

const rows: number = 20
const columns: number = 40

const graph: Ref<Node[][]> = ref([])
const cellsWithWall: Ref<Node[]> = ref([])

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
    graph.value.push(currentRow)
  }

  graph.value[randomStartRow][randomStartColumn].isStart = true
  graph.value[randomStartRow][randomStartColumn].htmlNode.classList.add('start')

  graph.value[randomEndRow][randomEndColumn].isEnd = true
  graph.value[randomEndRow][randomEndColumn].htmlNode.classList.add('end')

  return { start: graph.value[randomStartRow][randomStartColumn], end: graph.value[randomEndRow][randomEndColumn] }
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

function createNode({ row, col, isWall = false, htmlNode, isStart = false, isEnd = false }: CreateNode): Node {
  return {
    row,
    col,
    htmlNode,
    isStart,
    isEnd,
    isWall,
    isVisited: false,
    neighbors: [],
    previousNode: null,
    distance: Number.POSITIVE_INFINITY,
    f: 0,
    g: 0,
    h: 0,
  }
}

export function useChangeClassWall(row: number, column: number): void {
  const cell = graph.value[row][column]
  const cellHTML = graph.value[row][column].htmlNode
  if (cellHTML.className.includes('start') || cellHTML.className.includes('end') || cellHTML.className.includes('visited'))
    return
  if (cellHTML.className.includes('wall')) {
    cellHTML.classList.remove('wall')
    cellsWithWall.value.splice(cellsWithWall.value.findIndex(el => el.htmlNode.id === cellHTML.id), 1)
    cell.isWall = false
    return
  }
  cellHTML.classList.add('wall')
  cellsWithWall.value.push(cell)
  cell.isWall = true
}

export function useReplaceWallClassName(element: HTMLElement, nameOfClass: string, wallElement: HTMLElement) {
  element.classList.remove(nameOfClass)
  wallElement.classList.remove('wall')
  wallElement.classList.add(nameOfClass)
  cellsWithWall.value.splice(cellsWithWall.value.findIndex(el => el.htmlNode.id === wallElement.id), 1)
}

export function useClearWall() {
  const totalWall = cellsWithWall.value.length
  for (let i = totalWall - 1; i > -1; i--) {
    graph.value[cellsWithWall.value[i].row][cellsWithWall.value[i].col].isWall = false
    cellsWithWall.value[i].htmlNode.classList.remove('wall')
    cellsWithWall.value.splice(i, 1)
  }
}
export function useHandleClickHolding(row: number, column: number, holdingTouch: boolean) {
  if (holdingTouch)
    useChangeClassWall(row, column)
}
