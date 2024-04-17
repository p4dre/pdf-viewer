import { useRef, useState, createElement, Fragment, useEffect, useMemo, useContext, createContext, useCallback } from "react";
import * as main from "../../../main";

let ThumbnailDirection;
(function (ThumbnailDirection) {
  ThumbnailDirection["Horizontal"] = "Horizontal";
  ThumbnailDirection["Vertical"] = "Vertical";
})(ThumbnailDirection || (ThumbnailDirection = {}));

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

var CoverInner = function (_a) {
  var doc = _a.doc,
    getPageIndex = _a.getPageIndex,
    renderSpinner = _a.renderSpinner,
    store = _a.store,
    width = _a.width;
  var numPages = doc.numPages;
  var targetPage = getPageIndex ? getPageIndex({ numPages: numPages }) : 0;
  var normalizePage = Math.max(0, Math.min(targetPage, numPages - 1));
  var initialPagesRotation = store.get("pagesRotation") || new Map();
  var initialTargetPageRotation = initialPagesRotation.has(normalizePage) ? initialPagesRotation.get(normalizePage) : 0;
  var _b = useState(""),
    src = _b[0],
    setSrc = _b[1];
  var isMounted = main.useIsMounted();
  var renderTask = useRef();
  var _c = useState(store.get("rotation") || 0),
    rotation = _c[0],
    setRotation = _c[1];
  var _d = useState(initialTargetPageRotation),
    pageRotation = _d[0],
    setPageRotation = _d[1];
  var _e = useState(false),
    isVisible = _e[0],
    setVisible = _e[1];
  var handlePagesRotationChanged = function (rotations) {
    var pageRotation = rotations.has(normalizePage) ? rotations.get(normalizePage) : 0;
    setPageRotation(pageRotation);
  };
  var handleRotationChanged = function (currentRotation) {
    setRotation(currentRotation);
  };
  var handleVisibilityChanged = function (params) {
    setVisible(params.isVisible);
  };
  var containerRef = main.useIntersectionObserver({
    onVisibilityChanged: handleVisibilityChanged,
  });
  useEffect(
    function () {
      if (!isVisible) {
        return;
      }
      var containerEle = containerRef.current;
      if (!containerEle) {
        return;
      }
      setSrc("");
      main.getPage(doc, normalizePage).then(function (page) {
        var viewport = page.getViewport({ scale: 1 });
        var viewportRotation = viewport.rotation;
        var rotationValue = (viewportRotation + rotation + pageRotation) % 360;
        var isVertical = Math.abs(rotation + pageRotation) % 180 === 0;
        var w = isVertical ? viewport.width : viewport.height;
        var h = isVertical ? viewport.height : viewport.width;
        var canvas = document.createElement("canvas");
        var canvasContext = canvas.getContext("2d", { alpha: false });
        var containerWidth = containerEle.clientWidth;
        var containerHeight = containerEle.clientHeight;
        var scaled = width ? width / w : Math.min(containerWidth / w, containerHeight / h);
        var canvasWidth = scaled * w;
        var canvasHeight = scaled * h;
        canvas.height = canvasHeight;
        canvas.width = canvasWidth;
        canvas.style.opacity = "0";
        var renderViewport = page.getViewport({
          rotation: rotationValue,
          scale: scaled,
        });
        renderTask.current = page.render({ canvasContext: canvasContext, viewport: renderViewport });
        renderTask.current.promise.then(
          function () {
            isMounted.current && setSrc(canvas.toDataURL());
            canvas.width = 0;
            canvas.height = 0;
          },
          function () {}
        );
      });
    },
    [pageRotation, isVisible]
  );
  useEffect(function () {
    store.subscribe("pagesRotation", handlePagesRotationChanged);
    store.subscribe("rotation", handleRotationChanged);
    return function () {
      store.unsubscribe("pagesRotation", handlePagesRotationChanged);
      store.unsubscribe("rotation", handleRotationChanged);
    };
  }, []);
  useEffect(function () {
    return function () {
      var _a;
      (_a = renderTask.current) === null || _a === void 0 ? void 0 : _a.cancel();
    };
  }, []);
  return createElement(
    "div",
    { ref: containerRef, className: "rpv-thumbnail__cover-inner", "data-testid": "thumbnail__cover-inner" },
    src
      ? createElement("img", { className: "rpv-thumbnail__cover-image", "data-testid": "thumbnail__cover-image", src: src })
      : createElement("div", { className: "rpv-thumbnail__cover-loader", "data-testid": "thumbnail__cover-loader" }, renderSpinner ? renderSpinner() : createElement(main.Spinner, null))
  );
};

var Cover = function (_a) {
  var getPageIndex = _a.getPageIndex,
    renderSpinner = _a.renderSpinner,
    store = _a.store,
    width = _a.width;
  var _b = useState(store.get("doc")),
    currentDoc = _b[0],
    setCurrentDoc = _b[1];
  var handleDocumentChanged = function (doc) {
    setCurrentDoc(doc);
  };
  useEffect(function () {
    store.subscribe("doc", handleDocumentChanged);
    return function () {
      store.unsubscribe("doc", handleDocumentChanged);
    };
  }, []);
  return createElement(
    "div",
    { className: "rpv-thumbnail__cover" },
    currentDoc ? createElement(CoverInner, { doc: currentDoc, getPageIndex: getPageIndex, renderSpinner: renderSpinner, store: store, width: width }) : createElement("div", { className: "rpv-thumbnail__cover-loader" }, renderSpinner ? renderSpinner() : createElement(main.Spinner, null))
  );
};

var defaultSpinner = function () {
  return createElement(main.Spinner, null);
};
var SpinnerContext = createContext({
  renderSpinner: defaultSpinner,
});

var FetchLabels = function (_a) {
  var children = _a.children,
    doc = _a.doc;
  var isMounted = main.useIsMounted();
  var _b = useState({
      loading: true,
      labels: [],
    }),
    status = _b[0],
    setStatus = _b[1];
  useEffect(
    function () {
      doc.getPageLabels().then(function (result) {
        isMounted.current && setStatus({ loading: false, labels: result || [] });
      });
    },
    [doc.loadingTask.docId]
  );
  return status.loading ? createElement(Fragment, null) : children(status.labels);
};

var scrollToBeVisibleVertically = function (ele, container) {
  var top = ele.getBoundingClientRect().top - container.getBoundingClientRect().top;
  var eleHeight = ele.clientHeight;
  var containerHeight = container.clientHeight;
  if (top < 0) {
    container.scrollTop += top;
    return;
  }
  if (top + eleHeight <= containerHeight) {
    return;
  }
  container.scrollTop += top + eleHeight - containerHeight;
};
var scrollToBeVisibleHorizontally = function (ele, container) {
  var left = ele.getBoundingClientRect().left - container.getBoundingClientRect().left;
  var eleWidth = ele.clientWidth;
  var containerWidth = container.clientWidth;
  if (left < 0) {
    container.scrollLeft += left;
    return;
  }
  if (left + eleWidth <= containerWidth) {
    return;
  }
  container.scrollLeft += left + eleWidth - containerWidth;
};

var ThumbnailItem = function (_a) {
  var page = _a.page,
    pageHeight = _a.pageHeight,
    pageIndex = _a.pageIndex,
    pageWidth = _a.pageWidth,
    rotation = _a.rotation,
    thumbnailHeight = _a.thumbnailHeight,
    thumbnailWidth = _a.thumbnailWidth,
    onRenderCompleted = _a.onRenderCompleted;
  var l10n = useContext(main.LocalizationContext).l10n;
  var renderTask = useRef();
  var _b = useState(""),
    src = _b[0],
    setSrc = _b[1];
  var thumbnailLabel = l10n && l10n.thumbnail ? l10n.thumbnail.thumbnailLabel : "Thumbnail of page {{pageIndex}}";
  useEffect(
    function () {
      var task = renderTask.current;
      if (task) {
        task.cancel();
      }
      var canvas = document.createElement("canvas");
      var canvasContext = canvas.getContext("2d", { alpha: false });
      var w = thumbnailWidth;
      var h = w / (pageWidth / pageHeight);
      var scale = w / pageWidth;
      canvas.height = h;
      canvas.width = w;
      canvas.style.height = "".concat(h, "px");
      canvas.style.width = "".concat(w, "px");
      var viewport = page.getViewport({ rotation: rotation, scale: scale });
      renderTask.current = page.render({ canvasContext: canvasContext, viewport: viewport });
      renderTask.current.promise.then(
        function () {
          setSrc(canvas.toDataURL());
          onRenderCompleted(pageIndex);
        },
        function () {
          onRenderCompleted(pageIndex);
        }
      );
      return function () {
        var _a;
        (_a = renderTask.current) === null || _a === void 0 ? void 0 : _a.cancel();
      };
    },
    [rotation]
  );
  const spinner = useContext(SpinnerContext).renderSpinner();
  if (!src) {
    return spinner;
  } else {
    return <img aria-label={thumbnailLabel.replace("{{pageIndex}}", "".concat(pageIndex + 1))} src={src} height={`${thumbnailHeight}px`} width={`${thumbnailWidth}px`} />;
  }
  // return !src ? useContext(SpinnerContext).renderSpinner() : createElement("img", { "aria-label": thumbnailLabel.replace("{{pageIndex}}", "".concat(pageIndex + 1)), src: src, height: "".concat(thumbnailHeight, "px"), width: "".concat(thumbnailWidth, "px") });
};

var ThumbnailContainer = function (_a) {
  var doc = _a.doc,
    pageHeight = _a.pageHeight,
    pageIndex = _a.pageIndex,
    pageRotation = _a.pageRotation,
    pageWidth = _a.pageWidth,
    rotation = _a.rotation,
    shouldRender = _a.shouldRender,
    thumbnailWidth = _a.thumbnailWidth,
    onRenderCompleted = _a.onRenderCompleted,
    onVisibilityChanged = _a.onVisibilityChanged;
  var isMounted = main.useIsMounted();
  var _b = useState({
      height: pageHeight,
      page: null,
      viewportRotation: 0,
      width: pageWidth,
    }),
    pageSize = _b[0],
    setPageSize = _b[1];
  var page = pageSize.page,
    height = pageSize.height,
    width = pageSize.width;
  var scale = width / height;
  var isVertical = Math.abs(rotation + pageRotation) % 180 === 0;
  var w = isVertical ? thumbnailWidth : thumbnailWidth / scale;
  var h = isVertical ? thumbnailWidth / scale : thumbnailWidth;
  useEffect(
    function () {
      if (shouldRender) {
        main.getPage(doc, pageIndex).then(function (pdfPage) {
          var viewport = pdfPage.getViewport({ scale: 1 });
          isMounted.current &&
            setPageSize({
              height: viewport.height,
              page: pdfPage,
              viewportRotation: viewport.rotation,
              width: viewport.width,
            });
        });
      }
    },
    [shouldRender]
  );
  var rotationNumber = (pageSize.viewportRotation + rotation + pageRotation) % 360;
  var containerRef = main.useIntersectionObserver({
    onVisibilityChanged: function (visibility) {
      onVisibilityChanged(pageIndex, visibility);
    },
  });
  const spinner = useContext(SpinnerContext).renderSpinner();
  return (
    <div className="rpv-thumbnail__container" ref={containerRef} style={{ height: `${h}px`, width: `${w}px` }}>
      {!page ? spinner : <ThumbnailItem page={page} pageHeight={isVertical ? height : width} pageIndex={pageIndex} pageWidth={isVertical ? width : height} rotation={rotationNumber} thumbnailHeight={h} thumbnailWidth={w} onRenderCompleted={onRenderCompleted} />}
    </div>
  );
  // return createElement(
  //   "div",
  //   {
  //     className: "rpv-thumbnail__container",
  //     "data-testid": "thumbnail__container-".concat(pageIndex),
  //     ref: containerRef,
  //     style: {
  //       height: "".concat(h, "px"),
  //       width: "".concat(w, "px"),
  //     },
  //   },
  //   !page
  //     ? useContext(SpinnerContext).renderSpinner()
  //     : createElement(ThumbnailItem, { page: page, pageHeight: isVertical ? height : width, pageIndex: pageIndex, pageWidth: isVertical ? width : height, rotation: rotationNumber, thumbnailHeight: h, thumbnailWidth: w, onRenderCompleted: onRenderCompleted })
  // );
};

var ThumbnailList = function (_a) {
  var currentPage = _a.currentPage,
    doc = _a.doc,
    labels = _a.labels,
    pagesRotation = _a.pagesRotation,
    pageHeight = _a.pageHeight,
    pageWidth = _a.pageWidth,
    renderCurrentPageLabel = _a.renderCurrentPageLabel,
    renderThumbnailItem = _a.renderThumbnailItem,
    rotatedPage = _a.rotatedPage,
    rotation = _a.rotation,
    thumbnailDirection = _a.thumbnailDirection,
    thumbnailWidth = _a.thumbnailWidth,
    viewMode = _a.viewMode,
    onJumpToPage = _a.onJumpToPage,
    onRotatePage = _a.onRotatePage;
  var numPages = doc.numPages;
  var docId = doc.loadingTask.docId;
  var containerRef = useRef(null);
  var thumbnailsRef = useRef([]);
  var _b = useState(currentPage),
    currentFocused = _b[0],
    setCurrentFocused = _b[1];
  var direction = useContext(main.ThemeContext).direction;
  var isRtl = direction === main.TextDirection.RightToLeft;
  var _c = useState(-1),
    renderPageIndex = _c[0],
    setRenderPageIndex = _c[1];
  var isMounted = main.useIsMounted();
  var previousViewMode = main.usePrevious(viewMode);
  var hasRenderingThumbnailRef = useRef(false);
  var renderQueue = main.useRenderQueue({ doc: doc });
  var pageIndexes = useMemo(
    function () {
      return Array(numPages)
        .fill(0)
        .map(function (_, pageIndex) {
          return pageIndex;
        });
    },
    [docId]
  );
  var chunks = useMemo(
    function () {
      switch (viewMode) {
        case main.ViewMode.DualPage:
          return main.chunk(pageIndexes, 2);
        case main.ViewMode.DualPageWithCover:
          return [[pageIndexes[0]]].concat(main.chunk(pageIndexes.slice(1), 2));
        case main.ViewMode.SinglePage:
        default:
          return main.chunk(pageIndexes, 1);
      }
    },
    [docId, viewMode]
  );
  var handleKeyDown = function (e) {
    switch (e.key) {
      case "ArrowDown":
        activateNextItem();
        break;
      case "ArrowUp":
        activatePreviousItem();
        break;
      case "Enter":
        jumpToFocusedPage();
        break;
    }
  };
  var activateNextItem = function () {
    var container = containerRef.current;
    if (!container) {
      return;
    }
    var items = thumbnailsRef.current;
    var nextItem = currentFocused + 1;
    if (nextItem < items.length) {
      if (currentFocused >= 0) {
        items[currentFocused].setAttribute("tabindex", "-1");
      }
      setCurrentFocused(nextItem);
    }
  };
  var activatePreviousItem = function () {
    var container = containerRef.current;
    if (!container) {
      return;
    }
    var items = thumbnailsRef.current;
    var prevItem = currentFocused - 1;
    if (prevItem >= 0) {
      if (currentFocused >= 0) {
        items[currentFocused].setAttribute("tabindex", "-1");
      }
      setCurrentFocused(prevItem);
    }
  };
  var jumpToFocusedPage = function () {
    if (currentFocused >= 0 && currentFocused < numPages) {
      onJumpToPage(currentFocused);
    }
  };
  main.useIsomorphicLayoutEffect(
    function () {
      var container = containerRef.current;
      if (!container) {
        return;
      }
      thumbnailsRef.current = Array.from(container.querySelectorAll(".rpv-thumbnail__item"));
    },
    [viewMode]
  );
  useEffect(
    function () {
      var thumbnails = thumbnailsRef.current;
      if (thumbnails.length === 0 || currentFocused < 0 || currentFocused > thumbnails.length) {
        return;
      }
      var thumbnailEle = thumbnails[currentFocused];
      thumbnailEle.setAttribute("tabindex", "0");
      thumbnailEle.focus();
    },
    [currentFocused]
  );
  main.useIsomorphicLayoutEffect(
    function () {
      var container = containerRef.current;
      var thumbnails = thumbnailsRef.current;
      if (!container || thumbnails.length === 0 || currentPage < 0 || currentPage > thumbnails.length) {
        return;
      }
      var thumbnailContainer = thumbnails[currentPage].closest(".rpv-thumbnail__items");
      if (thumbnailContainer) {
        thumbnailDirection === "Vertical" ? scrollToBeVisibleVertically(thumbnailContainer, container) : scrollToBeVisibleHorizontally(thumbnailContainer, container);
      }
    },
    [currentPage, thumbnailDirection]
  );
  var handleRenderCompleted = useCallback(
    function (pageIndex) {
      if (isMounted.current) {
        renderQueue.markRendered(pageIndex);
        hasRenderingThumbnailRef.current = false;
        renderNextThumbnail();
      }
    },
    [docId]
  );
  var handleVisibilityChanged = useCallback(
    function (pageIndex, visibility) {
      visibility.isVisible ? renderQueue.setVisibility(pageIndex, visibility.ratio) : renderQueue.setOutOfRange(pageIndex);
      renderNextThumbnail();
    },
    [docId]
  );
  var renderNextThumbnail = useCallback(
    function () {
      if (hasRenderingThumbnailRef.current) {
        return;
      }
      var nextPage = renderQueue.getHighestPriorityPage();
      if (nextPage > -1) {
        renderQueue.markRendering(nextPage);
        hasRenderingThumbnailRef.current = true;
        setRenderPageIndex(nextPage);
      }
    },
    [docId]
  );
  useEffect(
    function () {
      if (rotatedPage >= 0) {
        renderQueue.markRendering(rotatedPage);
        hasRenderingThumbnailRef.current = true;
        setRenderPageIndex(rotatedPage);
      }
    },
    [docId, rotatedPage]
  );
  main.useIsomorphicLayoutEffect(
    function () {
      if (previousViewMode !== viewMode) {
        renderQueue.markNotRendered();
        renderNextThumbnail();
      }
    },
    [viewMode]
  );
  var renderPageThumbnail = function (pageIndex) {
    var isCover = viewMode === main.ViewMode.DualPageWithCover && (pageIndex === 0 || (numPages % 2 === 0 && pageIndex === numPages - 1));
    var key = "".concat(doc.loadingTask.docId, "___").concat(pageIndex);
    var pageLabel = labels.length === numPages ? labels[pageIndex] : "".concat(pageIndex + 1);
    var label = renderCurrentPageLabel ? renderCurrentPageLabel({ currentPage: currentPage, pageIndex: pageIndex, numPages: numPages, pageLabel: pageLabel }) : pageLabel;
    var pageRotation = pagesRotation.has(pageIndex) ? pagesRotation.get(pageIndex) : 0;
    var thumbnail = createElement(ThumbnailContainer, {
      doc: doc,
      pageHeight: pageHeight,
      pageIndex: pageIndex,
      pageRotation: pageRotation,
      pageWidth: pageWidth,
      rotation: rotation,
      shouldRender: renderPageIndex === pageIndex,
      thumbnailWidth: thumbnailWidth,
      onRenderCompleted: handleRenderCompleted,
      onVisibilityChanged: handleVisibilityChanged,
    });
    return renderThumbnailItem
      ? renderThumbnailItem({
          currentPage: currentPage,
          key: key,
          numPages: numPages,
          pageIndex: pageIndex,
          renderPageLabel: createElement(Fragment, null, label),
          renderPageThumbnail: thumbnail,
          onJumpToPage: function () {
            return onJumpToPage(pageIndex);
          },
          onRotatePage: function (direction) {
            return onRotatePage(pageIndex, direction);
          },
        })
      : createElement(
          "div",
          { key: key },
          createElement(
            "div",
            {
              className: main.classNames({
                "rpv-thumbnail__item": true,
                "rpv-thumbnail__item--dual-even": viewMode === main.ViewMode.DualPage && pageIndex % 2 === 0,
                "rpv-thumbnail__item--dual-odd": viewMode === main.ViewMode.DualPage && pageIndex % 2 === 1,
                "rpv-thumbnail__item--dual-cover": isCover,
                "rpv-thumbnail__item--dual-cover-even": viewMode === main.ViewMode.DualPageWithCover && !isCover && pageIndex % 2 === 0,
                "rpv-thumbnail__item--dual-cover-odd": viewMode === main.ViewMode.DualPageWithCover && !isCover && pageIndex % 2 === 1,
                "rpv-thumbnail__item--single": viewMode === main.ViewMode.SinglePage,
                "rpv-thumbnail__item--selected": currentPage === pageIndex,
              }),
              role: "button",
              tabIndex: currentPage === pageIndex ? 0 : -1,
              onClick: function () {
                return onJumpToPage(pageIndex);
              },
            },
            thumbnail
          ),
          createElement("div", { "data-testid": "thumbnail__label-".concat(pageIndex), className: "rpv-thumbnail__label" }, label)
        );
  };
  return createElement(
    "div",
    {
      ref: containerRef,
      "data-testid": "thumbnail__list",
      className: main.classNames({
        "rpv-thumbnail__list": true,
        "rpv-thumbnail__list--horizontal": thumbnailDirection === "Horizontal",
        "rpv-thumbnail__list--rtl": isRtl,
        "rpv-thumbnail__list--vertical": thumbnailDirection === "Vertical",
      }),
      onKeyDown: handleKeyDown,
    },
    chunks.map(function (chunkItem, index) {
      var isSelectedChunk = false;
      switch (viewMode) {
        case main.ViewMode.DualPage:
          isSelectedChunk = currentPage === 2 * index || currentPage === 2 * index + 1;
          break;
        case main.ViewMode.DualPageWithCover:
          isSelectedChunk = (currentPage === 0 && index === 0) || (index > 0 && currentPage === 2 * index - 1) || (index > 0 && currentPage === 2 * index);
          break;
        case main.ViewMode.SinglePage:
        default:
          isSelectedChunk = currentPage === index;
          break;
      }
      return createElement(
        "div",
        {
          className: main.classNames({
            "rpv-thumbnail__items": true,
            "rpv-thumbnail__items--dual": viewMode === main.ViewMode.DualPage,
            "rpv-thumbnail__items--dual-cover": viewMode === main.ViewMode.DualPageWithCover,
            "rpv-thumbnail__items--single": viewMode === main.ViewMode.SinglePage,
            "rpv-thumbnail__items--selected": isSelectedChunk,
          }),
          key: "".concat(index, "___").concat(viewMode),
        },
        chunkItem.map(function (pageIndex) {
          return renderPageThumbnail(pageIndex);
        })
      );
    })
  );
};

var ThumbnailListWithStore = function (_a) {
  var renderCurrentPageLabel = _a.renderCurrentPageLabel,
    renderThumbnailItem = _a.renderThumbnailItem,
    store = _a.store,
    thumbnailDirection = _a.thumbnailDirection,
    thumbnailWidth = _a.thumbnailWidth;
  var _b = useState(store.get("doc")),
    currentDoc = _b[0],
    setCurrentDoc = _b[1];
  var _c = useState(store.get("currentPage") || 0),
    currentPage = _c[0],
    setCurrentPage = _c[1];
  var _d = useState(store.get("pageHeight") || 0),
    pageHeight = _d[0],
    setPageHeight = _d[1];
  var _e = useState(store.get("pageWidth") || 0),
    pageWidth = _e[0],
    setPageWidth = _e[1];
  var _f = useState(store.get("rotation") || 0),
    rotation = _f[0],
    setRotation = _f[1];
  var _g = useState(store.get("pagesRotation") || new Map()),
    pagesRotation = _g[0],
    setPagesRotation = _g[1];
  var _h = useState(store.get("rotatedPage") || -1),
    rotatedPage = _h[0],
    setRotatedPage = _h[1];
  var _j = useState(store.get("viewMode")),
    viewMode = _j[0],
    setViewMode = _j[1];
  var handleCurrentPageChanged = function (currentPageIndex) {
    setCurrentPage(currentPageIndex);
  };
  var handleDocumentChanged = function (doc) {
    setCurrentDoc(doc);
  };
  var handlePageHeightChanged = function (height) {
    setPageHeight(height);
  };
  var handlePageWidthChanged = function (width) {
    setPageWidth(width);
  };
  var handleRotationChanged = function (currentRotation) {
    setRotation(currentRotation);
  };
  var handlePagesRotationChanged = function (rotations) {
    setPagesRotation(rotations);
  };
  var handleRotatedPage = function (rotatedPage) {
    setRotatedPage(rotatedPage);
  };
  var handleViewModeChanged = function (viewMode) {
    setViewMode(viewMode);
  };
  var jump = function (pageIndex) {
    var jumpToPage = store.get("jumpToPage");
    if (jumpToPage) {
      jumpToPage(pageIndex);
    }
  };
  var rotatePage = function (pageIndex, direction) {
    store.get("rotatePage")(pageIndex, direction);
  };
  useEffect(function () {
    store.subscribe("doc", handleDocumentChanged);
    store.subscribe("pageHeight", handlePageHeightChanged);
    store.subscribe("pageWidth", handlePageWidthChanged);
    store.subscribe("rotatedPage", handleRotatedPage);
    store.subscribe("rotation", handleRotationChanged);
    store.subscribe("pagesRotation", handlePagesRotationChanged);
    store.subscribe("viewMode", handleViewModeChanged);
    return function () {
      store.unsubscribe("doc", handleDocumentChanged);
      store.unsubscribe("pageHeight", handlePageHeightChanged);
      store.unsubscribe("pageWidth", handlePageWidthChanged);
      store.unsubscribe("rotatedPage", handleRotatedPage);
      store.unsubscribe("rotation", handleRotationChanged);
      store.unsubscribe("pagesRotation", handlePagesRotationChanged);
      store.unsubscribe("viewMode", handleViewModeChanged);
    };
  }, []);
  main.useIsomorphicLayoutEffect(function () {
    store.subscribe("currentPage", handleCurrentPageChanged);
    return function () {
      store.unsubscribe("currentPage", handleCurrentPageChanged);
    };
  }, []);
  const spinner = useContext(SpinnerContext).renderSpinner();
  return currentDoc
    ? createElement(
        main.LazyRender,
        {
          testId: "thumbnail__list-container",
          attrs: {
            className: "rpv-thumbnail__list-container",
          },
        },
        createElement(FetchLabels, { doc: currentDoc }, function (labels) {
          return createElement(ThumbnailList, {
            currentPage: currentPage,
            doc: currentDoc,
            labels: labels,
            pagesRotation: pagesRotation,
            pageHeight: pageHeight,
            pageWidth: pageWidth,
            renderCurrentPageLabel: renderCurrentPageLabel,
            renderThumbnailItem: renderThumbnailItem,
            rotatedPage: rotatedPage,
            rotation: rotation,
            thumbnailDirection: thumbnailDirection,
            thumbnailWidth: thumbnailWidth,
            viewMode: viewMode,
            onJumpToPage: jump,
            onRotatePage: rotatePage,
          });
        })
      )
    : createElement("div", { "data-testid": "thumbnail-list__loader", className: "rpv-thumbnail__loader" }, spinner);
};

var useThumbnailPlugin = function (pluginProps) {
  var store = useMemo(function () {
    return main.createStore({
      rotatePage: function () {},
      viewMode: main.ViewMode.SinglePage,
    });
  }, []);
  var _a = useState(""),
    docId = _a[0],
    setDocId = _a[1];
  var CoverDecorator = function (props) {
    return createElement(Cover, __assign({}, props, { renderSpinner: pluginProps === null || pluginProps === void 0 ? void 0 : pluginProps.renderSpinner, store: store }));
  };
  var ThumbnailsDecorator = useCallback(
    function (props) {
      return createElement(
        SpinnerContext.Provider,
        { value: { renderSpinner: (pluginProps === null || pluginProps === void 0 ? void 0 : pluginProps.renderSpinner) || defaultSpinner } },
        createElement(ThumbnailListWithStore, {
          renderCurrentPageLabel: pluginProps === null || pluginProps === void 0 ? void 0 : pluginProps.renderCurrentPageLabel,
          renderThumbnailItem: props === null || props === void 0 ? void 0 : props.renderThumbnailItem,
          store: store,
          thumbnailDirection: (props === null || props === void 0 ? void 0 : props.thumbnailDirection) || "Vertical",
          thumbnailWidth: (pluginProps === null || pluginProps === void 0 ? void 0 : pluginProps.thumbnailWidth) || 100,
        })
      );
    },
    [docId]
  );
  return {
    install: function (pluginFunctions) {
      store.update("jumpToPage", pluginFunctions.jumpToPage);
      store.update("rotatePage", pluginFunctions.rotatePage);
    },
    onDocumentLoad: function (props) {
      setDocId(props.doc.loadingTask.docId);
      store.update("doc", props.doc);
    },
    onViewerStateChange: function (viewerState) {
      store.update("currentPage", viewerState.pageIndex);
      store.update("pagesRotation", viewerState.pagesRotation);
      store.update("pageHeight", viewerState.pageHeight);
      store.update("pageWidth", viewerState.pageWidth);
      store.update("rotation", viewerState.rotation);
      store.update("rotatedPage", viewerState.rotatedPage);
      store.update("viewMode", viewerState.viewMode);
      return viewerState;
    },
    Cover: CoverDecorator,
    Thumbnails: ThumbnailsDecorator,
  };
};

export { useThumbnailPlugin };
