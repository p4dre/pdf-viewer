import { useEffect } from "react";

const useLockScroll = () => {
  useEffect(() => {
    var originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);
};

export default useLockScroll;
