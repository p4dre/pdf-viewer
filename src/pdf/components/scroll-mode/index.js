import { useRef, useState, useContext, useMemo, useEffect, createElement } from "react";
import Icon from "../../../components/Icon";
import LocalizationContext from "../../../context/LocalizationContext";
import { ScrollMode, ViewMode } from "../../../enums";
import Tooltip from "../../../components/Tooltip";
import { Position } from "../../../enums";
import MinimalButton from "../../../components/MinimalButton";
import MenuItem from "../../../components/MenuItem";
import { createStore } from "../../../utils";

var DualPageCoverViewModeIcon = function () {
  return createElement(Icon, { size: 16 }, createElement("rect", { x: "0.5", y: "0.497", width: "22", height: "22", rx: "1", ry: "1" }), createElement("line", { x1: "0.5", y1: "6.497", x2: "22.5", y2: "6.497" }), createElement("line", { x1: "11.5", y1: "6.497", x2: "11.5", y2: "22.497" }));
};

var DualPageViewModeIcon = function () {
  return createElement(Icon, { size: 16 }, createElement("rect", { x: "0.5", y: "0.497", width: "22", height: "22", rx: "1", ry: "1" }), createElement("line", { x1: "11.5", y1: "0.497", x2: "11.5", y2: "22.497" }));
};

var HorizontalScrollingIcon = function () {
  return createElement(
    Icon,
    { size: 16 },
    createElement("path", {
      d: "M6.5,21.5c0,0.552-0.448,1-1,1h-4c-0.552,0-1-0.448-1-1v-20c0-0.552,0.448-1,1-1h4c0.552,0,1,0.448,1,1V21.5z\n            M14.5,21.5c0,0.552-0.448,1-1,1h-4c-0.552,0-1-0.448-1-1v-20c0-0.552,0.448-1,1-1h4c0.552,0,1,0.448,1,1V21.5z\n            M22.5,21.5 c0,0.552-0.448,1-1,1h-4c-0.552,0-1-0.448-1-1v-20c0-0.552,0.448-1,1-1h4c0.552,0,1,0.448,1,1V21.5z",
    })
  );
};

var PageScrollingIcon = function () {
  return createElement(Icon, { size: 16 }, createElement("rect", { x: "0.5", y: "0.497", width: "22", height: "22", rx: "1", ry: "1" }));
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

var switchScrollMode = function (store, scrollMode) {
  store.get("switchScrollMode")(scrollMode);
  var currentViewMode = store.get("viewMode");
  if ((scrollMode === ScrollMode.Horizontal || scrollMode === ScrollMode.Wrapped) && currentViewMode !== ViewMode.SinglePage) {
    store.get("switchViewMode")(ViewMode.SinglePage);
  }
};

var VerticalScrollingIcon = function () {
  return createElement(
    Icon,
    { size: 16 },
    createElement("path", {
      d: "M23.5,5.5c0,0.552-0.448,1-1,1h-21c-0.552,0-1-0.448-1-1v-3c0-0.552,0.448-1,1-1h21c0.552,0,1,0.448,1,1V5.5z\n            M23.5,13.5c0,0.552-0.448,1-1,1h-21c-0.552,0-1-0.448-1-1v-3c0-0.552,0.448-1,1-1h21c0.552,0,1,0.448,1,1V13.5z\n            M23.5,21.5 c0,0.552-0.448,1-1,1h-21c-0.552,0-1-0.448-1-1v-3c0-0.552,0.448-1,1-1h21c0.552,0,1,0.448,1,1V21.5z",
    })
  );
};

var WrappedScrollingIcon = function () {
  return createElement(
    Icon,
    { size: 16 },
    createElement("path", {
      d: "M10.5,9.5c0,0.552-0.448,1-1,1h-8c-0.552,0-1-0.448-1-1v-8c0-0.552,0.448-1,1-1h8c0.552,0,1,0.448,1,1V9.5z\n            M23.5,9.5c0,0.552-0.448,1-1,1h-8c-0.552,0-1-0.448-1-1v-8c0-0.552,0.448-1,1-1h8c0.552,0,1,0.448,1,1V9.5z\n            M10.5,22.5 c0,0.552-0.448,1-1,1h-8c-0.552,0-1-0.448-1-1v-8c0-0.552,0.448-1,1-1h8c0.552,0,1,0.448,1,1V22.5z\n            M23.5,22.5c0,0.552-0.448,1-1,1 h-8c-0.552,0-1-0.448-1-1v-8c0-0.552,0.448-1,1-1h8c0.552,0,1,0.448,1,1V22.5z",
    })
  );
};

var SwitchScrollModeDecorator = function (_a) {
  var children = _a.children,
    mode = _a.mode,
    onClick = _a.onClick;
  var l10n = useContext(LocalizationContext).l10n;
  var label = "";
  var icon = createElement(VerticalScrollingIcon, null);
  switch (mode) {
    case ScrollMode.Horizontal:
      label = l10n && l10n.scrollMode ? l10n.scrollMode.horizontalScrolling : "Horizontal scrolling";
      icon = createElement(HorizontalScrollingIcon, null);
      break;
    case ScrollMode.Page:
      label = l10n && l10n.scrollMode ? l10n.scrollMode.pageScrolling : "Page scrolling";
      icon = createElement(PageScrollingIcon, null);
      break;
    case ScrollMode.Wrapped:
      label = l10n && l10n.scrollMode ? l10n.scrollMode.wrappedScrolling : "Wrapped scrolling";
      icon = createElement(WrappedScrollingIcon, null);
      break;
    case ScrollMode.Vertical:
    default:
      label = l10n && l10n.scrollMode ? l10n.scrollMode.verticalScrolling : "Vertical scrolling";
      icon = createElement(VerticalScrollingIcon, null);
      break;
  }
  return children({ icon: icon, label: label, onClick: onClick });
};

var TOOLTIP_OFFSET$1 = { left: 0, top: 8 };
var SwitchScrollModeButton = function (_a) {
  var isDisabled = _a.isDisabled,
    isSelected = _a.isSelected,
    mode = _a.mode,
    onClick = _a.onClick;
  var testId = "";
  switch (mode) {
    case ScrollMode.Horizontal:
      testId = "scroll-mode__horizontal-button";
      break;
    case ScrollMode.Page:
      testId = "scroll-mode__page-button";
      break;
    case ScrollMode.Wrapped:
      testId = "scroll-mode__wrapped-button";
      break;
    case ScrollMode.Vertical:
    default:
      testId = "scroll-mode__vertical-button";
      break;
  }
  return createElement(SwitchScrollModeDecorator, { mode: mode, onClick: onClick }, function (props) {
    return createElement(Tooltip, {
      ariaControlsSuffix: "scroll-mode-switch",
      position: Position.BottomCenter,
      target: createElement(MinimalButton, { ariaLabel: props.label, isDisabled: isDisabled, isSelected: isSelected, testId: testId, onClick: props.onClick }, props.icon),
      content: function () {
        return props.label;
      },
      offset: TOOLTIP_OFFSET$1,
    });
  });
};

var useScrollMode = function (store) {
  var _a = useState(store.get("scrollMode") || ScrollMode.Vertical),
    scrollMode = _a[0],
    setScrollMode = _a[1];
  var handleScrollModeChanged = function (currentScrollMode) {
    setScrollMode(currentScrollMode);
  };
  useEffect(function () {
    store.subscribe("scrollMode", handleScrollModeChanged);
    return function () {
      store.unsubscribe("scrollMode", handleScrollModeChanged);
    };
  }, []);
  return { scrollMode: scrollMode };
};

var useViewMode = function (store) {
  var _a = useState(store.get("viewMode") || ViewMode.SinglePage),
    viewMode = _a[0],
    setViewMode = _a[1];
  var handleViewModeChanged = function (currentViewMode) {
    setViewMode(currentViewMode);
  };
  useEffect(function () {
    store.subscribe("viewMode", handleViewModeChanged);
    return function () {
      store.unsubscribe("viewMode", handleViewModeChanged);
    };
  }, []);
  return { viewMode: viewMode };
};

var SwitchScrollMode = function (_a) {
  var children = _a.children,
    mode = _a.mode,
    store = _a.store;
  var viewMode = useViewMode(store).viewMode;
  var scrollMode = useScrollMode(store).scrollMode;
  var onClick = function () {
    switchScrollMode(store, mode);
  };
  var isSelected = scrollMode === mode;
  var isDisabled = (mode === ScrollMode.Horizontal || mode === ScrollMode.Wrapped) && viewMode !== ViewMode.SinglePage;
  var defaultChildren = function (props) {
    return createElement(SwitchScrollModeButton, { isDisabled: isDisabled, isSelected: isSelected, mode: props.mode, onClick: props.onClick });
  };
  var render = children || defaultChildren;
  return render({
    isDisabled: isDisabled,
    isSelected: isSelected,
    mode: mode,
    onClick: onClick,
  });
};

var SwitchScrollModeMenuItem = function (_a) {
  var isDisabled = _a.isDisabled,
    isSelected = _a.isSelected,
    mode = _a.mode,
    onClick = _a.onClick;
  var testId = "";
  switch (mode) {
    case ScrollMode.Horizontal:
      testId = "scroll-mode__horizontal-menu";
      break;
    case ScrollMode.Page:
      testId = "scroll-mode__page-menu";
      break;
    case ScrollMode.Wrapped:
      testId = "scroll-mode__wrapped-menu";
      break;
    case ScrollMode.Vertical:
    default:
      testId = "scroll-mode__vertical-menu";
      break;
  }
  return createElement(SwitchScrollModeDecorator, { mode: mode, onClick: onClick }, function (props) {
    return createElement(MenuItem, { checked: isSelected, icon: props.icon, isDisabled: isDisabled, testId: testId, onClick: props.onClick }, props.label);
  });
};

var switchViewMode = function (store, viewMode) {
  store.get("switchViewMode")(viewMode);
  var currentScrollMode = store.get("scrollMode");
  if ((currentScrollMode === ScrollMode.Horizontal || currentScrollMode === ScrollMode.Wrapped) && viewMode !== ViewMode.SinglePage) {
    store.get("switchScrollMode")(ScrollMode.Vertical);
  }
};

var SwitchViewModeDecorator = function (_a) {
  var children = _a.children,
    mode = _a.mode,
    onClick = _a.onClick;
  var l10n = useContext(LocalizationContext).l10n;
  var label = "";
  var icon = createElement(PageScrollingIcon, null);
  switch (mode) {
    case ViewMode.DualPage:
      label = l10n && l10n.scrollMode ? l10n.scrollMode.dualPage : "Dual page";
      icon = createElement(DualPageViewModeIcon, null);
      break;
    case ViewMode.DualPageWithCover:
      label = l10n && l10n.scrollMode ? l10n.scrollMode.dualPageCover : "Dual page with cover";
      icon = createElement(DualPageCoverViewModeIcon, null);
      break;
    case ViewMode.SinglePage:
    default:
      label = l10n && l10n.scrollMode ? l10n.scrollMode.singlePage : "Single page";
      icon = createElement(PageScrollingIcon, null);
      break;
  }
  return children({ icon: icon, label: label, onClick: onClick });
};

var TOOLTIP_OFFSET = { left: 0, top: 8 };
var SwitchViewModeButton = function (_a) {
  var isDisabled = _a.isDisabled,
    isSelected = _a.isSelected,
    mode = _a.mode,
    onClick = _a.onClick;
  var testId = "";
  switch (mode) {
    case ViewMode.DualPage:
      testId = "view-mode__dual-button";
      break;
    case ViewMode.DualPageWithCover:
      testId = "view-mode__dual-cover-button";
      break;
    case ViewMode.SinglePage:
    default:
      testId = "view-mode__single-button";
      break;
  }
  return createElement(SwitchViewModeDecorator, { mode: mode, onClick: onClick }, function (props) {
    return createElement(Tooltip, {
      ariaControlsSuffix: "view-mode-switch",
      position: Position.BottomCenter,
      target: createElement(MinimalButton, { ariaLabel: props.label, isDisabled: isDisabled, isSelected: isSelected, testId: testId, onClick: props.onClick }, props.icon),
      content: function () {
        return props.label;
      },
      offset: TOOLTIP_OFFSET,
    });
  });
};

var SwitchViewMode = function (_a) {
  var children = _a.children,
    mode = _a.mode,
    store = _a.store;
  var viewMode = useViewMode(store).viewMode;
  var scrollMode = useScrollMode(store).scrollMode;
  var onClick = function () {
    switchViewMode(store, mode);
  };
  var isSelected = viewMode === mode;
  var isDisabled = (scrollMode === ScrollMode.Horizontal || scrollMode === ScrollMode.Wrapped) && mode !== ViewMode.SinglePage;
  var defaultChildren = function (props) {
    return createElement(SwitchViewModeButton, { isDisabled: isDisabled, isSelected: isSelected, mode: props.mode, onClick: props.onClick });
  };
  var render = children || defaultChildren;
  return render({
    isDisabled: isDisabled,
    isSelected: isSelected,
    mode: mode,
    onClick: onClick,
  });
};

var SwitchViewModeMenuItem = function (_a) {
  var isDisabled = _a.isDisabled,
    isSelected = _a.isSelected,
    mode = _a.mode,
    onClick = _a.onClick;
  var testId = "";
  switch (mode) {
    case ViewMode.DualPage:
      testId = "view-mode__dual-menu";
      break;
    case ViewMode.DualPageWithCover:
      testId = "view-mode__dual-cover-menu";
      break;
    case ViewMode.SinglePage:
    default:
      testId = "view-mode__single-menu";
      break;
  }
  return createElement(SwitchViewModeDecorator, { mode: mode, onClick: onClick }, function (props) {
    return createElement(MenuItem, { checked: isSelected, icon: props.icon, isDisabled: isDisabled, testId: testId, onClick: props.onClick }, props.label);
  });
};

var useScrollModePlugin = function () {
  var store = useMemo(function () {
    return createStore({
      scrollMode: ScrollMode.Vertical,
      viewMode: ViewMode.SinglePage,
      switchScrollMode: function () {},
      switchViewMode: function () {},
    });
  }, []);
  var SwitchScrollModeDecorator = function (props) {
    return createElement(SwitchScrollMode, __assign({}, props, { store: store }));
  };
  var SwitchScrollModeButtonDecorator = function (props) {
    return createElement(SwitchScrollModeDecorator, { mode: props.mode }, function (p) {
      return createElement(SwitchScrollModeButton, {
        isDisabled: p.isDisabled,
        isSelected: p.isSelected,
        mode: p.mode,
        onClick: function () {
          p.onClick();
        },
      });
    });
  };
  var SwitchScrollModeMenuItemDecorator = function (props) {
    return createElement(SwitchScrollModeDecorator, { mode: props.mode }, function (p) {
      return createElement(SwitchScrollModeMenuItem, {
        isDisabled: p.isDisabled,
        isSelected: p.isSelected,
        mode: p.mode,
        onClick: function () {
          p.onClick();
          props.onClick();
        },
      });
    });
  };
  var SwitchViewModeDecorator = function (props) {
    return createElement(SwitchViewMode, __assign({}, props, { store: store }));
  };
  var SwitchViewModeButtonDecorator = function (props) {
    return createElement(SwitchViewModeDecorator, { mode: props.mode }, function (p) {
      return createElement(SwitchViewModeButton, {
        isDisabled: p.isDisabled,
        isSelected: p.isSelected,
        mode: p.mode,
        onClick: function () {
          p.onClick();
        },
      });
    });
  };
  var SwitchViewModeMenuItemDecorator = function (props) {
    return createElement(SwitchViewModeDecorator, { mode: props.mode }, function (p) {
      return createElement(SwitchViewModeMenuItem, {
        isDisabled: p.isDisabled,
        isSelected: p.isSelected,
        mode: p.mode,
        onClick: function () {
          p.onClick();
          props.onClick();
        },
      });
    });
  };
  return {
    install: function (pluginFunctions) {
      store.update("switchScrollMode", pluginFunctions.switchScrollMode);
      store.update("switchViewMode", pluginFunctions.switchViewMode);
    },
    onViewerStateChange: function (viewerState) {
      store.update("scrollMode", viewerState.scrollMode);
      store.update("viewMode", viewerState.viewMode);
      return viewerState;
    },
    switchScrollMode: function (scrollMode) {
      switchScrollMode(store, scrollMode);
    },
    switchViewMode: function (viewMode) {
      switchViewMode(store, viewMode);
    },
    SwitchScrollMode: SwitchScrollModeDecorator,
    SwitchScrollModeButton: SwitchScrollModeButtonDecorator,
    SwitchScrollModeMenuItem: SwitchScrollModeMenuItemDecorator,
    SwitchViewMode: SwitchViewModeDecorator,
    SwitchViewModeButton: SwitchViewModeButtonDecorator,
    SwitchViewModeMenuItem: SwitchViewModeMenuItemDecorator,
  };
};

export { DualPageCoverViewModeIcon, DualPageViewModeIcon, HorizontalScrollingIcon, PageScrollingIcon, VerticalScrollingIcon, WrappedScrollingIcon, useScrollModePlugin };
