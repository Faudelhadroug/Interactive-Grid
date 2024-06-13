<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
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
import dfsAlgo from '../utils/algorithms/dfs'
import GridParams from './GridParams.vue'

const cells = ref()
const cellsMobile = ref()
const height = ref(window.innerHeight)
const width = ref(window.innerWidth)
const graph: Ref<Node[][]> = ref([])

const rows: Ref<number> = ref(width.value > 1279 ? 20 : 10)
const columns: Ref<number> = ref(width.value > 1279 ? 40 : 20)

const cellStartRow: Ref<number> = ref(1)
const cellStartColumn: Ref<number> = ref(1)
const cellEndRow: Ref<number> = ref(21)
const cellEndColumn: Ref<number> = ref(21)

onMounted(() => {
  window.addEventListener('resize', updateDimensions)
  const { grid, baseCellStart, baseCellEnd } = useGridInformations(width.value > 1279 ? cells : cellsMobile, { rowsGrid: rows, columnsGrid: columns })
  updateChangementGrid(grid, baseCellStart, baseCellEnd)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateDimensions)
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
          }, 25)
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
  if (blockUserAction.value)
    return
  clearForcePathAndVisited()
  blockUserAction.value = true
  switch (algo) {
    case 'aStar':
      try {
        path.value = await aStarAlgo({
          rows: rows.value,
          columns: columns.value,
          grid: graph,
          start: startNode.value,
          end: endNode.value,
        })
        await animationPath()
        if (path.value.length === 0)
          alert('no path possible')
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
        if (shortest.length === 0)
          alert('no path possible')
        resetGraphAfterDijkstra()
      }
      catch (error) {
        console.error(error)
      }
      break
    case 'dfs':
      try {
        const { shortest, allVisited } = dfsAlgo({
          grid: graph.value,
          startNode: startNode.value,
          endNode: endNode.value,
        })
        path.value = shortest
        visited.value = allVisited
        await animationVisited()
        await animationPath()
        if (shortest.length === 0)
          alert('no path possible')
      }
      catch (error) {
        console.error(error)
      }
      break
  }
  blockUserAction.value = false
}
function updateChangementGrid(grid: Ref<Node[][]>, baseCellStart: Ref<Node | undefined>, baseCellEnd: Ref<Node | undefined>) {
  graph.value = grid.value
  cellStartRow.value = baseCellStart.value!.row
  cellStartColumn.value = baseCellStart.value!.col
  cellEndRow.value = baseCellEnd.value!.row
  cellEndColumn.value = baseCellEnd.value!.col
}

function removeStartAndEnd() {
  graph.value[cellStartRow.value][cellStartColumn.value].isStart = false
  graph.value[cellStartRow.value][cellStartColumn.value].htmlNode.classList.remove('start')
  graph.value[cellEndRow.value][cellEndColumn.value].isEnd = false
  graph.value[cellEndRow.value][cellEndColumn.value].htmlNode.classList.remove('end')
}
function updateDimensions() {
  width.value = window.innerWidth
  height.value = window.innerHeight
}

watch(width, (newWidth, oldWidth) => {
  if (newWidth < 1280 && oldWidth > 1279) {
    clearForcePathAndVisited()
    useClearWall()
    removeStartAndEnd()
    rows.value = 10
    columns.value = 20
    const { grid, baseCellStart, baseCellEnd } = useGridInformations(cellsMobile, { rowsGrid: rows, columnsGrid: columns })
    updateChangementGrid(grid, baseCellStart, baseCellEnd)
  }

  if (newWidth > 1279 && oldWidth < 1280) {
    clearForcePathAndVisited()
    useClearWall()
    removeStartAndEnd()
    rows.value = 20
    columns.value = 40
    const { grid, baseCellStart, baseCellEnd } = useGridInformations(cells, { rowsGrid: rows, columnsGrid: columns })
    updateChangementGrid(grid, baseCellStart, baseCellEnd)
  }
})
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
  <div class="bg-teal-950 text-teal-950 py-[1rem] xl:py-[2rem] h-screen">
    <div class="flex justify-around md:justify-center md:space-x-[10rem] items-center xl:hidden pb-[1rem] bg-slate-100">
      <GridParams />
      <div class="flex flex-col justify-center items-center select-none bg-green-900 text-white rounded-md mt-[1rem]">
        <p class="p-[1rem] ">
          Clear options
        </p>
        <div class="space-y-[1rem] py-[1rem] flex flex-col justify-center items-center ">
          <button class="bg-green-700 p-[1rem] rounded-xl" @click="useClearWall()">
            All wall
          </button>
          <button class="bg-green-700 p-[1rem] rounded-xl" @click="clearPathAndVisited()">
            Visited path
          </button>
        </div>
      </div>
    </div>
    <table class="flex justify-center items-center select-none w-full pb-[1rem] px-[0.5rem] xl:py-[1rem] xl:pl-[4rem] bg-slate-100">
      <tbody @touchstart="holdingTouch = true" @touchend="holdingTouch = false" @mouseup="holdingTouch = false" @mousedown="holdingTouch = true">
        <tr v-for="row in 20" v-show="width > 1279" :id="`${row - 1}`" :key="`row-${row - 1}`">
          <td
            v-for="column in 40" :id="`${row - 1}-${column - 1}`"
            :key="`${row}-${column}`"
            ref="cells"
            class="outline outline-1 w-[30px] h-[30px]"
            :draggable="graph.length > 0 && width > 1279 ? graph[row - 1][column - 1].isStart || graph[row - 1][column - 1].isEnd ? true : false : false"
            @mousedown="blockUserAction ? null : useChangeClassWall(row - 1, column - 1)"
            @mouseover="blockUserAction ? null : useHandleClickHolding(row - 1, column - 1, holdingTouch)"
            @dragstart="blockUserAction ? null : handleDragStart($event, row - 1, column - 1)"
            @drop="blockUserAction ? null : handleDrop($event, row - 1, column - 1)"
            @dragover.prevent
          >
            <!-- {{ column + (columns * (row - 1)) - 1 }} -->
            <!-- {{ `${row - 1}-${column - 1}` }} -->
          </td>
        </tr>
        <tr v-for="row in 10" v-show="width < 1280" :id="`${row - 1}`" :key="`rowMobile-${row - 1}`">
          <td
            v-for="column in 20" :id="`Mobile:${row - 1}-${column - 1}`"
            :key="`${row}-${column}`"
            ref="cellsMobile"
            class="outline outline-1 w-[20px] h-[25px] sm:w-[30px] sm:h-[40px]"
            :draggable="graph.length > 0 ? graph[row - 1][column - 1].isStart || graph[row - 1][column - 1].isEnd ? true : false : false"
            @mousedown="blockUserAction ? null : useChangeClassWall(row - 1, column - 1)"
            @mouseover="blockUserAction ? null : useHandleClickHolding(row - 1, column - 1, holdingTouch)"
            @dragstart="blockUserAction ? null : handleDragStart($event, row - 1, column - 1)"
            @drop="blockUserAction ? null : handleDrop($event, row - 1, column - 1)"
            @dragover.prevent
          >
            <!-- {{ column + (columns * (row - 1)) - 1 }} -->
            <!-- {{ `${row - 1}-${column - 1}` }} -->
          </td>
        </tr>
      </tbody>
      <div class="hidden xl:flex xl:flex-col xl:justify-center xl:items-center">
        <GridParams />
        <div class="flex flex-col justify-center items-center select-none bg-green-900 text-white rounded-md">
          <p class="p-[1rem]">
            Clear options
          </p>
          <div class="space-y-[1rem] py-[1rem] flex flex-col justify-center items-center ">
            <button class="bg-green-700 p-[1rem] rounded-xl" @click="useClearWall()">
              All wall
            </button>
            <button class="bg-green-700 p-[1rem] rounded-xl" @click="clearPathAndVisited()">
              Visited path
            </button>
          </div>
        </div>
      </div>
    </table>
    <div class=" text-slate-200 space-x-[1rem] flex flex-wrap justify-center select-none  py-[1rem] bg-red-900 ">
      <p class="p-[1rem] rounded-md">
        Algorithms
      </p>
      <div class="flex space-x-[1rem]">
        <button class="bg-red-700 p-[1rem] rounded-xl" @click="startSearchAlgo('aStar')">
          A* search
        </button>
        <button class="bg-red-700 p-[1rem] rounded-xl" @click="startSearchAlgo('dijkstra')">
          Dijkstra
        </button>
        <button class="bg-red-700 p-[1rem] rounded-xl" @click="startSearchAlgo('dfs')">
          DFS
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
