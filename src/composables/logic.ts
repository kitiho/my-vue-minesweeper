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

export class GamePlay {
  /**
 * 是否已经生成地雷
 */
  mineGenerated = false

  state = reactive(
    Array.from({ length: this.height },
      (_, y) => Array.from({ length: this.width },
        (_, x): BlockState => ({
          revealed: false,
          mine: false,
          flagged: false,
          adjacentMines: 0,
          x,
          y,
        }))),
  )

  constructor(public width: number, public height: number) {
    this.reset()
  }

  /**
 * 重置游戏
 */
  reset() {
    this.state.forEach(row => row.forEach((block) => {
      block.revealed = false
      block.flagged = false
      block.adjacentMines = 0
    }))
    this.mineGenerated = false
  }

  /**
 * 点击方块
 * @param block 当前点击的方块
 */
  onClick(block: BlockState) {
    if (!this.mineGenerated) {
      this.generateMines(block)
      this.updateNumbers()
      this.mineGenerated = true
    }
    block.revealed = true
    if (block.mine) {
      alert('BOOM!')
      return
    }
    this.checkGameState()
    this.expandZero(block)
  }

  /**
 * 右键标记
 * @param block 当前点击的方块
 */
  onRightClick(block: BlockState) {
    if (block.revealed)
      return
    block.flagged = !block.flagged
    this.checkGameState()
  }

  /**
 * 生成地雷
 * @param initial 第一次点击的方块
 */
  generateMines(initial: BlockState) {
    for (const row of this.state) {
      for (const block of row) {
        if (Math.abs(initial.x - block.x) < 1)
          continue
        if (Math.abs(initial.y - block.y) < 1)
          continue
        block.mine = Math.random() < 0.1
      }
    }
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
      const neighbor = this.state[y][x]
      if (neighbor.flagged || neighbor.revealed)
        continue
      siblings.push(neighbor)
    }
    return siblings
  }

  /**
 * 计算邻居雷数
 */
  updateNumbers() {
    this.state.forEach((row) => {
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

  /**
 * 检查游戏状态
 */
  checkGameState() {
    let mineCount = 0
    this.state.forEach((row) => {
      row.forEach((block) => {
        if (block.mine)
          mineCount++
      })
    })
    let flagCount = 0
    this.state.forEach((row) => {
      row.forEach((block) => {
        if (block.flagged)
          flagCount++
      })
    })
    if (mineCount === flagCount)
      alert('You Win!')
  }
}
