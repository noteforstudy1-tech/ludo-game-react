import { useState, useRef, useCallback } from 'react';
import Peer from 'peerjs';
import type { DataConnection } from 'peerjs';
import type { GameAction, ChatMessage, PlayerColor } from '../types';

interface NetworkState {
  isHost: boolean;
  isConnected: boolean;
  roomId: string | null;
  peers: string[]; // List of peer IDs connected to
  messages: ChatMessage[];
  myColor: PlayerColor | null;
  error: string | null;
}

type Payload = 
  | { type: 'GAME_ACTION'; action: GameAction }
  | { type: 'CHAT_MESSAGE'; message: ChatMessage }
  | { type: 'PEER_LIST'; peers: string[] }
  | { type: 'ASSIGN_COLOR'; color: PlayerColor };

export const useLudoNetwork = (onActionReceived: (action: GameAction) => void) => {
  const [state, setState] = useState<NetworkState>({
    isHost: false,
    isConnected: false,
    roomId: null,
    peers: [],
    messages: [],
    myColor: null,
    error: null,
  });

  const peerRef = useRef<Peer | null>(null);
  const connectionsRef = useRef<Map<string, DataConnection>>(new Map());
  const colorsRef = useRef<PlayerColor[]>(['green', 'yellow', 'blue']); // Remaining colors for clients
  const isHostRef = useRef<boolean>(false);

  const broadcast = useCallback((payload: Payload) => {
    connectionsRef.current.forEach(conn => {
      if (conn.open) {
        conn.send(payload);
      }
    });
  }, []);

  const handleData = useCallback((data: unknown) => {
    const payload = data as Payload;
    switch (payload.type) {
      case 'GAME_ACTION':
        onActionReceived(payload.action);
        break;
      case 'CHAT_MESSAGE':
        setState(s => ({ ...s, messages: [...s.messages, payload.message] }));
        break;
      case 'PEER_LIST':
        // Client receives peer list from host to connect to others
        payload.peers.forEach(p => {
          if (p !== peerRef.current?.id && !connectionsRef.current.has(p)) {
            // Only initiate connection if our ID is "smaller" to avoid double connections
            if (peerRef.current?.id && peerRef.current.id < p) {
              connectToPeer(p);
            }
          }
        });
        break;
      case 'ASSIGN_COLOR':
        setState(s => ({ ...s, myColor: payload.color }));
        break;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onActionReceived]);

  const setupConnection = useCallback((conn: DataConnection, isIncoming: boolean = false) => {
    conn.on('open', () => {
      connectionsRef.current.set(conn.peer, conn);
      setState(s => ({ ...s, peers: Array.from(connectionsRef.current.keys()), isConnected: true }));

      // If we are the host and a new client just connected to us, assign them a color
      if (isHostRef.current && isIncoming) {
        const color = colorsRef.current.shift();
        if (color) {
          conn.send({ type: 'ASSIGN_COLOR', color });
        }
        // Broadcast updated peer list to everyone
        broadcast({ type: 'PEER_LIST', peers: Array.from(connectionsRef.current.keys()) });
      }
    });

    conn.on('data', (data) => handleData(data));

    conn.on('close', () => {
      connectionsRef.current.delete(conn.peer);
      setState(s => ({ ...s, peers: Array.from(connectionsRef.current.keys()) }));
    });

    conn.on('error', (err) => {
      console.error('Connection error:', err);
    });
  }, [handleData, broadcast]);

  const connectToPeer = useCallback((peerId: string) => {
    if (!peerRef.current) return;
    const conn = peerRef.current.connect(peerId);
    setupConnection(conn, false);
  }, [setupConnection]);

  const createRoom = useCallback(() => {
    const roomId = `ludo-${Math.random().toString(36).substr(2, 6)}`;
    const peer = new Peer(roomId, {
      host: '0.peerjs.com',
      port: 443,
      secure: true,
      path: '/'
    });

    peer.on('open', (id) => {
      peerRef.current = peer;
      isHostRef.current = true;
      setState(s => ({ ...s, isHost: true, roomId: id, myColor: 'red', isConnected: true, error: null }));
    });

    peer.on('connection', (conn) => {
      setupConnection(conn, true);
    });

    peer.on('error', (err) => {
      setState(s => ({ ...s, error: err.message }));
    });
  }, [setupConnection]);

  const joinRoom = useCallback((roomId: string) => {
    const peer = new Peer({
      host: '0.peerjs.com',
      port: 443,
      secure: true,
      path: '/'
    });

    peer.on('open', () => {
      peerRef.current = peer;
      isHostRef.current = false;
      setState(s => ({ ...s, isHost: false, roomId, error: null }));
      connectToPeer(roomId); // Connect to host
    });

    peer.on('connection', (conn) => {
      setupConnection(conn, true);
    });

    peer.on('error', (err) => {
      setState(s => ({ ...s, error: err.message }));
    });
  }, [connectToPeer, setupConnection]);

  const sendAction = useCallback((action: GameAction) => {
    broadcast({ type: 'GAME_ACTION', action });
  }, [broadcast]);

  const sendChat = useCallback((text: string, senderName: string) => {
    if (!state.myColor) return;

    const message: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      senderName,
      senderColor: state.myColor,
      text,
      timestamp: Date.now()
    };

    broadcast({ type: 'CHAT_MESSAGE', message });
    setState(s => ({ ...s, messages: [...s.messages, message] }));
  }, [broadcast, state.myColor]);

  const disconnect = useCallback(() => {
    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
    }
    connectionsRef.current.clear();
    isHostRef.current = false;
    colorsRef.current = ['green', 'yellow', 'blue'];
    setState({
      isHost: false,
      isConnected: false,
      roomId: null,
      peers: [],
      messages: [],
      myColor: null,
      error: null
    });
  }, []);

  return {
    ...state,
    createRoom,
    joinRoom,
    sendAction,
    sendChat,
    disconnect
  };
};
