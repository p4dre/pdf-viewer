import { useContext } from "react";
import ThemeContext from "../context/ThemeContext";
import { TextDirection } from "../enums";

const MinimalButton = function (props) {
  const { ariaLabel = "", ariaKeyShortcuts = "", isDisabled = false, isSelected = false, testId, onClick = () => {}, children } = props;

  var direction = useContext(ThemeContext).direction;
  var isRtl = direction === TextDirection.RightToLeft;
  var attrs = testId ? { "data-testid": testId } : {};
  return (
    <button
      ariaLabel={ariaLabel}
      ariaKeyShortcuts={ariaKeyShortcuts}
      ariaDisabled={isDisabled}
      className={`rpv-core__minimal-button ${isDisabled ? "rpv-core__minimal-button--disabled" : ""} ${isRtl ? "rpv-core__minimal-button--rtl" : ""} ${isSelected ? "rpv-core__minimal-button--selected" : ""}`}
      type="button"
      onClick={onClick}
      {...attrs}
    >
      {children}
    </button>
  );
};

export default MinimalButton;
