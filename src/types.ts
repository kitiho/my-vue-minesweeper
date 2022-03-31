export interface BlockState {
  revealed: boolean
  mine?: boolean
  flagged: boolean
  adjacentMines: number
  x: number
  y: number
}
