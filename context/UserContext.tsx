"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface UserContextType {
  profileClicked: boolean;
  setProfileClicked: (value: boolean) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [profileClicked, setProfileClicked] = useState(false);

  return (
    <UserContext.Provider value={{ profileClicked, setProfileClicked }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context)
    throw new Error("useUserContext must be used within UserProvider");
  return context;
};
