import { ref } from 'vue'
import type { Ref } from 'vue'
import type { CreateNode, Node } from '../utils/interface'

const grid: Ref<Node[][]> = ref([])
const cellsWithWall: Ref<Node[]> = ref([])
const rows: Ref<number> = ref(20)
const columns: Ref<number> = ref(40)

export function useCalculCell(rowNb: number, columnNb: number): number {
  return columnNb + (columns.value * (rowNb - 1)) - 1
}
export function updateGridInformation() {

}
export function useGridInformations(cells: Ref<HTMLElement[]>, { rowsGrid, columnsGrid }: { rowsGrid: Ref<number>, columnsGrid: Ref<number> }) {
  const baseCellStart: Ref<undefined | Node> = ref(undefined)
  const baseCellEnd: Ref<undefined | Node> = ref(undefined)
  rows.value = rowsGrid.value
  columns.value = columnsGrid.value

  const { start, end } = initStartAndEnd(cells)
  baseCellStart.value = start
  baseCellEnd.value = end

  return {
    grid,
    baseCellStart,
    baseCellEnd,
  }
}

function initStartAndEnd(cells: Ref<HTMLElement[]>) {
  const { randomStartRow, randomStartColumn, randomEndRow, randomEndColumn } = generateRandomStartAndEnd()
  grid.value.length = 0
  for (let i = 1; i < rows.value + 1; i++) {
    const currentRow: Node[] = []
    for (let j = 1; j < columns.value + 1; j++) {
      const row = i
      const column = j
      const nbCell = useCalculCell(row, column)
      const elementNode: HTMLElement = cells.value[nbCell]
      //* -1 Because we start iteration at 1 instead of 0, and we want that to avoid * by 0
      currentRow.push(createNode({ row: row - 1, col: column - 1, isWall: elementNode.className.includes('wall'), htmlNode: elementNode, isStart: false, isEnd: false }))
    }
    grid.value.push(currentRow)
  }

  grid.value[randomStartRow][randomStartColumn].isStart = true
  grid.value[randomStartRow][randomStartColumn].htmlNode.classList.add('start')

  grid.value[randomEndRow][randomEndColumn].isEnd = true
  grid.value[randomEndRow][randomEndColumn].htmlNode.classList.add('end')

  return { start: grid.value[randomStartRow][randomStartColumn], end: grid.value[randomEndRow][randomEndColumn] }
}
function generateRandomStartAndEnd() {
  const min: number = 1
  const areaDivisionStart: number = 4
  const randomStartRow = Math.floor(Math.random() * (rows.value - min) + min)
  const randomStartColumn = Math.floor(Math.random() * (columns.value / areaDivisionStart - min) + min)

  const areaDivisionEnd: number = 2
  const minEnd = columns.value / areaDivisionEnd
  const randomEndRow = Math.floor(Math.random() * (rows.value - min) + min)
  const randomEndColumn = Math.floor(Math.random() * (columns.value - minEnd) + minEnd)

  return { randomStartRow, randomStartColumn, randomEndRow, randomEndColumn }
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
  const cell = grid.value[row][column]
  const cellHTML = grid.value[row][column].htmlNode
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
    grid.value[cellsWithWall.value[i].row][cellsWithWall.value[i].col].isWall = false
    cellsWithWall.value[i].htmlNode.classList.remove('wall')
    cellsWithWall.value.splice(i, 1)
  }
}
export function useHandleClickHolding(row: number, column: number, holdingTouch: boolean) {
  if (holdingTouch)
    useChangeClassWall(row, column)
}
