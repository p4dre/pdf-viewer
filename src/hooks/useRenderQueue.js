import { useRef, useMemo } from "react";

var PageRenderStatus;
(function (PageRenderStatus) {
  PageRenderStatus["NotRenderedYet"] = "NotRenderedYet";
  PageRenderStatus["Rendering"] = "Rendering";
  PageRenderStatus["Rendered"] = "Rendered";
})(PageRenderStatus || (PageRenderStatus = {}));

var OUT_OF_RANGE_VISIBILITY = -9999;

const useRenderQueue = (props) => {
  const { doc } = props;
  const { numPages } = doc;
  const { docId } = doc.loadingTask;

  var initialPageVisibilities = useMemo(() => {
    return Array(numPages)
      .fill(null)
      .map(function (_, pageIndex) {
        return {
          pageIndex: pageIndex,
          renderStatus: PageRenderStatus.NotRenderedYet,
          visibility: OUT_OF_RANGE_VISIBILITY,
        };
      });
  }, [docId]);
  var latestRef = useRef({
    currentRenderingPage: -1,
    startRange: 0,
    endRange: numPages - 1,
    visibilities: initialPageVisibilities,
  });
  var markNotRendered = function () {
    for (var i = 0; i < numPages; i++) {
      latestRef.current.visibilities[i].renderStatus = PageRenderStatus.NotRenderedYet;
    }
  };
  var markRendered = function (pageIndex) {
    latestRef.current.visibilities[pageIndex].renderStatus = PageRenderStatus.Rendered;
  };
  var markRendering = function (pageIndex) {
    if (latestRef.current.currentRenderingPage !== -1 && latestRef.current.currentRenderingPage !== pageIndex && latestRef.current.visibilities[latestRef.current.currentRenderingPage].renderStatus === PageRenderStatus.Rendering) {
      latestRef.current.visibilities[latestRef.current.currentRenderingPage].renderStatus = PageRenderStatus.NotRenderedYet;
    }
    latestRef.current.visibilities[pageIndex].renderStatus = PageRenderStatus.Rendering;
    latestRef.current.currentRenderingPage = pageIndex;
  };
  var setRange = function (startIndex, endIndex) {
    latestRef.current.startRange = startIndex;
    latestRef.current.endRange = endIndex;
    for (var i = 0; i < numPages; i++) {
      if (i < startIndex || i > endIndex) {
        latestRef.current.visibilities[i].visibility = OUT_OF_RANGE_VISIBILITY;
        latestRef.current.visibilities[i].renderStatus = PageRenderStatus.NotRenderedYet;
      }
    }
  };
  var setOutOfRange = function (pageIndex) {
    setVisibility(pageIndex, OUT_OF_RANGE_VISIBILITY);
  };
  var setVisibility = function (pageIndex, visibility) {
    latestRef.current.visibilities[pageIndex].visibility = visibility;
  };
  var getHighestPriorityPage = function () {
    var visiblePages = latestRef.current.visibilities.slice(latestRef.current.startRange, latestRef.current.endRange + 1).filter(function (item) {
      return item.visibility > OUT_OF_RANGE_VISIBILITY;
    });
    if (!visiblePages.length) {
      return -1;
    }
    var firstVisiblePage = visiblePages[0].pageIndex;
    var lastVisiblePage = visiblePages[visiblePages.length - 1].pageIndex;
    var numVisiblePages = visiblePages.length;
    for (var i = 0; i < numVisiblePages; i++) {
      if (visiblePages[i].renderStatus === PageRenderStatus.Rendering) {
        return -1;
      }
      if (visiblePages[i].renderStatus === PageRenderStatus.NotRenderedYet) {
        return visiblePages[i].pageIndex;
      }
    }
    if (lastVisiblePage + 1 < numPages && latestRef.current.visibilities[lastVisiblePage + 1].renderStatus !== PageRenderStatus.Rendered) {
      return lastVisiblePage + 1;
    } else if (firstVisiblePage - 1 >= 0 && latestRef.current.visibilities[firstVisiblePage - 1].renderStatus !== PageRenderStatus.Rendered) {
      return firstVisiblePage - 1;
    }
    return -1;
  };
  var isInRange = function (pageIndex) {
    return pageIndex >= latestRef.current.startRange && pageIndex <= latestRef.current.endRange;
  };
  return {
    getHighestPriorityPage: getHighestPriorityPage,
    isInRange: isInRange,
    markNotRendered: markNotRendered,
    markRendered: markRendered,
    markRendering: markRendering,
    setOutOfRange: setOutOfRange,
    setRange: setRange,
    setVisibility: setVisibility,
  };
};

export default useRenderQueue;
