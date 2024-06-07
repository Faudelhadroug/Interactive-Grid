<script setup lang="ts">
import { ref,
  // isRef, toRef, watch,
  onMounted } from 'vue'
import type { Ref } from 'vue'
import {
  useGridInformations,
  useChangeClassWall,
  useHandleClickHolding,
  // useCalculCell,
  useReplaceWallClassName,
} from '../composables/grid.ts'
import { inverseClassName, transfertClassName } from '../utils/handleClassName'

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

const cells = ref()
const { rows, columns, graph, baseCellStart, baseCellEnd } = useGridInformations(cells)
const cellStartRow: Ref<number> = ref(1)
const cellStartColumn: Ref<number> = ref(1)
const cellEndRow: Ref<number> = ref(21)
const cellEndColumn: Ref<number> = ref(21)

onMounted(() => {
  cellStartRow.value = baseCellStart.value!.row
  cellStartColumn.value = baseCellStart.value!.col
  cellEndRow.value = baseCellEnd.value!.row
  cellEndColumn.value = baseCellEnd.value!.col
})

const holdingTouch = ref(false)
// const renderingSolution = ref(false)
// const blockUserAction = ref(false)

const { handleDragStart, handleDrop } = useHandleDragging()

function useHandleDragging() {
  function handleDragStart(event: DragEvent, row: number, column: number) {
    const itemData = { row, column }
    holdingTouch.value = false
    event.dataTransfer!.setData('application/json', JSON.stringify(itemData))
  }

  function handleDrop(event: DragEvent, row: number, column: number) {
    const targetInfos = { row, column }
    holdingTouch.value = false
    const itemData = JSON.parse(event.dataTransfer!.getData('application/json'))
    const cellMoved: Node = graph[itemData.row][itemData.column]
    if (cellMoved.htmlNode.className.includes('start')) {
      handleCellStartMove(itemData, targetInfos)
      return
    }
    if (cellMoved.htmlNode.className.includes('end'))
      handleCellEndMove(itemData, targetInfos)

    // clearVisited()
  }

  function handleCellStartMove(itemData: { row: number, column: number }, targetInfos: { row: number, column: number }) {
    const cellMoved: Node = graph[itemData.row][itemData.column]
    const targetCell: Node = graph[targetInfos.row][targetInfos.column]
    if (targetCell.htmlNode.className.includes('end')) {
      inverseClassName(cellMoved.htmlNode, 'start', targetCell.htmlNode, 'end')
      changeStateStartEnd(cellMoved, targetCell)
      return
    }
    if (targetCell.htmlNode.className.includes('wall')) {
      useReplaceWallClassName(cellMoved.htmlNode, 'start', targetCell.htmlNode)
      cellMoved.isStart = false
      targetCell.isWall = false
      targetCell.isStart = true
      cellStartRow.value = targetInfos.row
      cellStartColumn.value = targetInfos.column
      return
    }
    transfertClassName(cellMoved.htmlNode, 'start', targetCell.htmlNode)
    cellMoved.isStart = false
    targetCell.isStart = true
    cellStartRow.value = targetInfos.row
    cellStartColumn.value = targetInfos.column
  }
  function handleCellEndMove(itemData: { row: number, column: number }, targetInfos: { row: number, column: number }) {
    const cellMoved: Node = graph[itemData.row][itemData.column]
    const targetCell: Node = graph[targetInfos.row][targetInfos.column]
    if (targetCell.htmlNode.className.includes('start')) {
      changeStateStartEnd(targetCell, cellMoved)
      inverseClassName(cellMoved.htmlNode, 'end', targetCell.htmlNode, 'start')
      return
    }
    if (targetCell.htmlNode.className.includes('wall')) {
      useReplaceWallClassName(cellMoved.htmlNode, 'end', targetCell.htmlNode)
      cellMoved.isEnd = false
      targetCell.isWall = false
      targetCell.isEnd = true
      cellEndRow.value = targetInfos.row
      cellEndColumn.value = targetInfos.column
      return
    }
    transfertClassName(cellMoved.htmlNode, 'end', targetCell.htmlNode)
    cellMoved.isEnd = false
    targetCell.isEnd = true
    cellEndRow.value = targetInfos.row
    cellEndColumn.value = targetInfos.column
  }

  function changeStateStartEnd(cellMoved: Node, targetCell: Node){
      targetCell.isStart = true
      targetCell.isEnd = false
      cellMoved.isStart = false
      cellMoved.isEnd = true
      cellStartRow.value = targetCell.row
      cellStartColumn.value = targetCell.col
      cellEndRow.value = cellMoved.row
      cellEndColumn.value = cellMoved.col
  }

  return {
    handleDragStart,
    handleDrop,
  }
}

</script>

<template>
  <div>
    <p>
      {{ cellStartRow }}
      -
      {{ cellStartColumn }}
    </p>
    <p>
      {{ cellEndRow }}
      -
      {{ cellEndColumn }}
    </p>
  </div>
  <table class="flex justify-center flex-nowrap select-none">
    <tbody @touchstart="holdingTouch = true" @touchend="holdingTouch = false" @mouseup="holdingTouch = false" @mousedown="holdingTouch = true">
      <tr v-for="row in rows" :id="`${row - 1}`" :key="`row${row - 1}`">
        <td
          v-for="column in columns" :id="`${row - 1}-${column - 1}`"
          :key="`${row}-${column}`"
          ref="cells"
          class="outline outline-1 w-[70px] md:w-[30px] h-[25px] md:h-[30px]"
          :draggable="graph.length > 0 ? graph[row - 1][column - 1].isStart || graph[row - 1][column - 1].isEnd ? true : false : false"
          @mousedown="useChangeClassWall(row - 1, column - 1)"
          @mouseover="useHandleClickHolding(row - 1, column - 1, holdingTouch)"
          @dragstart="handleDragStart($event, row - 1, column - 1)"
          @drop="handleDrop($event, row - 1, column - 1)"
          @dragover.prevent
        >
          <!-- {{ column + (columns * (row - 1)) - 1 }} -->
          <!-- {{ `${row - 1}-${column - 1}` }} -->
        </td><td />
      </tr>
    </tbody>
  </table>
</template>

<style scoped>

</style>
