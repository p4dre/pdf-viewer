import { useLayoutEffect } from "react";
import { calculatePosition } from "../utils";

const usePosition = (contentRef, targetRef, anchorRef, position, offset) => {
  useLayoutEffect(function () {
    const targetEle = targetRef.current;
    const contentEle = contentRef.current;
    const anchorEle = anchorRef.current;
    if (!contentEle || !targetEle || !anchorEle) {
      return;
    }
    const anchorRect = anchorEle.getBoundingClientRect();
    const _a = calculatePosition(contentEle, targetEle, position, offset),
      top = _a.top,
      left = _a.left;
    contentEle.style.top = "".concat(top - anchorRect.top, "px");
    contentEle.style.left = "".concat(left - anchorRect.left, "px");
  }, []);
};

export default usePosition;
