import React, { Component } from 'react';
import './App.css';

class Board extends Component {

  renderTile(val, index) {
    let displayVal, color, fontSize;
    if (val != null) {
      displayVal = val;
      color = this.props.colors.color(Math.log2(val) - 1);
    } else {
      displayVal = '';
      color = ColorUtils.defaultColor();
    }
    return <div className='board-tile' key={index} style={{backgroundColor:color}}>
             <div className='board-val'>{displayVal}</div>
           </div>
  }

  renderRow(arr, row, dim) {
    let start = row * dim;
    const end = start + dim;
    const tiles = arr.slice(start, end).map((val, index) =>
      this.renderTile(val, index)
    );
    return <div className='board-row' key={row}>{tiles}</div>
  }

  render() {
    const rows = [];
    let row = 0;
    while (row < this.props.dim) {
      rows.push(this.renderRow(this.props.squares, row, this.props.dim));
      row++;
    }
    return (
      <div className='board'>
        {rows}
      </div>
    );
  }
}


class Game extends Component {

  constructor(props) {
    super(props);
    this.state = {
      dim: props.dim,
      squares: Game.initBoard(props.dim),
      score: 0,
      lastKey: null,
      colors: new ColorUtils(props.dim),
      gameOver: false,
      touch: new TouchController(),
    };
  }

  static initBoard(dim) {
    let squares = Array(dim ** 2).fill(null);
    Game.fillEmptyTile(squares);
    return squares;
  }

  render() {
    return (
    <div className="game-container" 
      onKeyDown={(e) => this.handleMove(e.key)} 
      onTouchStart={(e) => this.state.touch.start(e)}
      onTouchMove={(e) => this.state.touch.move(e)}
      onTouchEnd={(e) => this.handleMove(this.state.touch.end())}
      tabIndex="0">
      <div className="game">
        <div className="board-container">
          {this.state.gameOver ? (<GameSummary score={this.state.score} reset={() => this.resetGame()}/>) : (null)}
          <Board squares={this.state.squares} dim={this.state.dim} colors={this.state.colors}/>
        </div>
        <Score score={this.state.score}/>
      </div>
    </div>
    );
  }

  handleMove(eventKey) {
    let squares = Array.from(this.state.squares);
    let scoreUpdates;
    switch(eventKey) {
      case 'ArrowUp':
        scoreUpdates = ArrayTransformer.shiftUp(squares, this.state.dim);
        break;
      case 'ArrowDown':
        scoreUpdates = ArrayTransformer.shiftDown(squares, this.state.dim);
        break;
      case 'ArrowLeft':
        scoreUpdates = ArrayTransformer.shiftLeft(squares, this.state.dim);
        break;
      case 'ArrowRight':
        scoreUpdates = ArrayTransformer.shiftRight(squares, this.state.dim);
        break;
    }

    if (scoreUpdates.length) {
      Game.fillEmptyTile(squares);
      this.updateScore(scoreUpdates);
    }

    this.setState({
      squares: squares,
      lastKey: eventKey,
      gameOver: Game.gameOver(squares, this.state.dim),
    });
  }

  setBoard(squares) {
    this.setState({squares: squares});
  }

  updateScore(values) {
    const amount = values.reduce((a, b) => a + b, 0);
    this.setState({
      score: this.state.score + amount,
    });
  }

  static gameOver(squares, dim) {
    let gameOver = Game.countEmptyTiles(squares) === 0;
    if (gameOver) {
      let boardCopy = squares.slice(0);
      if (ArrayTransformer.shiftLeft(boardCopy, dim).length) {
        gameOver = false;
      } else if (ArrayTransformer.shiftUp(boardCopy, dim).length) {
        gameOver = false;
      }
    }
    return gameOver;
  }

  resetGame() {
    this.setState({
      squares: Game.initBoard(this.state.dim),
      score: 0,
      lastKey: null,
      colors: new ColorUtils(this.state.dim),
      gameOver: false,
    });
  }

  static fillEmptyTile(squares) {
    const fillTileInEmptyIdx = Game.randLessThan(Game.countEmptyTiles(squares));
    let visitedEmptyTiles = 0;
    for (let idx = 0; idx < squares.length; idx++) {
      if (squares[idx] == null) {
        if (visitedEmptyTiles == fillTileInEmptyIdx) {
          squares[idx] = Game.newTileVal();
          return;
        }
        visitedEmptyTiles++;
      }
    }
  }

  static countEmptyTiles(squares) {
    let emptyTiles = 0;
    for (let idx = 0; idx < squares.length; idx++) {
      if (squares[idx] == null) {
        emptyTiles++;
      }
    }
    return emptyTiles;
  }

  static newTileVal() {
    return Math.ceil(Math.random() * 2) * 2;
  }

  static randLessThan(max) {
    return Math.floor(Math.random() * max);
  }
}


class GameSummary extends Component {

  render() {
    return (
      <div class="game-summary-container">
        <div class="game-summary">
          <h1>Game Over</h1>
          <h2>Score: {this.props.score}</h2>
          <button onClick={() => this.props.reset()}>Play Again</button>
        </div>
      </div>
    )
  }

}


class ArrayTransformer {

  static shiftLeft(squares, dim) {
    let mergedVals = [];
    let row = 0;
    while(row < dim) {
      mergedVals = mergedVals.concat(ArrayTransformer.shiftRowLeft(squares, row, dim));
      row++;
    }
    return mergedVals;
  }

  static shiftUp(squares, dim) {
    let mergedVals = [];
    let col = 0;
    while (col < dim) {
      mergedVals = mergedVals.concat(ArrayTransformer.shiftColUp(squares, col, dim));
      col++;
    }
    return mergedVals;
  }

  static shiftRight(squares, dim) {
    ArrayTransformer.horizontalReflection(squares, dim);
    const mergedVals = ArrayTransformer.shiftLeft(squares, dim);
    ArrayTransformer.horizontalReflection(squares, dim);
    return mergedVals;
  }

  static shiftDown(squares, dim) {
    ArrayTransformer.verticalReflection(squares, dim);
    const mergedVals = ArrayTransformer.shiftUp(squares, dim);
    ArrayTransformer.verticalReflection(squares, dim);
    return mergedVals;
  }

  static verticalReflection(squares, dim) {
    let col = 0;
    while(col < dim) {
      ArrayTransformer.reverseCol(squares, col, dim);
      col++;
    }
  }

  static horizontalReflection(squares, dim) {
    let row = 0;
    while(row < dim) {
      ArrayTransformer.reverseRow(squares, row, dim);
      row++;
    }
  }

  static toArrayLoc(row, col, dim) {
    let startRow = row * dim;
    return startRow + col;
  }

  static reverseRow(arr, row, dim) {
    let col = 0;
    while (col < Math.floor(dim / 2)) {
      let left = ArrayTransformer.toArrayLoc(row, col, dim);
      let right = ArrayTransformer.toArrayLoc(row, dim - col - 1, dim);
      let temp = arr[left];
      arr[left] = arr[right];
      arr[right] = temp;
      col++;
    }
  }

  static reverseCol(arr, col, dim) {
    let row = 0;
    while (row < Math.floor(dim / 2)) {
      let top = ArrayTransformer.toArrayLoc(row, col, dim);
      let bot = ArrayTransformer.toArrayLoc(dim - row - 1, col, dim);
      let temp = arr[top];
      arr[top] = arr[bot];
      arr[bot] = temp;
      row++;
    }
  }

  static shiftRowLeft(arr, row, dim) {
    let mergedVals = [];
    let shiftTo = ArrayTransformer.toArrayLoc(row, 0, dim);
    // start at 1 bc no need to shift col 0
    for (let col = 1; col < dim; col ++) {
      let shiftFrom = ArrayTransformer.toArrayLoc(row, col, dim);
      while (arr[shiftFrom] != null && shiftTo != shiftFrom) {
        if (arr[shiftTo] == null) {
          arr[shiftTo] = arr[shiftFrom];
          arr[shiftFrom] = null;
          mergedVals.push(0);
        } else {
          if (arr[shiftTo] == arr[shiftFrom]) {
            arr[shiftTo] +=  arr[shiftFrom];
            arr[shiftFrom] = null;
            mergedVals.push(arr[shiftTo]);
          }
          shiftTo += 1;
        } 
      }
    }
    return mergedVals;
  }

  static shiftColUp(arr, col, dim) {
    let mergedVals = [];
    let rowBoundary = 0;
    let shiftTo = ArrayTransformer.toArrayLoc(rowBoundary, col, dim);
    // start at 1 bc no need to shift row 0
    for (let row = 1; row < dim; row++) {
      let shiftFrom = ArrayTransformer.toArrayLoc(row, col, dim);
      while (arr[shiftFrom] != null && rowBoundary < row) {
        if (arr[shiftTo] == null) {
          arr[shiftTo] = arr[shiftFrom];
          arr[shiftFrom] = null;
          mergedVals.push(0);
        } else {
          if (arr[shiftTo] == arr[shiftFrom]) {
            arr[shiftTo] += arr[shiftFrom];
            arr[shiftFrom] = null;
            mergedVals.push(arr[shiftTo]);
          }
          rowBoundary += 1;
          shiftTo = ArrayTransformer.toArrayLoc(rowBoundary, col, dim);
        }
      }
    }
    return mergedVals;
  }  

}


class Score extends Component {

  render() {
    return (
    <div className="score-container">
      <div className="score-name">score:</div>
      <div className="score-value">{this.props.score}</div>
    </div>);
  }

  getScore() {
    return this.props.score;
  }

}

class ColorUtils {

  constructor(dim) {
    let cycleLength = Math.floor(dim + 1 + Math.random() * dim ** 2)
    this.cycleLength = cycleLength;
    this.offset = Math.floor(Math.random() * cycleLength);
    this.centers = ColorUtils.randomList(30, 280, 3);
    this.widths = ColorUtils.randomList(10, 80, 3);
    this.phases = ColorUtils.shuffle(ColorUtils.accumulate(ColorUtils.randomList(1, 8, 3)));
    this.depthCenterAdj = ColorUtils.randomList(0, 100, 3);
    this.depthWidthAdj = ColorUtils.randomList(0, 100, 3);
    this.noise = ColorUtils.randomList(-30, 30, dim ** 2 * 3);
    this.seen = {};
  }

  static shuffle(list) {
    var j, x, i;
    for (i = list.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = list[i];
        list[i] = list[j];
        list[j] = x;
    }
    return list;
}

  static accumulate(list) {
    let cumulatives = [];
    for (let i = 0; i < list.length; i++) {
      let val = 0;
      for (let j = 0; j < i; j++) {
        val += list[j];
      }
      cumulatives.push(val);
    }
    return cumulatives;
  }

  static randomList(min, max, len) {
    let vals = [];
    for (let i = 0; i < len; i++) {
      vals.push(min + (Math.random() * (max - min)));
    }
    return vals;
  }

  color(position) {
    if (!(position in this.seen)) {
      this.seen[position] = this.fuzz(this.rgb(position, this.cycleLength), Object.values(this.seen));
    }toString()
    return 'rgba(' + this.seen[position].toString() + ',.6)';
  }

  static defaultColor() {
    return 'rgba(240,240,240,.2)';
  }

  // good insight here: https://krazydad.com/tutorials/makecolors.php
  rgb(pos, len) {
    let rgb = []
    for (let i = 0; i < 3; i++) {
      rgb.push(ColorUtils.colorFreq(pos + this.offset, 
                                    len, 
                                    this.centers[i], 
                                    this.widths[i], 
                                    this.phases[i],
                                    this.depthCenterAdj[i],
                                    this.depthWidthAdj[i],
                                    this.noise[i * pos]));
    }
    return rgb
  }

  fuzz(rgb, others) {
    for (let color in others) {
      let similarity = 0;
      for (let i = 0; i < color.length; i++) {
        similarity += Math.abs(rgb[i] - color[i]);
      }
      if (similarity < 1000) {
        for (let i = 0; i < rgb.length; i++) {
          rgb[i] = (rgb[i] + 30 + Math.random() * 20) % 255;
        }
      }
    }
    return rgb;
  }

  static colorFreq(pos, len, center, width, phase, widthAdj, centerAdj, noise) {
    const step = 2 * Math.PI / len;
    const depth = Math.floor(pos / len);
    const adjustedCenter = (center + (depth * centerAdj));
    const adjustedWidth = width + (depth * widthAdj);
    return (Math.sin((pos * step) + phase) * adjustedWidth + adjustedCenter + noise) % 255;
  }

}


class TouchController {

  static minDistance = 5;

  constructor () {
    this.startX = null;
    this.startY = null;
    this.endX = null;
    this.endY = null;
  }

  start(touchEvent) {
    this.startX = touchEvent.touches[0].clientX;
    this.startY = touchEvent.touches[0].clientY;
  }

  move(touchEvent) {
    this.endX = touchEvent.touches[0].clientX;
    this.endY = touchEvent.touches[0].clientY;
  }

  // called on touchend event
  end(callback) {
    const xDiff = this.endX - this.startX;
    const yDiff = this.endY - this.startY;
    var direction = null;
    if ((xDiff ** 2 + yDiff ** 2) >= TouchController.minDistance ** 2) {
      if (Math.abs(xDiff) > Math.abs(yDiff)) {
        if (xDiff > yDiff) {
          direction = 'ArrowRight';
        } else {
          direction = 'ArrowLeft'
        }
      } else {
        if (yDiff > 0) {
          direction = 'ArrowDown';
        } else {
          direction = 'ArrowUp';
        }
      }
    }
    return direction;
  }

}

class App extends Component {
  render() {
    return (
      <Game dim={4} />
    );
  }
}

export {App, Game, Score, ArrayTransformer, ColorUtils, TouchController};
