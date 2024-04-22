import { useRef, useContext, useMemo, createElement, Fragment } from "react";
import useToggle from "./hooks/useToggle";
import ThemeContext from "./ThemeContext";
import { TextDirection, ToggleStatus } from "./enums";
import usePosition from "./hooks/usePosition";
import Arrow from "./Arrow";
import { uniqueId } from "./utils";
import useEscape from "./hooks/useEscape";

const TooltipBody = function (props) {
  const { ariaControlsSuffix, children, contentRef, offset, position, targetRef } = props;
  const anchorRef = useRef();
  const direction = useContext(ThemeContext).direction;
  const isRtl = direction === TextDirection.RightToLeft;
  usePosition(contentRef, targetRef, anchorRef, position, offset);
  return (
    <>
      <div ref={anchorRef} style={{ left: 0, position: "absolute", top: 0 }}>
        <div role="tooltip" ref={contentRef} id={`rpv-core__tooltip-body-${ariaControlsSuffix}`} className={`rpv-core__tooltip-body ${isRtl ? "rpv-core__tooltip-body--rtl" : ""}`}>
          <Arrow position={position} customClassName="rpv-core__tooltip-body-arrow" />
          <div className="rpv-core__tooltip-body-content">{children}</div>
        </div>
      </div>
    </>
  );
};

// const Tooltip = function (props) {
//   const { ariaControlsSuffix, content, offset, position, target } = props;
//   const [opened, toggle] = useToggle(false);
//   const targetRef = useRef();
//   const contentRef = useRef();
//   const controlsSuffix = useMemo(function () {
//     return ariaControlsSuffix || "".concat(uniqueId());
//   }, []);
//   useEscape(function () {
//     if (targetRef.current && document.activeElement && targetRef.current.contains(document.activeElement)) {
//       close();
//     }
//   });
//   const open = function () {
//     toggle(ToggleStatus.Open);
//   };
//   const close = function () {
//     toggle(ToggleStatus.Close);
//   };
//   const onBlur = function (e) {
//     const shouldHideTooltip = e.relatedTarget instanceof HTMLElement && e.currentTarget.parentElement && e.currentTarget.parentElement.contains(e.relatedTarget);
//     if (shouldHideTooltip) {
//       if (contentRef.current) {
//         contentRef.current.style.display = "none";
//       }
//     } else {
//       close();
//     }
//   };
//   const tooltipBodyProps = {
//     ariaControlsSuffix: controlsSuffix,
//     contentRef: contentRef,
//     offset: offset,
//     position: position,
//     targetRef: targetRef,
//   };
//   return (
//     <>
//       <div ref={targetRef} onBlur={onBlur} onFocus={open} onMouseEnter={open} onMouseLeave={close} ariaDescribedby={`rpv-core__tooltip-body-${controlsSuffix}`}>
//         {target}
//       </div>
//       {opened && <TooltipBody {...tooltipBodyProps}>{content}</TooltipBody>}
//     </>
//   );
// };

var Tooltip = function (_a) {
  var ariaControlsSuffix = _a.ariaControlsSuffix,
    content = _a.content,
    offset = _a.offset,
    position = _a.position,
    target = _a.target;
  var _b = useToggle(false),
    opened = _b.opened,
    toggle = _b.toggle;
  var targetRef = useRef();
  var contentRef = useRef();
  var controlsSuffix = useMemo(function () {
    return ariaControlsSuffix || "".concat(uniqueId());
  }, []);
  useEscape(function () {
    if (targetRef.current && document.activeElement && targetRef.current.contains(document.activeElement)) {
      close();
    }
  });
  var open = function () {
    toggle(ToggleStatus.Open);
  };
  var close = function () {
    toggle(ToggleStatus.Close);
  };
  var onBlur = function (e) {
    var shouldHideTooltip = e.relatedTarget instanceof HTMLElement && e.currentTarget.parentElement && e.currentTarget.parentElement.contains(e.relatedTarget);
    if (shouldHideTooltip) {
      if (contentRef.current) {
        contentRef.current.style.display = "none";
      }
    } else {
      close();
    }
  };
  return createElement(
    Fragment,
    null,
    createElement(
      "div",
      {
        ref: targetRef,
        "aria-describedby": "rpv-core__tooltip-body-".concat(controlsSuffix),
        onBlur: onBlur,
        onFocus: open,
        onMouseEnter: open,
        onMouseLeave: close,
      },
      target
    ),
    opened &&
      createElement(
        TooltipBody,
        {
          ariaControlsSuffix: controlsSuffix,
          contentRef: contentRef,
          offset: offset,
          position: position,
          targetRef: targetRef,
        },
        content()
      )
  );
};

export default Tooltip;
