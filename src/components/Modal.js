import { useRef, useContext, useLayoutEffect } from "react";
import useToggle from "../hooks/useToggle";
import ThemeContext from "../context/ThemeContext";
import { TextDirection } from "../enums";
import useLockScroll from "../hooks/useLockScroll";
import useEscape from "../hooks/useEscape";
import useClickOutside from "../hooks/useClickOutside";
import { uniqueId } from "../utils";

const Portal = (props) => {
  const { content, isOpened = false, target } = props;

  const [opened, toggle] = useToggle(isOpened);
  return (
    <>
      {target && target(toggle, opened)} {opened && content(toggle)}
    </>
  );
};

const ModalOverlay = (props) => {
  return <div className="rpv-core__modal-overlay">{props.children}</div>;
};

const ModalBody = (props) => {
  const { ariaControlsSuffix, children, closeOnClickOutside, closeOnEscape, onToggle } = props;
  var contentRef = useRef();
  var direction = useContext(ThemeContext).direction;
  var isRtl = direction === TextDirection.RightToLeft;
  useLockScroll();
  useEscape(function () {
    if (contentRef.current && closeOnEscape) {
      onToggle();
    }
  });
  useClickOutside(closeOnClickOutside, contentRef, onToggle);
  useLayoutEffect(function () {
    var contentEle = contentRef.current;
    if (!contentEle) {
      return;
    }
    var maxHeight = document.body.clientHeight * 0.75;
    if (contentEle.getBoundingClientRect().height >= maxHeight) {
      contentEle.style.overflow = "auto";
      contentEle.style.maxHeight = "".concat(maxHeight, "px");
    }
  }, []);
  return <div id={`rpv-core__modal-body-${ariaControlsSuffix}`} ref={contentRef} role="dialog" tabIndex={-1} ariaModal="true" className={`rpv-core__modal-body ${isRtl ? "rpv-core__modal-body--rtl" : ""}`}></div>;
};

const Modal = function (props) {
  const { ariaControlsSuffix, closeOnClickOutside, closeOnEscape, content, isOpened = false, target } = props;
  const controlsSuffix = ariaControlsSuffix || "".concat(uniqueId());
  const renderTarget = function (toggle, opened) {
    return (
      <div ariaExpanded={opened ? "true" : "false"} ariaHaspopup="dialog" airaControls={`rpv-core__modal-body-${controlsSuffix}`}>
        {target(toggle, opened)}
      </div>
    );
  };

  const renderContent = function (toggle) {
    const modalBodyProps = {
      ariaControlsSuffix: controlsSuffix,
      closeOnClickOutside: closeOnClickOutside,
      closeOnEscape: closeOnEscape,
      onToggle: toggle,
    };
    return (
      <ModalOverlay>
        <ModalBody {...modalBodyProps}>{content(toggle)}</ModalBody>
      </ModalOverlay>
    );
  };
  const portalProps = {
    target: target ? renderTarget : null,
    content: renderContent,
    isOpened: isOpened,
  };
  return <Portal {...portalProps} />;
};

export default Modal;
