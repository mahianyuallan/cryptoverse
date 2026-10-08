import React, {useMemo, useState} from 'react'
import HTMLReactParser from 'html-react-parser';
import {Avatar, Button, Col, Input, Result, Row, Select, Statistic, Table, Tag, Tooltip, Typography} from 'antd';
import {GlobalOutlined, SearchOutlined} from '@ant-design/icons';

import {useGetExchangesQuery} from '../services/coinGeckoApi';
import {useGetCryptosQuery} from '../services/cryptoApi';

const {Title, Text, Paragraph} = Typography;

// Bitcoin's id in the Coinranking API. CoinGecko quotes exchange volumes in BTC, so Bitcoin's price turns them into dollars.
const BITCOIN_UUID = 'Qwsogvtv82FCd';

const formatCompact = (value, options = {}) => new Intl.NumberFormat('en-US', {notation: 'compact', maximumFractionDigits: 2, ...options}).format(value);

// CoinGecko's Trust Score runs from 1 to 10
const trustColor = (score) => (score >= 8 ? 'green' : score >= 5 ? 'gold' : 'red');

// CoinGecko sometimes reports impossible volumes (one exchange has claimed 170 billion BTC in a day, far more than the
// 21 million BTC that will ever exist). Treat anything above that as unreliable: show "—" and leave it out of totals.
const MAX_PLAUSIBLE_BTC_VOLUME = 21000000;
const reliableVolume = (exchange) => (exchange.trade_volume_24h_btc <= MAX_PLAUSIBLE_BTC_VOLUME ? exchange.trade_volume_24h_btc : null);

const Exchanges = () => {
  const {data: exchanges, isFetching, isError, refetch} = useGetExchangesQuery();
  const {data: cryptosList} = useGetCryptosQuery(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [country, setCountry] = useState();

  const countries = useMemo(() => [...new Set((exchanges || []).map((exchange) => exchange.country).filter(Boolean))].sort(), [exchanges]);

  const filteredExchanges = useMemo(() => (exchanges || []).filter((exchange) => (
    exchange.name.toLowerCase().includes(searchTerm.toLowerCase()) && (!country || exchange.country === country)
  )), [exchanges, searchTerm, country]);

  if(isError) {
    return (
      <Result
        status="warning"
        title="Couldn't load exchanges"
        subTitle="CoinGecko didn't respond. Its free API only allows a few requests a minute, so wait a moment and try again."
        extra={<Button type="primary" onClick={refetch}>Try again</Button>}
      />
    );
  }

  // Show volumes in dollars once Bitcoin's price is known, in BTC until then
  const btcPrice = Number(cryptosList?.data?.coins?.find((coin) => coin.uuid === BITCOIN_UUID)?.price);
  const formatVolume = (btcVolume) => (btcPrice ? formatCompact(btcVolume * btcPrice, {style: 'currency', currency: 'USD'}) : `${formatCompact(btcVolume)} BTC`);
  const totalVolume = (exchanges || []).reduce((sum, exchange) => sum + (reliableVolume(exchange) ?? 0), 0);

  const columns = [
    {
      title: '#',
      dataIndex: 'trust_score_rank',
      width: 60,
      defaultSortOrder: 'ascend',
      sorter: (a, b) => a.trust_score_rank - b.trust_score_rank,
    },
    {
      title: 'Exchange',
      dataIndex: 'name',
      render: (name, exchange) => (
        <span className="exchange-name">
          <Avatar src={exchange.image} size="small" />
          <Text strong>{name}</Text>
        </span>
      ),
    },
    {
      title: 'Trust Score',
      dataIndex: 'trust_score',
      sorter: (a, b) => a.trust_score - b.trust_score,
      render: (score) => <Tag color={trustColor(score)}>{score}/10</Tag>,
    },
    {
      title: '24h Volume',
      dataIndex: 'trade_volume_24h_btc',
      sorter: (a, b) => (reliableVolume(a) ?? -1) - (reliableVolume(b) ?? -1),
      render: (btcVolume, exchange) => (reliableVolume(exchange) == null
        ? <Tooltip title="CoinGecko reports an impossible volume for this exchange">—</Tooltip>
        : formatVolume(btcVolume)),
    },
    {
      title: 'Established',
      dataIndex: 'year_established',
      responsive: ['md'],
      sorter: (a, b) => (a.year_established || 9999) - (b.year_established || 9999),
      render: (year) => year || '—',
    },
    {
      title: 'Country',
      dataIndex: 'country',
      responsive: ['lg'],
      render: (exchangeCountry) => exchangeCountry || '—',
    },
  ];

  // The details shown when an exchange is opened; phones hide the Established and Country columns, so repeat them here
  const renderDetails = (exchange) => (
    <div className="exchange-details">
      <Paragraph>{exchange.description ? HTMLReactParser(exchange.description) : 'No description available.'}</Paragraph>
      {(exchange.country || exchange.year_established) && (
        <Text type="secondary">
          {[exchange.country, exchange.year_established && `Established ${exchange.year_established}`].filter(Boolean).join(' · ')}
        </Text>
      )}
      <a href={exchange.url} target="_blank" rel="noreferrer"><GlobalOutlined /> Visit {exchange.name}</a>
    </div>
  );

  return (
    <>
      <Title level={2} className="heading">Cryptocurrency Exchanges</Title>
      <Text type="secondary">The top 250 exchanges, ranked by CoinGecko's Trust Score. Select an exchange to see more.</Text>

      {exchanges && (
        <Row gutter={[32, 16]} className="exchanges-stats">
          <Col xs={12} md={8}><Statistic title="Exchanges listed" value={exchanges.length} /></Col>
          <Col xs={12} md={8}><Statistic title="Combined 24h volume" value={formatVolume(totalVolume)} /></Col>
          <Col xs={24} md={8}><Statistic title="Trust Score 10/10" value={exchanges.filter((exchange) => exchange.trust_score === 10).length} /></Col>
        </Row>
      )}

      <div className="exchanges-filters">
        <Input placeholder="Search exchanges" prefix={<SearchOutlined />} allowClear onChange={(e) => setSearchTerm(e.target.value)} />
        <Select
          showSearch
          allowClear
          placeholder="All countries"
          value={country}
          onChange={setCountry}
          options={countries.map((name) => ({value: name, label: name}))}
        />
      </div>

      <Table
        rowKey="id"
        size="middle"
        columns={columns}
        dataSource={filteredExchanges}
        loading={isFetching}
        expandable={{expandedRowRender: renderDetails, expandRowByClick: true}}
        pagination={{pageSize: 25, showSizeChanger: false, responsive: true}}
      />

      <Text type="secondary" className="exchanges-source">
        Exchange data from <a href="https://www.coingecko.com/" target="_blank" rel="noreferrer">CoinGecko</a>
      </Text>
    </>
  )
}

export default Exchanges
