import { useMemo, useRef, useEffect, useContext, Fragment, createElement } from "react";
import Icon from "../../../components/Icon";
import LocalizationContext from "../../../context/LocalizationContext";
import { Position } from "../../../enums";
import { isMac, createStore } from "../../../utils";
import Tooltip from "../../../components/Tooltip";
import MinimalButton from "../../../components/MinimalButton";
import MenuItem from "../../../components/MenuItem";

var OpenFileIcon = function () {
  return createElement(Icon, { size: 16 }, createElement("path", { d: "M18.5,7.5c.275,0,.341-.159.146-.354L12.354.854a.5.5,0,0,0-.708,0L5.354,7.147c-.2.195-.129.354.146.354h3v10a1,1,0,0,0,1,1h5a1,1,0,0,0,1-1V7.5Z" }), createElement("path", { d: "M23.5,18.5v4a1,1,0,0,1-1,1H1.5a1,1,0,0,1-1-1v-4" }));
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

var useTriggerOpen = function (store) {
  var inputRef = useRef();
  var openFile = function () {
    var inputEle = inputRef.current;
    if (inputEle) {
      inputEle.click();
      if (store.get("triggerOpenFile")) {
        store.update("triggerOpenFile", false);
      }
    }
  };
  var handleOpenFileTriggered = function (trigger) {
    if (trigger) {
      openFile();
    }
  };
  useEffect(function () {
    store.subscribe("triggerOpenFile", handleOpenFileTriggered);
    return function () {
      store.unsubscribe("triggerOpenFile", handleOpenFileTriggered);
    };
  }, []);
  return {
    inputRef: inputRef,
    openFile: openFile,
  };
};

var TOOLTIP_OFFSET = { left: 0, top: 8 };
var OpenButton = function (_a) {
  var enableShortcuts = _a.enableShortcuts,
    store = _a.store,
    onClick = _a.onClick;
  var l10n = useContext(LocalizationContext).l10n;
  var label = l10n && l10n.open ? l10n.open.openFile : "Open file";
  var _b = useTriggerOpen(store),
    inputRef = _b.inputRef,
    openFile = _b.openFile;
  var ariaKeyShortcuts = enableShortcuts ? (isMac() ? "Meta+O" : "Ctrl+O") : "";
  return createElement(Tooltip, {
    ariaControlsSuffix: "open",
    position: Position.BottomCenter,
    target: createElement(
      "div",
      { className: "rpv-open__input-wrapper" },
      createElement("input", { accept: ".pdf", ref: inputRef, className: "rpv-open__input", multiple: false, tabIndex: -1, title: "", type: "file", onChange: onClick }),
      createElement(MinimalButton, { ariaKeyShortcuts: ariaKeyShortcuts, ariaLabel: label, testId: "open__button", onClick: openFile }, createElement(OpenFileIcon, null))
    ),
    content: function () {
      return label;
    },
    offset: TOOLTIP_OFFSET,
  });
};

var Open = function (_a) {
  var children = _a.children,
    enableShortcuts = _a.enableShortcuts,
    store = _a.store;
  var handleOpenFiles = function (e) {
    var files = e.target.files;
    if (!files || !files.length) {
      return;
    }
    var openFile = store.get("openFile");
    if (openFile) {
      openFile(files[0]);
    }
  };
  var defaultChildren = function (props) {
    return createElement(OpenButton, { enableShortcuts: enableShortcuts, store: store, onClick: props.onClick });
  };
  var render = children || defaultChildren;
  return render({
    onClick: handleOpenFiles,
  });
};

var OpenMenuItem = function (_a) {
  var store = _a.store,
    onClick = _a.onClick;
  var l10n = useContext(LocalizationContext).l10n;
  var label = l10n && l10n.open ? l10n.open.openFile : "Open file";
  var _b = useTriggerOpen(store),
    inputRef = _b.inputRef,
    openFile = _b.openFile;
  return createElement(
    MenuItem,
    { icon: createElement(OpenFileIcon, null), testId: "open__menu", onClick: openFile },
    createElement("div", { className: "rpv-open__input-wrapper" }, createElement("input", { accept: ".pdf", ref: inputRef, className: "rpv-open__input", multiple: false, tabIndex: -1, title: "", type: "file", onChange: onClick }), label)
  );
};

var ShortcutHandler = function (_a) {
  var containerRef = _a.containerRef,
    store = _a.store;
  var keydownHandler = function (e) {
    if (e.shiftKey || e.altKey || e.key !== "o") {
      return;
    }
    var isCommandPressed = isMac() ? e.metaKey : e.ctrlKey;
    if (!isCommandPressed) {
      return;
    }
    var containerEle = containerRef.current;
    if (!containerEle || !document.activeElement || !containerEle.contains(document.activeElement)) {
      return;
    }
    e.preventDefault();
    store.update("triggerOpenFile", true);
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

var useOpenPlugin = function (props) {
  var openPluginProps = useMemo(function () {
    return Object.assign({}, { enableShortcuts: true }, props);
  }, []);
  var store = useMemo(function () {
    return createStore({});
  }, []);
  var OpenDecorator = function (props) {
    return createElement(Open, __assign({ enableShortcuts: openPluginProps.enableShortcuts }, props, { store: store }));
  };
  var OpenButtonDecorator = function () {
    return createElement(OpenDecorator, null);
  };
  var OpenMenuItemDecorator = function () {
    return createElement(OpenDecorator, null, function (p) {
      return createElement(OpenMenuItem, { store: store, onClick: p.onClick });
    });
  };
  var renderViewer = function (props) {
    var slot = props.slot;
    var updateSlot = {
      children: createElement(Fragment, null, openPluginProps.enableShortcuts && createElement(ShortcutHandler, { containerRef: props.containerRef, store: store }), slot.children),
    };
    return __assign(__assign({}, slot), updateSlot);
  };
  return {
    install: function (pluginFunctions) {
      store.update("openFile", pluginFunctions.openFile);
    },
    renderViewer: renderViewer,
    Open: OpenDecorator,
    OpenButton: OpenButtonDecorator,
    OpenMenuItem: OpenMenuItemDecorator,
  };
};
export { OpenFileIcon, useOpenPlugin };
