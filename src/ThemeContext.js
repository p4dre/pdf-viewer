import { createContext } from "react";

let TextDirection;
(function (TextDirection) {
  TextDirection["RightToLeft"] = "RTL";
  TextDirection["LeftToRight"] = "LTR";
})(TextDirection || (TextDirection = {}));

const ThemeContext = createContext({
  currentTheme: "light",
  direction: TextDirection.LeftToRight,
  setCurrentTheme: function () {},
});

export default ThemeContext;
