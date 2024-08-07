import React, { useContext, useEffect, useRef, useState } from "react";
import ChatBody from "../../../components/chat_body";
import { WebSocketContext } from "@modules/websocket_provider";
import { useRouter } from "next/router";
import { API_URL, USER_JOIN_MESSAGE, USER_LEFT_CHAT } from "@constants/index";
import autosize from "autosize";
import { AuthContext } from "@modules/auth_provider";

export type Message = {
  content: string;
  client_id: string;
  username: string;
  room_id: string;
  type: "recv" | "self";
};

export const App = () => {
  const [messages, setMessage] = useState<Message[]>([]);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const { conn } = useContext(WebSocketContext);
  const [users, setUsers] = useState<{ username: string }[]>([]);
  const { user } = useContext(AuthContext);

  const router = useRouter();

  const sendMessage = () => {
    if (!textarea.current?.value) return;
    if (conn === null) {
      router.push("/");
      return;
    }

    conn.send(textarea.current.value);
    textarea.current.value = "";
  };

  useEffect(() => {
    if (conn === null) {
      router.push("/");
      return;
    }

    const roomId = conn.url.split("/")[5];
    async function getUsers() {
      try {
        const res = await fetch(`${API_URL}/ws/getClients/${roomId}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        const data = await res.json();
        setUsers(data);
      } catch (error) {
        console.error(error);
      }
    }
    getUsers();
  }, []);

  useEffect(() => {
    if (textarea.current) {
      autosize(textarea.current);
    }

    if (conn === null) {
      router.push("/");
      return;
    }

    conn.onmessage = (message) => {
      const m: Message = JSON.parse(message.data);
      console.log(m)
      console.log(user?.username)
      if (m.content == USER_JOIN_MESSAGE) {
        setUsers([...users, { username: m.username }]);
      }
      
      if (m.content == USER_LEFT_CHAT) {
        const deleteUser = users.filter((user) => user.username != m.username);
        setUsers(deleteUser);
        setMessage([...messages, m]);
        return
      }

      user?.username == m.username ? (m.type = 'self') : (m.type = 'recv'); 
      console.log(m);
      setMessage([...messages, m]);
    };

    conn.onclose = () => {};
    conn.onerror = () => {};
    conn.onopen = () => {};
  }, [textarea, messages, conn, users]);

  return (
    <>
      <div className="flex flex-col w-full">
        <div className="p-4 md:mx-6 mb-14">
          <ChatBody data={messages} />
        </div>
        <div className="fixed bottom-0 mt-4 w-full">
          <div className="flex md:flex-row px-4 py-2 bg-grey md:mx-4 rounded-md">
            <div className="flex w-full mr-4 rounded-md border border-blue">
              <textarea
                ref={textarea}
                placeholder="type your message here"
                className="w-full h-10 p-2 rounded-md focus:outline-none"
                style={{ resize: "none" }}
              />
            </div>
            <div className="flex items-center">
              <button
                className="p-2 rounded-md bg-blue text-white"
                onClick={sendMessage}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default App;
