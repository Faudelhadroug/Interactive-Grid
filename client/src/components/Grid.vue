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
import Modal from './Modal.vue'

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
  baseCellStart.value?.htmlNode.classList.remove('cursor-pointer')
  baseCellEnd.value?.htmlNode.classList.remove('cursor-pointer')
  baseCellStart.value?.htmlNode.classList.add('cursor-grab')
  baseCellEnd.value?.htmlNode.classList.add('cursor-grab')
  document.body.style.overflow = 'hidden'
  document.body.style.overflow = 'hidden'
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

function useModal() {
  const closeInfoModal = ref(true)
  const titleInfoModal = ref('')
  const descriptionInfoModal = ref('')
  function openInfoModal(title = '', description = '') {
    closeInfoModal.value = false
    titleInfoModal.value = title
    descriptionInfoModal.value = description
  }

  const closeTutoModalIntroduction = ref(false)
  const titleTutoModal = ref('Welcome to my pathfinder visualizer')
  const descriptionTutoModal = ref('This quick tutorial will help you understand the features available in this application and which features are disabled on mobile. You can also skip the tutorial at any time by clicking the \"Skip tutorial\" button.')
  const currentSlide = ref(1)
  const totalSlide = 5
  function slideTuto(goToNextPage: boolean) {
    goToNextPage ? currentSlide.value++ : currentSlide.value--
    switch (currentSlide.value) {
      case 1:
        titleTutoModal.value = 'Welcome to my pathfinder visualizer'
        descriptionTutoModal.value = 'This quick tutorial will help you understand the features available in this application and which features are disabled on mobile. You can also skip the tutorial at any time by clicking the \"Skip tutorial\" button.'
        break
      case 2:
        titleTutoModal.value = 'What is a pathfinder visualizer?'
        descriptionTutoModal.value = `A pathfinder visualizer is a tool used to visually demonstrate how pathfinding algorithms work by finding the shortest or most efficient path between two points on a 2D grid.\r\n\r\nThe red bar bellow the grid contains all algorithms available`
        break
      case 3:
        titleTutoModal.value = 'Wall possibility'
        descriptionTutoModal.value = 'You can block algorithm paths by placing walls on the grid. Simply click or touch a cell to place a wall..\r\n\r\n Additional options for desktop users: Hold down the click to quickly place multiple walls !'
        break
      case 4:
        titleTutoModal.value = 'Helpers for the grid'
        descriptionTutoModal.value = 'Mobile/Tablet: At the top of the grid, you\'ll find color-coded items and a green panel with grid clearing options.\r\n\r\n Desktop: On the right side of the grid, locate color-coded items and a green panel with grid clearing options.'
        break
      case 5:
        titleTutoModal.value = 'Drag and drop'
        descriptionTutoModal.value = 'For desktop users only: You can drag and drop to freely adjust the position of the start and end.'
        break
      default:
        break
    }
  }

  watch(closeTutoModalIntroduction, (newCloseTutoModalIntroduction) => {
    if (newCloseTutoModalIntroduction) {
      document.body.style.overflow = 'scroll'
      document.body.style.overflow = 'scroll'
    }
    else {
      document.body.style.overflow = 'hidden'
      document.body.style.overflow = 'hidden'
    }
  })

  return { closeInfoModal, titleInfoModal, descriptionInfoModal, openInfoModal, closeTutoModalIntroduction, slideTuto, totalSlide, currentSlide, titleTutoModal, descriptionTutoModal }
}

const { closeInfoModal, titleInfoModal, descriptionInfoModal, openInfoModal, closeTutoModalIntroduction, slideTuto, totalSlide, currentSlide, titleTutoModal, descriptionTutoModal } = useModal()

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

  function animationVisited(pathLength: number): Promise<void> {
    return new Promise((resolve) => {
      function markCellsVisited(i: number) {
        let toRemove
        pathLength === 0 ? toRemove = 0 : toRemove = 1
        if (i < visited.value.length - toRemove) {
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
          openInfoModal('Mission impossible !', '0 paths found')
      }
      catch (error) {
        openInfoModal('Error found !', error?.toString())
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
        await animationVisited(shortest.length)
        await animationPath()
        if (shortest.length === 0)
          openInfoModal('Mission impossible !', '0 paths found')
        resetGraphAfterDijkstra()
      }
      catch (error) {
        openInfoModal('Error found !', error?.toString())
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
        await animationVisited(shortest.length)
        await animationPath()
        if (shortest.length === 0)
          openInfoModal('Mission impossible !', '0 paths found')
      }
      catch (error) {
        openInfoModal('Error found !', error?.toString())
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
  <Modal v-if="!closeTutoModalIntroduction">
    <template v-if="currentSlide !== 4" #title>
      {{ titleTutoModal }}
    </template>
    <template v-if="currentSlide === 1" #description>
      {{ descriptionTutoModal }}
    </template>
    <template #descriptionWithImage>
      <div v-if="currentSlide === 2">
        <p class="whitespace-pre-wrap pb-[0.5rem]">
          {{ descriptionTutoModal }}
        </p>
        <img class="object-cover w-full" src="../assets/images/algoBar.png" alt="image of algorithms bars">
      </div>
      <div v-if="currentSlide === 3">
        <p class="whitespace-pre-wrap pb-[0.5rem]">
          {{ descriptionTutoModal }}
        </p>
        <img class="object-cover w-full" src="../assets/images/wallExample.png" alt="image of algorithms bars">
      </div>
      <div v-if="currentSlide === 5">
        <p class="whitespace-pre-wrap pb-[0.5rem]">
          {{ descriptionTutoModal }}
        </p>
        <img class="object-cover w-full" src="../assets/images/drag.png" alt="image of algorithms bars">
      </div>
    </template>
    <template #descriptionWithImageVertical>
      <div v-if="currentSlide === 4" class="sm:grid sm:grid-cols-2 justify-items-center items-center">
        <div>
          <h2 class="font-bold text-3xl">
            {{ titleTutoModal }}
          </h2>
          <p class="whitespace-pre-wrap pt-[2rem] pb-[1rem] sm:pb-[0.5rem]">
            {{ descriptionTutoModal }}
          </p>
        </div>
        <img class="object-cover w-full max-w-[15rem]" src="../assets/images/boardHelpers.png" alt="image of algorithms bars">
      </div>
    </template>
    <template #numberSlide>
      <div class="whitespace-nowrap">
        <p>{{ currentSlide }} / {{ totalSlide }}</p>
      </div>
    </template>
    <template #button>
      <button class="py-[0.5rem] px-[1.5rem] w-[10rem] bg-red-400 rounded-xl cursor-pointer" @click="closeTutoModalIntroduction = true">
        Skip tutorial
      </button>
    </template>
    <template #buttonNext>
      <button v-if="currentSlide !== totalSlide" class="py-[0.5rem] px-[1.5rem] bg-yellow-400 rounded-xl cursor-pointer" @click="slideTuto(true)">
        Next
      </button>
      <button v-else class="py-[0.5rem] px-[1.5rem] bg-yellow-400 rounded-xl cursor-pointer" @click="closeTutoModalIntroduction = true">
        Start
      </button>
    </template>
    <template v-if="currentSlide !== 1" #buttonPrev>
      <button class="py-[0.5rem] px-[1.5rem] bg-blue-400 rounded-xl cursor-pointer" @click="slideTuto(false)">
        Previous
      </button>
    </template>
  </Modal>
  <Modal v-if="!closeInfoModal">
    <template #title>
      {{ titleInfoModal }}
    </template>
    <template #description>
      {{ descriptionInfoModal }}
    </template>
    <template #closeSVG>
      <div class="flex items-center p-[0.2rem] cursor-pointer" @click="closeInfoModal = true">
        <svg fill="#2b2727" height="20px" width="20px" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="-39.2 -39.2 568.40 568.40" xml:space="preserve" stroke="#2b2727" stroke-width="49"><g id="SVGRepo_bgCarrier" stroke-width="0" /><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" /><g id="SVGRepo_iconCarrier"> <polygon points="456.851,0 245,212.564 33.149,0 0.708,32.337 212.669,245.004 0.708,457.678 33.149,490 245,277.443 456.851,490 489.292,457.678 277.331,245.004 489.292,32.337 " /></g>
        </svg>
      </div>
    </template>
    <template #button>
      <button class="py-[0.5rem] px-[1.5rem] bg-red-400 rounded-xl cursor-pointer" @click="closeInfoModal = true">
        OK
      </button>
    </template>
  </Modal>
  <div class="bg-teal-950 text-teal-950 py-[1rem] xl:py-[2rem] h-screen">
    <div class="flex justify-around md:justify-center md:space-x-[10rem] items-center xl:hidden pb-[1rem] bg-slate-100">
      <GridParams />
      <div class="flex flex-col justify-center items-center select-none bg-green-900 text-white rounded-md mt-[1rem]">
        <p class="p-[1rem] ">
          Grid Reset Option
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
            class="outline outline-1 w-[30px] h-[30px] cursor-pointer"
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
            class="outline outline-1 w-[20px] h-[25px] sm:w-[30px] sm:h-[40px] cursor-pointer"
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
        <div class="flex flex-col justify-center items-center select-none bg-green-900 text-white rounded-md mx-[1rem]">
          <p class="p-[1rem]">
            Grid Reset Option
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

<style>
.stopScroll {
  overflow: hidden
}
</style>
