import { useRef, useEffect } from "react";
const useQueue = (maxLength) => {
  const queueRef = useRef([]);
  const dequeue = () => {
    const queue = queueRef.current;
    const size = queue.length;
    if (size === 0) {
      return null;
    }
    const firstItem = queue.shift();
    queueRef.current = queue;
    return firstItem || null;
  };
  const enqueue = (item) => {
    const queue = queueRef.current;
    if (queue.length + 1 > maxLength) {
      queue.pop();
    }
    queueRef.current = [item].concat(queue);
  };
  const map = (transformer) => {
    return queueRef.current.map(function (item) {
      return transformer(item);
    });
  };
  useEffect(() => {
    return () => {
      queueRef.current = [];
    };
  }, []);
  return {
    dequeue: dequeue,
    enqueue: enqueue,
    map: map,
  };
};
export default useQueue;
