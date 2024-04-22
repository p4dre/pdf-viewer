import { useState } from "react";
let ToggleStatus;
(function (ToggleStatus) {
  ToggleStatus["Close"] = "Close";
  ToggleStatus["Open"] = "Open";
  ToggleStatus["Toggle"] = "Toggle";
})(ToggleStatus || (ToggleStatus = {}));
const useToggle = (isOpened) => {
  const [opened, setOpened] = useState(isOpened);
  const toggle = (status) => {
    switch (status) {
      case ToggleStatus.Close:
        setOpened(false);
        break;
      case ToggleStatus.Open:
        setOpened(true);
        break;
      case ToggleStatus.Toggle:
      default:
        setOpened((isOpened) => {
          return !isOpened;
        });
        break;
    }
  };
  return { opened: opened, toggle: toggle };
};

export default useToggle;
