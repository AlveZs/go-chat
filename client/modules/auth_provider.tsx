import { createContext, ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/router";

export type UserInfo = {
  username: string;
  id: string;
};

export type AuthContextProps = {
  authenticated: boolean;
  setAuthenticated: (auth: boolean) => void;
  user: UserInfo;
  setUser: (user: UserInfo) => void;
};

export const AuthContext = createContext<AuthContextProps>({
  authenticated: false,
  setAuthenticated: () => {},
  user: { username: "", id: "" },
  setUser: () => {},
});

const AuthContextProvider = ({ children }: { children: ReactNode }) => {
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState<UserInfo>({ username: "", id: "" });

  const router = useRouter();

  useEffect(() => {
    const userInfo = localStorage.getItem("user_info");

    if (!userInfo) {
      if (window.location.pathname != "/singup") {
        router.push("/login");
      }

      return;
    }

    const user: UserInfo = JSON.parse(userInfo);
    if (user) {
      setUser({
        username: user.username,
        id: user.id,
      });
    }

    setAuthenticated(true);
  }, [authenticated]);

  return (
    <AuthContext.Provider
      value={{
        authenticated,
        setAuthenticated,
        user,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContextProvider;
