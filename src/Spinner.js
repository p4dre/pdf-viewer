import { useState } from "react";
import useIntersectionObserver from "./hooks/useIntersectionObserver";

var Spinner = function (props) {
  const { size = "4em", testId } = props;
  const [visible, setVisible] = useState(false);
  const attrs = testId ? { "data-testid": testId } : {};
  const handleVisibilityChanged = (params) => {
    setVisible(params.isVisible);
  };
  const containerRef = useIntersectionObserver({
    onVisibilityChanged: handleVisibilityChanged,
  });
  return <div ref={containerRef} style={{ height: size, width: size }} className={`rpv-core__spinner ${visible ? "rpv-core__spinner--animating" : ""}`} />;
};

export default Spinner;
