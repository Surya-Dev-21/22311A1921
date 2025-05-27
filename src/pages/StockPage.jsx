import React, { useEffect, useState } from 'react';
import { Typography, FormControl, InputLabel, Select, MenuItem, Box, CircularProgress } from '@mui/material';
import { fetchStocks, fetchStockPrice } from '../api/stockApi';
import StockChart from '../components/StockChart';

const timeIntervals = [
  { label: '5 minutes', value: 5 },
  { label: '15 minutes', value: 15 },
  { label: '30 minutes', value: 30 },
  { label: '60 minutes', value: 60 },
];

const StockPage = () => {
  const [stocks, setStocks] = useState({});
  const [selectedTicker, setSelectedTicker] = useState('');
  const [timeInterval, setTimeInterval] = useState(5);
  const [priceData, setPriceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadStocks = async () => {
      try {
        const stocksData = await fetchStocks();
        setStocks(stocksData);
        const firstTicker = Object.values(stocksData)[0];
        setSelectedTicker(firstTicker);
      } catch (err) {
        setError(err.message);
      }
    };
    loadStocks();
  }, []);

  useEffect(() => {
    if (!selectedTicker) return;
    const loadPriceData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchStockPrice(selectedTicker, timeInterval);
        // data is array of price points or single object
        const pricePoints = Array.isArray(data) ? data : [data];
        setPriceData(pricePoints);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadPriceData();
  }, [selectedTicker, timeInterval]);

  const handleTickerChange = (event) => {
    setSelectedTicker(event.target.value);
  };

  const handleTimeIntervalChange = (event) => {
    setTimeInterval(event.target.value);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Stock Price Chart
      </Typography>
      {error && <Typography color="error">{error}</Typography>}
      <FormControl sx={{ minWidth: 200, marginRight: 2 }}>
        <InputLabel id="ticker-label">Stock</InputLabel>
        <Select
          labelId="ticker-label"
          value={selectedTicker}
          label="Stock"
          onChange={handleTickerChange}
        >
          {Object.entries(stocks).map(([name, ticker]) => (
            <MenuItem key={ticker} value={ticker}>
              {name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl sx={{ minWidth: 150 }}>
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
        <StockChart data={priceData} />
      )}
    </Box>
  );
};

export default StockPage;
