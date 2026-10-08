import React from 'react'
import {Line} from 'react-chartjs-2';
import {Col, Row, Typography} from 'antd';

const {Title} = Typography;

// Prices run from fractions of a cent to tens of thousands of dollars: show cents above $1, significant digits below
const formatPrice = (value) => new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  ...(Math.abs(value) >= 1 ? {maximumFractionDigits: 2} : {maximumSignificantDigits: 4}),
}).format(value);

const formatAxisPrice = (value) => new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD', notation: 'compact', maximumSignificantDigits: 4}).format(value);

const LineChart = ({coinHistory, currentPrice, coinName, isFetching}) => {
  if(!coinHistory?.data?.history) return 'Loading chart...';

  // The API sends the newest point first, with timestamps in seconds, so put it in time order and convert to milliseconds
  const history = [...coinHistory.data.history].reverse();
  const coinPrice = history.map((point) => (point.price == null ? null : Number(point.price)));
  const coinTimestamp = history.map((point) => point.timestamp * 1000);

  // Label the time axis with times for short periods, day + hour up to two weeks (so ticks within one day stay distinct),
  // days up to six months and months beyond that
  const spanDays = (coinTimestamp[coinTimestamp.length - 1] - coinTimestamp[0]) / 86400000;
  const labelFormat = spanDays <= 2 ? {hour: '2-digit', minute: '2-digit'}
    : spanDays <= 14 ? {month: 'short', day: 'numeric', hour: 'numeric'}
    : spanDays <= 180 ? {month: 'short', day: 'numeric'}
    : {month: 'short', year: 'numeric'};

  const change = coinHistory.data.change;
  const isDown = Number(change) < 0;
  const lineColor = isDown ? '#e5484d' : '#16a34a';

  const data = {
    labels: coinTimestamp.map((ms) => new Date(ms).toLocaleString([], labelFormat)),
    datasets: [
      {
        label: 'Price In USD',
        data: coinPrice,
        fill: true,
        backgroundColor: isDown ? 'rgba(229, 72, 77, 0.08)' : 'rgba(22, 163, 74, 0.08)',
        borderColor: lineColor,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 4,
        tension: 0.1,
      },
    ],
  };

  const options = {
    animation: false,
    interaction: {mode: 'index', intersect: false},
    plugins: {
      legend: {display: false},
      tooltip: {
        callbacks: {
          title: (items) => new Date(coinTimestamp[items[0].dataIndex]).toLocaleString(),
          label: (item) => formatPrice(item.parsed.y),
        },
      },
    },
    scales: {
      x: {grid: {display: false}, ticks: {maxTicksLimit: 8, maxRotation: 0}},
      y: {ticks: {callback: (value) => formatAxisPrice(value)}},
    },
  };

  return (
    <>
      <Row className="chart-header">
        <Title level={2} className="chart-title">{coinName} Price Chart</Title>
        <Col className="price-container">
          <Title level={5} className="price-change" style={{color: lineColor}}>
            Change: {change == null ? 'N/A' : `${isDown ? '' : '+'}${change}%`}
          </Title>
          <Title level={5} className="current-price">
            Current {coinName} Price: {currentPrice == null ? 'N/A' : formatPrice(currentPrice)}
          </Title>
        </Col>
      </Row>
      <div style={{opacity: isFetching ? 0.5 : 1}}>
        <Line data={data} options={options} />
      </div>
    </>
  )
}

export default LineChart
