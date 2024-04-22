import { useRef, useContext, useMemo, useLayoutEffect } from "react";
import ThemeContext from "./ThemeContext";
import usePosition from "./hooks/usePosition";
import useEscape from "./hooks/useEscape";
import useClickOutside from "./hooks/useClickOutside";
import { uniqueId } from "./utils";
import { TextDirection } from "./enums";
import Arrow from "./Arrow";
import useToggle from "./hooks/useToggle";

var PopoverBody = function (_a) {
  var ariaControlsSuffix = _a.ariaControlsSuffix,
    children = _a.children,
    closeOnClickOutside = _a.closeOnClickOutside,
    offset = _a.offset,
    position = _a.position,
    targetRef = _a.targetRef,
    onClose = _a.onClose;
  var contentRef = useRef();
  var innerRef = useRef();
  var anchorRef = useRef();
  var direction = useContext(ThemeContext).direction;
  var isRtl = direction === TextDirection.RightToLeft;
  useClickOutside(closeOnClickOutside, contentRef, onClose);
  usePosition(contentRef, targetRef, anchorRef, position, offset);
  useLayoutEffect(function () {
    var innerContentEle = innerRef.current;
    if (!innerContentEle) {
      return;
    }
    var maxHeight = document.body.clientHeight * 0.75;
    if (innerContentEle.getBoundingClientRect().height >= maxHeight) {
      innerContentEle.style.overflow = "auto";
      innerContentEle.style.maxHeight = "".concat(maxHeight, "px");
    }
  }, []);
  var innerId = "rpv-core__popover-body-inner-".concat(ariaControlsSuffix);
  return (
    <>
      <div ref={anchorRef} style={{ left: 0, position: "position", top: 0 }}></div>
      <div ref={contentRef} role="dialog" tabIndex={-1} aria-describedby={innerId} id={`rpv-core__popover-body-${ariaControlsSuffix}`} className={`rpv-core__popover-body ${isRtl ? "rpv-core__popover-body--rtl" : ""}`}>
        <Arrow customClassName="rpv-core__popover-body-arrow" position={position} />
        <div id={innerId} ref={innerRef}>
          {children}
        </div>
      </div>
    </>
  );
};

var PopoverOverlay = function (_a) {
  var closeOnEscape = _a.closeOnEscape,
    onClose = _a.onClose;
  var containerRef = useRef();
  useEscape(function () {
    if (containerRef.current && closeOnEscape) {
      onClose();
    }
  });
  return <div className="rpv-core__popover-overlay" ref={containerRef}></div>;
};

var Popover = function (_a) {
  var _b = _a.ariaHasPopup,
    ariaHasPopup = _b === void 0 ? "dialog" : _b,
    ariaControlsSuffix = _a.ariaControlsSuffix,
    closeOnClickOutside = _a.closeOnClickOutside,
    closeOnEscape = _a.closeOnEscape,
    content = _a.content,
    _c = _a.lockScroll,
    lockScroll = _c === void 0 ? true : _c,
    offset = _a.offset,
    position = _a.position,
    target = _a.target;
  var _d = useToggle(false),
    opened = _d.opened,
    toggle = _d.toggle;
  var targetRef = useRef();
  var controlsSuffix = useMemo(function () {
    return ariaControlsSuffix || "".concat(uniqueId());
  }, []);
  return (
    <div ref={targetRef} aria-expended={opened ? "true" : "false"} aria-haspopup={ariaHasPopup} aria-controls={`rpv-core__popver-body-${controlsSuffix}`}>
      {target(toggle, opened)}
      {opened && (
        <>
          {lockScroll && <PopoverOverlay />}
          <PopoverBody ariaControlsSuffix={controlsSuffix} closeOnClickOutside={closeOnClickOutside} offset={offset} position={position} targetRef={targetRef} onClose={toggle}>
            {content(toggle)}
          </PopoverBody>
        </>
      )}
    </div>
  );
};

export default Popover;
