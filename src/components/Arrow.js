import { Position } from "../enums";

const Arrow = (props) => {
  const { customClassName, position } = props;
  const topLeft = position === Position.TopLeft ? "rpv-core__arrow--tl" : "";
  const topCenter = position === Position.TopCenter ? "rpv-core__arrow--tc" : "";
  const topRight = position === Position.TopRight ? "rpv-core__arrow--tr" : "";
  const rightTop = position === Position.RightTop ? "rpv-core__arrow--rt" : "";
  const rightCenter = position === Position.RightCenter ? "rpv-core__arrow--rc" : "";
  const rightBottom = position === Position.RightBottom ? "rpv-core__arrow--rb" : "";
  const bottomLeft = position === Position.BottomLeft ? "rpv-core__arrow--bl" : "";
  const bottomCenter = position === Position.BottomCenter ? "rpv-core__arrow--bc" : "";
  const bottomRight = position === Position.BottomRight ? "rpv-core__arrow--br" : "";
  const leftTop = position === Position.LeftTop ? "rpv-core__arrow--lt" : "";
  const leftCenter = position === Position.LeftCenter ? "rpv-core__arrow--lc" : "";
  const leftBottom = position === Position.LeftBottom ? "rpv-core__arrow--lb" : "";
  return <div className={`rpv-core__arrow ${topLeft} ${topCenter} ${topRight} ${rightTop} ${rightCenter} ${rightBottom} ${bottomLeft} ${bottomCenter} ${bottomRight} ${leftTop} ${leftCenter} ${leftBottom} ${customClassName}`}></div>;
};

export default Arrow;
