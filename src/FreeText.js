import Annotation from "./Annotation";
var getTitle = function (annotation) {
  return annotation.titleObj ? annotation.titleObj.str : annotation.title || "";
};
var getContents = function (annotation) {
  return annotation.contentsObj ? annotation.contentsObj.str : annotation.contents || "";
};
const FreeText = (props) => {
  const { annotation, page, viewport } = props;
  var hasPopup = annotation.hasPopup === false;
  var title = getTitle(annotation);
  var contents = getContents(annotation);
  var isRenderable = !!(annotation.hasPopup || title || contents);
  const annotationProps = {
    annotation: annotation,
    hasPopup: hasPopup,
    ignoreBorder: true,
    isRenderable: isRenderable,
    page: page,
    viewport: viewport,
  };
  return (
    <Annotation {...annotationProps}>
      {(props) => (
        <div className={`rpv-core__annotation rpv-core__annotation--free-text`} onClick={props.popup.toggleOnClick} onMouseEnter={props.popup.openOnHover} onMouseLeave={props.popup.closeOnHover}>
          {props.slot.children}
        </div>
      )}
    </Annotation>
  );
};

export default FreeText;
