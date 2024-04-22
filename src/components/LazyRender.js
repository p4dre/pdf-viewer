import { useState } from "react";
import useIntersectionObserver from "../hooks/useIntersectionObserver";

const LazyRender = (props) => {
  const { attrs, children } = props;

  const [visible, setVisible] = useState(false);

  var handleVisibilityChanged = function (params) {
    if (params.isVisible) {
      setVisible(true);
    }
  };
  var containerRef = useIntersectionObserver({
    once: true,
    onVisibilityChanged: handleVisibilityChanged,
  });
  return (
    <div ref={containerRef} {...attrs}>
      {visible && children}
    </div>
  );
};

export default LazyRender;
