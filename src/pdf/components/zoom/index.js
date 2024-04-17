import { useState, useEffect, useMemo, Fragment, useContext, createElement } from "react";
import * as main from "../../../main";

var ZoomInIcon = function () {
  return createElement(
    main.Icon,
    { ignoreDirection: true, size: 16 },
    createElement("path", { d: "M10.5,0.499c5.523,0,10,4.477,10,10s-4.477,10-10,10s-10-4.477-10-10S4.977,0.499,10.5,0.499z\n            M23.5,23.499\n            l-5.929-5.929\n            M5.5,10.499h10\n            M10.5,5.499v10" })
  );
};

var ZoomOutIcon = function () {
  return createElement(main.Icon, { ignoreDirection: true, size: 16 }, createElement("path", { d: "M10.5,0.499c5.523,0,10,4.477,10,10s-4.477,10-10,10s-10-4.477-10-10S4.977,0.499,10.5,0.499z\n            M23.5,23.499\n            l-5.929-5.929\n            M5.5,10.499h10" }));
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

var useZoom = function (store) {
  var _a = useState(store.get("scale") || 0),
    scale = _a[0],
    setScale = _a[1];
  var handleScaleChanged = function (currentScale) {
    setScale(currentScale);
  };
  useEffect(function () {
    store.subscribe("scale", handleScaleChanged);
    return function () {
      store.unsubscribe("scale", handleScaleChanged);
    };
  }, []);
  return { scale: scale };
};

var CurrentScale = function (_a) {
  var children = _a.children,
    store = _a.store;
  var scale = useZoom(store).scale;
  var defaultChildren = function (props) {
    return createElement(Fragment, null, "".concat(Math.round(props.scale * 100), "%"));
  };
  var render = children || defaultChildren;
  return render({ scale: scale });
};

var WHEEL_EVENT_OPTIONS = {
  passive: false,
};
var svgElement = null;
var createSvgElement = function () {
  return svgElement || (svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg"));
};
var PinchZoom = function (_a) {
  var pagesContainerRef = _a.pagesContainerRef,
    store = _a.store;
  var zoomTo = main.useDebounceCallback(function (scale) {
    var zoom = store.get("zoom");
    if (zoom) {
      zoom(scale);
    }
  }, 40);
  var handleWheelEvent = function (e) {
    if (!e.ctrlKey) {
      return;
    }
    e.preventDefault();
    var target = e.target;
    var rect = target.getBoundingClientRect();
    var scaleDiff = 1 - e.deltaY / 100;
    var originX = e.clientX - rect.left;
    var originY = e.clientY - rect.top;
    var currentScale = store.get("scale");
    var matrix = createSvgElement().createSVGMatrix().translate(originX, originY).scale(scaleDiff).translate(-originX, -originY).scale(currentScale);
    zoomTo(matrix.a);
  };
  main.useIsomorphicLayoutEffect(function () {
    var pagesContainer = pagesContainerRef.current;
    if (!pagesContainer) {
      return;
    }
    pagesContainer.addEventListener("wheel", handleWheelEvent, WHEEL_EVENT_OPTIONS);
    return function () {
      pagesContainer.removeEventListener("wheel", handleWheelEvent);
    };
  }, []);
  return createElement(Fragment, null);
};

var LEVELS = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1, 1.1, 1.3, 1.5, 1.7, 1.9, 2.1, 2.4, 2.7, 3.0, 3.3, 3.7, 4.1, 4.6, 5.1, 5.7, 6.3, 7.0, 7.7, 8.5, 9.4, 10];
var increase = function (currentLevel) {
  var found = LEVELS.find(function (item) {
    return item > currentLevel;
  });
  return found || currentLevel;
};
var decrease = function (currentLevel) {
  var found = LEVELS.findIndex(function (item) {
    return item >= currentLevel;
  });
  return found === -1 || found === 0 ? currentLevel : LEVELS[found - 1];
};

var ShortcutHandler = function (_a) {
  var containerRef = _a.containerRef,
    store = _a.store;
  var keydownHandler = function (e) {
    if (e.shiftKey || e.altKey) {
      return;
    }
    var isCommandPressed = main.isMac() ? e.metaKey : e.ctrlKey;
    if (!isCommandPressed) {
      return;
    }
    var containerEle = containerRef.current;
    if (!containerEle || !document.activeElement || !containerEle.contains(document.activeElement)) {
      return;
    }
    var zoom = store.get("zoom");
    if (!zoom) {
      return;
    }
    var scale = store.get("scale") || 1;
    var newScale = 1;
    switch (e.key) {
      case "-":
        newScale = decrease(scale);
        break;
      case "=":
        newScale = increase(scale);
        break;
      case "0":
        newScale = 1;
        break;
      default:
        newScale = scale;
        break;
    }
    if (newScale !== scale) {
      e.preventDefault();
      zoom(newScale);
    }
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

var DEFAULT_LEVELS = [0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4];
var PORTAL_OFFSET = { left: 0, top: 8 };
var ZoomPopover = function (_a) {
  var _b = _a.levels,
    levels = _b === void 0 ? DEFAULT_LEVELS : _b,
    scale = _a.scale,
    onZoom = _a.onZoom;
  var l10n = useContext(main.LocalizationContext).l10n;
  var direction = useContext(main.ThemeContext).direction;
  var isRtl = direction === main.TextDirection.RightToLeft;
  var getSpcialLevelLabel = function (level) {
    switch (level) {
      case main.SpecialZoomLevel.ActualSize:
        return l10n && l10n.zoom ? l10n.zoom.actualSize : "Actual size";
      case main.SpecialZoomLevel.PageFit:
        return l10n && l10n.zoom ? l10n.zoom.pageFit : "Page fit";
      case main.SpecialZoomLevel.PageWidth:
        return l10n && l10n.zoom ? l10n.zoom.pageWidth : "Page width";
    }
  };
  var zoomDocumentLabel = l10n && l10n.zoom ? l10n.zoom.zoomDocument : "Zoom document";
  var renderTarget = function (toggle) {
    var click = function () {
      toggle();
    };
    return createElement(
      main.MinimalButton,
      { ariaLabel: zoomDocumentLabel, testId: "zoom__popover-target", onClick: click },
      createElement(
        "span",
        { className: "rpv-zoom__popover-target" },
        createElement(
          "span",
          {
            "data-testid": "zoom__popover-target-scale",
            className: main.classNames({
              "rpv-zoom__popover-target-scale": true,
              "rpv-zoom__popover-target-scale--ltr": !isRtl,
              "rpv-zoom__popover-target-scale--rtl": isRtl,
            }),
          },
          Math.round(scale * 100),
          "%"
        ),
        createElement("span", { className: "rpv-zoom__popover-target-arrow" })
      )
    );
  };
  var renderContent = function (toggle) {
    return createElement(
      main.Menu,
      null,
      Object.keys(main.SpecialZoomLevel).map(function (k) {
        var level = k;
        var clickMenuItem = function () {
          toggle();
          onZoom(level);
        };
        return createElement(main.MenuItem, { key: level, onClick: clickMenuItem }, getSpcialLevelLabel(level));
      }),
      createElement(main.MenuDivider, null),
      levels.map(function (level) {
        var clickMenuItem = function () {
          toggle();
          onZoom(level);
        };
        return createElement(main.MenuItem, { key: level, onClick: clickMenuItem }, "".concat(Math.round(level * 100), "%"));
      })
    );
  };
  return createElement(main.Popover, { ariaControlsSuffix: "zoom", ariaHasPopup: "menu", position: main.Position.BottomCenter, target: renderTarget, content: renderContent, offset: PORTAL_OFFSET, closeOnClickOutside: true, closeOnEscape: true });
};

var Zoom = function (_a) {
  var children = _a.children,
    levels = _a.levels,
    store = _a.store;
  var scale = useZoom(store).scale;
  var zoomTo = function (newLevel) {
    var zoom = store.get("zoom");
    if (zoom) {
      zoom(newLevel);
    }
  };
  var defaultChildren = function (props) {
    return createElement(ZoomPopover, { levels: levels, scale: props.scale, onZoom: props.onZoom });
  };
  var render = children || defaultChildren;
  return render({
    scale: scale,
    onZoom: zoomTo,
  });
};

var TOOLTIP_OFFSET$1 = { left: 0, top: 8 };
var ZoomInButton = function (_a) {
  var enableShortcuts = _a.enableShortcuts,
    onClick = _a.onClick;
  var l10n = useContext(main.LocalizationContext).l10n;
  var label = l10n && l10n.zoom ? l10n.zoom.zoomIn : "Zoom in";
  var ariaKeyShortcuts = enableShortcuts ? (main.isMac() ? "Meta+=" : "Ctrl+=") : "";
  return createElement(main.Tooltip, {
    ariaControlsSuffix: "zoom-in",
    position: main.Position.BottomCenter,
    target: createElement(main.MinimalButton, { ariaKeyShortcuts: ariaKeyShortcuts, ariaLabel: label, testId: "zoom__in-button", onClick: onClick }, createElement(ZoomInIcon, null)),
    content: function () {
      return label;
    },
    offset: TOOLTIP_OFFSET$1,
  });
};

var ZoomIn = function (_a) {
  var children = _a.children,
    enableShortcuts = _a.enableShortcuts,
    store = _a.store;
  var scale = useZoom(store).scale;
  var zoomIn = function () {
    var zoom = store.get("zoom");
    if (zoom) {
      var newLevel = increase(scale);
      zoom(newLevel);
    }
  };
  var render = children || ZoomInButton;
  return render({
    enableShortcuts: enableShortcuts,
    onClick: zoomIn,
  });
};

var ZoomInMenuItem = function (_a) {
  var onClick = _a.onClick;
  var l10n = useContext(main.LocalizationContext).l10n;
  var label = l10n && l10n.zoom ? l10n.zoom.zoomIn : "Zoom in";
  return createElement(main.MenuItem, { icon: createElement(ZoomInIcon, null), testId: "zoom__in-menu", onClick: onClick }, label);
};

var TOOLTIP_OFFSET = { left: 0, top: 8 };
var ZoomOutButton = function (_a) {
  var enableShortcuts = _a.enableShortcuts,
    onClick = _a.onClick;
  var l10n = useContext(main.LocalizationContext).l10n;
  var label = l10n && l10n.zoom ? l10n.zoom.zoomOut : "Zoom out";
  var ariaKeyShortcuts = enableShortcuts ? (main.isMac() ? "Meta+-" : "Ctrl+-") : "";
  return createElement(main.Tooltip, {
    ariaControlsSuffix: "zoom-out",
    position: main.Position.BottomCenter,
    target: createElement(main.MinimalButton, { ariaKeyShortcuts: ariaKeyShortcuts, ariaLabel: label, testId: "zoom__out-button", onClick: onClick }, createElement(ZoomOutIcon, null)),
    content: function () {
      return label;
    },
    offset: TOOLTIP_OFFSET,
  });
};

var ZoomOut = function (_a) {
  var children = _a.children,
    enableShortcuts = _a.enableShortcuts,
    store = _a.store;
  var scale = useZoom(store).scale;
  var zoomIn = function () {
    var zoom = store.get("zoom");
    if (zoom) {
      var newLevel = decrease(scale);
      zoom(newLevel);
    }
  };
  var render = children || ZoomOutButton;
  return render({
    enableShortcuts: enableShortcuts,
    onClick: zoomIn,
  });
};

var ZoomOutMenuItem = function (_a) {
  var onClick = _a.onClick;
  var l10n = useContext(main.LocalizationContext).l10n;
  var label = l10n && l10n.zoom ? l10n.zoom.zoomOut : "Zoom out";
  return createElement(main.MenuItem, { icon: createElement(ZoomOutIcon, null), testId: "zoom__out-menu", onClick: onClick }, label);
};

var useZoomPlugin = function (props) {
  var zoomPluginProps = useMemo(function () {
    return Object.assign({}, { enableShortcuts: true }, props);
  }, []);
  var store = useMemo(function () {
    return main.createStore({});
  }, []);
  var CurrentScaleDecorator = function (props) {
    return createElement(CurrentScale, __assign({}, props, { store: store }));
  };
  var ZoomInDecorator = function (props) {
    return createElement(ZoomIn, __assign({ enableShortcuts: zoomPluginProps.enableShortcuts }, props, { store: store }));
  };
  var ZoomInButtonDecorator = function () {
    return createElement(ZoomInDecorator, null, function (props) {
      return createElement(ZoomInButton, __assign({}, props));
    });
  };
  var ZoomInMenuItemDecorator = function (props) {
    return createElement(ZoomInDecorator, null, function (p) {
      return createElement(ZoomInMenuItem, {
        onClick: function () {
          p.onClick();
          props.onClick();
        },
      });
    });
  };
  var ZoomOutDecorator = function (props) {
    return createElement(ZoomOut, __assign({ enableShortcuts: zoomPluginProps.enableShortcuts }, props, { store: store }));
  };
  var ZoomOutButtonDecorator = function () {
    return createElement(ZoomOutDecorator, null, function (props) {
      return createElement(ZoomOutButton, __assign({}, props));
    });
  };
  var ZoomOutMenuItemDecorator = function (props) {
    return createElement(ZoomOutDecorator, null, function (p) {
      return createElement(ZoomOutMenuItem, {
        onClick: function () {
          p.onClick();
          props.onClick();
        },
      });
    });
  };
  var ZoomDecorator = function (props) {
    return createElement(Zoom, __assign({}, props, { store: store }));
  };
  var ZoomPopoverDecorator = function (zoomPopverProps) {
    return createElement(ZoomDecorator, null, function (props) {
      return createElement(ZoomPopover, __assign({ levels: zoomPopverProps === null || zoomPopverProps === void 0 ? void 0 : zoomPopverProps.levels }, props));
    });
  };
  var renderViewer = function (props) {
    var slot = props.slot;
    if (!zoomPluginProps.enableShortcuts) {
      return slot;
    }
    var updateSlot = {
      children: createElement(Fragment, null, createElement(ShortcutHandler, { containerRef: props.containerRef, store: store }), createElement(PinchZoom, { pagesContainerRef: props.pagesContainerRef, store: store }), slot.children),
    };
    return __assign(__assign({}, slot), updateSlot);
  };
  return {
    renderViewer: renderViewer,
    install: function (pluginFunctions) {
      store.update("zoom", pluginFunctions.zoom);
    },
    onViewerStateChange: function (viewerState) {
      store.update("scale", viewerState.scale);
      return viewerState;
    },
    zoomTo: function (scale) {
      var zoom = store.get("zoom");
      if (zoom) {
        zoom(scale);
      }
    },
    CurrentScale: CurrentScaleDecorator,
    ZoomIn: ZoomInDecorator,
    ZoomInButton: ZoomInButtonDecorator,
    ZoomInMenuItem: ZoomInMenuItemDecorator,
    ZoomOut: ZoomOutDecorator,
    ZoomOutButton: ZoomOutButtonDecorator,
    ZoomOutMenuItem: ZoomOutMenuItemDecorator,
    Zoom: ZoomDecorator,
    ZoomPopover: ZoomPopoverDecorator,
  };
};

export { ZoomInIcon, ZoomOutIcon, useZoomPlugin };
