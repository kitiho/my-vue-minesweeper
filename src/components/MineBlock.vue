
<script setup lang="ts">
import type { BlockState } from '~/types'
import { __ISDEV__ } from '~/composables'

defineProps<{ block: BlockState }>()
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
function getClass(block: BlockState) {
  if (block.flagged)
    return 'bg-gray-500/10'
  if (!block.revealed) return 'bg-gray-500/10  hover:bg-gray/10'
  return block.mine
    ? 'bg-red-500/50'
    : numberColors[block.adjacentMines]
}
const emit = defineEmits<{ (e: 'lrclick', event: MouseEvent): void }>()
function whichButtons(event: MouseEvent) {
  if (event.buttons === 3)
    emit('lrclick', event)
}

</script>

<template>
  <button
    w-10
    h-10
    m="0.5"
    border="1 gray-400/10"
    flex="~"
    items-center
    justify-center
    :class="getClass(block)"
    @mousedown="whichButtons"
  >
    <template v-if="block.flagged">
      <div i-mdi-flag text-red />
    </template>
    <template v-if="block.revealed || __ISDEV__">
      <div v-if="block.mine" i-mdi-mine />
      <div v-else>
        {{ block.adjacentMines }}
      </div>
    </template>
  </button>
</template>

<style scoped>
</style>
