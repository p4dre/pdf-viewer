import { useMemo, useEffect, useContext, createElement } from "react";
import * as main from "../../../main";

var RotateBackwardIcon = function () {
  return createElement(
    main.Icon,
    { ignoreDirection: true, size: 16 },
    createElement("path", {
      d: "M3.434,10.537c0.141-0.438,0.316-0.864,0.523-1.274\n            M3.069,14.425C3.023,14.053,3,13.679,3,13.305 c0-0.291,0.014-0.579,0.041-0.863\n            M4.389,18.111c-0.341-0.539-0.623-1.112-0.843-1.711\n            M7.163,20.9 c-0.543-0.345-1.048-0.747-1.506-1.2\n            M10.98,22.248c-0.65-0.074-1.29-0.218-1.909-0.431\n            M10,4.25h2 c4.987,0.015,9.017,4.069,9.003,9.055c-0.013,4.581-3.456,8.426-8.008,8.945\n            M13.5,1.75L10,4.25l3.5,2.5",
    })
  );
};

var RotateForwardIcon = function () {
  return createElement(
    main.Icon,
    { ignoreDirection: true, size: 16 },
    createElement("path", {
      d: "M20.566,10.537c-0.141-0.438-0.316-0.864-0.523-1.274\n            M20.931,14.425C20.977,14.053,21,13.679,21,13.305 c0-0.291-0.014-0.579-0.041-0.863\n            M19.611,18.111c0.341-0.539,0.624-1.114,0.843-1.713\n            M16.837,20.9 c0.543-0.345,1.048-0.747,1.506-1.2\n            M13.02,22.248c0.65-0.074,1.29-0.218,1.909-0.431\n            M14,4.25h-2 c-4.987,0.015-9.017,4.069-9.003,9.055c0.013,4.581,3.456,8.426,8.008,8.945\n            M10.5,1.75l3.5,2.5l-3.5,2.5",
    })
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
var RotateButton = function (_a) {
  var direction = _a.direction,
    onClick = _a.onClick;
  var l10n = useContext(main.LocalizationContext).l10n;
  var backwardLabel = l10n && l10n.rotate ? l10n.rotate.rotateBackward : "Rotate counterclockwise";
  var forwardLabel = l10n && l10n.rotate ? l10n.rotate.rotateForward : "Rotate clockwise";
  var label = direction === main.RotateDirection.Backward ? backwardLabel : forwardLabel;
  var icon = direction === main.RotateDirection.Backward ? createElement(RotateBackwardIcon, null) : createElement(RotateForwardIcon, null);
  return createElement(main.Tooltip, {
    ariaControlsSuffix: "rotate",
    position: main.Position.BottomCenter,
    target: createElement(main.MinimalButton, { ariaLabel: label, testId: direction === main.RotateDirection.Backward ? "rotate__backward-button" : "rotate__forward-button", onClick: onClick }, icon),
    content: function () {
      return label;
    },
    offset: TOOLTIP_OFFSET,
  });
};

var Rotate = function (_a) {
  var children = _a.children,
    direction = _a.direction,
    store = _a.store;
  var onClick = function () {
    var rotate = store.get("rotate");
    if (rotate) {
      rotate(direction);
    }
  };
  var defaultChildren = function (props) {
    return createElement(RotateButton, { direction: props.direction, onClick: props.onClick });
  };
  var render = children || defaultChildren;
  return render({
    direction: direction,
    onClick: onClick,
  });
};

var RotateMenuItem = function (_a) {
  var direction = _a.direction,
    onClick = _a.onClick;
  var l10n = useContext(main.LocalizationContext).l10n;
  var backwardLabel = l10n && l10n.rotate ? l10n.rotate.rotateBackward : "Rotate counterclockwise";
  var forwardLabel = l10n && l10n.rotate ? l10n.rotate.rotateForward : "Rotate clockwise";
  var label = direction === main.RotateDirection.Backward ? backwardLabel : forwardLabel;
  var icon = direction === main.RotateDirection.Backward ? createElement(RotateBackwardIcon, null) : createElement(RotateForwardIcon, null);
  return createElement(main.MenuItem, { icon: icon, testId: direction === main.RotateDirection.Backward ? "rotate__backward-menu" : "rotate__forward-menu", onClick: onClick }, label);
};

var RotatePage = function (_a) {
  var children = _a.children,
    store = _a.store;
  var onRotatePage = function (pageIndex, direction) {
    var rotatePage = store.get("rotatePage");
    if (rotatePage) {
      rotatePage(pageIndex, direction);
    }
  };
  return children({
    onRotatePage: onRotatePage,
  });
};

var useRotatePlugin = function () {
  var store = useMemo(function () {
    return main.createStore();
  }, []);
  var RotateDecorator = function (props) {
    return createElement(Rotate, __assign({}, props, { store: store }));
  };
  var RotateBackwardButtonDecorator = function () {
    return createElement(RotateDecorator, { direction: main.RotateDirection.Backward }, function (props) {
      return createElement(RotateButton, __assign({}, props));
    });
  };
  var RotateBackwardMenuItemDecorator = function (props) {
    return createElement(RotateDecorator, { direction: main.RotateDirection.Backward }, function (p) {
      return createElement(RotateMenuItem, {
        direction: p.direction,
        onClick: function () {
          p.onClick();
          props.onClick();
        },
      });
    });
  };
  var RotateForwardButtonDecorator = function () {
    return createElement(RotateDecorator, { direction: main.RotateDirection.Forward }, function (props) {
      return createElement(RotateButton, __assign({}, props));
    });
  };
  var RotateForwardMenuItemDecorator = function (props) {
    return createElement(RotateDecorator, { direction: main.RotateDirection.Forward }, function (p) {
      return createElement(RotateMenuItem, {
        direction: p.direction,
        onClick: function () {
          p.onClick();
          props.onClick();
        },
      });
    });
  };
  var RotatePageDecorator = function (props) {
    return createElement(RotatePage, __assign({}, props, { store: store }));
  };
  return {
    install: function (pluginFunctions) {
      store.update("rotate", pluginFunctions.rotate);
      store.update("rotatePage", pluginFunctions.rotatePage);
    },
    Rotate: RotateDecorator,
    RotateBackwardButton: RotateBackwardButtonDecorator,
    RotateBackwardMenuItem: RotateBackwardMenuItemDecorator,
    RotateForwardButton: RotateForwardButtonDecorator,
    RotateForwardMenuItem: RotateForwardMenuItemDecorator,
    RotatePage: RotatePageDecorator,
  };
};

export { RotateBackwardIcon, RotateForwardIcon, useRotatePlugin };
