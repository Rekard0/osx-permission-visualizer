import { getMarkerEnd, BaseEdge } from 'reactflow';

export default function SelfLoopEdge({
  id,
  sourceX,
  sourceY,
  data,
  arrowHeadType,
  markerEndId,
  label, ...props
}) {
  const indx = data.index+1
  // Adjust these values based on the size and desired position of the loop
  const loopRadiusX = 50 + indx *10;
  const loopRadiusY = 75 + indx *10;
  const offsetX = -5 ;
  const offsetY = -10 ;

  const edgePath = `
    M ${sourceX + offsetX} ${sourceY + offsetY}
    a ${loopRadiusX} ${loopRadiusY} 0 1 0 ${loopRadiusX * 2} 0
    a ${loopRadiusX} ${loopRadiusY} 0 1 0 ${-loopRadiusX * 2} 0
  `;
  const markerEnd = getMarkerEnd(arrowHeadType, markerEndId);

  // Adjust label position as needed
  const labelX = sourceX + offsetX + 40+ loopRadiusX + 10 * indx;
  const labelY = sourceY + offsetY * indx;
  const padding = 4; // Padding around the text
  const boxWidth = label.length * 8 + padding * 2; // Estimate width based on character count
  const boxHeight = 20; // Fixed height

  // Rotation transform
  const rotationDegree = 90;
  const transform = `rotate(${rotationDegree}, ${labelX}, ${labelY})`;

  return (
    <>
      <BaseEdge id={id} path={edgePath} markerEnd={markerEnd} {...props} />
      <g transform={transform}>
        <rect
          x={labelX - boxWidth / 2}
          y={labelY - boxHeight / 2}
          width={boxWidth}
          height={boxHeight}
          fill="white"
          stroke="black"
          strokeWidth="1"
        />
        <text
          x={labelX}
          y={labelY + 5} // Adjust for vertical alignment
          textAnchor="middle"
          style={{ fontSize: '12px', fill: 'black' }}
        >
          {label}
        </text>
      </g>
    </>
  );
}