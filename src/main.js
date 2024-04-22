"use strict";
import { useState, useEffect, useLayoutEffect, useMemo, useRef, createElement } from "react";
import * as PdfJsApi from "pdfjs-dist/build/pdf";
import DocumentLoader from "./components/DocumentLoader";
import Inner from "./components/Inner";
import useIntersectionObserver from "./hooks/useIntersectionObserver";
import usePrevious from "./hooks/usePrevious";
import { FullScreenMode, TextDirection, SpecialZoomLevel, ViewMode, ScrollMode } from "./enums";
import ThemeContext from "./context/ThemeContext";
import LocalizationContext from "./context/LocalizationContext";
import Spinner from "./components/Spinner";
import { getPage } from "./utils";

PdfJsApi.GlobalWorkerOptions.workerSrc = "https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js";

var core = {
  askingPassword: {
    requirePasswordToOpen: "This document requires a password to open",
    submit: "Submit",
  },
  wrongPassword: {
    tryAgain: "The password is wrong. Please try again",
  },
  pageLabel: "Page {{pageIndex}}",
};
var enUs = {
  core: core,
};

var DefaultLocalization = enUs;

const SCROLL_BAR_WIDTH = 17;
const PAGE_PADDING = 8;
const calculateScale = function (container, pageHeight, pageWidth, scale, viewMode, numPages) {
  var w = pageWidth;
  switch (true) {
    case viewMode === ViewMode.DualPageWithCover && numPages >= 3:
    case viewMode === ViewMode.DualPage && numPages >= 3:
      w = 2 * pageWidth;
      break;
    default:
      w = pageWidth;
      break;
  }
  switch (scale) {
    case SpecialZoomLevel.ActualSize:
      return 1;
    case SpecialZoomLevel.PageFit:
      return Math.min((container.clientWidth - SCROLL_BAR_WIDTH) / w, (container.clientHeight - 2 * PAGE_PADDING) / pageHeight);
    case SpecialZoomLevel.PageWidth:
      return (container.clientWidth - SCROLL_BAR_WIDTH) / w;
  }
};

var LEVELS = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1, 1.1, 1.3, 1.5, 1.7, 1.9, 2.1, 2.4, 2.7, 3.0, 3.3, 3.7, 4.1, 4.6, 5.1, 5.7, 6.3, 7.0, 7.7, 8.5, 9.4, 10];
var decrease = function (currentLevel) {
  var found = LEVELS.findIndex(function (item) {
    return item >= currentLevel;
  });
  return found === -1 || found === 0 ? currentLevel : LEVELS[found - 1];
};

const RESERVE_HEIGHT = 45;
const RESERVE_WIDTH = 45;
const PageSizeCalculator = function (props) {
  const { defaultScale, doc, render, scrollMode, viewMode } = props;
  const pagesRef = useRef();
  const [state, setState] = useState({
    pageSizes: [],
    scale: 0,
  });
  useLayoutEffect(() => {
    var queryPageSizes = Array(doc.numPages)
      .fill(0)
      .map(function (_, i) {
        return new Promise(function (resolve, _) {
          getPage(doc, i).then(function (pdfPage) {
            var viewport = pdfPage.getViewport({ scale: 1 });
            resolve({
              pageHeight: viewport.height,
              pageWidth: viewport.width,
              rotation: viewport.rotation,
            });
          });
        });
      });
    Promise.all(queryPageSizes).then(function (pageSizes) {
      var pagesEle = pagesRef.current;
      if (!pagesEle || pageSizes.length === 0) {
        return;
      }
      var w = pageSizes[0].pageWidth;
      var h = pageSizes[0].pageHeight;
      var parentEle = pagesEle.parentElement;
      var scaleWidth = (parentEle.clientWidth - RESERVE_WIDTH) / w;
      var scaleHeight = (parentEle.clientHeight - RESERVE_HEIGHT) / h;
      var scaled = scaleWidth;
      switch (scrollMode) {
        case ScrollMode.Horizontal:
          scaled = Math.min(scaleWidth, scaleHeight);
          break;
        case ScrollMode.Vertical:
        default:
          scaled = scaleWidth;
          break;
      }
      var scale = defaultScale ? (typeof defaultScale === "string" ? calculateScale(parentEle, h, w, defaultScale, viewMode, doc.numPages) : defaultScale) : decrease(scaled);
      setState({ pageSizes: pageSizes, scale: scale });
    });
  }, [doc.loadingTask.docId]);
  return state.pageSizes.length === 0 || state.scale === 0
    ? createElement(
        "div",
        {
          className: "rpv-core__page-size-calculator",
          "data-testid": "core__page-size-calculating",
          ref: pagesRef,
        },
        createElement(Spinner, null)
      )
    : render(state.pageSizes, state.scale);
};

const isDarkMode = function () {
  return typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
};

const useWithTheme = function (theme, onSwitchTheme) {
  var initialTheme = useMemo(function () {
    return theme === "auto" ? (isDarkMode() ? "dark" : "light") : theme;
  }, []);
  var _a = useState(initialTheme),
    currentTheme = _a[0],
    setCurrentTheme = _a[1];
  var prevTheme = usePrevious(currentTheme);
  useEffect(function () {
    if (theme !== "auto") {
      return;
    }
    var media = window.matchMedia("(prefers-color-scheme: dark)");
    var handler = function (e) {
      setCurrentTheme(e.matches ? "dark" : "light");
    };
    media.addEventListener("change", handler);
    return function () {
      return media.removeEventListener("change", handler);
    };
  }, []);
  useEffect(
    function () {
      if (currentTheme !== prevTheme && onSwitchTheme) {
        onSwitchTheme(currentTheme);
      }
    },
    [currentTheme]
  );
  useEffect(
    function () {
      if (theme !== currentTheme) {
        setCurrentTheme(theme);
      }
    },
    [theme]
  );
  return {
    currentTheme: currentTheme,
    setCurrentTheme: setCurrentTheme,
  };
};

const isSameUrl = function (a, b) {
  var typeA = typeof a;
  var typeB = typeof b;
  if (typeA === "string" && typeB === "string" && a === b) {
    return true;
  }
  if (typeA === "object" && typeB === "object") {
    return (
      a.length === b.length &&
      a.every(function (v, i) {
        return v === b[i];
      })
    );
  }
  return false;
};

var NUM_OVERSCAN_PAGES = 3;
var DEFAULT_RENDER_RANGE = function (visiblePagesRange) {
  return {
    startPage: visiblePagesRange.startPage - NUM_OVERSCAN_PAGES,
    endPage: visiblePagesRange.endPage + NUM_OVERSCAN_PAGES,
  };
};
const Player = function (props) {
  const {
    options,
    characterMap,
    defaultScale,
    enableSmoothScroll = false,
    fileUrl,
    httpHeaders = {},
    initialPage = 0,
    pageLayout,
    initialRotation = 0,
    localization,
    plugins = [],
    renderError,
    renderLoader,
    renderPage,
    renderProtectedView,
    scrollMode = ScrollMode.Vertical,
    setRenderRange = DEFAULT_RENDER_RANGE,
    transformGetDocumentParams,
    theme = { direction: TextDirection.LeftToRight, theme: "light" },
    viewMode = ViewMode.SinglePage,
    withCredentials = false,
    onDocumentAskPassword,
    onDocumentLoad = () => {},
    onPageChange = () => {},
    onRotate = () => {},
    onRotatePage = () => {},
    onSwitchTheme = () => {},
    onZoom = () => {},
  } = props;
  const [file, setFile] = useState({
    data: fileUrl,
    name: typeof fileUrl === "string" ? fileUrl : "",
    shouldLoad: false,
  });
  const openFile = (fileName, data) => {
    setFile({
      data: data,
      name: fileName,
      shouldLoad: true,
    });
  };

  const [visible, setVisible] = useState(false);
  const prevFile = usePrevious(file);
  useEffect(() => {
    if (!isSameUrl(prevFile.data, fileUrl)) {
      setFile({
        data: fileUrl,
        name: typeof fileUrl === "string" ? fileUrl : "",
        shouldLoad: visible,
      });
    }
  }, [fileUrl, visible]);
  const visibilityChanged = (params) => {
    setVisible(params.isVisible);
    if (params.isVisible) {
      setFile(function (currentFile) {
        return Object.assign({}, currentFile, { shouldLoad: true });
      });
    }
  };
  const containerRef = useIntersectionObserver({
    onVisibilityChanged: visibilityChanged,
  });
  const themeProps = typeof theme === "string" ? { direction: TextDirection.LeftToRight, theme: theme } : theme;
  const [l10n, setL10n] = useState(localization || DefaultLocalization);
  const localizationContext = { l10n: l10n, setL10n: setL10n };
  const themeContext = Object.assign({}, { direction: themeProps.direction }, useWithTheme(themeProps.theme || "light", onSwitchTheme));
  useEffect(() => {
    if (localization) {
      setL10n(localization);
    }
  }, [localization]);

  const renderPageCalculator = (doc) => {
    return (
      <PageSizeCalculator
        defaultScale={defaultScale}
        doc={doc}
        render={(pageSizes, initialScale) => {
          return (
            <Inner
              currentFile={{ data: file.data, name: file.name }}
              defaultScale={defaultScale}
              doc={doc}
              enableSmoothScroll={enableSmoothScroll}
              initialPage={initialPage}
              initialRotation={initialRotation}
              initialScale={initialScale}
              pageLayout={pageLayout}
              pageSizes={pageSizes}
              plugins={plugins}
              renderPage={renderPage}
              scrollMode={scrollMode}
              setRenderRange={setRenderRange}
              viewMode={viewMode}
              viewerState={{
                file: file,
                fullScreenMode: FullScreenMode.Normal,
                pageIndex: -1,
                pageHeight: pageSizes[0].pageHeight,
                pageWidth: pageSizes[0].pageWidth,
                pagesRotation: new Map(),
                rotation: initialRotation,
                scale: initialScale,
                scrollMode: scrollMode,
                viewMode: viewMode,
              }}
              onDocumentLoad={onDocumentLoad}
              onOpenFile={openFile}
              onPageChange={onPageChange}
              onRotate={onRotate}
              onRotatePage={onRotatePage}
              onZoom={onZoom}
            />
          );
        }}
        scrollMode={scrollMode}
        viewMode={viewMode}
      />
    );
  };
  return (
    <LocalizationContext.Provider value={localizationContext}>
      <ThemeContext.Provider value={themeContext}>
        <div ref={containerRef} className={"rpv-core__viewer rpv-core__viewer--".concat(themeContext.currentTheme)} style={{ height: "100%", width: "100%" }}>
          {file.shouldLoad && (
            <DocumentLoader
              render={(doc) => renderPageCalculator(doc)}
              characterMap={characterMap}
              file={file.data}
              httpHeaders={httpHeaders}
              renderError={renderError}
              renderLoader={renderLoader}
              renderProtectedView={renderProtectedView}
              transformGetDocumentParams={transformGetDocumentParams}
              withCredentials={withCredentials}
              onDocumentAskPassword={onDocumentAskPassword}
            />
          )}
        </div>
      </ThemeContext.Provider>
    </LocalizationContext.Provider>
  );
};

export default Player;
