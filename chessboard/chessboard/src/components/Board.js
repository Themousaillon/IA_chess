import React, { Component } from 'react';
import { connect } from 'react-redux';
import './Board.css';
import Cell from './Cell.js';
import UpgradeBox from './UpgradeBox';


@connect((store) => {
  return{
    board: store.board.board
  }
})
class Board extends Component {
  renderBoard = () => {
    let boardJSX = [];
    for (let i=0; i<8; i++){
      for (let j=0; j<8; j++)
        boardJSX.push(<Cell key = {i*8+j} colindex = {j} rowindex = {i} />)
    }
    return boardJSX
  }

  render() {
    return (
      <div>
        <UpgradeBox />
        <div className = "board">
          { this.renderBoard() }
        </div>
        <UpgradeBox />
      </div>
    );
  }
}

export default Board;
