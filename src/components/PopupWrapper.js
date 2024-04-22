import { useRef, useContext, useLayoutEffect, createElement, Fragment } from "react";
import ThemeContext from "../context/ThemeContext";

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

let TextDirection;
(function (TextDirection) {
  TextDirection["RightToLeft"] = "RTL";
  TextDirection["LeftToRight"] = "LTR";
})(TextDirection || (TextDirection = {}));

var classNames = function (classes) {
  var result = [];
  Object.keys(classes).forEach(function (clazz) {
    if (clazz && classes[clazz]) {
      result.push(clazz);
    }
  });
  return result.join(" ");
};

var dateRegex = new RegExp("^D:" + "(\\d{4})" + "(\\d{2})?" + "(\\d{2})?" + "(\\d{2})?" + "(\\d{2})?" + "(\\d{2})?" + "([Z|+|-])?" + "(\\d{2})?" + "'?" + "(\\d{2})?" + "'?");
var parse = function (value, min, max, defaultValue) {
  var parsed = parseInt(value, 10);
  return parsed >= min && parsed <= max ? parsed : defaultValue;
};

var convertDate = function (input) {
  var matches = dateRegex.exec(input);
  if (!matches) {
    return null;
  }
  var year = parseInt(matches[1], 10);
  var month = parse(matches[2], 1, 12, 1) - 1;
  var day = parse(matches[3], 1, 31, 1);
  var hour = parse(matches[4], 0, 23, 0);
  var minute = parse(matches[5], 0, 59, 0);
  var second = parse(matches[6], 0, 59, 0);
  var universalTimeRelation = matches[7] || "Z";
  var offsetHour = parse(matches[8], 0, 23, 0);
  var offsetMinute = parse(matches[9], 0, 59, 0);
  switch (universalTimeRelation) {
    case "-":
      hour += offsetHour;
      minute += offsetMinute;
      break;
    case "+":
      hour -= offsetHour;
      minute -= offsetMinute;
      break;
  }
  return new Date(Date.UTC(year, month, day, hour, minute, second));
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

var getTitle = function (annotation) {
  return annotation.titleObj ? annotation.titleObj.str : annotation.title || "";
};
var getContents = function (annotation) {
  return annotation.contentsObj ? annotation.contentsObj.str : annotation.contents || "";
};
const PopupWrapper = (props) => {
  const { annotation } = props;
  const direction = useContext(ThemeContext).direction;
  const title = getTitle(annotation);
  const contents = getContents(annotation);
  const isRtl = direction === TextDirection.RightToLeft;
  const containerRef = useRef();
  const dateStr = "";
  if (annotation.modificationDate) {
    const date = convertDate(annotation.modificationDate);
    dateStr = date ? "".concat(date.toLocaleDateString(), ", ").concat(date.toLocaleTimeString()) : "";
  }
  useLayoutEffect(function () {
    const containerEle = containerRef.current;
    if (!containerEle) {
      return;
    }
    const annotationEle = document.querySelector('[data-annotation-id="'.concat(annotation.id, '"]'));
    if (!annotationEle) {
      return;
    }
    const ele = annotationEle;
    ele.style.zIndex += 1;
    return function () {
      ele.style.zIndex = "".concat(parseInt(ele.style.zIndex, 10) - 1);
    };
  }, []);
  return createElement(
    "div",
    {
      ref: containerRef,
      className: classNames({
        "rpv-core__annotation-popup-wrapper": true,
        "rpv-core__annotation-popup-wrapper--rtl": isRtl,
      }),
      style: {
        top: annotation.annotationType === AnnotationType.Popup ? "" : "100%",
      },
    },
    title &&
      createElement(
        Fragment,
        null,
        createElement(
          "div",
          {
            className: classNames({
              "rpv-core__annotation-popup-title": true,
              "rpv-core__annotation-popup-title--ltr": !isRtl,
              "rpv-core__annotation-popup-title--rtl": isRtl,
            }),
          },
          title
        ),
        createElement("div", { className: "rpv-core__annotation-popup-date" }, dateStr)
      ),
    contents &&
      createElement(
        "div",
        { className: "rpv-core__annotation-popup-content" },
        contents.split("\n").map(function (item, index) {
          return createElement(Fragment, { key: index }, item, createElement("br", null));
        })
      )
  );
};

export default PopupWrapper;
