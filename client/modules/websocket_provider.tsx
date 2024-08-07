import React, { createContext, useState } from "react";

type Conn = WebSocket | null;
type WebSocketContextProps = {
  conn: Conn;
  setConn: (c: Conn) => void;
};

export const WebSocketContext = createContext<WebSocketContextProps>({
  conn: null,
  setConn: () => {},
});

const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [conn, setConn] = useState<Conn>(null);

  return (
    <WebSocketContext.Provider
      value={{
        conn,
        setConn,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
}

export default WebSocketProvider;
