import Annotation from "./Annotation";
var getTitle = function (annotation) {
  return annotation.titleObj ? annotation.titleObj.str : annotation.title || "";
};
var getContents = function (annotation) {
  return annotation.contentsObj ? annotation.contentsObj.str : annotation.contents || "";
};
var downloadFile = function (url, data) {
  var blobUrl = typeof data === "string" ? "" : URL.createObjectURL(new Blob([data], { type: "" }));
  var link = document.createElement("a");
  link.style.display = "none";
  link.href = blobUrl || url;
  link.setAttribute("download", getFileName(url));
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  if (blobUrl) {
    URL.revokeObjectURL(blobUrl);
  }
};

var getFileName = function (url) {
  var str = url.split("/").pop();
  return str ? str.split("#")[0].split("?")[0] : url;
};

const FileAttachment = (props) => {
  const { annotation, page, viewport } = props;
  const title = getTitle(annotation);
  const contents = getContents(annotation);
  const hasPopup = annotation.hasPopup === false && (!!title || !!contents);
  const doubleClick = function () {
    const file = annotation.file;
    file && downloadFile(file.filename, file.content);
  };
  const annotationProps = {
    annotation: annotation,
    hasPopup: hasPopup,
    ignoreBorder: true,
    isRenderable: true,
    page: page,
    viewport: viewport,
  };
  return (
    <Annotation {...annotationProps}>
      {(props) => (
        <div className={`rpv-core__annotation rpv-core__annotation--file-attachment`} onClick={props.popup.toggleOnClick} onDoubleClick={doubleClick} onMouseEnter={props.popup.openOnHover} onMouseLeave={props.popup.closeOnHover}>
          {props.slot.children}
        </div>
      )}
    </Annotation>
  );
};

export default FileAttachment;
