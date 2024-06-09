<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { ComputedRef, Ref } from 'vue'
import {
  useChangeClassWall,
  useClearWall,
  useGridInformations,
  useHandleClickHolding,
  useReplaceWallClassName,
} from '../composables/grid.ts'
import { inverseClassName, transfertClassName } from '../utils/handleClassName'
import type { Node } from '../utils/interface'
import aStarAlgo from '../utils/algorithms/aStar.ts'
import dijkstraAlgo from '../utils/algorithms/dijkstra.ts'

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

const startNode: ComputedRef<Node> = computed(() => {
  return graph.value[cellStartRow.value][cellStartColumn.value]
})
const endNode: ComputedRef<Node> = computed(() => {
  return graph.value[cellEndRow.value][cellEndColumn.value]
})

const path: Ref<Node[] | []> = ref([])
const visited: Ref<Node[] | []> = ref([])

const holdingTouch = ref(false)
const blockUserAction = ref(false)

const { animationPath, animationVisited } = useAnimation()
function useAnimation() {
  function animationPath(): Promise<void> {
    return new Promise((resolve) => {
      function markCellsPath(i: number) {
        if (i < path.value.length - 1) {
          path.value[i].htmlNode.classList.add('path')
          setTimeout(() => {
            markCellsPath(i + 1)
          }, 50)
        }
        else {
          resolve()
        }
      }
      markCellsPath(1)
    })
  }

  function animationVisited(): Promise<void> {
    return new Promise((resolve) => {
      function markCellsVisited(i: number) {
        if (i < visited.value.length - 1) {
          visited.value[i].htmlNode.classList.add('visited')
          setTimeout(() => {
            markCellsVisited(i + 1)
          }, 10)
        }
        else {
          resolve()
        }
      }
      markCellsVisited(1)
    })
  }

  return {
    animationPath,
    animationVisited,
  }
}

const { clearPathAndVisited, clearForcePathAndVisited } = useClear()
function useClear() {
  function clearPath() {
    const totalPath = path.value.length
    if (totalPath > 0) {
      for (let i = totalPath - 1; i > -1; i--) {
        path.value[i].htmlNode.classList.remove('path')
        path.value.splice(i, 1)
      }
    }
  }
  function clearVisited() {
    const totalVisited = visited.value.length
    if (totalVisited > 0) {
      for (let i = totalVisited - 1; i > -1; i--) {
        visited.value[i].htmlNode.classList.remove('visited')
        visited.value.splice(i, 1)
      }
    }
  }

  function clearPathAndVisited() {
    if (blockUserAction.value)
      return
    clearPath()
    clearVisited()
  }

  function clearForcePathAndVisited() {
    clearPath()
    clearVisited()
  }
  return {
    clearPath,
    clearVisited,
    clearPathAndVisited,
    clearForcePathAndVisited,
  }
}

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
    const cellMoved: Node = graph.value[itemData.row][itemData.column]
    if (cellMoved.htmlNode.className.includes('start')) {
      handleCellStartMove(itemData, targetInfos)
      return
    }
    if (cellMoved.htmlNode.className.includes('end'))
      handleCellEndMove(itemData, targetInfos)
    clearPathAndVisited()
  }

  function handleCellStartMove(itemData: { row: number, column: number }, targetInfos: { row: number, column: number }) {
    const cellMoved: Node = graph.value[itemData.row][itemData.column]
    const targetCell: Node = graph.value[targetInfos.row][targetInfos.column]
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
    const cellMoved: Node = graph.value[itemData.row][itemData.column]
    const targetCell: Node = graph.value[targetInfos.row][targetInfos.column]
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

  function changeStateStartEnd(cellMoved: Node, targetCell: Node) {
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
async function startSearchAlgo(algo: string) {
  clearForcePathAndVisited()
  blockUserAction.value = true
  switch (algo) {
    case 'aStar':
      try {
        path.value = await aStarAlgo({
          rows,
          columns,
          grid: graph,
          start: startNode.value,
          end: endNode.value,
        })
        await animationPath()
      }
      catch (error) {
        console.error(error)
      }
      break
    case 'dijkstra':
      try {
        const { shortest, allVisited } = dijkstraAlgo({
          grid: graph.value,
          startNode: startNode.value,
          endNode: endNode.value,
        })
        path.value = shortest
        visited.value = allVisited
        await animationVisited()
        await animationPath()
        resetGraphAfterDijkstra()
      }
      catch (error) {

      }
      break
  }
  blockUserAction.value = false
}

function resetGraphAfterDijkstra() {
  for (let i = 0; i < graph.value.length; i++) {
    for (let y = 0; y < graph.value[i].length; y++) {
      graph.value[i][y].distance = Number.POSITIVE_INFINITY
      graph.value[i][y].isVisited = false
      graph.value[i][y].previousNode = null
      graph.value[i][y].f = 0
      graph.value[i][y].g = 0
      graph.value[i][y].h = 0
    }
  }
}
</script>

<template>
  <div class="bg-yellow-200 p-[1rem] space-x-[5rem] flex justify-center select-none">
    <button @click="useClearWall()">
      Clear all wall
    </button>
    <button @click="startSearchAlgo('aStar')">
      A* search algo
    </button>
    <button @click="startSearchAlgo('dijkstra')">
      Dijkstra Algo
    </button>
    <button @click="clearPathAndVisited()">
      Clear visited path
    </button>
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
          @mousedown="blockUserAction ? null : useChangeClassWall(row - 1, column - 1)"
          @mouseover="blockUserAction ? null : useHandleClickHolding(row - 1, column - 1, holdingTouch)"
          @dragstart="blockUserAction ? null : handleDragStart($event, row - 1, column - 1)"
          @drop="blockUserAction ? null : handleDrop($event, row - 1, column - 1)"
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
