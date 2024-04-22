import { useContext } from "react";
import ThemeContext from "../context/ThemeContext";
import { TextDirection } from "../enums";
import CheckIcon from "./CheckIcon";
const MenuItem = function (props) {
  const { checked = false, children, icon = null, isDisabled = false, testId, onClick = () => {} } = props;
  var direction = useContext(ThemeContext).direction;
  var isRtl = direction === TextDirection.RightToLeft;
  var attrs = testId ? { "data-testid": testId } : {};
  return (
    <button type="button" role="menuitem" tabIndex={-1} className={`rpv-core__menu-item ${isDisabled ? "rpv-core__menu-item--disabled" : ""} ${!isRtl ? "rpv-core__menu-item--ltr" : ""} ${isRtl ? "rpv-core__menu-item--rtl" : ""}`} onClick={onClick} {...attrs}>
      <div className={`rpv-core__menu-item-icon ${!isRtl ? "rpv-core__menu-item-icon--ltr" : ""} ${isRtl ? "rpv-core__menu-item-icon--rtl" : ""}`}>{icon}</div>
      <div className={`rpv-core__menu-item-label ${!isRtl ? "rpv-core__menu-item-icon--ltr" : ""} ${isRtl ? "rpv-core__menu-item-icon--rtl" : ""}`}>{children}</div>
      <div className={`rpv-core__menu-item-label ${!isRtl ? "rpv-core__menu-item-icon--ltr" : ""} ${isRtl ? "rpv-core__menu-item-icon--rtl" : ""}`}>{checked && <CheckIcon />}</div>
    </button>
  );
};

export default MenuItem;
