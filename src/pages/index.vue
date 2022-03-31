<script setup lang="ts">
import { GamePlay } from '~/composables/logic'
import Confetti from '~/components/Confetti.vue'

const play = new GamePlay(9, 9, 10)
const state = computed(() => play.board)
const now = useNow()
const timerMS = computed(() => Math.round(((play.state.value.endMS ?? +now.value) - (play.state.value.startMS ?? +now.value)) / 1000))
const mineRest = computed(() => {
  if (!play.state.value.mineGenerated)
    return play.mines
  return play.blocks.reduce((a, b) => a - (b.flagged ? 1 : 0), play.mines)
})
function newGame(difficulty: 'easy' | 'medium' | 'hard') {
  switch (difficulty) {
    case 'easy':
      play.reset(10, 10, 10)
      break
    case 'medium':
      play.reset(20, 20, 40)
      break
    case 'hard':
      play.reset(30, 30, 99)
      break
  }
}
watchEffect(() => {
  play.checkGameState()
})
</script>

<template>
  <div>
    <div>Mine Sweeper</div>
    <div flex="~ gap1" justify-center p4>
      <button btn @click="play.reset()">
        New Game
      </button>
      <button btn @click="newGame('easy')">
        Easy
      </button>
      <button btn @click="newGame('medium')">
        Medium
      </button>
      <button btn @click="newGame('hard')">
        Hard
      </button>
    </div>
    <div flex="~ gap-10" justify-center>
      <div font-mono text-2xl flex="~ gap-1" items-center>
        <div i-carbon-timer />
        {{ timerMS }}
      </div>
      <div font-mono text-2xl flex="~ gap-1" items-center>
        <div i-mdi-mine />
        {{ mineRest }}
      </div>
    </div>
    <div p5>
      <div v-for="row, y in state" :key="y" flex="~" items-center justify-center>
        <template v-for="item in row" :key="item">
          <MineBlock
            :block="item"
            @click="play.onClick(item)"
            @contextmenu.prevent="play.onRightClick(item)"
            @lrclick="play.autoExpand(item)"
          />
        </template>
      </div>
      <button btn mt5 @click="play.reset()">
        RESET
      </button>
    </div>
    <Confetti :passed="play.state.value.status === 'won'" />
  </div>
</template>
