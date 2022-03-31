import type { Ref } from 'vue'
import type { BlockState } from '~/types'
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

type GameStatus = 'ready' | 'play' | 'won' | 'lost'
interface GameState {
  board: BlockState[][]
  mineGenerated: boolean
  status: GameStatus
  startMS?: number
  endMS?: number
}
export class GamePlay {
  state = ref() as Ref<GameState>

  constructor(public width: number, public height: number, public mines: number) {
    this.reset()
  }

  get board() {
    return this.state.value.board
  }

  get blocks() {
    return this.state.value.board.flat()
  }

  /**
 * 重置游戏
 */
  reset(width = this.width,
    height = this.height,
    mines = this.mines) {
    this.width = width
    this.height = height
    this.mines = mines
    this.state.value = {
      mineGenerated: false,
      status: 'ready',
      board: Array.from({ length: this.height }, (_, y) =>
        Array.from({ length: this.width },
          (_, x): BlockState => ({
            x,
            y,
            adjacentMines: 0,
            revealed: false,
            mine: false,
            flagged: false,
          }),
        ),
      ),
    }
  }

  /**
 * 点击方块
 * @param block 当前点击的方块
 */
  onClick(block: BlockState) {
    if (this.state.value.status === 'ready') {
      this.state.value.status = 'play'
      this.state.value.startMS = +new Date()
    }
    if (this.state.value.status !== 'play' || block.flagged)
      return
    if (!this.state.value.mineGenerated) {
      this.generateMines(this.board, block)
      this.state.value.mineGenerated = true
    }
    block.revealed = true
    if (block.mine) {
      this.onGameOver('lost')
      return
    }
    this.expandZero(block)
  }

  /**
 * 右键标记
 * @param block 当前点击的方块
 */
  onRightClick(block: BlockState) {
    if (this.state.value.status !== 'play')
      return
    if (block.revealed)
      return
    block.flagged = !block.flagged
  }

  randomRange(min: number, max: number) {
    return Math.random() * (max - min) + min
  }

  randomInt(min: number, max: number) {
    return Math.round(this.randomRange(min, max))
  }

  /**
 * 生成地雷
 * @param initial 第一次点击的方块
 */
  generateMines(state: BlockState[][], initial: BlockState) {
    const placeRandom = () => {
      const x = this.randomInt(0, this.width - 1)
      const y = this.randomInt(0, this.height - 1)
      const block = state[y][x]
      if (Math.abs(initial.x - block.x) <= 1 && Math.abs(initial.y - block.y) <= 1)
        return false
      if (block.mine)
        return false
      block.mine = true
      return true
    }
    Array.from({ length: this.mines }, () => null)
      .forEach(() => {
        let placed = false
        while (!placed)
          placed = placeRandom()
      })
    this.updateNumbers()
  }

  /**
 * 展开零
 * @param block 当前块
 */
  expandZero(block: BlockState) {
    if (block.adjacentMines > 0)
      return
    const siblings = this.getSibling(block)
    siblings.forEach((sibling) => {
      if (sibling.revealed)
        return
      sibling.revealed = true
      this.expandZero(sibling)
    })
  }

  autoExpand(block: BlockState) {
    if (this.state.value.status !== 'play' || block.flagged)
      return
    const siblings = this.getSibling(block)
    const flags = siblings.reduce((a, b) => a + (b.flagged ? 1 : 0), 0)
    const notRevealed = siblings.reduce((a, b) => a + (!b.revealed && !b.flagged ? 1 : 0), 0)
    if (flags === block.adjacentMines) {
      siblings.forEach((sibling) => {
        if (sibling.revealed || sibling.flagged)
          return
        sibling.revealed = true
        this.expandZero(sibling)
        if (sibling.mine)
          this.onGameOver('lost')
      })
    }
    const missingFlags = block.adjacentMines - flags
    if (notRevealed === missingFlags) {
      siblings.forEach((sibling) => {
        if (!sibling.revealed && !sibling.flagged)
          sibling.flagged = true
      })
    }
  }

  /**
 * 获取相邻的雷
 * @param block 当前块
 */
  getSibling(block: BlockState) {
    const siblings = []
    for (const [dx, dy] of directions) {
      const x = block.x + dx
      const y = block.y + dy
      if (x < 0 || x >= this.width || y < 0 || y >= this.height)
        continue
      const neighbor = this.board[y][x]
      siblings.push(neighbor)
    }
    return siblings
  }

  /**
 * 计算邻居雷数
 */
  updateNumbers() {
    this.board.forEach((row) => {
      row.forEach((block) => {
        if (block.mine) return
        block.adjacentMines = 0
        const siblings = this.getSibling(block)
        siblings.forEach((sibling) => {
          if (sibling.mine)
            block.adjacentMines++
        })
      })
    })
  }

  showAllMines() {
    this.board.forEach((row) => {
      row.forEach((block) => {
        if (block.mine)
          block.revealed = true
      })
    })
  }

  onGameOver(status: GameStatus) {
    this.state.value.status = status
    this.state.value.endMS = +new Date()
    if (status === 'lost') {
      this.showAllMines()
      setTimeout(() => {
        alert('lost')
      }, 10)
    }
  }

  /**
 * 检查游戏状态
 */
  checkGameState() {
    if (!this.state.value.mineGenerated || this.state.value.status !== 'play')
      return
    const blocks = this.board.flat()
    if (!blocks.some(block => !block.mine && !block.revealed))
      this.onGameOver('won')
  }
}
