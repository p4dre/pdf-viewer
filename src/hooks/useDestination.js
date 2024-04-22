import { useCallback } from "react";
import useStack from "./useStack";
import useQueue from "./useQueue";

var MAX_QUEUE_LENGTH = 50;
const useDestination = (props) => {
  const { getCurrentPage } = props;
  var previousDestinations = useStack(MAX_QUEUE_LENGTH);
  var nextDestinations = useQueue(MAX_QUEUE_LENGTH);
  var getNextDestination = function () {
    var nextDest = nextDestinations.dequeue();
    if (nextDest) {
      previousDestinations.push(nextDest);
    }
    if (nextDest && nextDest.pageIndex === getCurrentPage()) {
      return getNextDestination();
    }
    return nextDest;
  };
  var getPreviousDestination = function () {
    var prevDest = previousDestinations.pop();
    if (prevDest) {
      nextDestinations.enqueue(prevDest);
    }
    if (prevDest && prevDest.pageIndex === getCurrentPage()) {
      return getPreviousDestination();
    }
    return prevDest;
  };
  var markVisitedDestination = useCallback(function (destination) {
    previousDestinations.push(destination);
  }, []);
  return {
    getNextDestination: getNextDestination,
    getPreviousDestination: getPreviousDestination,
    markVisitedDestination: markVisitedDestination,
  };
};

export default useDestination;
