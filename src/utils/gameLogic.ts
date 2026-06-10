import type { GameState, PlayerColor, Token, GameAction } from '../types';
import { PATHS, YARDS, isSafeSpot } from './boardMap';

export const initializeTokens = (colors: PlayerColor[] = ['red', 'green', 'yellow', 'blue']): Record<string, Token> => {
  const tokens: Record<string, Token> = {};
  
  colors.forEach(color => {
    for (let i = 0; i < 4; i++) {
      const id = `${color}-${i}`;
      tokens[id] = {
        id,
        color,
        x: YARDS[color][i].x,
        y: YARDS[color][i].y,
        pathIndex: -1,
      };
    }
  });
  return tokens;
};

export const INITIAL_STATE: GameState = {
  isStarted: false,
  mode: null,
  activePlayers: ['red', 'green', 'yellow', 'blue'],
  botColors: [],
  currentTurn: 'red',
  diceValue: 1,
  hasRolled: false,
  tokens: initializeTokens(),
  winner: null,
  message: 'Welcome to Ludo! Please setup the game.',
};

export const getNextTurn = (currentTurn: PlayerColor, activePlayers: PlayerColor[]): PlayerColor => {
  const idx = activePlayers.indexOf(currentTurn);
  return activePlayers[(idx + 1) % activePlayers.length];
};

export const isValidMove = (token: Token, diceValue: number): boolean => {
  if (token.pathIndex === 56) return false;
  
  if (token.pathIndex === -1) {
    return diceValue === 6;
  }
  
  if (token.pathIndex + diceValue > 56) {
    return false;
  }
  
  return true;
};

export const hasValidMoves = (state: GameState): boolean => {
  const playerTokens = Object.values(state.tokens).filter(t => t.color === state.currentTurn);
  return playerTokens.some(token => isValidMove(token, state.diceValue));
};

export const checkWinCondition = (tokens: Record<string, Token>, player: PlayerColor): boolean => {
  const playerTokens = Object.values(tokens).filter(t => t.color === player);
  return playerTokens.every(t => t.pathIndex === 56);
};

export const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'START_GAME': {
      const { players, bots, mode } = action.payload;
      return {
        ...INITIAL_STATE,
        isStarted: true,
        mode,
        activePlayers: players,
        botColors: bots,
        currentTurn: players[0],
        tokens: initializeTokens(players),
        message: `Game started! ${players[0].toUpperCase()} to roll.`,
      };
    }

    case 'ROLL_DICE': {
      if (!state.isStarted || state.hasRolled || state.winner) return state;
      
      const value = action.payload.value;
      const tempState = { ...state, diceValue: value, hasRolled: true };
      
      if (!hasValidMoves(tempState)) {
        const nextTurn = getNextTurn(state.currentTurn, state.activePlayers);
        return {
          ...state,
          diceValue: value,
          hasRolled: false,
          currentTurn: nextTurn,
          message: `${state.currentTurn} rolled a ${value}. No valid moves. ${nextTurn}'s turn.`
        };
      }
      
      return {
        ...state,
        diceValue: value,
        hasRolled: true,
        message: `${state.currentTurn} rolled a ${value}. Choose a token to move.`
      };
    }
    
    case 'MOVE_TOKEN': {
      if (!state.isStarted || !state.hasRolled || state.winner) return state;
      
      const token = state.tokens[action.payload.tokenId];
      if (!token || token.color !== state.currentTurn) return state;
      
      if (!isValidMove(token, state.diceValue)) return state;
      
      const newTokens = { ...state.tokens };
      let newPathIndex = token.pathIndex;
      
      if (token.pathIndex === -1 && state.diceValue === 6) {
        newPathIndex = 0;
      } else {
        newPathIndex += state.diceValue;
      }
      
      const targetPos = PATHS[token.color][newPathIndex];
      const movedToken: Token = {
        ...token,
        pathIndex: newPathIndex,
        x: targetPos.x,
        y: targetPos.y
      };
      newTokens[movedToken.id] = movedToken;
      
      let gotExtraTurn = state.diceValue === 6;
      let captureMessage = '';
      
      // Check captures
      if (newPathIndex < 51 && !isSafeSpot(targetPos.x, targetPos.y)) {
        Object.values(newTokens).forEach(otherToken => {
          if (otherToken.id !== movedToken.id && 
              otherToken.color !== movedToken.color && 
              otherToken.pathIndex !== -1 && 
              otherToken.pathIndex < 51 &&
              otherToken.x === targetPos.x && 
              otherToken.y === targetPos.y) {
            
            // Capture! Send back to yard
            const yardPos = YARDS[otherToken.color][parseInt(otherToken.id.split('-')[1])];
            newTokens[otherToken.id] = {
              ...otherToken,
              pathIndex: -1,
              x: yardPos.x,
              y: yardPos.y
            };
            gotExtraTurn = true;
            captureMessage = ` Captured ${otherToken.color}!`;
          }
        });
      }
      
      let winner: PlayerColor | null = state.winner;
      if (checkWinCondition(newTokens, state.currentTurn)) {
        winner = state.currentTurn;
        return {
          ...state,
          tokens: newTokens,
          winner,
          message: `${state.currentTurn} wins!`,
          hasRolled: true
        };
      }
      
      if (gotExtraTurn) {
        return {
          ...state,
          tokens: newTokens,
          hasRolled: false,
          message: `Moved.${captureMessage} ${state.currentTurn} gets another turn!`
        };
      } else {
        const nextTurn = getNextTurn(state.currentTurn, state.activePlayers);
        return {
          ...state,
          tokens: newTokens,
          hasRolled: false,
          currentTurn: nextTurn,
          message: `Moved. ${nextTurn}'s turn.`
        };
      }
    }
    
    case 'NEXT_TURN': {
      const nextTurn = getNextTurn(state.currentTurn, state.activePlayers);
      return {
        ...state,
        hasRolled: false,
        currentTurn: nextTurn,
        message: `${nextTurn}'s turn.`
      };
    }
    
    case 'SYNC_STATE': {
      return action.payload.state;
    }

    case 'RESET_GAME': {
      return INITIAL_STATE;
    }
    
    default:
      return state;
  }
};
