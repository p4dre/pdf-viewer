let Position = 0;
(function (Position) {
  Position["TopLeft"] = "TOP_LEFT";
  Position["TopCenter"] = "TOP_CENTER";
  Position["TopRight"] = "TOP_RIGHT";
  Position["RightTop"] = "RIGHT_TOP";
  Position["RightCenter"] = "RIGHT_CENTER";
  Position["RightBottom"] = "RIGHT_BOTTOM";
  Position["BottomLeft"] = "BOTTOM_LEFT";
  Position["BottomCenter"] = "BOTTOM_CENTER";
  Position["BottomRight"] = "BOTTOM_RIGHT";
  Position["LeftTop"] = "LEFT_TOP";
  Position["LeftCenter"] = "LEFT_CENTER";
  Position["LeftBottom"] = "LEFT_BOTTOM";
})(Position || (Position = {}));

let TextDirection;
(function (TextDirection) {
  TextDirection["RightToLeft"] = "RTL";
  TextDirection["LeftToRight"] = "LTR";
})(TextDirection || (TextDirection = {}));

let FullScreenMode;
(function (FullScreenMode) {
  FullScreenMode["Normal"] = "Normal";
  FullScreenMode["Entering"] = "Entering";
  FullScreenMode["Entered"] = "Entered";
  FullScreenMode["EnteredCompletely"] = "EnteredCompletely";
  FullScreenMode["Exitting"] = "Exitting";
  FullScreenMode["Exited"] = "Exited";
})(FullScreenMode || (FullScreenMode = {}));

let ToggleStatus;
(function (ToggleStatus) {
  ToggleStatus["Close"] = "Close";
  ToggleStatus["Open"] = "Open";
  ToggleStatus["Toggle"] = "Toggle";
})(ToggleStatus || (ToggleStatus = {}));

let RotateDirection;
(function (RotateDirection) {
  RotateDirection["Backward"] = "Backward";
  RotateDirection["Forward"] = "Forward";
})(RotateDirection || (RotateDirection = {}));

let ScrollMode;
(function (ScrollMode) {
  ScrollMode["Page"] = "Page";
  ScrollMode["Horizontal"] = "Horizontal";
  ScrollMode["Vertical"] = "Vertical";
  ScrollMode["Wrapped"] = "Wrapped";
})(ScrollMode || (ScrollMode = {}));

let ViewMode;
(function (ViewMode) {
  ViewMode["DualPage"] = "DualPage";
  ViewMode["DualPageWithCover"] = "DualPageWithCover";
  ViewMode["SinglePage"] = "SinglePage";
})(ViewMode || (ViewMode = {}));

let LayerRenderStatus;
(function (LayerRenderStatus) {
  LayerRenderStatus[(LayerRenderStatus["PreRender"] = 0)] = "PreRender";
  LayerRenderStatus[(LayerRenderStatus["DidRender"] = 1)] = "DidRender";
})(LayerRenderStatus || (LayerRenderStatus = {}));

var Api;
(function (Api) {
  Api[(Api["ExitFullScreen"] = 0)] = "ExitFullScreen";
  Api[(Api["FullScreenChange"] = 1)] = "FullScreenChange";
  Api[(Api["FullScreenElement"] = 2)] = "FullScreenElement";
  Api[(Api["FullScreenEnabled"] = 3)] = "FullScreenEnabled";
  Api[(Api["RequestFullScreen"] = 4)] = "RequestFullScreen";
})(Api || (Api = {}));
var defaultVendor = {
  ExitFullScreen: "exitFullscreen",
  FullScreenChange: "fullscreenchange",
  FullScreenElement: "fullscreenElement",
  FullScreenEnabled: "fullscreenEnabled",
  RequestFullScreen: "requestFullscreen",
};

let SpecialZoomLevel;
(function (SpecialZoomLevel) {
  SpecialZoomLevel["ActualSize"] = "ActualSize";
  SpecialZoomLevel["PageFit"] = "PageFit";
  SpecialZoomLevel["PageWidth"] = "PageWidth";
})(SpecialZoomLevel || (SpecialZoomLevel = {}));

let AnnotationType;
(function (AnnotationType) {
  AnnotationType[(AnnotationType["Text"] = 1)] = "Text";
  AnnotationType[(AnnotationType["Link"] = 2)] = "Link";
  AnnotationType[(AnnotationType["FreeText"] = 3)] = "FreeText";
  AnnotationType[(AnnotationType["Line"] = 4)] = "Line";
  AnnotationType[(AnnotationType["Square"] = 5)] = "Square";
  AnnotationType[(AnnotationType["Circle"] = 6)] = "Circle";
  AnnotationType[(AnnotationType["Polygon"] = 7)] = "Polygon";
  AnnotationType[(AnnotationType["Polyline"] = 8)] = "Polyline";
  AnnotationType[(AnnotationType["Highlight"] = 9)] = "Highlight";
  AnnotationType[(AnnotationType["Underline"] = 10)] = "Underline";
  AnnotationType[(AnnotationType["Squiggly"] = 11)] = "Squiggly";
  AnnotationType[(AnnotationType["StrikeOut"] = 12)] = "StrikeOut";
  AnnotationType[(AnnotationType["Stamp"] = 13)] = "Stamp";
  AnnotationType[(AnnotationType["Caret"] = 14)] = "Caret";
  AnnotationType[(AnnotationType["Ink"] = 15)] = "Ink";
  AnnotationType[(AnnotationType["Popup"] = 16)] = "Popup";
  AnnotationType[(AnnotationType["FileAttachment"] = 17)] = "FileAttachment";
})(AnnotationType || (AnnotationType = {}));

let PageRenderStatus;
(function (PageRenderStatus) {
  PageRenderStatus["NotRenderedYet"] = "NotRenderedYet";
  PageRenderStatus["Rendering"] = "Rendering";
  PageRenderStatus["Rendered"] = "Rendered";
})(PageRenderStatus || (PageRenderStatus = {}));

let PageMode;
(function (PageMode) {
  PageMode["Attachments"] = "UseAttachments";
  PageMode["Bookmarks"] = "UseOutlines";
  PageMode["ContentGroup"] = "UseOC";
  PageMode["Default"] = "UserNone";
  PageMode["FullScreen"] = "FullScreen";
  PageMode["Thumbnails"] = "UseThumbs";
})(PageMode || (PageMode = {}));

let PasswordStatus;
(function (PasswordStatus) {
  PasswordStatus["RequiredPassword"] = "RequiredPassword";
  PasswordStatus["WrongPassword"] = "WrongPassword";
})(PasswordStatus || (PasswordStatus = {}));

let AnnotationBorderStyleType;
(function (AnnotationBorderStyleType) {
  AnnotationBorderStyleType[(AnnotationBorderStyleType["Solid"] = 1)] = "Solid";
  AnnotationBorderStyleType[(AnnotationBorderStyleType["Dashed"] = 2)] = "Dashed";
  AnnotationBorderStyleType[(AnnotationBorderStyleType["Beveled"] = 3)] = "Beveled";
  AnnotationBorderStyleType[(AnnotationBorderStyleType["Inset"] = 4)] = "Inset";
  AnnotationBorderStyleType[(AnnotationBorderStyleType["Underline"] = 5)] = "Underline";
})(AnnotationBorderStyleType || (AnnotationBorderStyleType = {}));

let ScrollDirection;
(function (ScrollDirection) {
  ScrollDirection["Horizontal"] = "Horizontal";
  ScrollDirection["Vertical"] = "Vertical";
  ScrollDirection["Both"] = "Both";
})(ScrollDirection || (ScrollDirection = {}));

export { Position, TextDirection, FullScreenMode, ToggleStatus, RotateDirection, ScrollMode, ScrollDirection, ViewMode, LayerRenderStatus, Api, SpecialZoomLevel, AnnotationType, PageRenderStatus, PageMode, PasswordStatus, AnnotationBorderStyleType };
