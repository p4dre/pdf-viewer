import { useState, useEffect, useRef, useContext } from "react";
import * as PdfJsApi from "pdfjs-dist/build/pdf";
import ThemeContext from "../context/ThemeContext";
import useIsMounted from "../hooks/useIsMounted";
import AskingPassword from "./AskingPassword";
import Spinner from "./Spinner";
import { PasswordStatus, TextDirection } from "../enums";

var extendStatics = function (d, b) {
  extendStatics =
    Object.setPrototypeOf ||
    ({ __proto__: [] } instanceof Array &&
      function (d, b) {
        d.__proto__ = b;
      }) ||
    function (d, b) {
      for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
    };
  return extendStatics(d, b);
};
function __extends(d, b) {
  if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
  extendStatics(d, b);
  function __() {
    this.constructor = d;
  }
  d.prototype = b === null ? Object.create(b) : ((__.prototype = b.prototype), new __());
}

let LoadingStatus = (function () {
  function LoadingStatus() {}
  return LoadingStatus;
})();

let AskForPasswordState = (function (_super) {
  __extends(AskForPasswordState, _super);
  function AskForPasswordState(verifyPassword, passwordStatus) {
    var _this = _super.call(this) || this;
    _this.verifyPassword = verifyPassword;
    _this.passwordStatus = passwordStatus;
    return _this;
  }
  return AskForPasswordState;
})(LoadingStatus);

let CompletedState = (function (_super) {
  __extends(CompletedState, _super);
  function CompletedState(doc) {
    var _this = _super.call(this) || this;
    _this.doc = doc;
    return _this;
  }
  return CompletedState;
})(LoadingStatus);

let FailureState = (function (_super) {
  __extends(FailureState, _super);
  function FailureState(error) {
    var _this = _super.call(this) || this;
    _this.error = error;
    return _this;
  }
  return FailureState;
})(LoadingStatus);
let LoadingState = (function (_super) {
  __extends(LoadingState, _super);
  function LoadingState(percentages) {
    var _this = _super.call(this) || this;
    _this.percentages = percentages;
    return _this;
  }
  return LoadingState;
})(LoadingStatus);

const DocumentLoader = function (props) {
  const { characterMap, file, httpHeaders, render, renderError, renderLoader, renderProtectedView, transformGetDocumentParams, withCredentials, onDocumentAskPassword } = props;
  const direction = useContext(ThemeContext).direction;
  const isRtl = direction === TextDirection.RightToLeft;
  const [status, setStatus] = useState(new LoadingState(0));

  const docRef = useRef("");
  const isMounted = useIsMounted();
  useEffect(() => {
    docRef.current = "";
    setStatus(new LoadingState(0));
    const worker = new PdfJsApi.PDFWorker({
      name: "PDFWorker_".concat(Date.now()),
    });
    const params = Object.assign(
      {
        httpHeaders: httpHeaders,
        withCredentials: withCredentials,
        worker: worker,
      },
      "string" === typeof file ? { url: file } : { data: file },
      characterMap
        ? {
            cMapUrl: characterMap.url,
            cMapPacked: characterMap.isCompressed,
          }
        : {}
    );
    const transformParams = transformGetDocumentParams ? transformGetDocumentParams(params) : params;
    const loadingTask = PdfJsApi.getDocument(transformParams);
    loadingTask.onPassword = function (verifyPassword, reason) {
      switch (reason) {
        case PdfJsApi.PasswordResponses.NEED_PASSWORD:
          isMounted.current && setStatus(new AskForPasswordState(verifyPassword, PasswordStatus.RequiredPassword));
          break;
        case PdfJsApi.PasswordResponses.INCORRECT_PASSWORD:
          isMounted.current && setStatus(new AskForPasswordState(verifyPassword, PasswordStatus.WrongPassword));
          break;
      }
    };
    loadingTask.onProgress = function (progress) {
      var loaded = progress.total > 0 ? Math.min(100, (100 * progress.loaded) / progress.total) : 100;
      if (isMounted.current && docRef.current === "") {
        setStatus(new LoadingState(loaded));
      }
    };
    loadingTask.promise.then(
      function (doc) {
        docRef.current = doc.loadingTask.docId;
        isMounted.current && setStatus(new CompletedState(doc));
      },
      function (err) {
        return (
          isMounted.current &&
          !worker.destroyed &&
          setStatus(
            new FailureState({
              message: err.message || "Cannot load document",
              name: err.name,
            })
          )
        );
      }
    );
    return () => {
      loadingTask.destroy();
      worker.destroy();
    };
  }, [file]);
  if (status instanceof AskForPasswordState) {
    return <AskingPassword passwordStatus={status.passwordStatus} renderProtectedView={renderProtectedView} verifyPassword={status.verifyPassword} onDocumentAskPassword={onDocumentAskPassword} />;
  }
  if (status instanceof CompletedState) {
    return render(status.doc);
  }
  if (status instanceof FailureState) {
    return renderError ? (
      renderError(status.error)
    ) : (
      <div className={`rpv-core__doc-error ${isRtl ? "rpv-core__doc-error--rtl" : ""}`}>
        {" "}
        <div className="rpv-core__doc-error-text">{status.error.message}</div>
      </div>
    );
  }
  return <div className={`rpv-core__doc-loading ${isRtl ? "rpv-core__doc-loading--rtl" : ""}`}>{renderLoader ? renderLoader(status.percentages) : <Spinner />}</div>;
};

export default DocumentLoader;
