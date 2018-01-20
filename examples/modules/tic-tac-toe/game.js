/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

 const NN_TOP_GUESSES = 5;
 const FIRST_TO_N = 5;

import TOPICS from './topics';

import { Game, TurnOrder } from 'boardgame.io/core';

function randomTopic(veto) {
  if (veto !== undefined) {
    // TODO: make this different
  }
  return TOPICS[Math.floor(Math.random() * TOPICS.length)]
}

function nnWins(nnGuesses, topic) {
  for (var i = 0; i < Math.min(nnGuesses.length, NN_TOP_GUESSES); i++) {
    if (nnGuesses[i][0] === topic) {
      return true;
    }
  }
  return false;
}

function getWinResult(G, ctx) {
  // Need player guess and nn guess to be set
  if (G.playerGuess !== null && G.nnGuesses !== null) {
    console.log(G.nnGuesses);
    var win = null;
    var nnWin = nnWins(G.nnGuesses, G.topic);
    var playerWin = G.playerGuess === G.topic;
    if (playerWin && nnWin) {
      win = "both";
    } else if (playerWin) {
      win = "guesser";
    } else if (nnWin) {
      win = "ai";
    } else {
      win = "neither";
    }
    return {
      win: win,
      playerGuess: G.playerGuess,
      nnGuesses: G.nnGuesses,
      nnTopN: NN_TOP_GUESSES,
    }
  }
}

const TicTacToe = Game({
  name: 'tic-tac-toe',

  setup: () => ({
    round: 0,
    pathinks: null,
    topic: null,
    previousTopics: [],
    playerGuess: null,
    editedPathinks: null,
    nnGuesses: null,
    playerScore: 0,
    aiScore: 0
  }),

  moves: {
    submitDraw(G, ctx, pathinks) {
      console.log("submitDraw");
      return { ...G, pathinks };
    },
    submitGuess(G, ctx, playerGuess) {
      console.log("submitGuess");
      return { ...G, playerGuess };
    },
    submitTraitor(G, ctx, [editedPathinks, nnGuesses]) {
      console.log("submitTraitor");
      return { ...G, editedPathinks, nnGuesses};
    }  },

  flow: {
    movesPerTurn: 1,

    endGameIf: (G, ctx) => {
      if (G.playerScore === FIRST_TO_N) {
        return "player";
      }
      if (G.aiScore == FIRST_TO_N) {
        return "AI";
      }
    },

    phases: [
      {
        name: 'draw phase',
        allowedMoves: ['submitDraw'],
        onPhaseBegin: (G, ctx) => {
          return {
            ...G,
            topic: randomTopic()
          }
        },
        endPhaseIf: G => G.pathinks !== null,
        turnOrder: TurnOrder.ANY
      },

      {
        name: 'play phase',
        allowedMoves: ['submitGuess', 'submitTraitor'],
        endPhaseIf: G => getWinResult(G, undefined) !== undefined,
        onPhaseEnd: (G, ctx) => {
          var winResult = getWinResult(G, undefined);
          // Reset guesses, etc for next round
          return {
            ...G,
            playerScore: (winResult.win === 'guesser' || winResult.win == 'both') ? G.playerScore + 1 : G.playerScore,
            aiScore: (winResult.win === 'ai' || winResult.win == 'both') ? G.aiScore + 1 : G.aiScore,
            topic: null,
            previousTopics: [...G.previousTopics, G.topic],
            round: G.round + 1,
            pathinks: null,
            playerGuess: null,
            nnGuesses: null,
            editedPathinks: null
          };
        },
        turnOrder: TurnOrder.ANY
      },
    ],
  },
});

export default TicTacToe;
