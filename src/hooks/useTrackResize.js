import { useLayoutEffect } from "react";

var useTrackResize = (props) => {
  const { targetRef, onResize } = props;
  useLayoutEffect(() => {
    var io = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        onResize(entry.target);
      });
    });
    var container = targetRef.current;
    if (!container) {
      return;
    }
    io.observe(container);
    return () => {
      io.unobserve(container);
    };
  }, []);
};

export default useTrackResize;
