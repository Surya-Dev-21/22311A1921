import React, { useEffect, useState } from 'react';
import { Typography, FormControl, InputLabel, Select, MenuItem, Box, CircularProgress } from '@mui/material';
import CorrelationHeatmapChart from '../components/CorrelationHeatmapChart';
import { fetchStocks, fetchStockPrice } from '../api/stockApi';

const timeIntervals = [
  { label: '5 minutes', value: 5 },
  { label: '15 minutes', value: 15 },
  { label: '30 minutes', value: 30 },
  { label: '60 minutes', value: 60 },
];

const CorrelationHeatmap = () => {
  const [stocks, setStocks] = useState({});
  const [timeInterval, setTimeInterval] = useState(5);
  const [priceData, setPriceData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadStocks = async () => {
      try {
        const stocksData = await fetchStocks();
        setStocks(stocksData);
      } catch (err) {
        setError(err.message);
      }
    };
    loadStocks();
  }, []);

  useEffect(() => {
    if (Object.keys(stocks).length === 0) return;

    const loadPriceData = async () => {
      setLoading(true);
      setError(null);
      try {
        const dataPromises = Object.values(stocks).map((ticker) =>
          fetchStockPrice(ticker, timeInterval)
        );
        const results = await Promise.all(dataPromises);
        const priceMap = {};
        Object.keys(stocks).forEach((name, idx) => {
          priceMap[stocks[name]] = results[idx];
        });
        setPriceData(priceMap);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadPriceData();
  }, [stocks, timeInterval]);

  const handleTimeIntervalChange = (event) => {
    setTimeInterval(event.target.value);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Correlation Heatmap
      </Typography>
      {error && <Typography color="error">{error}</Typography>}
      <FormControl sx={{ minWidth: 150, marginBottom: 2 }}>
        <InputLabel id="time-interval-label">Time Interval</InputLabel>
        <Select
          labelId="time-interval-label"
          value={timeInterval}
          label="Time Interval"
          onChange={handleTimeIntervalChange}
        >
          {timeIntervals.map((interval) => (
            <MenuItem key={interval.value} value={interval.value}>
              {interval.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {loading ? (
        <Box sx={{ marginTop: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <CorrelationHeatmapChart priceData={priceData} stocks={stocks} />
      )}
    </Box>
  );
};

export default CorrelationHeatmap;
