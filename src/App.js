
import React, { useEffect, useCallback } from 'react';
import { html } from 'htm/react';
import { Board } from './components/Board.js';
import { Sidebar } from './components/Sidebar.js';
import { useLudoGame } from './hooks/useLudoGame.js';
import { useLudoNetwork } from './hooks/useLudoNetwork.js';
import { getBestBotMove } from './utils/botLogic.js';

export default function App() {
  const game = useLudoGame();
  
  const handleActionReceived = useCallback((action) => {
    game.dispatchAction(action);
  }, [game]);

  const network = useLudoNetwork(handleActionReceived);

  const handleStartGame = (players, bots, mode) => {
    game.startGame(players, bots, mode);
    if (network.isConnected && network.isHost) {
      network.sendAction({ type: 'START_GAME', payload: { players, bots, mode } });
    }
  };

  const handleRollDice = () => {
    if (game.state.mode === 'online' && network.myColor !== game.state.currentTurn) return;
    const value = game.rollDice();
    if (value && network.isConnected) {
      network.sendAction({ type: 'ROLL_DICE', payload: { value } });
    }
  };

  const handleTokenClick = (tokenId) => {
    const tokenColor = tokenId.split('-')[0];
    if (game.state.mode === 'online' && network.myColor !== tokenColor) return;
    game.moveToken(tokenId);
    if (network.isConnected) {
      network.sendAction({ type: 'MOVE_TOKEN', payload: { tokenId } });
    }
  };

  useEffect(() => {
    if (network.isHost && network.peers.length > 0) {
      network.sendAction({ type: 'SYNC_STATE', payload: { state: game.state } });
    }
  }, [network.peers.length, network.isHost, game.state]);

  useEffect(() => {
    if (game.state.isStarted && !game.state.winner) {
      if (game.state.botColors.includes(game.state.currentTurn)) {
        if (!game.state.hasRolled) {
          const timer = setTimeout(() => {
            handleRollDice();
          }, 600);
          return () => clearTimeout(timer);
        } else {
          const timer = setTimeout(() => {
            const bestMove = getBestBotMove(game.state);
            if (bestMove) {
              handleTokenClick(bestMove);
            }
          }, 800);
          return () => clearTimeout(timer);
        }
      }
    }
  }, [game.state.currentTurn, game.state.hasRolled, game.state.isStarted, game.state.winner]);

  return html`
    <div className="flex flex-col md:flex-row h-screen bg-gray-900 text-white overflow-hidden">
      <div className="flex-1 flex items-center justify-center p-4 overflow-y-auto">
        ${game.state.isStarted ? html`
          <${Board} 
            state=${game.state} 
            onTokenClick=${handleTokenClick} 
            myColor=${network.isConnected ? network.myColor : null} 
          />
        ` : html`
          <div className="text-center opacity-50 flex flex-col items-center">
            <div className="w-32 h-32 mb-8 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-3xl border-4 border-indigo-500/30 flex items-center justify-center rotate-12">
               <span className="text-6xl">🎲</span>
            </div>
            <h1 className="text-4xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-gray-400 to-gray-600">
              Ludo React
            </h1>
            <p className="mt-4 text-gray-500 font-medium">Please setup the game in the sidebar</p>
          </div>
        `}
      </div>

      <${Sidebar} 
        gameState=${game.state}
        networkState=${network}
        onRollDice=${handleRollDice}
        onCreateRoom=${network.createRoom}
        onJoinRoom=${network.joinRoom}
        onSendChat=${network.sendChat}
        onDisconnect=${network.disconnect}
        onStartGame=${handleStartGame}
      />
    </div>
  `;
}
