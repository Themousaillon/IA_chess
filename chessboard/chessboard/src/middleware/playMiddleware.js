import { setCurrentSelected, setAvailablePlays } from '../actions/gameActions'
import { applyPlayList, clearPlayList, movePiece } from '../actions/boardActions'
import { generate_plays } from '../logic/board/travelPaterns'

function findPlay(x, y, playList){
  for (let i in playList){
    console.log(playList[i])
    if (playList[i].i === x && playList[i].j === y)
      return i
  }
  return -1
}

function makePlay(current, play){
  switch(play.type){
    case "MOVE":
      let pos2 = {i: play.i, j: play.j}
      let pos1 = {i: current.x, j: current.y}
      return movePiece(pos1, pos2)
    default:
  }
}

export function playMiddleware(x,y){
  return function(dispatch, getState){
    let _store = getState()
    let board = _store.board.board
    let player = _store.game.currentPlayer
    let currentSelected = _store.game.currentSelectedCell
    let playList = _store.game.availablePlays
    console.log(playList)
    if (board[x][y].army === player){
      dispatch(setCurrentSelected(x,y))
      playList = generate_plays(player, board, x, y)
      dispatch(clearPlayList())
      dispatch(setAvailablePlays(playList))
      dispatch(applyPlayList(playList))
    }
    else if (board[x][y].army === "empty"){
      let index = findPlay(x, y, playList)
      console.log(index)
      if (index !== -1)
        dispatch(makePlay(currentSelected, playList[index]))
      dispatch(clearPlayList())
    }
  }
}