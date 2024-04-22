import { useEffect } from "react";

const useClickOutside = (closeOnClickOutside, targetRef, onClickOutside) => {
  const clickHandler = (e) => {
    const target = targetRef.current;
    if (!target) {
      return;
    }
    const clickedTarget = e.target;
    if (clickedTarget instanceof Element && clickedTarget.shadowRoot) {
      const paths = e.composedPath();
      if (paths.length > 0 && !target.contains(paths[0])) {
        onClickOutside();
      }
    } else if (!target.contains(clickedTarget)) {
      onClickOutside();
    }
  };
  useEffect(() => {
    if (!closeOnClickOutside) {
      return;
    }
    const eventOptions = {
      capture: true,
    };
    document.addEventListener("click", clickHandler, eventOptions);
    return () => {
      document.removeEventListener("click", clickHandler, eventOptions);
    };
  }, []);
};

export default useClickOutside;
