import { useState, useEffect, useLayoutEffect, useRef, useMemo, useContext, Fragment, useCallback, createElement } from "react";
import Icon from "../../../Icon";
import LocalizationContext from "../../../LocalizationContext";
import ThemeContext from "../../../ThemeContext";
import { TextDirection } from "../../../enums";
import TextBox from "../../../TextBox";
import Spinner from "../../../Spinner";
import Tooltip from "../../../Tooltip";
import MinimalButton from "../../../MinimalButton";
import Button from "../../../Button";
import { Position, LayerRenderStatus } from "../../../enums";
import { isMac, getPage, createStore } from "../../../utils";
import Popover from "../../../Popover";

var classNames = function (classes) {
  var result = [];
  Object.keys(classes).forEach(function (clazz) {
    if (clazz && classes[clazz]) {
      result.push(clazz);
    }
  });
  return result.join(" ");
};

var NextIcon = function () {
  return createElement(Icon, { size: 16 }, createElement("path", { d: "M0.541,5.627L11.666,18.2c0.183,0.207,0.499,0.226,0.706,0.043c0.015-0.014,0.03-0.028,0.043-0.043\n            L23.541,5.627" }));
};

var PreviousIcon = function () {
  return createElement(Icon, { size: 16 }, createElement("path", { d: "M23.535,18.373L12.409,5.8c-0.183-0.207-0.499-0.226-0.706-0.043C11.688,5.77,11.674,5.785,11.66,5.8\n            L0.535,18.373" }));
};

var SearchIcon = function () {
  return createElement(Icon, { ignoreDirection: true, size: 16 }, createElement("path", { d: "M10.5,0.5c5.523,0,10,4.477,10,10s-4.477,10-10,10s-10-4.477-10-10S4.977,0.5,10.5,0.5z\n            M23.5,23.5\n            l-5.929-5.929" }));
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

var EMPTY_KEYWORD_REGEXP = {
  keyword: "",
  regExp: new RegExp(" "),
  wholeWords: false,
};

var calculateOffset = function (children, parent) {
  var top = children.offsetTop;
  var left = children.offsetLeft;
  var p = children.parentElement;
  while (p && p !== parent) {
    top += p.offsetTop;
    left += p.offsetLeft;
    p = p.parentElement;
  }
  return {
    left: left,
    top: top,
  };
};

var getCssProperties = function (area) {
  return {
    left: "".concat(area.left, "%"),
    top: "".concat(area.top, "%"),
    height: "".concat(area.height, "%"),
    width: "".concat(area.width, "%"),
  };
};

var HightlightItem = function (_a) {
  var index = _a.index,
    area = _a.area,
    onHighlightKeyword = _a.onHighlightKeyword;
  var containerRef = useRef();
  useLayoutEffect(function () {
    var highlightEle = containerRef.current;
    if (onHighlightKeyword && highlightEle) {
      onHighlightKeyword({
        highlightEle: highlightEle,
        keyword: area.keyword,
      });
    }
  }, []);
  return createElement("div", { className: "rpv-search__highlight", "data-index": index, ref: containerRef, style: getCssProperties(area), title: area.keywordStr.trim() });
};

var removeNode = function (ele) {
  var parent = ele.parentNode;
  if (parent) {
    parent.removeChild(ele);
  }
};
var replaceNode = function (replacementNode, node) {
  removeNode(replacementNode);
  var parent = node.parentNode;
  if (parent) {
    parent.insertBefore(replacementNode, node);
  }
  removeNode(node);
};
var unwrap = function (ele) {
  var parent = ele.parentNode;
  if (!parent) {
    return;
  }
  var range = document.createRange();
  range.selectNodeContents(ele);
  replaceNode(range.extractContents(), ele);
  parent.normalize();
};

var sortHighlightPosition = function (a, b) {
  if (a.top < b.top) {
    return -1;
  }
  if (a.top > b.top) {
    return 1;
  }
  if (a.left < b.left) {
    return -1;
  }
  if (a.left > b.left) {
    return 1;
  }
  return 0;
};
var Highlights = function (_a) {
  var numPages = _a.numPages,
    pageIndex = _a.pageIndex,
    renderHighlights = _a.renderHighlights,
    store = _a.store,
    onHighlightKeyword = _a.onHighlightKeyword;
  var containerRef = useRef();
  var defaultRenderHighlights = useCallback(function (renderProps) {
    return createElement(
      Fragment,
      null,
      renderProps.highlightAreas.map(function (area, index) {
        return createElement(HightlightItem, { index: index, key: index, area: area, onHighlightKeyword: onHighlightKeyword });
      })
    );
  }, []);
  var renderHighlightElements = renderHighlights || defaultRenderHighlights;
  var _b = useState(store.get("matchPosition")),
    matchPosition = _b[0],
    setMatchPosition = _b[1];
  var _c = useState(store.get("keyword") || [EMPTY_KEYWORD_REGEXP]),
    keywordRegexp = _c[0],
    setKeywordRegexp = _c[1];
  var _d = useState({
      pageIndex: pageIndex,
      scale: 1,
      status: LayerRenderStatus.PreRender,
    }),
    renderStatus = _d[0],
    setRenderStatus = _d[1];
  var currentMatchRef = useRef(null);
  var characterIndexesRef = useRef([]);
  var _e = useState([]),
    highlightAreas = _e[0],
    setHighlightAreas = _e[1];
  var defaultTargetPageFilter = function () {
    return true;
  };
  var targetPageFilter = useCallback(
    function () {
      return store.get("targetPageFilter") || defaultTargetPageFilter;
    },
    [store.get("targetPageFilter")]
  );
  var highlight = function (keywordStr, keyword, textLayerEle, span, charIndexSpan) {
    var range = document.createRange();
    var firstChild = span.firstChild;
    if (!firstChild || firstChild.nodeType !== Node.TEXT_NODE) {
      return null;
    }
    var length = firstChild.textContent.length;
    var startOffset = charIndexSpan[0].charIndexInSpan;
    var endOffset = charIndexSpan.length === 1 ? startOffset : charIndexSpan[charIndexSpan.length - 1].charIndexInSpan;
    if (startOffset > length || endOffset + 1 > length) {
      return null;
    }
    range.setStart(firstChild, startOffset);
    range.setEnd(firstChild, endOffset + 1);
    var wrapper = document.createElement("span");
    range.surroundContents(wrapper);
    var wrapperRect = wrapper.getBoundingClientRect();
    var textLayerRect = textLayerEle.getBoundingClientRect();
    var pageHeight = textLayerRect.height;
    var pageWidth = textLayerRect.width;
    var left = (100 * (wrapperRect.left - textLayerRect.left)) / pageWidth;
    var top = (100 * (wrapperRect.top - textLayerRect.top)) / pageHeight;
    var height = (100 * wrapperRect.height) / pageHeight;
    var width = (100 * wrapperRect.width) / pageWidth;
    unwrap(wrapper);
    return {
      keyword: keyword,
      keywordStr: keywordStr,
      numPages: numPages,
      pageIndex: pageIndex,
      left: left,
      top: top,
      height: height,
      width: width,
      pageHeight: pageHeight,
      pageWidth: pageWidth,
    };
  };
  var highlightAll = function (textLayerEle) {
    var charIndexes = characterIndexesRef.current;
    if (charIndexes.length === 0) {
      return [];
    }
    var highlightPos = [];
    var spans = [].slice.call(textLayerEle.querySelectorAll(".rpv-core__text-layer-text"));
    var fullText = charIndexes
      .map(function (item) {
        return item.char;
      })
      .join("");
    keywordRegexp.forEach(function (keyword) {
      var keywordStr = keyword.keyword;
      if (!keywordStr.trim()) {
        return;
      }
      var cloneKeyword = keyword.regExp.flags.indexOf("g") === -1 ? new RegExp(keyword.regExp, "".concat(keyword.regExp.flags, "g")) : keyword.regExp;
      var match;
      var matches = [];
      while ((match = cloneKeyword.exec(fullText)) !== null) {
        matches.push({
          keyword: cloneKeyword,
          startIndex: match.index,
          endIndex: cloneKeyword.lastIndex,
        });
      }
      matches
        .map(function (item) {
          return {
            keyword: item.keyword,
            indexes: charIndexes.slice(item.startIndex, item.endIndex),
          };
        })
        .forEach(function (item) {
          var spanIndexes = item.indexes.reduce(function (acc, item) {
            acc[item.spanIndex] = (acc[item.spanIndex] || []).concat([item]);
            return acc;
          }, {});
          Object.values(spanIndexes).forEach(function (charIndexSpan) {
            if (charIndexSpan.length !== 1 || charIndexSpan[0].char.trim() !== "") {
              var normalizedCharSpan = keyword.wholeWords ? charIndexSpan.slice(1, -1) : charIndexSpan;
              var hightlighPosition = highlight(keywordStr, item.keyword, textLayerEle, spans[normalizedCharSpan[0].spanIndex], normalizedCharSpan);
              if (hightlighPosition) {
                highlightPos.push(hightlighPosition);
              }
            }
          });
        });
    });
    return highlightPos.sort(sortHighlightPosition);
  };
  var handleKeywordChanged = function (keyword) {
    if (keyword && keyword.length > 0) {
      setKeywordRegexp(keyword);
    }
  };
  var handleMatchPositionChanged = function (currentPosition) {
    return setMatchPosition(currentPosition);
  };
  var handleRenderStatusChanged = function (status) {
    if (!status.has(pageIndex)) {
      return;
    }
    var currentStatus = status.get(pageIndex);
    if (currentStatus) {
      setRenderStatus({
        ele: currentStatus.ele,
        pageIndex: pageIndex,
        scale: currentStatus.scale,
        status: currentStatus.status,
      });
    }
  };
  var isEmptyKeyword = function () {
    return keywordRegexp.length === 0 || (keywordRegexp.length === 1 && keywordRegexp[0].keyword.trim() === "");
  };
  useEffect(
    function () {
      if (isEmptyKeyword() || renderStatus.status !== LayerRenderStatus.DidRender || characterIndexesRef.current.length) {
        return;
      }
      var textLayerEle = renderStatus.ele;
      var spans = [].slice.call(textLayerEle.querySelectorAll(".rpv-core__text-layer-text"));
      var charIndexes = spans
        .map(function (span) {
          return span.textContent;
        })
        .reduce(
          function (prev, curr, index) {
            return prev.concat(
              curr.split("").map(function (c, i) {
                return {
                  char: c,
                  charIndexInSpan: i,
                  spanIndex: index,
                };
              })
            );
          },
          [
            {
              char: "",
              charIndexInSpan: 0,
              spanIndex: 0,
            },
          ]
        )
        .slice(1);
      characterIndexesRef.current = charIndexes;
    },
    [keywordRegexp, renderStatus.status]
  );
  useEffect(
    function () {
      if (isEmptyKeyword() || !renderStatus.ele || renderStatus.status !== LayerRenderStatus.DidRender || !targetPageFilter()({ pageIndex: pageIndex, numPages: numPages })) {
        return;
      }
      var textLayerEle = renderStatus.ele;
      var highlightPos = highlightAll(textLayerEle);
      setHighlightAreas(highlightPos);
    },
    [keywordRegexp, matchPosition, renderStatus.status, characterIndexesRef.current]
  );
  useEffect(
    function () {
      if (isEmptyKeyword() && renderStatus.ele && renderStatus.status === LayerRenderStatus.DidRender) {
        setHighlightAreas([]);
      }
    },
    [keywordRegexp, renderStatus.status]
  );
  useEffect(
    function () {
      if (highlightAreas.length === 0) {
        return;
      }
      var container = containerRef.current;
      if (matchPosition.pageIndex !== pageIndex || !container || renderStatus.status !== LayerRenderStatus.DidRender) {
        return;
      }
      var highlightEle = container.querySelector('.rpv-search__highlight[data-index="'.concat(matchPosition.matchIndex, '"]'));
      if (!highlightEle) {
        return;
      }
      var _a = calculateOffset(highlightEle, container),
        left = _a.left,
        top = _a.top;
      var jump = store.get("jumpToDestination");
      if (jump) {
        jump({
          pageIndex: pageIndex,
          bottomOffset: (container.getBoundingClientRect().height - top) / renderStatus.scale,
          leftOffset: left / renderStatus.scale,
          scaleTo: renderStatus.scale,
        });
        if (currentMatchRef.current) {
          currentMatchRef.current.classList.remove("rpv-search__highlight--current");
        }
        currentMatchRef.current = highlightEle;
        highlightEle.classList.add("rpv-search__highlight--current");
      }
    },
    [highlightAreas, matchPosition]
  );
  useEffect(function () {
    store.subscribe("keyword", handleKeywordChanged);
    store.subscribe("matchPosition", handleMatchPositionChanged);
    store.subscribe("renderStatus", handleRenderStatusChanged);
    return function () {
      store.unsubscribe("keyword", handleKeywordChanged);
      store.unsubscribe("matchPosition", handleMatchPositionChanged);
      store.unsubscribe("renderStatus", handleRenderStatusChanged);
    };
  }, []);
  return createElement(
    "div",
    { className: "rpv-search__highlights", "data-testid": "search__highlights-".concat(pageIndex), ref: containerRef },
    renderHighlightElements({
      getCssProperties: getCssProperties,
      highlightAreas: highlightAreas,
    })
  );
};

var escapeRegExp = function (input) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};
var normalizeFlagKeyword = function (flagKeyword) {
  var source = flagKeyword.wholeWords ? " ".concat(flagKeyword.keyword, " ") : flagKeyword.keyword;
  var flags = flagKeyword.matchCase ? "g" : "gi";
  return {
    keyword: flagKeyword.keyword,
    regExp: new RegExp(escapeRegExp(source), flags),
    wholeWords: flagKeyword.wholeWords || false,
  };
};
var normalizeSingleKeyword = function (keyword, matchCase, wholeWords) {
  if (keyword instanceof RegExp) {
    return {
      keyword: keyword.source,
      regExp: keyword,
      wholeWords: wholeWords || false,
    };
  }
  if (typeof keyword === "string") {
    return keyword === ""
      ? EMPTY_KEYWORD_REGEXP
      : normalizeFlagKeyword({
          keyword: keyword,
          matchCase: matchCase || false,
          wholeWords: wholeWords || false,
        });
  }
  if (typeof matchCase !== "undefined") {
    keyword.matchCase = matchCase;
  }
  if (typeof wholeWords !== "undefined") {
    keyword.wholeWords = wholeWords;
  }
  return normalizeFlagKeyword(keyword);
};

var useDocument = function (store) {
  var currentDocRef = useRef(store.get("doc"));
  var handleDocumentChanged = function (doc) {
    currentDocRef.current = doc;
  };
  useEffect(function () {
    store.subscribe("doc", handleDocumentChanged);
    return function () {
      store.unsubscribe("doc", handleDocumentChanged);
    };
  }, []);
  return currentDocRef;
};

var useSearch = function (store) {
  var initialKeyword = store.get("initialKeyword");
  var normalizedKeywordFlags = useMemo(function () {
    if (initialKeyword && initialKeyword.length === 1) {
      var normalizedKeyword = normalizeSingleKeyword(initialKeyword[0]);
      return {
        matchCase: normalizedKeyword.regExp.flags.indexOf("i") === -1,
        wholeWords: normalizedKeyword.wholeWords,
      };
    } else {
      return {
        matchCase: false,
        wholeWords: false,
      };
    }
  }, []);
  var currentDocRef = useDocument(store);
  var _a = useState(initialKeyword),
    keywords = _a[0],
    setKeywords = _a[1];
  var _b = useState([]),
    found = _b[0],
    setFound = _b[1];
  var _c = useState(0),
    currentMatch = _c[0],
    setCurrentMatch = _c[1];
  var _d = useState(normalizedKeywordFlags.matchCase),
    matchCase = _d[0],
    setMatchCase = _d[1];
  var textContents = useRef([]);
  var _e = useState(normalizedKeywordFlags.wholeWords),
    wholeWords = _e[0],
    setWholeWords = _e[1];
  var defaultTargetPageFilter = function () {
    return true;
  };
  var targetPageFilter = useCallback(
    function () {
      return store.get("targetPageFilter") || defaultTargetPageFilter;
    },
    [store.get("targetPageFilter")]
  );
  var changeMatchCase = function (isChecked) {
    setMatchCase(isChecked);
    if (keywords.length > 0) {
      searchFor(keywords, isChecked, wholeWords);
    }
  };
  var changeWholeWords = function (isChecked) {
    setWholeWords(isChecked);
    if (keywords.length > 0) {
      searchFor(keywords, matchCase, isChecked);
    }
  };
  var jumpToMatch = function (index) {
    var numMatches = found.length;
    if (keywords.length === 0 || numMatches === 0) {
      return null;
    }
    var normalizedIndex = index === numMatches + 1 ? 1 : Math.max(1, Math.min(numMatches, index));
    setCurrentMatch(normalizedIndex);
    return jumpToGivenMatch(found[normalizedIndex - 1]);
  };
  var jumpToPreviousMatch = function () {
    return jumpToMatch(currentMatch - 1);
  };
  var jumpToNextMatch = function () {
    return jumpToMatch(currentMatch + 1);
  };
  var clearKeyword = function () {
    store.update("keyword", [EMPTY_KEYWORD_REGEXP]);
    setKeyword("");
    setCurrentMatch(0);
    setFound([]);
    setMatchCase(false);
    setWholeWords(false);
  };
  var search = function () {
    return searchFor(keywords, matchCase, wholeWords);
  };
  var setKeyword = function (keyword) {
    return setKeywords(keyword === "" ? [] : [keyword]);
  };
  var setTargetPages = function (targetPageFilter) {
    store.update("targetPageFilter", targetPageFilter);
  };
  var getTextContents = function () {
    var currentDoc = currentDocRef.current;
    if (!currentDoc) {
      return Promise.resolve([]);
    }
    var promises = Array(currentDoc.numPages)
      .fill(0)
      .map(function (_, pageIndex) {
        return getPage(currentDoc, pageIndex)
          .then(function (page) {
            return page.getTextContent();
          })
          .then(function (content) {
            var pageContent = content.items
              .map(function (item) {
                return item.str || "";
              })
              .join("");
            return Promise.resolve({
              pageContent: pageContent,
              pageIndex: pageIndex,
            });
          });
      });
    return Promise.all(promises).then(function (data) {
      data.sort(function (a, b) {
        return a.pageIndex - b.pageIndex;
      });
      return Promise.resolve(
        data.map(function (item) {
          return item.pageContent;
        })
      );
    });
  };
  var jumpToGivenMatch = function (match) {
    var jumpToPage = store.get("jumpToPage");
    if (jumpToPage) {
      jumpToPage(match.pageIndex);
    }
    store.update("matchPosition", {
      matchIndex: match.matchIndex,
      pageIndex: match.pageIndex,
    });
    return match;
  };
  var getKeywordSource = function (keyword) {
    if (keyword instanceof RegExp) {
      return keyword.source;
    }
    if (typeof keyword === "string") {
      return keyword;
    }
    return keyword.keyword;
  };
  var searchFor = function (keywordParam, matchCaseParam, wholeWordsParam) {
    var currentDoc = currentDocRef.current;
    if (!currentDoc) {
      return Promise.resolve([]);
    }
    var numPages = currentDoc.numPages;
    var keywords = keywordParam.map(function (k) {
      return normalizeSingleKeyword(k, matchCaseParam, wholeWordsParam);
    });
    store.update("keyword", keywords);
    setCurrentMatch(0);
    setFound([]);
    return new Promise(function (resolve, _) {
      var getTextPromise =
        textContents.current.length === 0
          ? getTextContents().then(function (response) {
              textContents.current = response;
              return Promise.resolve(response);
            })
          : Promise.resolve(textContents.current);
      getTextPromise.then(function (response) {
        var arr = [];
        response.forEach(function (pageText, pageIndex) {
          if (targetPageFilter()({ pageIndex: pageIndex, numPages: numPages })) {
            keywords.forEach(function (keyword) {
              var matchIndex = 0;
              var matches;
              while ((matches = keyword.regExp.exec(pageText)) !== null) {
                arr.push({
                  keyword: keyword.regExp,
                  matchIndex: matchIndex,
                  pageIndex: pageIndex,
                  pageText: pageText,
                  startIndex: matches.index,
                  endIndex: keyword.regExp.lastIndex,
                });
                matchIndex++;
              }
            });
          }
        });
        setFound(arr);
        if (arr.length > 0) {
          setCurrentMatch(1);
          jumpToGivenMatch(arr[0]);
        }
        resolve(arr);
      });
    });
  };
  useEffect(
    function () {
      textContents.current = [];
    },
    [currentDocRef.current]
  );
  return {
    clearKeyword: clearKeyword,
    changeMatchCase: changeMatchCase,
    changeWholeWords: changeWholeWords,
    currentMatch: currentMatch,
    jumpToMatch: jumpToMatch,
    jumpToNextMatch: jumpToNextMatch,
    jumpToPreviousMatch: jumpToPreviousMatch,
    keywords: keywords,
    matchCase: matchCase,
    numberOfMatches: found.length,
    wholeWords: wholeWords,
    search: search,
    searchFor: searchFor,
    setKeywords: setKeywords,
    keyword: keywords.length === 0 ? "" : getKeywordSource(keywords[0]),
    setKeyword: setKeyword,
    setTargetPages: setTargetPages,
  };
};

var Search = function (_a) {
  var children = _a.children,
    store = _a.store;
  var result = useSearch(store);
  var _b = useState(false),
    isDocumentLoaded = _b[0],
    setDocumentLoaded = _b[1];
  var handleDocumentChanged = function (_) {
    return setDocumentLoaded(true);
  };
  useEffect(function () {
    store.subscribe("doc", handleDocumentChanged);
    return function () {
      store.unsubscribe("doc", handleDocumentChanged);
    };
  }, []);
  return children(__assign(__assign({}, result), { isDocumentLoaded: isDocumentLoaded }));
};

var ShortcutHandler = function (_a) {
  var containerRef = _a.containerRef,
    store = _a.store;
  var isMouseInsideRef = useRef(false);
  var handleMouseEnter = function () {
    isMouseInsideRef.current = true;
  };
  var handleMouseLeave = function () {
    isMouseInsideRef.current = false;
  };
  var handleKeydown = function (e) {
    var containerEle = containerRef.current;
    if (!containerEle) {
      return;
    }
    if (e.shiftKey || e.altKey || e.key !== "f") {
      return;
    }
    var isCommandPressed = isMac() ? e.metaKey && !e.ctrlKey : e.ctrlKey;
    if (!isCommandPressed) {
      return;
    }
    if (isMouseInsideRef.current || (document.activeElement && containerEle.contains(document.activeElement))) {
      e.preventDefault();
      store.update("areShortcutsPressed", true);
    }
  };
  useEffect(
    function () {
      var containerEle = containerRef.current;
      if (!containerEle) {
        return;
      }
      document.addEventListener("keydown", handleKeydown);
      containerEle.addEventListener("mouseenter", handleMouseEnter);
      containerEle.addEventListener("mouseleave", handleMouseLeave);
      return function () {
        document.removeEventListener("keydown", handleKeydown);
        containerEle.removeEventListener("mouseenter", handleMouseEnter);
        containerEle.removeEventListener("mouseleave", handleMouseLeave);
      };
    },
    [containerRef.current]
  );
  return createElement(Fragment, null);
};

var PORTAL_OFFSET$1 = { left: 0, top: 8 };
var SearchPopover = function (_a) {
  var store = _a.store,
    onToggle = _a.onToggle;
  var l10n = useContext(LocalizationContext).l10n;
  var direction = useContext(ThemeContext).direction;
  var _b = useState(false),
    isQuerying = _b[0],
    setIsQuerying = _b[1];
  var _c = useState(false),
    searchDone = _c[0],
    setSearchDone = _c[1];
  var isRtl = direction === TextDirection.RightToLeft;
  var _d = useSearch(store),
    clearKeyword = _d.clearKeyword,
    changeMatchCase = _d.changeMatchCase,
    changeWholeWords = _d.changeWholeWords,
    currentMatch = _d.currentMatch,
    jumpToNextMatch = _d.jumpToNextMatch,
    jumpToPreviousMatch = _d.jumpToPreviousMatch,
    keyword = _d.keyword,
    matchCase = _d.matchCase,
    numberOfMatches = _d.numberOfMatches,
    wholeWords = _d.wholeWords,
    search = _d.search,
    setKeyword = _d.setKeyword;
  var performSearch = function (cb) {
    setIsQuerying(true);
    search().then(function (_) {
      setIsQuerying(false);
      setSearchDone(true);
      cb && cb();
    });
  };
  var onKeydownSearch = function (e) {
    if (e.key === "Enter" && keyword) {
      searchDone ? jumpToNextMatch() : performSearch();
    }
  };
  var onChangeMatchCase = function (e) {
    setSearchDone(false);
    changeMatchCase(e.target.checked);
  };
  var onChangeWholeWords = function (e) {
    setSearchDone(false);
    changeWholeWords(e.target.checked);
  };
  var onClose = function () {
    onToggle();
    clearKeyword();
  };
  var onChangeKeyword = function (value) {
    setSearchDone(false);
    setKeyword(value);
  };
  useEffect(function () {
    var initialKeyword = store.get("initialKeyword");
    if (initialKeyword && initialKeyword.length === 1 && keyword) {
      performSearch(function () {
        store.update("initialKeyword", []);
      });
    }
  }, []);
  var searchLabel = l10n && l10n.search ? l10n.search.enterToSearch : "Enter to search";
  var previousMatchLabel = l10n && l10n.search ? l10n.search.previousMatch : "Previous match";
  var nextMatchLabel = l10n && l10n.search ? l10n.search.nextMatch : "Next match";
  var closeButtonLabel = l10n && l10n.search ? l10n.search.close : "Close";
  return createElement(
    "div",
    { className: "rpv-search__popover" },
    createElement(
      "div",
      { className: "rpv-search__popover-input-counter" },
      createElement(TextBox, { ariaLabel: searchLabel, autoFocus: true, placeholder: searchLabel, type: "text", value: keyword, onChange: onChangeKeyword, onKeyDown: onKeydownSearch }),
      createElement(
        "div",
        {
          className: classNames({
            "rpv-search__popover-counter": true,
            "rpv-search__popover-counter--ltr": !isRtl,
            "rpv-search__popover-counter--rtl": isRtl,
          }),
        },
        isQuerying && createElement(Spinner, { testId: "search__popover-searching", size: "1rem" }),
        !isQuerying && createElement("span", { "data-testid": "search__popover-num-matches" }, currentMatch, "/", numberOfMatches)
      )
    ),
    createElement(
      "label",
      { className: "rpv-search__popover-label" },
      createElement("input", { className: "rpv-search__popover-label-checkbox", "data-testid": "search__popover-match-case", checked: matchCase, type: "checkbox", onChange: onChangeMatchCase }),
      " ",
      l10n && l10n.search ? l10n.search.matchCase : "Match case"
    ),
    createElement(
      "label",
      { className: "rpv-search__popover-label" },
      createElement("input", { className: "rpv-search__popover-label-checkbox", checked: wholeWords, "data-testid": "search__popover-whole-words", type: "checkbox", onChange: onChangeWholeWords }),
      " ",
      l10n && l10n.search ? l10n.search.wholeWords : "Whole words"
    ),
    createElement(
      "div",
      { className: "rpv-search__popover-footer" },
      createElement(
        "div",
        { className: "rpv-search__popover-footer-item" },
        createElement(Tooltip, {
          ariaControlsSuffix: "search-previous-match",
          position: isRtl ? Position.BottomRight : Position.BottomCenter,
          target: createElement(MinimalButton, { ariaLabel: previousMatchLabel, isDisabled: currentMatch <= 1, onClick: jumpToPreviousMatch }, createElement(PreviousIcon, null)),
          content: function () {
            return previousMatchLabel;
          },
          offset: PORTAL_OFFSET$1,
        })
      ),
      createElement(
        "div",
        { className: "rpv-search__popover-footer-item" },
        createElement(Tooltip, {
          ariaControlsSuffix: "search-next-match",
          position: Position.BottomCenter,
          target: createElement(MinimalButton, { ariaLabel: nextMatchLabel, isDisabled: currentMatch > numberOfMatches - 1, onClick: jumpToNextMatch }, createElement(NextIcon, null)),
          content: function () {
            return nextMatchLabel;
          },
          offset: PORTAL_OFFSET$1,
        })
      ),
      createElement(
        "div",
        {
          className: classNames({
            "rpv-search__popover-footer-button": true,
            "rpv-search__popover-footer-button--ltr": !isRtl,
            "rpv-search__popover-footer-button--rtl": isRtl,
          }),
        },
        createElement(Button, { onClick: onClose }, closeButtonLabel)
      )
    )
  );
};

var ShowSearchPopoverDecorator = function (_a) {
  var children = _a.children,
    onClick = _a.onClick;
  var l10n = useContext(LocalizationContext).l10n;
  var label = l10n && l10n.search ? l10n.search.search : "Search";
  var icon = createElement(SearchIcon, null);
  return children({ icon: icon, label: label, onClick: onClick });
};

var TOOLTIP_OFFSET = { left: 0, top: 8 };
var ShowSearchPopoverButton = function (_a) {
  var enableShortcuts = _a.enableShortcuts,
    store = _a.store,
    onClick = _a.onClick;
  var ariaKeyShortcuts = enableShortcuts ? (isMac() ? "Meta+F" : "Ctrl+F") : "";
  var handleShortcutsPressed = function (areShortcutsPressed) {
    if (areShortcutsPressed) {
      onClick();
    }
  };
  useEffect(function () {
    store.subscribe("areShortcutsPressed", handleShortcutsPressed);
    return function () {
      store.unsubscribe("areShortcutsPressed", handleShortcutsPressed);
    };
  }, []);
  return createElement(ShowSearchPopoverDecorator, { onClick: onClick }, function (p) {
    return createElement(Tooltip, {
      ariaControlsSuffix: "search-popover",
      position: Position.BottomCenter,
      target: createElement(MinimalButton, { ariaKeyShortcuts: ariaKeyShortcuts, ariaLabel: p.label, testId: "search__popover-button", onClick: onClick }, p.icon),
      content: function () {
        return p.label;
      },
      offset: TOOLTIP_OFFSET,
    });
  });
};

var PORTAL_OFFSET = { left: 0, top: 8 };
var ShowSearchPopover = function (_a) {
  var children = _a.children,
    enableShortcuts = _a.enableShortcuts,
    store = _a.store;
  var direction = useContext(ThemeContext).direction;
  var portalPosition = direction === TextDirection.RightToLeft ? Position.BottomRight : Position.BottomLeft;
  var defaultChildren = function (props) {
    return createElement(ShowSearchPopoverButton, __assign({ enableShortcuts: enableShortcuts, store: store }, props));
  };
  var render = children || defaultChildren;
  return createElement(Popover, {
    ariaControlsSuffix: "search",
    lockScroll: false,
    position: portalPosition,
    target: function (toggle) {
      return render({
        onClick: toggle,
      });
    },
    content: function (toggle) {
      return createElement(SearchPopover, { store: store, onToggle: toggle });
    },
    offset: PORTAL_OFFSET,
    closeOnClickOutside: false,
    closeOnEscape: true,
  });
};

var normalizeKeywords = function (keyword) {
  return Array.isArray(keyword)
    ? keyword.map(function (k) {
        return normalizeSingleKeyword(k);
      })
    : [normalizeSingleKeyword(keyword)];
};
var useSearchPlugin = function (props) {
  var searchPluginProps = useMemo(function () {
    return Object.assign({}, { enableShortcuts: true, onHighlightKeyword: function () {} }, props);
  }, []);
  var store = useMemo(function () {
    return createStore({
      initialKeyword: props && props.keyword ? (Array.isArray(props.keyword) ? props.keyword : [props.keyword]) : [],
      keyword: props && props.keyword ? normalizeKeywords(props.keyword) : [EMPTY_KEYWORD_REGEXP],
      matchPosition: {
        matchIndex: -1,
        pageIndex: -1,
      },
      renderStatus: new Map(),
    });
  }, []);
  var _a = useSearch(store),
    clearKeyword = _a.clearKeyword,
    jumpToMatch = _a.jumpToMatch,
    jumpToNextMatch = _a.jumpToNextMatch,
    jumpToPreviousMatch = _a.jumpToPreviousMatch,
    searchFor = _a.searchFor,
    setKeywords = _a.setKeywords,
    setTargetPages = _a.setTargetPages;
  var SearchDecorator = function (props) {
    return createElement(Search, __assign({}, props, { store: store }));
  };
  var ShowSearchPopoverDecorator = function (props) {
    return createElement(ShowSearchPopover, __assign({ enableShortcuts: searchPluginProps.enableShortcuts }, props, { store: store }));
  };
  var ShowSearchPopoverButtonDecorator = function () {
    return createElement(ShowSearchPopoverDecorator, null, function (props) {
      return createElement(ShowSearchPopoverButton, __assign({ enableShortcuts: searchPluginProps.enableShortcuts, store: store }, props));
    });
  };
  var renderViewer = function (renderViewerProps) {
    var currentSlot = renderViewerProps.slot;
    if (currentSlot.subSlot) {
      currentSlot.subSlot.children = createElement(Fragment, null, searchPluginProps.enableShortcuts && createElement(ShortcutHandler, { containerRef: renderViewerProps.containerRef, store: store }), currentSlot.subSlot.children);
    }
    return currentSlot;
  };
  var renderPageLayer = function (renderProps) {
    return createElement(Highlights, { key: renderProps.pageIndex, numPages: renderProps.doc.numPages, pageIndex: renderProps.pageIndex, renderHighlights: props === null || props === void 0 ? void 0 : props.renderHighlights, store: store, onHighlightKeyword: searchPluginProps.onHighlightKeyword });
  };
  return {
    install: function (pluginFunctions) {
      var initialKeyword = props && props.keyword ? (Array.isArray(props.keyword) ? props.keyword : [props.keyword]) : [];
      var keyword = props && props.keyword ? normalizeKeywords(props.keyword) : [EMPTY_KEYWORD_REGEXP];
      store.update("initialKeyword", initialKeyword);
      store.update("jumpToDestination", pluginFunctions.jumpToDestination);
      store.update("jumpToPage", pluginFunctions.jumpToPage);
      store.update("keyword", keyword);
    },
    renderPageLayer: renderPageLayer,
    renderViewer: renderViewer,
    uninstall: function (props) {
      var renderStatus = store.get("renderStatus");
      if (renderStatus) {
        renderStatus.clear();
      }
    },
    onDocumentLoad: function (props) {
      store.update("doc", props.doc);
    },
    onTextLayerRender: function (props) {
      var renderStatus = store.get("renderStatus");
      if (renderStatus) {
        renderStatus = renderStatus.set(props.pageIndex, props);
        store.update("renderStatus", renderStatus);
      }
    },
    Search: SearchDecorator,
    ShowSearchPopover: ShowSearchPopoverDecorator,
    ShowSearchPopoverButton: ShowSearchPopoverButtonDecorator,
    clearHighlights: function () {
      clearKeyword();
    },
    highlight: function (keyword) {
      var keywords = Array.isArray(keyword) ? keyword : [keyword];
      setKeywords(keywords);
      return searchFor(keywords);
    },
    jumpToMatch: jumpToMatch,
    jumpToNextMatch: jumpToNextMatch,
    jumpToPreviousMatch: jumpToPreviousMatch,
    setTargetPages: setTargetPages,
  };
};

export { NextIcon, PreviousIcon, SearchIcon, useSearchPlugin };
