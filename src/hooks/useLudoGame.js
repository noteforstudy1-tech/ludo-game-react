
import { useReducer, useCallback, useMemo } from 'https://esm.sh/react@19';
import { gameReducer, INITIAL_STATE } from '../utils/gameLogic.js';

export const useLudoGame = () => {
  const [state, dispatch] = useReducer(gameReducer, INITIAL_STATE);

  const startGame = useCallback((players, bots, mode) => {
    dispatch({ type: 'START_GAME', payload: { players, bots, mode } });
  }, []);

  const rollDice = useCallback(() => {
    if (!state.isStarted || state.hasRolled || state.winner) return;
    const value = Math.floor(Math.random() * 6) + 1;
    dispatch({ type: 'ROLL_DICE', payload: { value } });
    return value;
  }, [state.isStarted, state.hasRolled, state.winner]);

  const moveToken = useCallback((tokenId) => {
    dispatch({ type: 'MOVE_TOKEN', payload: { tokenId } });
  }, []);

  const syncState = useCallback((newState) => {
    dispatch({ type: 'SYNC_STATE', payload: { state: newState } });
  }, []);

  const resetGame = useCallback(() => {
    dispatch({ type: 'RESET_GAME' });
  }, []);

  const dispatchAction = useCallback((action) => {
    dispatch(action);
  }, []);

  return useMemo(() => ({
    state,
    startGame,
    rollDice,
    moveToken,
    syncState,
    resetGame,
    dispatchAction
  }), [state, startGame, rollDice, moveToken, syncState, resetGame, dispatchAction]);
};
