<script setup lang="ts">
import type { BlockState } from '~/types'

const ISDEV = false
const WIDTH = 5
const HEIGHT = 5
const directions = [
  [1, 1],
  [1, 0],
  [1, -1],
  [0, -1],
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, 1],
]

let mineGenerated = false

const numberColors = [
  'text-transparent',
  'text-blue-500',
  'text-green-500',
  'text-orange-500',
  'text-red-500',
  'text-purple-500',
  'text-pink-500',
  'text-teal-500',

]
const state = reactive(
  Array.from({ length: HEIGHT },
    (_, y) => Array.from({ length: WIDTH },
      (_, x): BlockState => ({
        revealed: false,
        mine: false,
        flagged: false,
        adjacentMines: 0,
        x,
        y,
      }))),
)
function onClick(block: BlockState) {
  if (!mineGenerated) {
    generateMines(block)
    updateNumbers()
    mineGenerated = true
  }
  block.revealed = true
  if (block.mine) {
    alert('BOOM!')
    return
  }
  checkGameState()
  expandZero(block)
}

function onRightClick(block: BlockState) {
  if (block.revealed)
    return
  block.flagged = !block.flagged
  checkGameState()
}
// 生成雷
function generateMines(initial: BlockState) {
  for (const row of state) {
    for (const block of row) {
      if (Math.abs(initial.x - block.x) < 1)
        continue
      if (Math.abs(initial.y - block.y) < 1)
        continue
      block.mine = Math.random() < 0.1
    }
  }
}

// 展开零
function expandZero(block: BlockState) {
  if (block.adjacentMines > 0)
    return
  const siblings = getSibling(block)
  siblings.forEach((sibling) => {
    if (sibling.revealed)
      return
    sibling.revealed = true
    expandZero(sibling)
  })
}
function getSibling(block: BlockState) {
  const siblings = []
  for (const [dx, dy] of directions) {
    const x = block.x + dx
    const y = block.y + dy
    if (x < 0 || x >= WIDTH || y < 0 || y >= HEIGHT)
      continue
    const neighbor = state[y][x]
    if (neighbor.flagged || neighbor.revealed)
      continue
    siblings.push(neighbor)
  }
  return siblings
}
function updateNumbers() {
  state.forEach((row, y) => {
    row.forEach((block, x) => {
      if (block.mine) return
      block.adjacentMines = 0
      const siblings = getSibling(block)
      siblings.forEach((sibling) => {
        if (sibling.mine)
          block.adjacentMines++
      })
    })
  })
}
function getClass(block: BlockState) {
  if (block.flagged)
    return 'bg-gray-500/10'
  if (!block.revealed) return 'bg-gray-500/10  hover:bg-gray/10'
  return block.mine
    ? 'bg-red-500/50'
    : numberColors[block.adjacentMines]
}
function checkGameState() {
  let mineCount = 0
  state.forEach((row, y) => {
    row.forEach((block, x) => {
      if (block.mine)
        mineCount++
    })
  })
  let flagCount = 0
  state.forEach((row, y) => {
    row.forEach((block, x) => {
      if (block.flagged)
        flagCount++
    })
  })
  if (mineCount === flagCount)
    alert('You Win!')
}

</script>

<template>
  <div>
    <div>Mine Sweeper</div>
    <div p5>
      <div v-for="row, y in state" :key="y" flex="~" items-center justify-center>
        <button
          v-for="item in row"
          :key="item"
          w-10
          h-10
          m="0.5"
          border="1 gray-400/10"
          flex="~"
          items-center
          justify-center
          :class="getClass(item)"
          @click="onClick(item)"
          @contextmenu.prevent="onRightClick(item)"
        >
          <template v-if="item.flagged">
            <div i-mdi-flag text-red />
          </template>
          <template v-if="item.revealed || ISDEV">
            <div v-if="item.mine" i-mdi-mine />
            <div v-else>
              {{ item.adjacentMines }}
            </div>
          </template>
        </button>
      </div>
    </div>
  </div>
</template>
