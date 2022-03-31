<script setup lang="ts">
import { GamePlay } from '~/composables/logic'
import type { BlockState } from '~/types'

const ISDEV = false
/**
   * 数字的颜色
   */
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
const play = new GamePlay(12, 12)

function getClass(block: BlockState) {
  if (block.flagged)
    return 'bg-gray-500/10'
  if (!block.revealed) return 'bg-gray-500/10  hover:bg-gray/10'
  return block.mine
    ? 'bg-red-500/50'
    : numberColors[block.adjacentMines]
}

</script>

<template>
  <div>
    <div>Mine Sweeper</div>
    <div p5>
      <div v-for="row, y in play.state" :key="y" flex="~" items-center justify-center>
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
          @click="play.onClick(item)"
          @contextmenu.prevent="play.onRightClick(item)"
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
      <button btn mt5 @click="play.reset">
        RESET
      </button>
    </div>
  </div>
</template>
