///////// Travel patterns ///////////
// Réécriture des travels patterns de façon récursive (plus prorpe)

import { checkForMate, canRoque } from './playValidity'
import store from '../../store'

function get_playType(player, board, x, y){
  let opponent
  if (x < 0 || x > 7 || y < 0 || y > 7)
    return "INVALID"
  switch(player){
    case "white":
      opponent = "black"
      break
    case "black":
      opponent = "white"
      break
    default:
  }
  if (board[x][y].army === opponent)
    return "PRISE"
  else if (board[x][y].army === "empty")
    return "MOVE"
  else
    return "INVALID"
}

function filterPlayList(playList){
  let filtedredPlaylist = []
  for (let i in playList){
    if (playList[i].type !== "INVALID")
      filtedredPlaylist.push(playList[i])
    }
    return filtedredPlaylist
}

function get_opponent(player){
  if (player === "white")
    return "black"
  else
    return "white"
}

function filterMate(player, board, playList){
  let filtered = []
  for (let i in playList){
    if (checkForMate(player, board, playList[i]))
      filtered.push(playList[i])
  }
  return filtered
}

function travel(player, board, x, y, dx, dy, playList){
  console.log(playList)
  if (x < 0 || x > 7 || y < 0 || y > 7)
  {return Array.from(playList)}
  else if (board[x][y].army === player) {
    return Array.from(playList)
  }
  else if (board[x][y].army === "empty") {
    return travel(player, board, x+dx, y+dy, dx, dy, playList.concat([{i: x, j:y, type: "MOVE"}]))
  }
  else{
    return playList.concat([{i: x, j:y, type: "MOVE"}])
  }
}

function linePattern(player, board, x, y){
  let t = travel(player, board, x-1, y, -1, 0, [])
  let b = travel(player, board, x+1, y, 1, 0, [])
  let r = travel(player, board, x, y+1, 0, 1, [])
  let l = travel(player, board, x, y-1, 0, -1, [])
  let playList = t.concat(b).concat(r).concat(l)
  return filterMate(player, board, playList)
}


function diagPattern(player, board, x, y){
  let tr = travel(player, board, x-1, y+1, -1, 1, [])
  let tl = travel(player, board, x-1, y-1, -1, -1, [])
  let br = travel(player, board, x+1, y+1, 1, 1, [])
  let bl = travel(player, board, x+1, y-1, 1, -1, [])
  console.log(tr, tl, br, bl)
  let playList = tr.concat(tl).concat(br).concat(bl)
  return filterMate(player, board, playList)
}

function checkForUpgrade(play, upgradeLine){
  if (play.i === upgradeLine)
    return {...play, type: play.type + "_PAWNUPGRADE"}
  else
    return play
}

function pawntravel(player, board, x, y, verticalInfo, playList, upgradeLine){
  let opponent = get_opponent(player)
  if (board[x+verticalInfo.multiplier][y].army === "empty")
    playList.push(checkForUpgrade({i:x+verticalInfo.multiplier, j:y, type: "MOVE"}, upgradeLine))

  if (y<7){
    if (board[x+verticalInfo.multiplier][y+1].army === opponent)
      playList.push(checkForUpgrade({i:x+verticalInfo.multiplier, j:y+1, type: "PRISE"}, upgradeLine))
  }

  if (y>0){
    if (board[x+verticalInfo.multiplier][y-1].army === opponent)
      playList.push(checkForUpgrade({i:x+verticalInfo.multiplier, j:y-1, type: "PRISE"}, upgradeLine))
  }
}

export function pawnPattern(player, board, x, y){
  let playList = []
  if (x === 0 || x === 7)
    return playList
  let bigStartLine
  let enPassantLine
  let upgradeLine
  let verticalInfo = store.getState().game.playerProps[player].verticalInfo
  let enPassantPos = store.getState().game.playerProps[get_opponent(player)].enPassant
  console.log("enPassant --> ", enPassantPos )
  if (verticalInfo.position === "bot"){
    bigStartLine = 6
    enPassantLine = 3
    upgradeLine = 0
  }
  else{
    bigStartLine = 1
    enPassantLine = 4
    upgradeLine = 7
  }

  pawntravel(player, board, x, y, verticalInfo, playList, upgradeLine)

  if (x === bigStartLine && board[x+2*verticalInfo.multiplier][y].army === "empty" && board[x+verticalInfo.multiplier][y].army === "empty")
    playList.push({i:x+2*verticalInfo.multiplier, j:y, type: "BIGSTART"})

  if (x === enPassantLine && enPassantPos !== null){
    if (y-1 === enPassantPos){
      if (board[x+verticalInfo.multiplier][y-1].army === "empty")
        playList.push({i: x+verticalInfo.multiplier, j: y-1, type: "PRISE_EN_PASSANT"})
    }
    else if (y+1 === enPassantPos){
      if (board[x+verticalInfo.multiplier][y+1].army === "empty")
        playList.push({i: x+verticalInfo.multiplier, j: y+1, type: "PRISE_EN_PASSANT"})
    }
  }
  return filterMate(player, board, playList)
}

function roquePattern(player, board, x, y, playList){
  let roque_king_cond = canRoque(player, board, "ROQUE_KING")
  let roque_queen_cond = canRoque(player, board, "ROQUE_QUEEN")
  if (roque_king_cond){
    let king_l1 = {i: x, j: y+1, type: "MOVE"}
    let king_l2 = {i: x, j: y+2, type: "MOVE"}
    if (checkForMate(player, board, king_l1) && checkForMate(player, board, king_l2))
      playList.push({i: x, j: y+2, type: "ROQUE_KING"})
  }
  if (roque_queen_cond){
    let king_r1 = {i: x, j: y-1, type: "MOVE"}
    let king_r2 = {i: x, j: y-2, type: "MOVE"}
    let king_r3 = {i: x, j: y-3, type: "MOVE"}
    if (checkForMate(player, board, king_r1) && checkForMate(player, board, king_r2)
    && checkForMate(player, board, king_r3))
      playList.push({i: x, j: y-2, type: "ROQUE_QUEEN"})
  }

}

export function kingPattern(player, board, x, y){
  let playList = []
  playList.push({i:x+1, j:y, type: get_playType(player,board,x+1,y)})
  playList.push({i:x+1, j:y+1, type: get_playType(player,board,x+1,y+1)})
  playList.push({i:x+1, j:y-1, type: get_playType(player,board,x+1,y-1)})
  playList.push({i:x-1, j:y, type: get_playType(player,board,x-1,y)})
  playList.push({i:x-1, j:y+1, type: get_playType(player,board,x-1,y+1)})
  playList.push({i:x-1, j:y-1, type: get_playType(player,board,x-1,y-1)})
  playList.push({i:x, j:y+1, type: get_playType(player,board,x,y+1)})
  playList.push({i:x, j:y-1, type: get_playType(player,board,x,y-1)})
  roquePattern(player, board, x, y, playList)
  return filterMate(player, board, filterPlayList(playList))
}



export function knightPattern(player, board, x, y){
  let playList = []
  playList.push({i:x+2, j:y+1, type: get_playType(player,board,x+2,y+1)})
  playList.push({i:x+2, j:y-1, type: get_playType(player,board,x+2,y-1)})
  playList.push({i:x-2, j:y+1, type: get_playType(player,board,x-2,y+1)})
  playList.push({i:x-2, j:y-1, type: get_playType(player,board,x-2,y-1)})
  playList.push({i:x+1, j:y+2, type: get_playType(player,board,x+1,y+2)})
  playList.push({i:x-1, j:y+2, type: get_playType(player,board,x-1,y+2)})
  playList.push({i:x+1, j:y-2, type: get_playType(player,board,x+1,y-2)})
  playList.push({i:x-1, j:y-2, type: get_playType(player,board,x-1,y-2)})
  return filterMate(player, board, filterPlayList(playList))
}

function rookPattern(player, board, x, y){
    return linePattern(player, board, x, y)
}

function queenPattern(player, board, x, y){
  return linePattern(player, board, x, y).concat(diagPattern(player, board, x, y))
}

function bishopPattern(player, board, x, y){
  return diagPattern(player, board, x, y)
}


export function generate_plays(player, board, x, y){
  switch (board[x][y].piece){
    case "whitek" : case "blackk":
      return kingPattern(player, board, x, y)
    case "whiter" : case "blackr":
      return rookPattern(player, board, x, y)
    case ("blackkn") : case "whitekn":
      return knightPattern(player, board, x, y)
    case "blackb" : case "whiteb":
      return bishopPattern(player, board, x, y)
    case "blackq" : case "whiteq":
      return queenPattern(player, board, x, y)
    case "blackp" : case "whitep":
      return pawnPattern(player, board, x, y)
    default:
  }
}
