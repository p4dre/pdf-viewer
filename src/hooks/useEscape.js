import { useEffect } from "react";

const useEscape = (handler) => {
  const keyUpHandler = (e) => {
    if (e.key === "Escape") {
      handler();
    }
  };
  useEffect(() => {
    document.addEventListener("keyup", keyUpHandler);
    return () => {
      document.removeEventListener("keyup", keyUpHandler);
    };
  }, []);
};

export default useEscape;
