import Annotation from "./Annotation";

var getTitle = function (annotation) {
  return annotation.titleObj ? annotation.titleObj.str : annotation.title || "";
};
var getContents = function (annotation) {
  return annotation.contentsObj ? annotation.contentsObj.str : annotation.contents || "";
};

const Caret = (props) => {
  const { annotation, page, viewport } = props;
  const hasPopup = annotation.hasPopup === false;
  const title = getTitle(annotation);
  const contents = getContents(annotation);
  const isRenderable = !!(annotation.hasPopup || title || contents);
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
        <div className={`rpv-core__annotation rpv-core__annotation--caret`} onClick={props.popup.toggleOnClick} onMouseEnter={props.popup.openOnHover} onMouseLeve={props.popup.closeOnHover}>
          {props.slot.children}
        </div>
      )}
    </Annotation>
  );
};

export default Caret;
