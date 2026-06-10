
import React from 'react';
import { html } from 'htm/react';
import { isSafeSpot } from '../utils/boardMap.js';
import { Star } from 'lucide-react';
import clsx from 'clsx';
import { isValidMove } from '../utils/gameLogic.js';

const TokenUI = ({ token, isClickable, onClick }) => {
  const colorMap = {
    red: 'bg-ludo-red border-red-700',
    green: 'bg-ludo-green border-green-700',
    yellow: 'bg-ludo-yellow border-yellow-700',
    blue: 'bg-ludo-blue border-blue-700',
  };

  return html`
    <div
      onClick=${isClickable ? onClick : undefined}
      className=${clsx(
        'rounded-full border-2 drop-shadow-md transition-all duration-200 flex items-center justify-center relative',
        colorMap[token.color],
        isClickable ? 'cursor-pointer animate-pulse hover:scale-110 ring-2 ring-white z-10' : 'cursor-default'
      )}
      style=${{ width: '80%', height: '80%', minWidth: '1rem', minHeight: '1rem' }}
    />
  `;
};

export const Board = ({ state, onTokenClick, myColor }) => {
  const { tokens, currentTurn, diceValue, hasRolled } = state;

  const renderTokens = (cellTokens) => {
    return cellTokens.map(token => {
      if (!state.activePlayers.includes(token.color)) return null;
      const isMyTurn = currentTurn === token.color;
      const isLocalPlayer = myColor === null || myColor === token.color;
      const canMove = hasRolled && isMyTurn && isLocalPlayer && isValidMove(token, diceValue);

      return html`
        <${TokenUI} 
          key=${token.id} 
          token=${token} 
          isClickable=${canMove} 
          onClick=${() => onTokenClick(token.id)} 
        />
      `;
    });
  };

  const renderYard = (color, gridArea, bgClass, innerClass) => {
    const yardTokens = Object.values(tokens).filter(t => t.color === color && t.pathIndex === -1);
    const slots = [null, null, null, null];
    yardTokens.forEach((token, i) => {
      if (i < 4) slots[i] = token;
    });

    return html`
      <div style=${{ gridArea }} className=${clsx("p-4 border border-slate-700/50 flex items-center justify-center", bgClass)}>
        <div className="w-full h-full bg-white rounded-xl p-4 flex items-center justify-center shadow-inner">
          <div className="grid grid-cols-2 grid-rows-2 gap-4 w-full h-full max-w-[120px] max-h-[120px]">
            ${slots.map((token, i) => html`
              <div key=${i} className=${clsx("rounded-full border-2 flex items-center justify-center shadow-inner", innerClass)}>
                ${token && renderTokens([token])}
              </div>
            `)}
          </div>
        </div>
      </div>
    `;
  };

  const pathCells = [];
  for (let y = 0; y < 15; y++) {
    for (let x = 0; x < 15; x++) {
      if ((x < 6 && y < 6) || (x > 8 && y < 6) || (x < 6 && y > 8) || (x > 8 && y > 8) || (x >= 6 && x <= 8 && y >= 6 && y <= 8)) {
        continue;
      }

      let cellClass = 'bg-white';
      let content = null;

      if (y === 7 && x >= 1 && x <= 5) cellClass = 'bg-red-200';
      else if (x === 7 && y >= 1 && y <= 5) cellClass = 'bg-green-200';
      else if (y === 7 && x >= 9 && x <= 13) cellClass = 'bg-yellow-200';
      else if (x === 7 && y >= 9 && y <= 13) cellClass = 'bg-blue-200';
      
      else if (x === 1 && y === 6) cellClass = 'bg-red-300';
      else if (x === 8 && y === 1) cellClass = 'bg-green-300';
      else if (x === 13 && y === 8) cellClass = 'bg-yellow-300';
      else if (x === 6 && y === 13) cellClass = 'bg-blue-300';

      if (isSafeSpot(x, y) && !(x === 1 && y === 6) && !(x === 8 && y === 1) && !(x === 13 && y === 8) && !(x === 6 && y === 13)) {
        content = html`<${Star} className="w-5 h-5 text-gray-400" />`;
        cellClass = 'bg-gray-100';
      }

      const cellTokens = Object.values(tokens).filter(t => t.x === x && t.y === y && t.pathIndex >= 0 && t.pathIndex < 56);

      pathCells.push(html`
        <div 
          key=${`${x}-${y}`} 
          style=${{ gridArea: `${y + 1} / ${x + 1} / span 1 / span 1` }}
          className=${clsx('border border-slate-700/50 relative flex items-center justify-center', cellClass)}
        >
          ${content && html`<div className="absolute inset-0 flex items-center justify-center opacity-30">${content}</div>`}
          <div className="absolute inset-0 p-0.5 flex flex-wrap items-center justify-center gap-0.5 z-10">
             ${renderTokens(cellTokens)}
          </div>
        </div>
      `);
    }
  }

  const centerTokens = Object.values(tokens).filter(t => t.pathIndex === 56);

  return html`
    <div className="w-full max-w-[700px] aspect-square grid bg-slate-800 border-8 border-slate-900 shadow-2xl rounded-lg overflow-hidden" 
         style=${{ gridTemplateColumns: 'repeat(15, minmax(0, 1fr))', gridTemplateRows: 'repeat(15, minmax(0, 1fr))' }}>
      
      ${renderYard('red', '1 / 1 / span 6 / span 6', 'bg-ludo-red', 'border-red-200 bg-red-100')}
      ${renderYard('green', '1 / 10 / span 6 / span 6', 'bg-ludo-green', 'border-green-200 bg-green-100')}
      ${renderYard('yellow', '10 / 10 / span 6 / span 6', 'bg-ludo-yellow', 'border-yellow-200 bg-yellow-100')}
      ${renderYard('blue', '10 / 1 / span 6 / span 6', 'bg-ludo-blue', 'border-blue-200 bg-blue-100')}
      
      <div 
        style=${{ 
          gridArea: '7 / 7 / span 3 / span 3',
          backgroundImage: "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cG9seWdvbiBwb2ludHM9IjAsMCA1MCw1MCAwLDEwMCIgZmlsbD0iI2VmNDQ0NCIvPjxwb2x5Z29uIHBvaW50cz0iMCwwIDEwMCwwIDUwLDUwIiBmaWxsPSIjMjJjNTVlIi8+PHBvbHlnb24gcG9pbnRzPSIxMDAsMCAxMDAsMTAwIDUwLDUwIiBmaWxsPSIjZWFiMzA4Ii8+PHBvbHlnb24gcG9pbnRzPSIxMDAsMTAwIDAsMTAwIDUwLDUwIiBmaWxsPSIjM2I4MmY2Ii8+PC9zdmc+')"
        }}
        className="border border-slate-700/50 bg-cover bg-center relative overflow-hidden"
      >
        <div className="absolute inset-0 flex flex-wrap items-center justify-center gap-1 p-2 z-10">
            ${renderTokens(centerTokens)}
        </div>
      </div>

      ${pathCells}
    </div>
  `;
};
