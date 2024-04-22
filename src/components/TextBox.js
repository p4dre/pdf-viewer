import { useRef, useContext, useEffect, useLayoutEffect } from "react";
import ThemeContext from "../context/ThemeContext";

let TextDirection;
(function (TextDirection) {
  TextDirection["RightToLeft"] = "RTL";
  TextDirection["LeftToRight"] = "LTR";
})(TextDirection || (TextDirection = {}));

const TextBox = function (props) {
  const { ariaLabel = "", autoFocus = false, placeholder = "", testId, type = "text", value = "", onChange = () => {}, onKeyDown = () => {} } = props;

  const direction = useContext(ThemeContext).direction;
  const textboxRef = useRef();
  const isRtl = direction === TextDirection.RightToLeft;
  const attrs = {
    ref: textboxRef,
    "data-testid": "",
    "aria-label": ariaLabel,
    className: `rpv-core__textbox ${isRtl ? "rpv-core__textbox--rtl" : ""}`,
    placeholder: placeholder,
    value: value,
    onChange: (e) => {
      return onChange(e.target.value);
    },
    onKeyDown: onKeyDown,
  };
  if (testId) {
    attrs["data-testid"] = testId;
  }
  useLayoutEffect(function () {
    if (autoFocus) {
      var textboxEle = textboxRef.current;
      if (textboxEle) {
        var x = window.scrollX;
        var y = window.scrollY;
        textboxEle.focus();
        window.scrollTo(x, y);
      }
    }
  }, []);
  return type === "text" ? <input {...attrs} /> : <input type="password" {...attrs} />;
  // return type === "text" ? createElement("input", __assign({ type: "text" }, attrs)) : createElement("input", __assign({ type: "password" }, attrs));
};

export default TextBox;
