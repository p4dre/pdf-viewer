import { useState } from "react";
import useToggle from "./useToggle";

let ToggleStatus = 0;
(function (ToggleStatus) {
  ToggleStatus["Close"] = "Close";
  ToggleStatus["Open"] = "Open";
  ToggleStatus["Toggle"] = "Toggle";
})(ToggleStatus || (ToggleStatus = {}));

var TogglePopupBy;
(function (TogglePopupBy) {
  TogglePopupBy["Click"] = "Click";
  TogglePopupBy["Hover"] = "Hover";
})(TogglePopupBy || (TogglePopupBy = {}));

const useTogglePopup = () => {
  const { opened, toggle } = useToggle(false);

  const [togglePopupBy, setTooglePopupBy] = useState(TogglePopupBy.Hover);

  const toggleOnClick = () => {
    switch (togglePopupBy) {
      case TogglePopupBy.Click:
        opened && setTooglePopupBy(TogglePopupBy.Hover);
        toggle(ToggleStatus.Toggle);
        break;
      case TogglePopupBy.Hover:
        setTooglePopupBy(TogglePopupBy.Click);
        toggle(ToggleStatus.Open);
        break;
    }
  };
  const openOnHover = function () {
    togglePopupBy === TogglePopupBy.Hover && toggle(ToggleStatus.Open);
  };
  const closeOnHover = function () {
    togglePopupBy === TogglePopupBy.Hover && toggle(ToggleStatus.Close);
  };
  return {
    opened: opened,
    closeOnHover: closeOnHover,
    openOnHover: openOnHover,
    toggleOnClick: toggleOnClick,
  };
};

export default useTogglePopup;
