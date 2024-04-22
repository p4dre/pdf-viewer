import { useContext, createElement } from "react";
import Icon from "../../../components/Icon";
import ThemeContext from "../../../context/ThemeContext";
import LocalizationContext from "../../../context/LocalizationContext";
import Tooltip from "../../../components/Tooltip";
import { Position } from "../../../enums";
import MinimalButton from "../../../components/MinimalButton";
import MenuItem from "../../../components/MenuItem";

var DarkIcon = function () {
  return createElement(
    Icon,
    { size: 16 },
    createElement("path", { d: "M19.5,15.106l2.4-2.4a1,1,0,0,0,0-1.414l-2.4-2.4V5.5a1,1,0,0,0-1-1H15.106l-2.4-2.4a1,1,0,0,0-1.414,0l-2.4,2.4H5.5a1,1,0,0,0-1,1V8.894l-2.4,2.4a1,1,0,0,0,0,1.414l2.4,2.4V18.5a1,1,0,0,0,1,1H8.894l2.4,2.4a1,1,0,0,0,1.414,0l2.4-2.4H18.5a1,1,0,0,0,1-1Z" }),
    createElement("path", { d: "M10,6.349a6,6,0,0,1,0,11.3,6,6,0,1,0,0-11.3Z" })
  );
};

var LightIcon = function () {
  return createElement(
    Icon,
    { size: 16 },
    createElement("path", { d: "M19.491,15.106l2.4-2.4a1,1,0,0,0,0-1.414l-2.4-2.4V5.5a1,1,0,0,0-1-1H15.1L12.7,2.1a1,1,0,0,0-1.414,0l-2.4,2.4H5.491a1,1,0,0,0-1,1V8.894l-2.4,2.4a1,1,0,0,0,0,1.414l2.4,2.4V18.5a1,1,0,0,0,1,1H8.885l2.4,2.4a1,1,0,0,0,1.414,0l2.4-2.4h3.394a1,1,0,0,0,1-1Z" }),
    createElement("path", { d: "M11.491,6c4,0,6,2.686,6,6s-2,6-6,6Z" })
  );
};

var __assign = function () {
  __assign =
    Object.assign ||
    function __assign(t) {
      for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
      }
      return t;
    };
  return __assign.apply(this, arguments);
};

var TOOLTIP_OFFSET = { left: 0, top: 8 };
var SwitchThemeButton = function (_a) {
  var onClick = _a.onClick;
  var theme = useContext(ThemeContext);
  var l10n = useContext(LocalizationContext).l10n;
  var isDarkTheme = theme.currentTheme === "dark";
  var label = l10n && l10n.theme ? (isDarkTheme ? l10n.theme.switchLightTheme : l10n.theme.switchDarkTheme) : isDarkTheme ? "Switch to the light theme" : "Switch to the dark theme";
  return createElement(Tooltip, {
    ariaControlsSuffix: "theme-switch",
    position: Position.BottomCenter,
    target: createElement(MinimalButton, { ariaLabel: label, testId: "theme__switch-button", onClick: onClick }, isDarkTheme ? createElement(LightIcon, null) : createElement(DarkIcon, null)),
    content: function () {
      return label;
    },
    offset: TOOLTIP_OFFSET,
  });
};

var SwitchTheme = function (_a) {
  var children = _a.children;
  var theme = useContext(ThemeContext);
  var defaultChildern = function (props) {
    return createElement(SwitchThemeButton, { onClick: props.onClick });
  };
  var render = children || defaultChildern;
  return render({
    onClick: function () {
      return theme.setCurrentTheme(theme.currentTheme === "dark" ? "light" : "dark");
    },
  });
};

var SwitchThemeMenuItem = function (_a) {
  var onClick = _a.onClick;
  var theme = useContext(ThemeContext);
  var l10n = useContext(LocalizationContext).l10n;
  var isDarkTheme = theme.currentTheme === "dark";
  var label = l10n && l10n.theme ? (isDarkTheme ? l10n.theme.switchLightTheme : l10n.theme.switchDarkTheme) : isDarkTheme ? "Switch to the light theme" : "Switch to the dark theme";
  return createElement(MenuItem, { icon: isDarkTheme ? createElement(LightIcon, null) : createElement(DarkIcon, null), testId: "theme__switch-menu", onClick: onClick }, label);
};

var useThemePlugin = function () {
  var SwitchThemeDecorator = function (props) {
    return createElement(SwitchTheme, __assign({}, props));
  };
  var SwitchThemeButtonDecorator = function () {
    return createElement(SwitchThemeDecorator, null, function (props) {
      return createElement(SwitchThemeButton, __assign({}, props));
    });
  };
  var SwitchThemeMenuItemDecorator = function (props) {
    return createElement(SwitchThemeDecorator, null, function (p) {
      return createElement(SwitchThemeMenuItem, {
        onClick: function () {
          p.onClick();
          props.onClick();
        },
      });
    });
  };
  return {
    SwitchTheme: SwitchThemeDecorator,
    SwitchThemeButton: SwitchThemeButtonDecorator,
    SwitchThemeMenuItem: SwitchThemeMenuItemDecorator,
  };
};

export { DarkIcon, LightIcon, useThemePlugin };
