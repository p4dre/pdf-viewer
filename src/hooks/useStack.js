import { useRef, useEffect } from "react";
const useStack = (maxLength) => {
  const stackRef = useRef([]);
  const map = (transformer) => {
    return stackRef.current.map((item) => {
      return transformer(item);
    });
  };
  const pop = () => {
    const stack = stackRef.current;
    const size = stack.length;
    if (size === 0) {
      return null;
    }
    const lastItem = stack.pop();
    stackRef.current = stack;
    return lastItem;
  };
  const push = (item) => {
    const stack = stackRef.current;
    if (stack.length + 1 > maxLength) {
      stack.shift();
    }
    stack.push(item);
    stackRef.current = stack;
  };
  useEffect(() => {
    return () => {
      stackRef.current = [];
    };
  }, []);
  return {
    push: push,
    map: map,
    pop: pop,
  };
};

export default useStack;
