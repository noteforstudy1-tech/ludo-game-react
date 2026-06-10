
import { useState, useRef, useCallback } from 'https://esm.sh/react@19';
import Peer from 'https://esm.sh/peerjs@1.5.4';

export const useLudoNetwork = (onActionReceived) => {
  const [state, setState] = useState({
    isHost: false,
    isConnected: false,
    roomId: null,
    peers: [],
    messages: [],
    myColor: null,
    error: null,
  });

  const peerRef = useRef(null);
  const connectionsRef = useRef(new Map());
  const colorsRef = useRef(['green', 'yellow', 'blue']);
  const isHostRef = useRef(false);

  const broadcast = useCallback((payload) => {
    connectionsRef.current.forEach(conn => {
      if (conn.open) {
        conn.send(payload);
      }
    });
  }, []);

  const handleData = useCallback((data) => {
    const payload = data;
    switch (payload.type) {
      case 'GAME_ACTION':
        onActionReceived(payload.action);
        break;
      case 'CHAT_MESSAGE':
        setState(s => ({ ...s, messages: [...s.messages, payload.message] }));
        break;
      case 'PEER_LIST':
        payload.peers.forEach(p => {
          if (p !== peerRef.current?.id && !connectionsRef.current.has(p)) {
            connectToPeer(p);
          }
        });
        break;
      case 'ASSIGN_COLOR':
        setState(s => ({ ...s, myColor: payload.color }));
        break;
    }
  }, [onActionReceived]);

  const setupConnection = useCallback((conn, isIncoming = false) => {
    conn.on('open', () => {
      connectionsRef.current.set(conn.peer, conn);
      setState(s => ({ ...s, peers: Array.from(connectionsRef.current.keys()), isConnected: true }));

      if (isHostRef.current && isIncoming) {
        const color = colorsRef.current.shift();
        if (color) {
          conn.send({ type: 'ASSIGN_COLOR', color });
        }
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

  const connectToPeer = useCallback((peerId) => {
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

  const joinRoom = useCallback((roomId) => {
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
      connectToPeer(roomId);
    });

    peer.on('connection', (conn) => {
      setupConnection(conn, true);
    });

    peer.on('error', (err) => {
      setState(s => ({ ...s, error: err.message }));
    });
  }, [connectToPeer, setupConnection]);

  const sendAction = useCallback((action) => {
    broadcast({ type: 'GAME_ACTION', action });
  }, [broadcast]);

  const sendChat = useCallback((text, senderName) => {
    setState(s => {
      if (!s.myColor) return s;
      const message = {
        id: Math.random().toString(36).substr(2, 9),
        senderName,
        senderColor: s.myColor,
        text,
        timestamp: Date.now()
      };
      broadcast({ type: 'CHAT_MESSAGE', message });
      return { ...s, messages: [...s.messages, message] };
    });
  }, [broadcast]);

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
