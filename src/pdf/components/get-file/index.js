import { useState, useMemo, useContext, useEffect, createElement } from "react";
import * as main from "../../../main";

var DownloadIcon = function () {
  return createElement(
    main.Icon,
    { size: 16 },
    createElement("path", { d: "M5.5,11.5c-.275,0-.341.159-.146.354l6.292,6.293a.5.5,0,0,0,.709,0l6.311-6.275c.2-.193.13-.353-.145-.355L15.5,11.5V1.5a1,1,0,0,0-1-1h-5a1,1,0,0,0-1,1V11a.5.5,0,0,1-.5.5Z" }),
    createElement("path", { d: "M23.5,18.5v4a1,1,0,0,1-1,1H1.5a1,1,0,0,1-1-1v-4" })
  );
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

var TOOLTIP_OFFSET = { left: 0, top: 8 };
var DownloadButton = function (_a) {
  var onClick = _a.onClick;
  var l10n = useContext(main.LocalizationContext).l10n;
  var label = l10n && l10n.download ? l10n.download.download : "Download";
  return createElement(main.Tooltip, {
    ariaControlsSuffix: "get-file",
    position: main.Position.BottomCenter,
    target: createElement(main.MinimalButton, { ariaLabel: label, testId: "get-file__download-button", onClick: onClick }, createElement(DownloadIcon, null)),
    content: function () {
      return label;
    },
    offset: TOOLTIP_OFFSET,
  });
};

var isChromeIOS = function () {
  return /iphone|ipod|ipad/i.test(navigator.userAgent) && /CriOS/i.test(navigator.userAgent);
};
var isSafariIOS = function () {
  return /iphone|ipod|ipad/i.test(navigator.userAgent) && !/CriOS/i.test(navigator.userAgent);
};
var encodeUint8Array = function (data) {
  return btoa(
    Array(data.length)
      .fill("")
      .map(function (_, i) {
        return String.fromCharCode(data[i]);
      })
      .join("")
  );
};
var download = function (url, saveAs) {
  var link = document.createElement("a");
  link.style.display = "none";
  link.href = url;
  link.setAttribute("download", saveAs);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
var downloadBlob = function (data, saveAs, mimeType) {
  var blobUrl = URL.createObjectURL(new Blob([data], { type: mimeType }));
  download(blobUrl, saveAs);
  if (blobUrl) {
    URL.revokeObjectURL(blobUrl);
  }
  return;
};
var downloadFile = function (doc, saveAs) {
  doc.getData().then(function (data) {
    isSafariIOS() ? downloadBlob(data, saveAs, "application/octet-stream") : isChromeIOS() ? download("data:application/pdf;base64,".concat(encodeUint8Array(data)), saveAs) : downloadBlob(data, saveAs, "application/pdf");
  });
};

var Download = function (_a) {
  var children = _a.children,
    fileNameGenerator = _a.fileNameGenerator,
    store = _a.store;
  var _b = useState(store.get("file")),
    currentFile = _b[0],
    setCurrentFile = _b[1];
  var _c = useState(store.get("doc")),
    currentDocument = _c[0],
    setCurrentDocument = _c[1];
  var handleDocumentChanged = function (doc) {
    setCurrentDocument(doc);
  };
  var handleFileChanged = function (file) {
    setCurrentFile(file);
  };
  useEffect(function () {
    store.subscribe("doc", handleDocumentChanged);
    store.subscribe("file", handleFileChanged);
    return function () {
      store.subscribe("doc", handleDocumentChanged);
      store.unsubscribe("file", handleFileChanged);
    };
  }, []);
  var download = function () {
    if (currentDocument && currentFile) {
      downloadFile(currentDocument, fileNameGenerator(currentFile));
    }
  };
  var defaultChildren = function (props) {
    return createElement(DownloadButton, { onClick: props.onClick });
  };
  var render = children || defaultChildren;
  return render({
    onClick: download,
  });
};

var DownloadMenuItem = function (_a) {
  var onClick = _a.onClick;
  var l10n = useContext(main.LocalizationContext).l10n;
  var label = l10n && l10n.download ? l10n.download.download : "Download";
  return createElement(main.MenuItem, { icon: createElement(DownloadIcon, null), testId: "get-file__download-menu", onClick: onClick }, label);
};

var getFileName = function (url) {
  var str = url.split("/").pop();
  return str ? str.split("#")[0].split("?")[0] : url;
};

var useGetFilePlugin = function (props) {
  var store = useMemo(function () {
    return main.createStore({});
  }, []);
  var defaultFileNameGenerator = function (file) {
    return file.name ? getFileName(file.name) : "document.pdf";
  };
  var DownloadDecorator = function (downloadProps) {
    return createElement(Download, __assign({}, downloadProps, { fileNameGenerator: props ? props.fileNameGenerator || defaultFileNameGenerator : defaultFileNameGenerator, store: store }));
  };
  var DownloadButtonDecorator = function () {
    return createElement(DownloadDecorator, null, function (props) {
      return createElement(DownloadButton, __assign({}, props));
    });
  };
  var DownloadMenuItemDecorator = function (props) {
    return createElement(DownloadDecorator, null, function (p) {
      return createElement(DownloadMenuItem, {
        onClick: function () {
          p.onClick();
          props.onClick();
        },
      });
    });
  };
  return {
    onDocumentLoad: function (props) {
      store.update("doc", props.doc);
      store.update("file", props.file);
    },
    Download: DownloadDecorator,
    DownloadButton: DownloadButtonDecorator,
    DownloadMenuItem: DownloadMenuItemDecorator,
  };
};

export { DownloadIcon, useGetFilePlugin };
