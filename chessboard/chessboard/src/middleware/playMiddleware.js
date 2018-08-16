import { setCurrentSelected, setAvailablePlays, nexTurn } from '../actions/gameActions'
import { applyPlayList, clearPlayList, movePiece, roqueKing, roqueQueen } from '../actions/boardActions'
import { generate_plays } from '../logic/board/travelPatterns'

function findPlay(x, y, playList){
  for (let i in playList){
    if (playList[i].i === x && playList[i].j === y)
      return i
  }
  return -1
}

function get_opponent(player){
  if (player === "white")
    return "black"
  else
    return "white"
}

function makePlay(player, current, play){
  switch(play.type){
    case "MOVE": case "PRISE":
      let pos2 = {i: play.i, j: play.j}
      let pos1 = {i: current.x, j: current.y}
      return movePiece(pos1, pos2)
    case "ROQUE_KING":
      return roqueKing(player)
    case "ROQUE_QUEEN":
      return roqueQueen(player)

    default:
  }
}

export function playMiddleware(x,y){
  return function(dispatch, getState){
    let _store = getState()
    let board = _store.board.board
    let player = _store.game.currentPlayer
    if (board[x][y].army === player){
      console.log("dispatched !!!")
      dispatch(setCurrentSelected(x,y))
    }
    _store = getState()
    let currentSelected = _store.game.currentSelectedCell
    let currentCell = board[currentSelected.x][currentSelected.y]
    let playList = _store.game.availablePlays
    if (board[x][y].army === player){
      dispatch(setCurrentSelected(x,y))
      playList = generate_plays(player, board, x, y)
      console.log(playList)
      dispatch(clearPlayList())
      dispatch(setAvailablePlays(playList))
      dispatch(applyPlayList(playList))
    }
    else if ((board[x][y].army === "empty" || board[x][y].army === get_opponent(player)) && currentCell.army === player){
      let index = findPlay(x, y, playList)
      if (index !== -1){
        dispatch(makePlay(player, currentSelected, playList[index]))
        dispatch(nexTurn())
      }
      dispatch(clearPlayList())
    }
  }
}
