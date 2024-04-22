import { useContext } from "react";
import ThemeContext from "./ThemeContext";
import { TextDirection } from "./enums";

const Icon = function (props) {
  const { children, ignoreDirection = false, size = 24 } = props;

  var direction = useContext(ThemeContext).direction;
  var isRtl = !ignoreDirection && direction === TextDirection.RightToLeft;
  var width = "".concat(size || 24, "px");
  return (
    <svg ariaHidden="true" className={`rpv-core__icon ${isRtl ? "rpv-core__icon--rtl" : ""}`} focusable="false" height={width} viewBox="0 0 24 24" width={width}>
      {children}
    </svg>
  );
};

export default Icon;
