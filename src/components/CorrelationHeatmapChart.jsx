import React, { useMemo } from 'react';
import { Box, Typography } from '@mui/material';

// Helper functions for correlation calculations
function covariance(X, Y) {
  const n = X.length;
  const meanX = X.reduce((a, b) => a + b, 0) / n;
  const meanY = Y.reduce((a, b) => a + b, 0) / n;
  let cov = 0;
  for (let i = 0; i < n; i++) {
    cov += (X[i] - meanX) * (Y[i] - meanY);
  }
  return cov / (n - 1);
}

function standardDeviation(X) {
  const n = X.length;
  const meanX = X.reduce((a, b) => a + b, 0) / n;
  let variance = 0;
  for (let i = 0; i < n; i++) {
    variance += (X[i] - meanX) ** 2;
  }
  return Math.sqrt(variance / (n - 1));
}

function pearsonCorrelation(X, Y) {
  return covariance(X, Y) / (standardDeviation(X) * standardDeviation(Y));
}

// Map correlation coefficient to color
function correlationToColor(corr) {
  // Blue for strong negative, white for zero, red for strong positive
  const r = corr > 0 ? 255 : Math.floor(255 * (1 + corr));
  const g = Math.floor(255 * (1 - Math.abs(corr)));
  const b = corr < 0 ? 255 : Math.floor(255 * (1 - corr));
  return `rgb(${r},${g},${b})`;
}

const CorrelationHeatmapChart = ({ priceData, stocks }) => {
  const stockTickers = Object.values(stocks);
  const stockNames = Object.keys(stocks);

  // Prepare price arrays aligned by index for correlation calculation
  const alignedPrices = useMemo(() => {
    const minLength = Math.min(
      ...stockTickers.map((ticker) => (priceData[ticker] ? priceData[ticker].length : 0))
    );
    const aligned = {};
    stockTickers.forEach((ticker) => {
      aligned[ticker] = priceData[ticker]
        ? priceData[ticker].slice(0, minLength).map((p) => p.price)
        : Array(minLength).fill(0);
    });
    return aligned;
  }, [priceData, stockTickers]);

  // Calculate correlation matrix
  const correlationMatrix = useMemo(() => {
    const matrix = [];
    for (let i = 0; i < stockTickers.length; i++) {
      const row = [];
      for (let j = 0; j < stockTickers.length; j++) {
        if (i === j) {
          row.push(1);
        } else {
          const X = alignedPrices[stockTickers[i]];
          const Y = alignedPrices[stockTickers[j]];
          if (X.length === 0 || Y.length === 0) {
            row.push(0);
          } else {
            row.push(pearsonCorrelation(X, Y));
          }
        }
      }
      matrix.push(row);
    }
    return matrix;
  }, [alignedPrices, stockTickers]);

  return (
    <Box sx={{ overflowX: 'auto' }}>
      <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 600 }}>
        <thead>
          <tr>
            <th></th>
            {stockNames.map((name) => (
              <th key={name} style={{ border: '1px solid #ddd', padding: 8, textAlign: 'center' }}>
                {name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {stockNames.map((name, i) => (
            <tr key={name}>
              <td style={{ border: '1px solid #ddd', padding: 8, fontWeight: 'bold' }}>{name}</td>
              {correlationMatrix[i].map((corr, j) => (
                <td
                  key={j}
                  style={{
                    border: '1px solid #ddd',
                    padding: 8,
                    backgroundColor: correlationToColor(corr),
                    color: Math.abs(corr) > 0.5 ? 'white' : 'black',
                    textAlign: 'center',
                    cursor: 'default',
                  }}
                  title={`Correlation: ${corr.toFixed(2)}`}
                >
                  {corr.toFixed(2)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <Box sx={{ marginTop: 2 }}>
        <Typography variant="subtitle1">Color Legend:</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 20, height: 20, backgroundColor: 'rgb(0,0,255)' }} />
          <Typography>Strong Negative</Typography>
          <Box sx={{ width: 20, height: 20, backgroundColor: 'rgb(255,255,255)' }} />
          <Typography>Zero</Typography>
          <Box sx={{ width: 20, height: 20, backgroundColor: 'rgb(255,0,0)' }} />
          <Typography>Strong Positive</Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default CorrelationHeatmapChart;
