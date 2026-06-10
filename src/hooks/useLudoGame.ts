import { useReducer, useCallback } from 'react';
import { gameReducer, INITIAL_STATE } from '../utils/gameLogic';
import type { GameAction, GameState, PlayerColor, GameMode } from '../types';

export const useLudoGame = () => {
  const [state, dispatch] = useReducer(gameReducer, INITIAL_STATE);

  const startGame = useCallback((players: PlayerColor[], bots: PlayerColor[], mode: GameMode) => {
    dispatch({ type: 'START_GAME', payload: { players, bots, mode } });
  }, []);

  const rollDice = useCallback(() => {
    if (!state.isStarted || state.hasRolled || state.winner) return;
    const value = Math.floor(Math.random() * 6) + 1;
    dispatch({ type: 'ROLL_DICE', payload: { value } });
    return value;
  }, [state.isStarted, state.hasRolled, state.winner]);

  const moveToken = useCallback((tokenId: string) => {
    dispatch({ type: 'MOVE_TOKEN', payload: { tokenId } });
  }, []);

  const syncState = useCallback((newState: GameState) => {
    dispatch({ type: 'SYNC_STATE', payload: { state: newState } });
  }, []);

  const resetGame = useCallback(() => {
    dispatch({ type: 'RESET_GAME' });
  }, []);

  const dispatchAction = useCallback((action: GameAction) => {
    dispatch(action);
  }, []);

  return {
    state,
    startGame,
    rollDice,
    moveToken,
    syncState,
    resetGame,
    dispatchAction
  };
};
