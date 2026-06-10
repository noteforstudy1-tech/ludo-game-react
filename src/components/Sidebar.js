
import React, { useState } from 'https://esm.sh/react@19';
import { html } from 'https://esm.sh/htm/react';
import { MessageSquare, Users, Dices, Send, Play, Settings, Bot, Users2 } from 'https://esm.sh/lucide-react';
import clsx from 'https://esm.sh/clsx';

export const Sidebar = ({
  gameState,
  networkState,
  onRollDice,
  onCreateRoom,
  onJoinRoom,
  onSendChat,
  onDisconnect,
  onStartGame
}) => {
  const [joinId, setJoinId] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [playerName, setPlayerName] = useState('Player');
  
  const [setupMode, setSetupMode] = useState('pass');
  const [playerCount, setPlayerCount] = useState(2);

  const { isStarted, currentTurn, diceValue, hasRolled, winner, message, activePlayers } = gameState;

  const colorMap = {
    red: 'text-ludo-red',
    green: 'text-ludo-green',
    yellow: 'text-ludo-yellow',
    blue: 'text-ludo-blue',
  };

  const bgMap = {
    red: 'bg-ludo-red text-white',
    green: 'bg-ludo-green text-white',
    yellow: 'bg-ludo-yellow text-white',
    blue: 'bg-ludo-blue text-white',
  };

  const isMyTurn = networkState.myColor === null || networkState.myColor === currentTurn;

  const handleStartLocal = () => {
    let players = [];
    if (playerCount === 2) players = ['red', 'yellow'];
    else if (playerCount === 3) players = ['red', 'green', 'yellow'];
    else players = ['red', 'green', 'yellow', 'blue'];
    
    let bots = [];
    if (setupMode === 'bot') {
      bots = players.slice(1);
    }
    
    onStartGame(players, bots, setupMode);
  };

  const handleStartOnline = () => {
    if (!networkState.isHost) return;
    const connectedCount = 1 + networkState.peers.length;
    let players = [];
    if (connectedCount === 2) players = ['red', 'green'];
    else if (connectedCount === 3) players = ['red', 'green', 'yellow'];
    else players = ['red', 'green', 'yellow', 'blue'];
    
    onStartGame(players, [], 'online');
  };

  if (!isStarted) {
    return html`
      <div className="w-full md:w-80 bg-gray-800 border-l border-gray-700 flex flex-col h-screen overflow-y-auto">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold flex items-center gap-2 text-white">
            <${Settings} className="w-6 h-6 text-indigo-400" /> Setup Game
          </h2>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Game Mode</label>
            <div className="grid grid-cols-1 gap-2">
              <button 
                onClick=${() => setSetupMode('pass')}
                className=${clsx("p-3 rounded-lg flex items-center gap-3 transition-colors border", setupMode === 'pass' ? "bg-indigo-600/20 border-indigo-500 text-white" : "bg-gray-900 border-gray-700 text-gray-400 hover:bg-gray-800")}
              >
                <${Users2} className="w-5 h-5" /> Local Pass & Play
              </button>
              <button 
                onClick=${() => setSetupMode('bot')}
                className=${clsx("p-3 rounded-lg flex items-center gap-3 transition-colors border", setupMode === 'bot' ? "bg-indigo-600/20 border-indigo-500 text-white" : "bg-gray-900 border-gray-700 text-gray-400 hover:bg-gray-800")}
              >
                <${Bot} className="w-5 h-5" /> Local vs Bots
              </button>
              <button 
                onClick=${() => setSetupMode('online')}
                className=${clsx("p-3 rounded-lg flex items-center gap-3 transition-colors border", setupMode === 'online' ? "bg-indigo-600/20 border-indigo-500 text-white" : "bg-gray-900 border-gray-700 text-gray-400 hover:bg-gray-800")}
              >
                <${Users} className="w-5 h-5" /> Online Multiplayer
              </button>
            </div>
          </div>

          ${(setupMode === 'pass' || setupMode === 'bot') && html`
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Players / Colors</label>
                <div className="flex gap-2">
                  ${[2, 3, 4].map(num => html`
                    <button
                      key=${num}
                      onClick=${() => setPlayerCount(num)}
                      className=${clsx("flex-1 py-2 rounded border font-bold transition-colors", playerCount === num ? "bg-indigo-600 border-indigo-500 text-white" : "bg-gray-900 border-gray-700 text-gray-400 hover:bg-gray-800")}
                    >
                      ${num}
                    </button>
                  `)}
                </div>
              </div>
              
              <div className="bg-gray-900 p-4 rounded-lg border border-gray-700 space-y-2">
                 <p className="text-sm text-gray-400">Active Colors in Game:</p>
                 <div className="flex gap-2">
                    <div className="w-6 h-6 rounded-full bg-ludo-red" title="Red (P1)"></div>
                    ${playerCount > 2 && html`<div className="w-6 h-6 rounded-full bg-ludo-green" title="Green (P2)"></div>`}
                    <div className="w-6 h-6 rounded-full bg-ludo-yellow" title="Yellow"></div>
                    ${playerCount === 4 && html`<div className="w-6 h-6 rounded-full bg-ludo-blue" title="Blue (P4)"></div>`}
                 </div>
                 ${setupMode === 'bot' && html`
                   <p className="text-xs text-emerald-400 mt-2">You are RED. Others are AI Bots.</p>
                 `}
              </div>

              <button 
                onClick=${handleStartLocal}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all"
              >
                <${Play} className="w-5 h-5 fill-current" /> Start Game
              </button>
            </div>
          `}

          ${setupMode === 'online' && html`
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
               ${!networkState.isConnected ? html`
                 <div className="space-y-3 bg-gray-900 p-4 rounded-xl border border-gray-700">
                    <input 
                      type="text" 
                      placeholder="Your Name" 
                      value=${playerName}
                      onChange=${(e) => setPlayerName(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 mb-2"
                    />
                    <button 
                      onClick=${onCreateRoom}
                      className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-bold transition-colors"
                    >
                      Host New Room
                    </button>
                    <div className="relative flex py-2 items-center">
                        <div className="flex-grow border-t border-gray-700"></div>
                        <span className="flex-shrink-0 mx-4 text-gray-500 text-xs font-bold uppercase">OR</span>
                        <div className="flex-grow border-t border-gray-700"></div>
                    </div>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Enter Room ID" 
                        value=${joinId}
                        onChange=${(e) => setJoinId(e.target.value.trim())}
                        className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 font-mono"
                      />
                      <button 
                        onClick=${() => onJoinRoom(joinId)}
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-bold transition-colors"
                      >
                        Join
                      </button>
                    </div>
                 </div>
               ` : html`
                 <div className="space-y-4 bg-gray-900 p-4 rounded-xl border border-gray-700">
                    <div className="text-center">
                       <p className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-1">Room ID</p>
                       <div className="bg-gray-800 rounded-lg py-2 font-mono text-xl text-indigo-400 border border-gray-700 tracking-widest cursor-pointer select-all">
                         ${networkState.roomId}
                       </div>
                    </div>
                    
                    <div className="flex justify-between items-center bg-gray-800 p-3 rounded-lg">
                      <span className="text-gray-400 text-sm">Players Joined</span>
                      <span className="font-bold text-lg">${networkState.peers.length + 1} <span className="text-gray-500 text-sm">/ 4</span></span>
                    </div>

                    <div className="text-xs text-center text-gray-400">
                       Waiting for host to start the game...
                    </div>

                    ${networkState.isHost && html`
                      <button 
                        onClick=${handleStartOnline}
                        disabled=${networkState.peers.length === 0}
                        className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 transition-all"
                      >
                        <${Play} className="w-5 h-5 fill-current" /> Start Game
                      </button>
                    `}
                 </div>
               `}
               ${networkState.error && html`
                 <div className="bg-red-900/50 border border-red-500/50 text-red-200 p-3 rounded-lg text-sm text-center">
                   ${networkState.error}
                 </div>
               `}
            </div>
          `}
        </div>
      </div>
    `;
  }

  return html`
    <div className="w-full md:w-80 bg-gray-800 border-l border-gray-700 flex flex-col h-[500px] md:h-screen">
      <div className="p-4 border-b border-gray-700">
        <div className="flex justify-between items-center mb-4">
           <h2 className="text-xl font-bold flex items-center gap-2">
             <${Play} className="w-5 h-5 text-indigo-400 fill-current" /> Game Active
           </h2>
           ${networkState.isConnected && html`
              <div className="flex gap-2">
                <span className="text-xs font-bold px-2 py-1 rounded bg-indigo-900/50 text-indigo-300 border border-indigo-500/30">
                  Online
                </span>
                <button onClick=${onDisconnect} className="text-xs font-bold px-2 py-1 rounded bg-red-900/50 text-red-300 border border-red-500/30 hover:bg-red-800/50">
                  Disconnect
                </button>
              </div>
           `}
        </div>
        
        ${winner ? html`
          <div className="p-6 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/50 text-yellow-300 rounded-xl text-center shadow-lg">
            <p className="text-sm font-bold uppercase tracking-wider mb-1">Game Over</p>
            <p className="font-black text-2xl drop-shadow-md">${winner.toUpperCase()} WINS!</p>
          </div>
        ` : html`
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-gray-900 p-3 rounded-xl border border-gray-700 shadow-inner">
              <span className="text-sm font-bold text-gray-400">Current Turn</span>
              <span className=${clsx('font-black uppercase text-lg', colorMap[currentTurn])}>
                ${currentTurn}
              </span>
            </div>

            <div className="flex justify-center gap-3">
              ${activePlayers.map(p => html`
                <div key=${p} className=${clsx(
                  "w-8 h-8 rounded-full border-2 transition-all", 
                  currentTurn === p ? "scale-125 ring-2 ring-white z-10" : "opacity-50",
                  bgMap[p],
                  currentTurn === p ? `border-${p}-400` : "border-gray-900"
                )}></div>
              `)}
            </div>

            <div className="flex items-center gap-4 mt-2">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-300 rounded-2xl flex items-center justify-center text-5xl font-black text-gray-900 shadow-lg border-b-4 border-gray-400">
                ${diceValue}
              </div>
              <button
                onClick=${onRollDice}
                disabled=${hasRolled || !isMyTurn || gameState.botColors.includes(currentTurn)}
                className="flex-1 h-20 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed rounded-2xl font-bold transition-all shadow-lg border-b-4 border-indigo-800 disabled:border-gray-800 flex flex-col items-center justify-center gap-1"
              >
                <${Dices} className="w-6 h-6" />
                <span className="uppercase text-sm tracking-wider">${hasRolled ? 'Move' : 'Roll'}</span>
              </button>
            </div>
            
            <p className="text-sm text-center font-medium text-gray-300 bg-gray-700/30 py-2 px-3 rounded-lg border border-gray-700/50">
               ${message}
            </p>
          </div>
        `}
      </div>

      ${networkState.isConnected && html`
        <div className="p-3 border-b border-gray-700 bg-gray-900/50 text-xs flex justify-between items-center">
           <span className="text-gray-400">Room: <span className="font-mono text-indigo-300">${networkState.roomId}</span></span>
           <span className="text-gray-400">You are: <span className=${clsx("font-bold uppercase", colorMap[networkState.myColor || 'red'])}>${networkState.myColor}</span></span>
        </div>
      `}

      <div className="flex-1 flex flex-col min-h-0 bg-gray-900">
        <div className="p-3 border-b border-gray-800 bg-gray-800">
          <h2 className="text-sm font-bold flex items-center gap-2 text-gray-300 uppercase tracking-wider">
            <${MessageSquare} className="w-4 h-4" /> Activity Log / Chat
          </h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          ${networkState.messages.map(msg => html`
            <div key=${msg.id} className="flex flex-col">
              <span className=${clsx('text-[10px] font-bold uppercase tracking-wider', colorMap[msg.senderColor])}>
                ${msg.senderName}
              </span>
              <span className="bg-gray-800 rounded-lg rounded-tl-none p-2 text-sm mt-0.5 w-fit max-w-[90%] shadow-sm border border-gray-700/50 text-gray-100">
                ${msg.text}
              </span>
            </div>
          `)}
          ${networkState.messages.length === 0 && html`
            <div className="h-full flex items-center justify-center text-gray-600 text-sm font-medium">
              No messages
            </div>
          `}
        </div>

        <form 
          className="p-3 border-t border-gray-800 bg-gray-800 flex gap-2"
          onSubmit=${(e) => {
            e.preventDefault();
            if (chatInput.trim() && networkState.isConnected) {
              onSendChat(chatInput.trim(), playerName);
              setChatInput('');
            }
          }}
        >
          <input 
            type="text" 
            value=${chatInput}
            onChange=${(e) => setChatInput(e.target.value)}
            disabled=${!networkState.isConnected}
            placeholder=${networkState.isConnected ? "Type message..." : "Chat unavailable offline"}
            className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 disabled:opacity-40 transition-colors"
          />
          <button 
            type="submit"
            disabled=${!networkState.isConnected || !chatInput.trim()}
            className="p-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:text-gray-500 rounded-lg transition-colors shadow-md"
          >
            <${Send} className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  `;
};
