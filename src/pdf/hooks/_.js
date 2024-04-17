import { useState, useRef, useEffect, useContext, useMemo, createElement } from "react";
import * as main from "../../main";

var getFileName = function (url) {
  var str = url.split("/").pop();
  return str ? str.split("#")[0].split("?")[0] : url;
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
var AttachmentList = function (_a) {
  var files = _a.files;
  var containerRef = useRef();
  var l10n = useContext(main.LocalizationContext).l10n;
  var direction = useContext(main.ThemeContext).direction;
  var isRtl = direction === main.TextDirection.RightToLeft;
  var attachmentItemsRef = useRef([]);
  var clickDownloadLabel = l10n && l10n.attachment ? l10n.attachment.clickToDownload : "Click to download";
  var handleKeyDown = function (e) {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        moveToItem(function (items, activeEle) {
          return items.indexOf(activeEle) + 1;
        });
        break;
      case "ArrowUp":
        e.preventDefault();
        moveToItem(function (items, activeEle) {
          return items.indexOf(activeEle) - 1;
        });
        break;
      case "End":
        e.preventDefault();
        moveToItem(function (items, _) {
          return items.length - 1;
        });
        break;
      case "Home":
        e.preventDefault();
        moveToItem(function (_, __) {
          return 0;
        });
        break;
    }
  };
  var moveToItem = function (getItemIndex) {
    var container = containerRef.current;
    var attachmentItems = [].slice.call(container.getElementsByClassName("rpv-attachment__item"));
    if (attachmentItems.length === 0) {
      return;
    }
    attachmentItems.forEach(function (item) {
      return item.setAttribute("tabindex", "-1");
    });
    var activeEle = document.activeElement;
    var targetIndex = Math.min(attachmentItems.length - 1, Math.max(0, getItemIndex(attachmentItems, activeEle)));
    var targetEle = attachmentItems[targetIndex];
    targetEle.setAttribute("tabindex", "0");
    targetEle.focus();
  };
  main.useIsomorphicLayoutEffect(function () {
    var container = containerRef.current;
    if (!container) {
      return;
    }
    var attachmentItems = [].slice.call(container.getElementsByClassName("rpv-attachment__item"));
    attachmentItemsRef.current = attachmentItems;
    if (attachmentItems.length > 0) {
      var firstItem = attachmentItems[0];
      firstItem.focus();
      firstItem.setAttribute("tabindex", "0");
    }
  }, []);
  return createElement(
    "div",
    {
      "data-testid": "attachment__list",
      className: main.classNames({
        "rpv-attachment__list": true,
        "rpv-attachment__list--rtl": isRtl,
      }),
      ref: containerRef,
      tabIndex: -1,
      onKeyDown: handleKeyDown,
    },
    files.map(function (file) {
      return createElement(
        "button",
        {
          className: "rpv-attachment__item",
          key: file.fileName,
          tabIndex: -1,
          title: clickDownloadLabel,
          type: "button",
          onClick: function () {
            return downloadFile(file.fileName, file.data);
          },
        },
        file.fileName
      );
    })
  );
};

var AttachmentLoader = function (_a) {
  var doc = _a.doc;
  var l10n = useContext(main.LocalizationContext).l10n;
  var direction = useContext(main.ThemeContext).direction;
  var isRtl = direction === main.TextDirection.RightToLeft;
  var noAttachmentLabel = l10n && l10n.attachment ? l10n.attachment.noAttachment : "There is no attachment";
  var _b = useState({
      files: [],
      isLoaded: false,
    }),
    attachments = _b[0],
    setAttachments = _b[1];
  useEffect(
    function () {
      doc.getAttachments().then(function (response) {
        var files = response
          ? Object.keys(response).map(function (file) {
              return {
                data: response[file].content,
                fileName: response[file].filename,
              };
            })
          : [];
        setAttachments({
          files: files,
          isLoaded: true,
        });
      });
    },
    [doc]
  );
  return !attachments.isLoaded
    ? createElement(main.Spinner, null)
    : attachments.files.length === 0
    ? createElement(
        "div",
        {
          "data-testid": "attachment__empty",
          className: main.classNames({
            "rpv-attachment__empty": true,
            "rpv-attachment__empty--rtl": isRtl,
          }),
        },
        noAttachmentLabel
      )
    : createElement(AttachmentList, { files: attachments.files });
};

var AttachmentListWithStore = function (_a) {
  var store = _a.store;
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
  return currentDoc ? createElement(AttachmentLoader, { doc: currentDoc }) : createElement("div", { className: "rpv-attachment__loader" }, createElement(main.Spinner, null));
};

const useAttachmentPlugin = function () {
  var store = useMemo(function () {
    return main.createStore({});
  }, []);
  var AttachmentsDecorator = function () {
    return createElement(AttachmentListWithStore, { store: store });
  };
  return {
    onDocumentLoad: function (props) {
      store.update("doc", props.doc);
    },
    Attachments: AttachmentsDecorator,
  };
};

export default useAttachmentPlugin;
