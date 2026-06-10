
import { isValidMove } from './gameLogic.js';
import { PATHS, isSafeSpot } from './boardMap.js';

export const getBestBotMove = (state) => {
  const { currentTurn, diceValue, tokens } = state;
  const myTokens = Object.values(tokens).filter(t => t.color === currentTurn);
  const validTokens = myTokens.filter(t => isValidMove(t, diceValue));

  if (validTokens.length === 0) return null;

  for (const token of validTokens) {
    let newPathIndex = token.pathIndex === -1 && diceValue === 6 ? 0 : token.pathIndex + diceValue;
    if (newPathIndex < 51) {
      const targetPos = PATHS[token.color][newPathIndex];
      if (!isSafeSpot(targetPos.x, targetPos.y)) {
        const prey = Object.values(tokens).find(t => 
          t.color !== token.color && 
          t.pathIndex !== -1 && 
          t.pathIndex < 51 && 
          t.x === targetPos.x && 
          t.y === targetPos.y
        );
        if (prey) return token.id;
      }
    }
  }

  const yardToken = validTokens.find(t => t.pathIndex === -1);
  if (yardToken) return yardToken.id;

  const winningToken = validTokens.find(t => t.pathIndex + diceValue === 56);
  if (winningToken) return winningToken.id;

  validTokens.sort((a, b) => b.pathIndex - a.pathIndex);
  return validTokens[0].id;
};
