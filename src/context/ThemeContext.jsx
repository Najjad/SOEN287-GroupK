import { createContext, useEffect, useState } from "react";

export const ThemeContext = createContext();

export function ThemeProvider({ children }) {

  const [theme, setTheme] = useState(() => {

    const saved =
      localStorage.getItem("theme");

    return saved || "light";

  });



  useEffect(() => {

    if (theme === "dark") {

      document.body.classList.add("dark");

    } else {

      document.body.classList.remove("dark");

    }

    localStorage.setItem("theme", theme);

  }, [theme]);



  const toggleTheme = () => {

    setTheme(prev =>
      prev === "light"
        ? "dark"
        : "light"
    );

  };



  return (

    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme
      }}
    >

      {children}

    </ThemeContext.Provider>

  );

}