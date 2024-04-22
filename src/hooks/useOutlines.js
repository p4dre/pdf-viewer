import { useState, useEffect } from "react";
import useIsMounted from "./useIsMounted";

var flaternSingleOutline = function (outline) {
  var result = [];
  if (outline.items && outline.items.length > 0) {
    result = result.concat(flaternOutlines(outline.items));
  }
  return result;
};
var flaternOutlines = function (outlines) {
  var result = [];
  outlines.map(function (outline) {
    result = result.concat(outline).concat(flaternSingleOutline(outline));
  });
  return result;
};

const useOutlines = (doc) => {
  const isMounted = useIsMounted();
  const [outlines, setOutlines] = useState([]);

  useEffect(function () {
    doc.getOutline().then(function (result) {
      if (isMounted.current && result !== null) {
        var items = flaternOutlines(result);
        setOutlines(items);
      }
    });
  }, []);
  return outlines;
};

export default useOutlines;
