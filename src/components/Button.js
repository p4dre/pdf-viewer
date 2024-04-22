import { useContext } from "react";
import ThemeContext from "../context/ThemeContext";
import { TextDirection } from "../enums";

const Button = (props) => {
  const { children, onClick, testId } = props;
  var direction = useContext(ThemeContext).direction;
  var isRtl = direction === TextDirection.RightToLeft;
  var attrs = testId ? { "data-testid": testId } : {};
  return (
    <button className={`rpv-core__button ${isRtl ? "rpv-core__button--rtl" : ""}`} {...attrs}>
      {children}
    </button>
  );
};

export default Button;
