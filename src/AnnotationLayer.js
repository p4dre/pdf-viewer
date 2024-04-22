import { useState, useEffect, Fragment, createElement } from "react";
import AnnotationLayerBody from "./AnnotationLayerBody";
import useIsMounted from "./hooks/useIsMounted";
var AnnotationLoader = function (_a) {
  var page = _a.page,
    renderAnnotations = _a.renderAnnotations;
  var isMounted = useIsMounted();
  var _b = useState({
      loading: true,
      annotations: [],
    }),
    status = _b[0],
    setStatus = _b[1];
  useEffect(function () {
    page.getAnnotations({ intent: "display" }).then(function (result) {
      if (isMounted.current) {
        setStatus({
          loading: false,
          annotations: result,
        });
      }
    });
  }, []);
  return status.loading ? createElement(Fragment, null) : renderAnnotations(status.annotations);
};
const AnnotationLayer = (props) => {
  const { doc, outlines, page, pageIndex, plugins, rotation, scale, onExecuteNamedAction, onJumpFromLinkAnnotation, onJumpToDest } = props;

  var renderAnnotations = (annotations) => {
    return createElement(AnnotationLayerBody, {
      annotations: annotations,
      doc: doc,
      outlines: outlines,
      page: page,
      pageIndex: pageIndex,
      plugins: plugins,
      rotation: rotation,
      scale: scale,
      onExecuteNamedAction: onExecuteNamedAction,
      onJumpFromLinkAnnotation: onJumpFromLinkAnnotation,
      onJumpToDest: onJumpToDest,
    });
  };
  return createElement(AnnotationLoader, {
    page: page,
    renderAnnotations: renderAnnotations,
  });
};

export default AnnotationLayer;
