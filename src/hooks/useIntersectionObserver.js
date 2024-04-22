import { useRef, useLayoutEffect } from "react";

const useIntersectionObserver = (props) => {
  const containerRef = useRef(null);
  const { once, threshold, onVisibilityChanged } = props;

  useLayoutEffect(function () {
    const container = containerRef.current;
    if (!container) {
      return;
    }
    const intersectionTracker = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          const isVisible = entry.isIntersecting;
          const ratio = entry.intersectionRatio;
          onVisibilityChanged({ isVisible: isVisible, ratio: ratio });
          if (isVisible && once) {
            intersectionTracker.unobserve(container);
            intersectionTracker.disconnect();
          }
        });
      },
      {
        threshold: threshold || 0,
      }
    );
    intersectionTracker.observe(container);
    return function () {
      intersectionTracker.unobserve(container);
      intersectionTracker.disconnect();
    };
  }, []);
  return containerRef;
};

export default useIntersectionObserver;
