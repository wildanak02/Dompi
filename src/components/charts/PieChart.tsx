import React from 'react';
import { View } from 'react-native';
import { Svg, G, Path, Circle } from 'react-native-svg';
import { useTheme } from '@/contexts/ThemeContext';

function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
  return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const p1 = polarToCartesian(cx, cy, r, startAngle);
  const p2 = polarToCartesian(cx, cy, r, endAngle);
  const largeArc = endAngle - startAngle <= Math.PI ? 0 : 1;
  return `M ${cx} ${cy} L ${p1.x} ${p1.y} A ${r} ${r} 0 ${largeArc} 1 ${p2.x} ${p2.y} Z`;
}

interface PieChartProps {
  data: { label: string; value: number; color: string }[];
  radius?: number;
  innerRadius?: number;
}

export default function PieChart({ data, radius = 70, innerRadius = 35 }: PieChartProps) {
  const { theme } = useTheme();
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  let startAngle = -Math.PI / 2;

  const arcs = data.map((d) => {
    const angle = (d.value / total) * Math.PI * 2;
    const endAngle = startAngle + angle;
    const path = describeArc(0, 0, radius, startAngle, endAngle);
    const item = { path, color: d.color };
    startAngle = endAngle;
    return item;
  });

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={radius * 2} height={radius * 2} viewBox={`${-radius} ${-radius} ${radius * 2} ${radius * 2}`}>
        <G>
          {arcs.map((a, i) => (<Path key={i} d={a.path} fill={a.color} />))}
          {innerRadius > 0 && (<Circle cx={0} cy={0} r={innerRadius} fill={theme.card} />)}
        </G>
      </Svg>
    </View>
  );
}
