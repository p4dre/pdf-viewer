import { useContext } from "react";
import ThemeContext from "../context/ThemeContext";

let TextDirection;
(function (TextDirection) {
  TextDirection["RightToLeft"] = "RTL";
  TextDirection["LeftToRight"] = "LTR";
})(TextDirection || (TextDirection = {}));

const PrimaryButton = function (_a, props) {
  const { children, testId, onClick } = props;

  var direction = useContext(ThemeContext).direction;
  var isRtl = direction === TextDirection.RightToLeft;
  var attrs = testId ? { "data-testid": testId } : {};
  return (
    <button type="button" onClick={onClick} className={`rpv-core__primary-button ${isRtl ? "rpv-core__primary-button--rtl" : ""}`} {...attrs}>
      {children}
    </button>
  );
};

export default PrimaryButton;
