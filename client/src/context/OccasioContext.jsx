import { useState } from "react";
import { createContext } from "react";

export const OccasioContext = createContext();
export const backendUrl = import.meta.env.VITE_BACKEND_URL;

const OccasioContextProvider = (props) => {
  const currency = "$"
  const [user, setUser] = useState(null);
  const value = {
    currency,
    backendUrl,
    user,
    setUser
  };

  return (
    <OccasioContext.Provider value={value}>{props.children}</OccasioContext.Provider>
  );
}

export default OccasioContextProvider;