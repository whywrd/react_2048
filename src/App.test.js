import React from 'react';
import ReactDOM from 'react-dom';
import TestRenderer from 'react-test-renderer'
import {App, Game, Score, ArrayTransformer, ColorUtils, FontUtils} from './App';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<App />, div);
});

describe('ArrayTransformer', function() {

  it("should shift a 3x3 matrix left", function() {
    let arr = [null, 0, null,
                  1, 1,    1,
               null, 2,    1];
    expect(ArrayTransformer.shiftLeft(arr, 3)).toBeTruthy();
    expect(arr).toEqual([0,null,null,
                         2,   1,null,
                         2,   1,null]);
  })

  it("should shift a 4x4 matrix left", function() {
    let arr = [null,    0, null, null,
                  1,    1,    1, null,
               null,    2,    1,    1,
                  1, null,    1, null];
    expect(ArrayTransformer.shiftLeft(arr, 4)).toBeTruthy();
    expect(arr).toEqual([0,null,null,null,
                         2,   1,null,null,
                         2,   2,null,null,
                         2,null,null,null]);
  })

  it("should shift a 3x3 matrix right", function() {
    let arr = [null, 0, null,
                  1, 1,    1,
               null, 2,    1];
    expect(ArrayTransformer.shiftRight(arr, 3)).toBeTruthy();
    expect(arr).toEqual([null, null, 0,
                         null,   1,  2,
                         null,   2,  1]);
  })

  it("should shift a 4x4 matrix right", function() {
    let arr = [null,    0, null, null,
                  1,    1,    1, null,
               null,    2,    1,    1,
                  1, null,    1, null];
    expect(ArrayTransformer.shiftRight(arr, 4)).toBeTruthy();
    expect(arr).toEqual([null,null,null,0,
                         null,null,   1,2,
                         null,null,   2,2,
                         null,null,null,2]);
  })

  it("should shift a 3x3 matrix up", function() {
    let arr = [   2, 1, null,
                  2, 2,    1,
               null, 2, null];
    expect(ArrayTransformer.shiftUp(arr, 3)).toBeTruthy();
    expect(arr).toEqual([   4,    1,    1,
                         null,    4, null,
                         null, null, null]);
  })

  it("should shift a 4x4 matrix up", function() {
    let arr = [null,    0,    1,    1,
                  1,    1,    1, null,
               null,    2,    1,    1,
                  1, null,    1,    1];
    expect(ArrayTransformer.shiftUp(arr, 4)).toBeTruthy();
    expect(arr).toEqual([   2,   0,   2,   2,
                         null,   1,   2,   1,
                         null,   2,null,null,
                         null,null,null,null]);
  })

  it("should shift a 3x3 matrix down", function() {
    let arr = [   2, 1, null,
                  2, 2,    1,
               null, 2, null];
    expect(ArrayTransformer.shiftDown(arr, 3)).toBeTruthy();
    expect(arr).toEqual([null, null, null,
                         null,    1, null,
                            4,    4,    1]);
  })

  it("should shift a 4x4 matrix down", function() {
    let arr = [null,    0,    1,    2,
                  1,    1,    1, null,
               null,    2,    1,    1,
                  1, null,    1,    1];
    expect(ArrayTransformer.shiftDown(arr, 4)).toBeTruthy();
    expect(arr).toEqual([null,null,null,null,
                         null,   0,null,null,
                         null,   1,   2,   2,
                            2,   2,   2,   2]);
  })

  it("should return [0,0] if a 2 rows in a 2 dim board are shifted left and nothing is merged", function() {
    let arr = [null,1,
               null,1];
    expect(ArrayTransformer.shiftLeft(arr, 2)).toEqual([0,0]);
  })

  it("should return [0,0] if a 2 rows in a 2 dim board are shifted up and nothing is merged", function() {
    let arr = [null,null,
                  1,   1];
    expect(ArrayTransformer.shiftUp(arr, 2)).toEqual([0,0]);
  })

  it("should return [0] if a single row in a 2 dim board is shifted left and nothing is merged", function() {
    let arr = [null,null,
               null,   1];
    expect(ArrayTransformer.shiftLeft(arr, 2)).toEqual([0]);
  })

  it("should return [0] if a single row in a 2 dim board is shifted up and nothing is merged", function() {
    let arr = [null,null,
               null,   1];
    expect(ArrayTransformer.shiftUp(arr, 2)).toEqual([0]);
  })

  it("should return an empty array when the board can not be shifted left", function() {
    let arr = [2, 1, 0,
               2, 1, 0,
               2, 1, 0]
    expect(ArrayTransformer.shiftLeft(arr, 3)).toEqual([]);
  })

  it("should return an empty array when the board can not be shifted right", function() {
    let arr = [2, 1, 0,
               2, 1, 0,
               2, 1, 0]
    expect(ArrayTransformer.shiftRight(arr, 3)).toEqual([]);
  })

  it("should return an empty array when the board can not be shifted up", function() {
    let arr = [0, 0, 0,
               1, 1, 1,
               2, 2, 2]
    expect(ArrayTransformer.shiftUp(arr, 3)).toEqual([]);
  })  

  it("should return an empty array when the board can not be shifted down", function() {
    let arr = [0, 0, 0,
               1, 1, 1,
               2, 2, 2]
    expect(ArrayTransformer.shiftDown(arr, 3)).toEqual([]);
  })

});

describe('Game', function() {

  it("should return a random number in the range [0, max)", function() {
    let rand  = Game.randLessThan(1);
    expect(rand).toEqual(0);
    for (let i = 0; i < 100; i++) {
      rand = Game.randLessThan(2);
      expect(rand).toBeGreaterThanOrEqual(0);
      expect(rand).toBeLessThan(2);
    }
  })

  it("should return either 2 or 4 at random", function() {
    let trial = 0;
    let rand;
    let isTwo = 0;
    let isFour = 0;
    let errVal = 0;
    while ((trial < 100 || isTwo == 0 || isFour == 0) && trial < 1000) {
      rand = Game.newTileVal();
      if (rand == 2) {
        isTwo++;
      } else if (rand == 4) {
        isFour++;
      } else {
        errVal++;
      }
      trial++;
    }
    expect(isTwo).toBeGreaterThan(0);
    expect(isFour).toBeGreaterThan(0);
    expect(errVal).toEqual(0);
  })

  it("should fill empty tiles", function() {
    const squares = Array(16).fill(null);
    for (let i = 0; i < 16; i++) {
      expect(Game.countEmptyTiles(squares)).toEqual(16 - i);
      Game.fillEmptyTile(squares);
    }
  })

  it("should init a 4x4 game board with 1 filled tile", function() {
    const testRenderer = TestRenderer.create(<Game dim={4}/>);
    const testInstance = testRenderer.getInstance();
    expect(testInstance.state.squares.length).toEqual(16);
    expect(Game.countEmptyTiles(testInstance.state.squares)).toEqual(15);
    expect(testInstance.state.lastKey).toBeNull();
  })

  it("should handle a move", function() {
    const testRenderer = TestRenderer.create(<Game dim={4}/>);
    const testInstance = testRenderer.getInstance();
    expect(Game.countEmptyTiles(testInstance.state.squares)).toEqual(15);
    testInstance.handleMove('ArrowDown');
    expect(testInstance.state.lastKey).toEqual('ArrowDown');
    if (Game.countEmptyTiles(testInstance.state.squares) == 15) {
      testInstance.handleMove('ArrowUp');
    }
    expect(Game.countEmptyTiles(testInstance.state.squares)).toEqual(14);
  });

  it("should reset the game", function() {
    const testRenderer = TestRenderer.create(<Game dim={2}/>);
    const testInstance = testRenderer.getInstance();
    testInstance.setBoard([0,1,2,3]);
    testInstance.state.lastKey = 'ArrowUp';
    testInstance.state.score = 1;
    testInstance.resetGame();
    expect(Game.countEmptyTiles(testInstance.state.squares)).toEqual(3);
    expect(testInstance.state.score).toEqual(0);
    expect(testInstance.state.lastKey).toBeNull();
  });

  it("should indicate game over", function() {
    expect(Game.gameOver([0,1,2,3])).toBe(true);
  });

  it("should not indicate game over when board isn't filled", function() {
    expect(Game.gameOver([null, null, null, null])).toBe(false);
  });

  it("should not indicate game over when board is filled but moves remain", function() {
    expect(Game.gameOver([2,2,0,1], 2)).toBe(false);
  });

  it("should init score to 0", function() {
    const testRenderer = TestRenderer.create(<Game dim={4}/>);
    const testInstance = testRenderer.getInstance();
    expect(testInstance.state.score).toEqual(0);
  })

  it("should update the score on move", function() {
    const testRenderer = TestRenderer.create(<Game dim={4}/>);
    const testInstance = testRenderer.getInstance();
    testInstance.setBoard([1,1,null,null]);
    testInstance.handleMove('ArrowLeft');
    expect(testInstance.state.score).toEqual(2);
  });

  it("should handle a non move", function() {
    const testRenderer = TestRenderer.create(<Game dim={2}/>);
    const testInstance = testRenderer.getInstance();
    testInstance.setBoard([0,1,null,null]);
    testInstance.handleMove('ArrowLeft');
    expect(Game.countEmptyTiles(testInstance.state.squares)).toEqual(2);
    expect(testInstance.state.lastKey).toBe('ArrowLeft');
  });

});


describe("ColorUtils", function() {

  it("should return unique colors for the full cycle", function() {
    let createdColors = new Set();
    let colors = new ColorUtils(4);
    for (let i = 0; i < colors.cycleLength; i++) {
      createdColors.add(colors.color(i));
    }
    expect(createdColors.size).toEqual(colors.cycleLength);
  });

});


describe("Score", function() {

  it("should init a Score component with starting score 0", function() {
    const testRenderer = TestRenderer.create(<Score score={0}/>);
    const testInstance = testRenderer.getInstance();
    expect(testInstance.getScore()).toEqual(0);
  });

});
