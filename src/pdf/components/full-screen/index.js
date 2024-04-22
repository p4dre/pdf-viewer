import { useState, useContext, useMemo, useCallback, useEffect, Fragment, createElement } from "react";
import Icon from "../../../components/Icon";
import LocalizationContext from "../../../context/LocalizationContext";
import ThemeContext from "../../../context/ThemeContext";
import { isMac, isFullScreenEnabled, createStore } from "../../../utils";
import Tooltip from "../../../components/Tooltip";
import { Position, FullScreenMode, TextDirection } from "../../../enums";
import MinimalButton from "../../../components/MinimalButton";
import MenuItem from "../../../components/MenuItem";
import Spinner from "../../../components/Spinner";

var ExitFullScreenIcon = function () {
  return (
    <Icon size={16}>
      <path d="M11.5 23.499L11.5 14.499" />
      <path d="M7.5 18.499L11.5 14.499 15.5 18.499" />
      <path d="M11.5 1.499L11.5 10.499" />
      <path d="M7.5 6.499L11.5 10.499 15.5 6.499" />
      <path d="M20.5 12.499L1.5 12.499" />
    </Icon>
  );
};

var FullScreenIcon = function () {
  return createElement(
    Icon,
    { size: 16 },
    createElement("path", { d: "M0.5 12L23.5 12" }),
    createElement("path", { d: "M11.5 1L11.5 23" }),
    createElement("path", { d: "M8.5 4L11.5 1 14.5 4" }),
    createElement("path", { d: "M20.5 9L23.5 12 20.5 15" }),
    createElement("path", { d: "M3.5 15L0.5 12 3.5 9" }),
    createElement("path", { d: "M14.5 20L11.5 23 8.5 20" })
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

var TOOLTIP_OFFSET$1 = { left: 0, top: 8 };
var EnterFullScreenButton = function (_a) {
  var enableShortcuts = _a.enableShortcuts,
    onClick = _a.onClick;
  var l10n = useContext(LocalizationContext).l10n;
  var label = l10n && l10n.fullScreen ? l10n.fullScreen.enterFullScreen : "Full screen";
  var ariaKeyShortcuts = enableShortcuts ? (isMac() ? "Meta+Ctrl+F" : "F11") : "";
  return createElement(Tooltip, {
    ariaControlsSuffix: "full-screen-enter",
    position: Position.BottomCenter,
    target: createElement(MinimalButton, { ariaKeyShortcuts: ariaKeyShortcuts, ariaLabel: label, isDisabled: !isFullScreenEnabled(), testId: "full-screen__enter-button", onClick: onClick }, createElement(FullScreenIcon, null)),
    content: function () {
      return label;
    },
    offset: TOOLTIP_OFFSET$1,
  });
};

var TOOLTIP_OFFSET = { left: 0, top: 8 };
var ExitFullScreenButtonWithTooltip = function (_a) {
  var onClick = _a.onClick;
  var l10n = useContext(LocalizationContext).l10n;
  var exitFullScreenLabel = l10n && l10n.fullScreen ? l10n.fullScreen.exitFullScreen : "Exit full screen";
  return createElement(Tooltip, {
    ariaControlsSuffix: "full-screen-exit",
    position: Position.BottomCenter,
    target: createElement(MinimalButton, { ariaKeyShortcuts: "Esc", ariaLabel: exitFullScreenLabel, testId: "full-screen__exit-button-with-tooltip", onClick: onClick }, createElement(ExitFullScreenIcon, null)),
    content: function () {
      return exitFullScreenLabel;
    },
    offset: TOOLTIP_OFFSET,
  });
};

var useEnterFullScreen = function (getFullScreenTarget, store) {
  var _a = useState(store.get("fullScreenMode")),
    fullScreenMode = _a[0],
    setFullScreenMode = _a[1];
  var handleFullScreenMode = useCallback(function (fullScreenMode) {
    setFullScreenMode(fullScreenMode);
  }, []);
  var enterFullScreen = function () {
    var pagesContainer = store.get("getPagesContainer");
    if (!pagesContainer) {
      return;
    }
    var target = getFullScreenTarget(pagesContainer());
    store.get("enterFullScreenMode")(target);
  };
  var exitFullScreen = function () {
    store.get("exitFullScreenMode")();
  };
  useEffect(function () {
    store.subscribe("fullScreenMode", handleFullScreenMode);
    return function () {
      store.unsubscribe("fullScreenMode", handleFullScreenMode);
    };
  }, []);
  return {
    enterFullScreen: enterFullScreen,
    exitFullScreen: exitFullScreen,
    isFullScreen: fullScreenMode === FullScreenMode.Entering || fullScreenMode === FullScreenMode.EnteredCompletely,
  };
};

var EnterFullScreen = function (_a) {
  var children = _a.children,
    enableShortcuts = _a.enableShortcuts,
    getFullScreenTarget = _a.getFullScreenTarget,
    store = _a.store;
  var _b = useEnterFullScreen(getFullScreenTarget, store),
    enterFullScreen = _b.enterFullScreen,
    exitFullScreen = _b.exitFullScreen,
    isFullScreen = _b.isFullScreen;
  var defaultChildren = function (props) {
    return isFullScreen ? createElement(ExitFullScreenButtonWithTooltip, { onClick: props.onClick }) : createElement(EnterFullScreenButton, { enableShortcuts: enableShortcuts, onClick: props.onClick });
  };
  var render = children || defaultChildren;
  return render({
    onClick: isFullScreen ? exitFullScreen : enterFullScreen,
  });
};

var EnterFullScreenMenuItem = function (_a) {
  var onClick = _a.onClick;
  var l10n = useContext(LocalizationContext).l10n;
  var label = l10n && l10n.fullScreen ? l10n.fullScreen.enterFullScreen : "Full screen";
  return createElement(MenuItem, { icon: createElement(FullScreenIcon, null), isDisabled: !isFullScreenEnabled(), testId: "full-screen__enter-menu", onClick: onClick }, label);
};

var ExitFullScreenButton = function (_a) {
  var onClick = _a.onClick;
  var l10n = useContext(LocalizationContext).l10n;
  var direction = useContext(ThemeContext).direction;
  var isRtl = direction === TextDirection.RightToLeft;
  var exitFullScreenLabel = l10n && l10n.fullScreen ? l10n.fullScreen.exitFullScreen : "Exit full screen";
  return (
    <div className={`rpv-full-screen__exit-button ${!isRtl ? "rpv-full-screen__exit-button--ltr" : ""} ${isRtl ? "rpv-full-screen__exit-button--rtl" : ""}`}>
      <MinimalButton ariaLabel={exitFullScreenLabel} onClick={onClick}>
        <ExitFullScreenIcon />
      </MinimalButton>
    </div>
  );
};

var ExitFullScreen = function (_a) {
  var children = _a.children,
    getFullScreenTarget = _a.getFullScreenTarget,
    store = _a.store;
  var _b = useEnterFullScreen(getFullScreenTarget, store),
    enterFullScreen = _b.enterFullScreen,
    exitFullScreen = _b.exitFullScreen,
    isFullScreen = _b.isFullScreen;
  var defaultChildren = function (props) {
    return createElement(ExitFullScreenButton, { onClick: props.onClick });
  };
  var render = children || defaultChildren;
  return (
    isFullScreen &&
    render({
      onClick: isFullScreen ? exitFullScreen : enterFullScreen,
    })
  );
};

var FullScreenModeTracker = function (_a) {
  var store = _a.store,
    onEnterFullScreen = _a.onEnterFullScreen,
    onExitFullScreen = _a.onExitFullScreen;
  var _b = useState(store.get("fullScreenMode")),
    fullScreenMode = _b[0],
    setFullScreenMode = _b[1];
  var handleFullScreenMode = useCallback(function (fullScreenMode) {
    setFullScreenMode(fullScreenMode);
  }, []);
  var handleEnteredFullScreen = function () {
    onEnterFullScreen(store.get("zoom"));
  };
  var handleExitedFullScreen = function () {
    onExitFullScreen(store.get("zoom"));
  };
  useEffect(
    function () {
      switch (fullScreenMode) {
        case FullScreenMode.EnteredCompletely:
          handleEnteredFullScreen();
          break;
        case FullScreenMode.Exited:
          handleExitedFullScreen();
          break;
      }
    },
    [fullScreenMode]
  );
  useEffect(function () {
    store.subscribe("fullScreenMode", handleFullScreenMode);
    return function () {
      store.unsubscribe("fullScreenMode", handleFullScreenMode);
    };
  }, []);
  return (fullScreenMode === FullScreenMode.Entering || fullScreenMode === FullScreenMode.Entered) && createElement("div", { className: "rpv-full-screen__overlay" }, createElement(Spinner, null));
};

var ShortcutHandler = function (_a) {
  var containerRef = _a.containerRef,
    getFullScreenTarget = _a.getFullScreenTarget,
    store = _a.store;
  var enterFullScreen = useEnterFullScreen(getFullScreenTarget, store).enterFullScreen;
  var keydownHandler = function (e) {
    if (e.shiftKey || e.altKey) {
      return;
    }
    var areShortcutsPressed = isMac() ? e.metaKey && e.ctrlKey && e.key === "f" : e.key === "F11";
    if (!areShortcutsPressed) {
      return;
    }
    var containerEle = containerRef.current;
    if (!containerEle || !document.activeElement || !containerEle.contains(document.activeElement)) {
      return;
    }
    e.preventDefault();
    enterFullScreen();
  };
  useEffect(
    function () {
      var containerEle = containerRef.current;
      if (!containerEle) {
        return;
      }
      document.addEventListener("keydown", keydownHandler);
      return function () {
        document.removeEventListener("keydown", keydownHandler);
      };
    },
    [containerRef.current]
  );
  return createElement(Fragment, null);
};

var useFullScreenPlugin = function (props) {
  var defaultFullScreenTarget = function (ele) {
    return ele;
  };
  var getFullScreenTarget = (props === null || props === void 0 ? void 0 : props.getFullScreenTarget) || defaultFullScreenTarget;
  var fullScreenPluginProps = useMemo(function () {
    return Object.assign({}, { enableShortcuts: true, onEnterFullScreen: function () {}, onExitFullScreen: function () {} }, props);
  }, []);
  var store = useMemo(function () {
    return createStore({
      enterFullScreenMode: function () {},
      exitFullScreenMode: function () {},
      fullScreenMode: FullScreenMode.Normal,
      zoom: function () {},
    });
  }, []);
  var EnterFullScreenDecorator = function (props) {
    return createElement(EnterFullScreen, __assign({}, props, { enableShortcuts: fullScreenPluginProps.enableShortcuts, getFullScreenTarget: getFullScreenTarget, store: store }));
  };
  var EnterFullScreenButtonDecorator = function () {
    return createElement(EnterFullScreenDecorator, null, function (renderProps) {
      return createElement(EnterFullScreenButton, __assign({ enableShortcuts: fullScreenPluginProps.enableShortcuts }, renderProps));
    });
  };
  var EnterFullScreenMenuItemDecorator = function (props) {
    return createElement(EnterFullScreenDecorator, null, function (p) {
      return createElement(EnterFullScreenMenuItem, {
        onClick: function () {
          p.onClick();
          props.onClick();
        },
      });
    });
  };
  var ExitFullScreenDecorator = function () {
    return createElement(ExitFullScreen, { getFullScreenTarget: getFullScreenTarget, store: store }, props === null || props === void 0 ? void 0 : props.renderExitFullScreenButton);
  };
  var renderViewer = function (props) {
    var currentSlot = props.slot;
    if (currentSlot.subSlot) {
      currentSlot.subSlot.children = createElement(
        Fragment,
        null,
        fullScreenPluginProps.enableShortcuts && createElement(ShortcutHandler, { containerRef: props.containerRef, getFullScreenTarget: getFullScreenTarget, store: store }),
        createElement(FullScreenModeTracker, { store: store, onEnterFullScreen: fullScreenPluginProps.onEnterFullScreen, onExitFullScreen: fullScreenPluginProps.onExitFullScreen }),
        createElement(ExitFullScreenDecorator, null),
        currentSlot.subSlot.children
      );
    }
    return currentSlot;
  };
  return {
    install: function (pluginFunctions) {
      store.update("enterFullScreenMode", pluginFunctions.enterFullScreenMode);
      store.update("exitFullScreenMode", pluginFunctions.exitFullScreenMode);
      store.update("getPagesContainer", pluginFunctions.getPagesContainer);
      store.update("zoom", pluginFunctions.zoom);
    },
    onViewerStateChange: function (viewerState) {
      store.update("fullScreenMode", viewerState.fullScreenMode);
      return viewerState;
    },
    renderViewer: renderViewer,
    EnterFullScreen: EnterFullScreenDecorator,
    EnterFullScreenButton: EnterFullScreenButtonDecorator,
    EnterFullScreenMenuItem: EnterFullScreenMenuItemDecorator,
  };
};

export { ExitFullScreenIcon, FullScreenIcon, useFullScreenPlugin };
