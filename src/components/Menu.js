import { useRef, useContext, useLayoutEffect } from "react";
import ThemeContext from "../context/ThemeContext";
import { TextDirection } from "../enums";

const Menu = (_a) => {
  var children = _a.children;
  var containerRef = useRef();
  var visibleMenuItemsRef = useRef([]);
  var direction = useContext(ThemeContext).direction;
  var isRtl = direction === TextDirection.RightToLeft;
  var handleKeyDown = function (e) {
    var container = containerRef.current;
    if (!container) {
      return;
    }
    switch (e.key) {
      case "Tab":
        e.preventDefault();
        break;
      case "ArrowDown":
        e.preventDefault();
        moveToItem(function (_, currentIndex) {
          return currentIndex + 1;
        });
        break;
      case "ArrowUp":
        e.preventDefault();
        moveToItem(function (_, currentIndex) {
          return currentIndex - 1;
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
  var moveToItem = function (getNextItem) {
    var container = containerRef.current;
    if (!container) {
      return;
    }
    var items = visibleMenuItemsRef.current;
    var currentIndex = items.findIndex(function (item) {
      return item.getAttribute("tabindex") === "0";
    });
    var targetIndex = Math.min(items.length - 1, Math.max(0, getNextItem(items, currentIndex)));
    if (currentIndex >= 0 && currentIndex <= items.length - 1) {
      items[currentIndex].setAttribute("tabindex", "-1");
    }
    items[targetIndex].setAttribute("tabindex", "0");
    items[targetIndex].focus();
  };
  var findVisibleItems = function (container) {
    var visibleItems = [];
    container.querySelectorAll('.rpv-core__menu-item[role="menuitem"]').forEach(function (item) {
      if (item instanceof HTMLElement) {
        var parent_1 = item.parentElement;
        if (parent_1 === container) {
          visibleItems.push(item);
        } else {
          if (window.getComputedStyle(parent_1).display !== "none") {
            visibleItems.push(item);
          }
        }
      }
    });
    return visibleItems;
  };
  useLayoutEffect(function () {
    var container = containerRef.current;
    if (!container) {
      return;
    }
    var visibleItems = findVisibleItems(container);
    visibleMenuItemsRef.current = visibleItems;
  }, []);
  useLayoutEffect(function () {
    document.addEventListener("keydown", handleKeyDown);
    return function () {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);
  return (
    <div ref={containerRef} role="menu" tabIndex={0} ariaOrientation="vertical" className={`rpv-core__menu ${isRtl ? "rpv-core__menu--rtl" : ""}`}>
      {children}
    </div>
  );
};

export default Menu;
