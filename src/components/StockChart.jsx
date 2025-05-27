import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

const StockChart = ({ data }) => {
  if (!data || data.length === 0) {
    return <div>No data available</div>;
  }

  // Calculate average price
  const avgPrice =
    data.reduce((sum, point) => sum + point.price, 0) / data.length;

  // Format tooltip content
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const point = payload[0].payload;
      return (
        <div style={{ backgroundColor: 'white', padding: 10, border: '1px solid #ccc' }}>
          <p>{`Time: ${new Date(point.lastUpdatedAt).toLocaleTimeString()}`}</p>
          <p>{`Price: $${point.price.toFixed(2)}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="lastUpdatedAt"
          tickFormatter={(timeStr) => new Date(timeStr).toLocaleTimeString()}
        />
        <YAxis domain={['auto', 'auto']} />
        <Tooltip content={<CustomTooltip />} />
        <Line type="monotone" dataKey="price" stroke="#1976d2" dot={false} />
        <ReferenceLine y={avgPrice} label={`Avg: $${avgPrice.toFixed(2)}`} stroke="#ff7300" strokeDasharray="3 3" />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default StockChart;
