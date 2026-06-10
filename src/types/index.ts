export type PlayerColor = 'red' | 'green' | 'yellow' | 'blue';
export type GameMode = 'pass' | 'bot' | 'online';

export interface Token {
  id: string;
  color: PlayerColor;
  x: number;
  y: number;
  pathIndex: number; // -1 means in yard, 57 means home
}

export interface GameState {
  isStarted: boolean;
  mode: GameMode | null;
  activePlayers: PlayerColor[];
  botColors: PlayerColor[];
  currentTurn: PlayerColor;
  diceValue: number;
  hasRolled: boolean;
  tokens: Record<string, Token>; // key: tokenId
  winner: PlayerColor | null;
  message: string;
}

export type GameAction =
  | { type: 'START_GAME'; payload: { players: PlayerColor[], bots: PlayerColor[], mode: GameMode } }
  | { type: 'ROLL_DICE'; payload: { value: number } }
  | { type: 'MOVE_TOKEN'; payload: { tokenId: string } }
  | { type: 'NEXT_TURN' }
  | { type: 'SYNC_STATE'; payload: { state: GameState } }
  | { type: 'RESET_GAME' };

export interface ChatMessage {
  id: string;
  senderName: string;
  senderColor: PlayerColor;
  text: string;
  timestamp: number;
}
