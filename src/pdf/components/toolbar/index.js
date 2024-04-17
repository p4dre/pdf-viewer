import { useContext, useMemo, Fragment, useCallback, createElement } from "react";
import * as main from "../../../main";
import * as selectionMode from "../selection-mode";
import * as fullScreen from "../full-screen";
import * as getFile from "../get-file";
import * as open from "../open";
import * as pageNavigation from "../page-navigation";
import * as print from "../print";
import * as properties from "../properties";
import * as rotate from "../rotate";
import * as scrollMode from "../scroll-mode";
import * as search from "../search";
import * as theme from "../theme";
import * as zoom from "../zoom";

var MoreIcon = function () {
  return createElement(
    main.Icon,
    { size: 16 },
    createElement("path", {
      d: "M12,0.5c1.381,0,2.5,1.119,2.5,2.5S13.381,5.5,12,5.5S9.5,4.381,9.5,3S10.619,0.5,12,0.5z\n            M12,9.5\n            c1.381,0,2.5,1.119,2.5,2.5s-1.119,2.5-2.5,2.5S9.5,13.381,9.5,12S10.619,9.5,12,9.5z\n            M12,18.5c1.381,0,2.5,1.119,2.5,2.5\n            s-1.119,2.5-2.5,2.5S9.5,22.381,9.5,21S10.619,18.5,12,18.5z",
    })
  );
};

var PORTAL_OFFSET = { left: 0, top: 8 };
var MoreActionsPopover = function (_a) {
  var toolbarSlot = _a.toolbarSlot;
  var l10n = useContext(main.LocalizationContext).l10n;
  var direction = useContext(main.ThemeContext).direction;
  var portalPosition = direction === main.TextDirection.RightToLeft ? main.Position.BottomLeft : main.Position.BottomRight;
  var DownloadMenuItem = toolbarSlot.DownloadMenuItem,
    EnterFullScreenMenuItem = toolbarSlot.EnterFullScreenMenuItem,
    GoToFirstPageMenuItem = toolbarSlot.GoToFirstPageMenuItem,
    GoToLastPageMenuItem = toolbarSlot.GoToLastPageMenuItem,
    GoToNextPageMenuItem = toolbarSlot.GoToNextPageMenuItem,
    GoToPreviousPageMenuItem = toolbarSlot.GoToPreviousPageMenuItem,
    OpenMenuItem = toolbarSlot.OpenMenuItem,
    PrintMenuItem = toolbarSlot.PrintMenuItem,
    RotateBackwardMenuItem = toolbarSlot.RotateBackwardMenuItem,
    RotateForwardMenuItem = toolbarSlot.RotateForwardMenuItem,
    ShowPropertiesMenuItem = toolbarSlot.ShowPropertiesMenuItem,
    SwitchScrollModeMenuItem = toolbarSlot.SwitchScrollModeMenuItem,
    SwitchSelectionModeMenuItem = toolbarSlot.SwitchSelectionModeMenuItem,
    SwitchViewModeMenuItem = toolbarSlot.SwitchViewModeMenuItem,
    SwitchThemeMenuItem = toolbarSlot.SwitchThemeMenuItem;
  var renderTarget = function (toggle, opened) {
    var label = l10n && l10n.toolbar ? l10n.toolbar.moreActions : "More actions";
    return createElement(main.Tooltip, {
      ariaControlsSuffix: "toolbar-more-actions",
      position: portalPosition,
      target: createElement(main.MinimalButton, { ariaLabel: label, isSelected: opened, testId: "toolbar__more-actions-popover-target", onClick: toggle }, createElement(MoreIcon, null)),
      content: function () {
        return label;
      },
      offset: PORTAL_OFFSET,
    });
  };
  var renderContent = function (toggle) {
    return createElement(
      main.Menu,
      null,
      createElement("div", { className: "rpv-core__display--block rpv-core__display--hidden-medium" }, createElement(SwitchThemeMenuItem, { onClick: toggle })),
      createElement("div", { className: "rpv-core__display--block rpv-core__display--hidden-medium" }, createElement(EnterFullScreenMenuItem, { onClick: toggle })),
      createElement("div", { className: "rpv-core__display--block rpv-core__display--hidden-medium" }, createElement(OpenMenuItem, null)),
      createElement("div", { className: "rpv-core__display--block rpv-core__display--hidden-medium" }, createElement(PrintMenuItem, { onClick: toggle })),
      createElement("div", { className: "rpv-core__display--block rpv-core__display--hidden-medium" }, createElement(DownloadMenuItem, { onClick: toggle })),
      createElement("div", { className: "rpv-core__display--block rpv-core__display--hidden-medium" }, createElement(main.MenuDivider, null)),
      createElement(GoToFirstPageMenuItem, { onClick: toggle }),
      createElement("div", { className: "rpv-core__display--block rpv-core__display--hidden-medium" }, createElement(GoToPreviousPageMenuItem, { onClick: toggle })),
      createElement("div", { className: "rpv-core__display--block rpv-core__display--hidden-medium" }, createElement(GoToNextPageMenuItem, { onClick: toggle })),
      createElement(GoToLastPageMenuItem, { onClick: toggle }),
      createElement(main.MenuDivider, null),
      createElement(RotateForwardMenuItem, { onClick: toggle }),
      createElement(RotateBackwardMenuItem, { onClick: toggle }),
      createElement(main.MenuDivider, null),
      createElement(SwitchSelectionModeMenuItem, { mode: selectionMode.SelectionMode.Text, onClick: toggle }),
      createElement(SwitchSelectionModeMenuItem, { mode: selectionMode.SelectionMode.Hand, onClick: toggle }),
      createElement(main.MenuDivider, null),
      createElement(SwitchScrollModeMenuItem, { mode: main.ScrollMode.Page, onClick: toggle }),
      createElement(SwitchScrollModeMenuItem, { mode: main.ScrollMode.Vertical, onClick: toggle }),
      createElement(SwitchScrollModeMenuItem, { mode: main.ScrollMode.Horizontal, onClick: toggle }),
      createElement(SwitchScrollModeMenuItem, { mode: main.ScrollMode.Wrapped, onClick: toggle }),
      createElement(main.MenuDivider, null),
      createElement("div", { className: "rpv-core__display--hidden rpv-core__display--block-small" }, createElement(SwitchViewModeMenuItem, { mode: main.ViewMode.SinglePage, onClick: toggle })),
      createElement("div", { className: "rpv-core__display--hidden rpv-core__display--block-small" }, createElement(SwitchViewModeMenuItem, { mode: main.ViewMode.DualPage, onClick: toggle })),
      createElement("div", { className: "rpv-core__display--hidden rpv-core__display--block-small" }, createElement(SwitchViewModeMenuItem, { mode: main.ViewMode.DualPageWithCover, onClick: toggle })),
      createElement("div", { className: "rpv-core__display--hidden rpv-core__display--block-small" }, createElement(main.MenuDivider, null)),
      createElement(ShowPropertiesMenuItem, { onClick: toggle })
    );
  };
  return createElement(main.Popover, { ariaControlsSuffix: "toolbar-more-actions", ariaHasPopup: "menu", position: portalPosition, target: renderTarget, content: renderContent, offset: PORTAL_OFFSET, closeOnClickOutside: true, closeOnEscape: true });
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

var renderDefaultToolbar = function (transformToolbarSlot) {
  return function (defaultToolbarSlot) {
    var toolbarSlot = useMemo(function () {
      return transformToolbarSlot(defaultToolbarSlot);
    }, []);
    var direction = useContext(main.ThemeContext).direction;
    var isRtl = direction === main.TextDirection.RightToLeft;
    var CurrentPageInput = toolbarSlot.CurrentPageInput,
      Download = toolbarSlot.Download,
      EnterFullScreen = toolbarSlot.EnterFullScreen,
      GoToNextPage = toolbarSlot.GoToNextPage,
      GoToPreviousPage = toolbarSlot.GoToPreviousPage,
      NumberOfPages = toolbarSlot.NumberOfPages,
      Open = toolbarSlot.Open,
      Print = toolbarSlot.Print,
      ShowSearchPopover = toolbarSlot.ShowSearchPopover,
      SwitchTheme = toolbarSlot.SwitchTheme,
      Zoom = toolbarSlot.Zoom,
      ZoomIn = toolbarSlot.ZoomIn,
      ZoomOut = toolbarSlot.ZoomOut;
    return createElement(
      "div",
      {
        "data-testid": "toolbar",
        className: main.classNames({
          "rpv-toolbar": true,
          "rpv-toolbar--rtl": isRtl,
        }),
        role: "toolbar",
        "aria-orientation": "horizontal",
      },
      createElement(
        "div",
        { className: "rpv-toolbar__left" },
        createElement("div", { className: "rpv-toolbar__item" }, createElement(ShowSearchPopover, null)),
        createElement("div", { className: "rpv-core__display--hidden rpv-core__display--block-small" }, createElement("div", { className: "rpv-toolbar__item" }, createElement(GoToPreviousPage, null))),
        createElement("div", { className: "rpv-toolbar__item" }, createElement(CurrentPageInput, null), createElement("span", { className: "rpv-toolbar__label" }, createElement(NumberOfPages, null))),
        createElement("div", { className: "rpv-core__display--hidden rpv-core__display--block-small" }, createElement("div", { className: "rpv-toolbar__item" }, createElement(GoToNextPage, null)))
      ),
      createElement(
        "div",
        { className: "rpv-toolbar__center" },
        createElement("div", { className: "rpv-toolbar__item" }, createElement(ZoomOut, null)),
        createElement("div", { className: "rpv-core__display--hidden rpv-core__display--block-small" }, createElement("div", { className: "rpv-toolbar__item" }, createElement(Zoom, null))),
        createElement("div", { className: "rpv-toolbar__item" }, createElement(ZoomIn, null))
      ),
      createElement(
        "div",
        { className: "rpv-toolbar__right" },
        createElement("div", { className: "rpv-core__display--hidden rpv-core__display--block-medium" }, createElement("div", { className: "rpv-toolbar__item" }, createElement(SwitchTheme, null))),
        createElement("div", { className: "rpv-core__display--hidden rpv-core__display--block-medium" }, createElement("div", { className: "rpv-toolbar__item" }, createElement(EnterFullScreen, null))),
        createElement("div", { className: "rpv-core__display--hidden rpv-core__display--block-medium" }, createElement("div", { className: "rpv-toolbar__item" }, createElement(Open, null))),
        createElement("div", { className: "rpv-core__display--hidden rpv-core__display--block-medium" }, createElement("div", { className: "rpv-toolbar__item" }, createElement(Download, null))),
        createElement("div", { className: "rpv-core__display--hidden rpv-core__display--block-medium" }, createElement("div", { className: "rpv-toolbar__item" }, createElement(Print, null))),
        createElement("div", { className: "rpv-toolbar__item" }, createElement(MoreActionsPopover, { toolbarSlot: toolbarSlot }))
      )
    );
  };
};

var defaultTransform = function (slot) {
  var NumberOfPages = slot.NumberOfPages;
  return Object.assign({}, slot, {
    NumberOfPages: function () {
      return createElement(Fragment, null, "/ ", createElement(NumberOfPages, null));
    },
  });
};
var DefaultToobar = function (toolbarSlot) {
  return renderDefaultToolbar(defaultTransform)(toolbarSlot);
};

var Toolbar = function (_a) {
  var children = _a.children,
    slot = _a.slot;
  var render = children || DefaultToobar;
  return render(slot);
};

var useToolbarPlugin = function (props) {
  var fullScreenPluginInstance = fullScreen.useFullScreenPlugin(props ? props.fullScreenPlugin : {});
  var getFilePluginInstance = getFile.useGetFilePlugin(props ? props.useGetFilePlugin : {});
  var openPluginInstance = open.useOpenPlugin(props ? props.openPlugin : {});
  var pageNavigationPluginInstance = pageNavigation.usePageNavigationPlugin(props ? props.pageNavigationPlugin : {});
  var printPluginInstance = print.usePrintPlugin(props ? props.printPlugin : {});
  var propertiesPluginInstance = properties.usePropertiesPlugin();
  var rotatePluginInstance = rotate.useRotatePlugin();
  var scrollModePluginInstance = scrollMode.useScrollModePlugin();
  var searchPluginInstance = search.useSearchPlugin(props ? props.searchPlugin : {});
  var selectionModePluginInstance = selectionMode.useSelectionModePlugin(props ? props.selectionModePlugin : {});
  var themePluginInstance = theme.useThemePlugin();
  var zoomPluginInstance = zoom.useZoomPlugin(props ? props.zoomPlugin : {});
  var plugins = [
    fullScreenPluginInstance,
    getFilePluginInstance,
    openPluginInstance,
    pageNavigationPluginInstance,
    printPluginInstance,
    propertiesPluginInstance,
    rotatePluginInstance,
    scrollModePluginInstance,
    searchPluginInstance,
    selectionModePluginInstance,
    themePluginInstance,
    zoomPluginInstance,
  ];
  var ToolbarDecorator = useCallback(function (props) {
    var EnterFullScreen = fullScreenPluginInstance.EnterFullScreen,
      EnterFullScreenMenuItem = fullScreenPluginInstance.EnterFullScreenMenuItem;
    var Download = getFilePluginInstance.Download,
      DownloadMenuItem = getFilePluginInstance.DownloadMenuItem;
    var Open = openPluginInstance.Open,
      OpenMenuItem = openPluginInstance.OpenMenuItem;
    var CurrentPageInput = pageNavigationPluginInstance.CurrentPageInput,
      CurrentPageLabel = pageNavigationPluginInstance.CurrentPageLabel,
      GoToFirstPage = pageNavigationPluginInstance.GoToFirstPage,
      GoToFirstPageMenuItem = pageNavigationPluginInstance.GoToFirstPageMenuItem,
      GoToLastPage = pageNavigationPluginInstance.GoToLastPage,
      GoToLastPageMenuItem = pageNavigationPluginInstance.GoToLastPageMenuItem,
      GoToNextPage = pageNavigationPluginInstance.GoToNextPage,
      GoToNextPageMenuItem = pageNavigationPluginInstance.GoToNextPageMenuItem,
      GoToPreviousPage = pageNavigationPluginInstance.GoToPreviousPage,
      GoToPreviousPageMenuItem = pageNavigationPluginInstance.GoToPreviousPageMenuItem,
      NumberOfPages = pageNavigationPluginInstance.NumberOfPages;
    var Print = printPluginInstance.Print,
      PrintMenuItem = printPluginInstance.PrintMenuItem;
    var ShowProperties = propertiesPluginInstance.ShowProperties,
      ShowPropertiesMenuItem = propertiesPluginInstance.ShowPropertiesMenuItem;
    var Rotate = rotatePluginInstance.Rotate,
      RotateBackwardMenuItem = rotatePluginInstance.RotateBackwardMenuItem,
      RotateForwardMenuItem = rotatePluginInstance.RotateForwardMenuItem;
    var SwitchScrollMode = scrollModePluginInstance.SwitchScrollMode,
      SwitchScrollModeMenuItem = scrollModePluginInstance.SwitchScrollModeMenuItem,
      SwitchViewMode = scrollModePluginInstance.SwitchViewMode,
      SwitchViewModeMenuItem = scrollModePluginInstance.SwitchViewModeMenuItem;
    var Search = searchPluginInstance.Search,
      ShowSearchPopover = searchPluginInstance.ShowSearchPopover;
    var SwitchSelectionMode = selectionModePluginInstance.SwitchSelectionMode,
      SwitchSelectionModeMenuItem = selectionModePluginInstance.SwitchSelectionModeMenuItem;
    var SwitchTheme = themePluginInstance.SwitchTheme,
      SwitchThemeMenuItem = themePluginInstance.SwitchThemeMenuItem;
    var CurrentScale = zoomPluginInstance.CurrentScale,
      Zoom = zoomPluginInstance.Zoom,
      ZoomIn = zoomPluginInstance.ZoomIn,
      ZoomInMenuItem = zoomPluginInstance.ZoomInMenuItem,
      ZoomOut = zoomPluginInstance.ZoomOut,
      ZoomOutMenuItem = zoomPluginInstance.ZoomOutMenuItem;
    return createElement(
      Toolbar,
      __assign({}, props, {
        slot: {
          CurrentPageInput: CurrentPageInput,
          CurrentPageLabel: CurrentPageLabel,
          CurrentScale: CurrentScale,
          Download: Download,
          DownloadMenuItem: DownloadMenuItem,
          EnterFullScreen: EnterFullScreen,
          EnterFullScreenMenuItem: EnterFullScreenMenuItem,
          GoToFirstPage: GoToFirstPage,
          GoToFirstPageMenuItem: GoToFirstPageMenuItem,
          GoToLastPage: GoToLastPage,
          GoToLastPageMenuItem: GoToLastPageMenuItem,
          GoToNextPage: GoToNextPage,
          GoToNextPageMenuItem: GoToNextPageMenuItem,
          GoToPreviousPage: GoToPreviousPage,
          GoToPreviousPageMenuItem: GoToPreviousPageMenuItem,
          NumberOfPages: NumberOfPages,
          Open: Open,
          OpenMenuItem: OpenMenuItem,
          Print: Print,
          PrintMenuItem: PrintMenuItem,
          Rotate: Rotate,
          RotateBackwardMenuItem: RotateBackwardMenuItem,
          RotateForwardMenuItem: RotateForwardMenuItem,
          Search: Search,
          ShowProperties: ShowProperties,
          ShowPropertiesMenuItem: ShowPropertiesMenuItem,
          ShowSearchPopover: ShowSearchPopover,
          SwitchScrollMode: SwitchScrollMode,
          SwitchScrollModeMenuItem: SwitchScrollModeMenuItem,
          SwitchSelectionMode: SwitchSelectionMode,
          SwitchSelectionModeMenuItem: SwitchSelectionModeMenuItem,
          SwitchViewMode: SwitchViewMode,
          SwitchViewModeMenuItem: SwitchViewModeMenuItem,
          SwitchTheme: SwitchTheme,
          SwitchThemeMenuItem: SwitchThemeMenuItem,
          Zoom: Zoom,
          ZoomIn: ZoomIn,
          ZoomInMenuItem: ZoomInMenuItem,
          ZoomOut: ZoomOut,
          ZoomOutMenuItem: ZoomOutMenuItem,
        },
      })
    );
  }, []);
  return {
    fullScreenPluginInstance: fullScreenPluginInstance,
    getFilePluginInstance: getFilePluginInstance,
    openPluginInstance: openPluginInstance,
    pageNavigationPluginInstance: pageNavigationPluginInstance,
    printPluginInstance: printPluginInstance,
    propertiesPluginInstance: propertiesPluginInstance,
    rotatePluginInstance: rotatePluginInstance,
    scrollModePluginInstance: scrollModePluginInstance,
    searchPluginInstance: searchPluginInstance,
    selectionModePluginInstance: selectionModePluginInstance,
    themePluginInstance: themePluginInstance,
    zoomPluginInstance: zoomPluginInstance,
    install: function (pluginFunctions) {
      plugins.forEach(function (plugin) {
        if (plugin.install) {
          plugin.install(pluginFunctions);
        }
      });
    },
    renderPageLayer: function (renderProps) {
      return createElement(
        Fragment,
        null,
        plugins.map(function (plugin, idx) {
          return plugin.renderPageLayer ? createElement(Fragment, { key: idx }, plugin.renderPageLayer(renderProps)) : createElement(Fragment, { key: idx });
        })
      );
    },
    renderViewer: function (props) {
      var slot = props.slot;
      plugins.forEach(function (plugin) {
        if (plugin.renderViewer) {
          slot = plugin.renderViewer(__assign(__assign({}, props), { slot: slot }));
        }
      });
      return slot;
    },
    uninstall: function (pluginFunctions) {
      plugins.forEach(function (plugin) {
        if (plugin.uninstall) {
          plugin.uninstall(pluginFunctions);
        }
      });
    },
    onDocumentLoad: function (props) {
      plugins.forEach(function (plugin) {
        if (plugin.onDocumentLoad) {
          plugin.onDocumentLoad(props);
        }
      });
    },
    onAnnotationLayerRender: function (props) {
      plugins.forEach(function (plugin) {
        if (plugin.onAnnotationLayerRender) {
          plugin.onAnnotationLayerRender(props);
        }
      });
    },
    onTextLayerRender: function (props) {
      plugins.forEach(function (plugin) {
        if (plugin.onTextLayerRender) {
          plugin.onTextLayerRender(props);
        }
      });
    },
    onViewerStateChange: function (viewerState) {
      var newState = viewerState;
      plugins.forEach(function (plugin) {
        if (plugin.onViewerStateChange) {
          newState = plugin.onViewerStateChange(newState);
        }
      });
      return newState;
    },
    renderDefaultToolbar: renderDefaultToolbar,
    Toolbar: ToolbarDecorator,
  };
};

export { MoreActionsPopover, MoreIcon, useToolbarPlugin };
