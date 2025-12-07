import React from "react";
import { G, Line, Text } from "react-native-svg";

interface CoordinateSystemProps {
  width: number;
  height: number;
  step?: number;
  axisColor?: string;
  gridColor?: string;
}

const CoordinateSystem: React.FC<CoordinateSystemProps> = ({
  width,
  height,
  step = 50,
  axisColor = "black",
  gridColor = "#ccc",
}) => {
  const xTicks = [];
  for (let x = 0; x <= width; x += step) {
    xTicks.push(x);
  }

  const yTicks = [];
  for (let y = 0; y <= height; y += step) {
    yTicks.push(y);
  }

  return (
    <G>
      {/* Lưới dọc */}
      {xTicks.map((x, idx) => (
        <Line
          key={`xgrid-${idx}`}
          x1={x}
          y1={0}
          x2={x}
          y2={height}
          stroke={gridColor}
          strokeWidth={1}
          strokeDasharray="4 4" // nét đứt
        />
      ))}

      {/* Lưới ngang */}
      {yTicks.map((y, idx) => (
        <Line
          key={`ygrid-${idx}`}
          x1={0}
          y1={y}
          x2={width}
          y2={y}
          stroke={gridColor}
          strokeWidth={1}
          strokeDasharray="4 4"
        />
      ))}

      {/* Trục X */}
      <Line x1={0} y1={0} x2={width} y2={0} stroke={axisColor} strokeWidth={2} />

      {/* Trục Y */}
      <Line x1={0} y1={0} x2={0} y2={height} stroke={axisColor} strokeWidth={2} />

      {/* Tick + label trục X */}
      {xTicks.map((x, idx) => (
        <React.Fragment key={`xtick-${idx}`}>
          <Line x1={x} y1={-5} x2={x} y2={5} stroke={axisColor} strokeWidth={1} />
          <Text x={x} y={20} fontSize="10" fill={axisColor} textAnchor="middle">
            {x}
          </Text>
        </React.Fragment>
      ))}

      {/* Tick + label trục Y */}
      {yTicks.map((y, idx) => (
        <React.Fragment key={`ytick-${idx}`}>
          <Line x1={-5} y1={y} x2={5} y2={y} stroke={axisColor} strokeWidth={1} />
          {y !== 0 && (
            <Text
              x={20}
              y={y + 3}
              fontSize="10"
              fill={axisColor}
              textAnchor="start"
            >
              {y}
            </Text>
          )}
        </React.Fragment>
      ))}
    </G>
  );
};

export default CoordinateSystem;
