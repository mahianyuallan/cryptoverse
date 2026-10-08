import React, {useState} from 'react'
import HTMLReactParser from 'html-react-parser';
import {useParams} from 'react-router-dom';
import {Col, Typography, Select} from 'antd';
import {MoneyCollectOutlined, DollarCircleOutlined, FundOutlined, ExclamationCircleOutlined, StopOutlined, TrophyOutlined, CheckOutlined, NumberOutlined, ThunderboltOutlined} from '@ant-design/icons';
import {useGetCryptoDetailsQuery, useGetCryptoHistoryQuery} from '../services/cryptoApi';
import {useGetCoinDescriptionQuery} from '../services/coinGeckoApi';
import LineChart from './LineChart';
import descriptionSections from '../utils/descriptionSections';
import formatValue from '../utils/formatValue';


const {Title, Text} = Typography;
const {Option} = Select;

// Every time period the price history API accepts. It rejects anything else (e.g. 5d, 6m or ytd).
const timePeriods = [
  {value: '1h', label: '1 Hour'},
  {value: '3h', label: '3 Hours'},
  {value: '12h', label: '12 Hours'},
  {value: '24h', label: '1 Day'},
  {value: '7d', label: '7 Days'},
  {value: '30d', label: '30 Days'},
  {value: '3m', label: '3 Months'},
  {value: '1y', label: '1 Year'},
  {value: '3y', label: '3 Years'},
  {value: '5y', label: '5 Years'},
  {value: 'all', label: 'All Time'},
];

// Keep any line breaks inside a paragraph. HTMLReactParser also turns any links in the text into real links.
const renderParagraph = (text) => HTMLReactParser(text.replace(/\r?\n/g, '<br />'));

const CryptoDetails = () => {
  const {coinId} = useParams();
  const [timePeriod, setTimePeriod] = useState('7d');
  const {data: cryptoDetails, isFetching: isCryptoDetailsFetching} = useGetCryptoDetailsQuery(coinId);
  const {data: cryptoHistory, isFetching: isCryptoHistoryFetching} = useGetCryptoHistoryQuery({coinId, timeperiod: timePeriod});
  const coinGeckoId = cryptoDetails?.data?.coin?.coinGeckoId;
  const {data: fullDescription} = useGetCoinDescriptionQuery(coinGeckoId, {skip: !coinGeckoId});

  if(isCryptoDetailsFetching) return 'Loading...';

  const coin = cryptoDetails?.data?.coin;

  // Only use CoinGecko's full description if it belongs to this coin: the hook keeps the previous coin's result while
  // the next one loads or if the request fails. Otherwise fall back to the one-sentence description.
  const description = (fullDescription?.coinGeckoId === coin?.coinGeckoId && fullDescription?.text) || coin?.description;
  const {overview, sections} = descriptionSections(description || '', coin?.name);

  const stats = [
    {title: 'Price to USD', value: `$ ${formatValue(coin?.price)}`, icon: <DollarCircleOutlined />},
    {title: 'Rank', value: coin?.rank, icon: <NumberOutlined />},
    {title: '24h Volume', value: `$ ${formatValue(coin?.['24hVolume'])}`, icon: <ThunderboltOutlined />},
    {title: 'Market Cap', value: `$ ${formatValue(coin?.marketCap)}`, icon: <DollarCircleOutlined />},
    {title: 'All-time-high(daily avg.)', value: `$ ${formatValue(coin?.allTimeHigh?.price)}`, icon: <TrophyOutlined />},
  ];

  // Supply is a number of coins, not dollars, so no $ here
  const genericStats = [
    {title: 'Number Of Markets', value: coin?.numberOfMarkets, icon: <FundOutlined />},
    {title: 'Number Of Exchanges', value: coin?.numberOfExchanges, icon: <MoneyCollectOutlined />},
    {title: 'Approved Supply', value: coin?.supply?.confirmed ? <CheckOutlined /> : <StopOutlined />, icon: <ExclamationCircleOutlined />},
    {title: 'Total Supply', value: formatValue(coin?.supply?.total), icon: <ExclamationCircleOutlined />},
    {title: 'Circulating Supply', value: formatValue(coin?.supply?.circulating), icon: <ExclamationCircleOutlined />},
  ];

  return (
    <Col className="coin-detail-container">
      <Col className="coin-heading-container">
        <Title level={2} className="coin-name">
          {cryptoDetails?.data?.coin?.name} ({cryptoDetails?.data?.coin?.symbol})
        </Title>
        <p>
          {cryptoDetails?.data?.coin?.name} live price in US dollars. View value statistics, market cap and supply.
        </p>
        <Text>{cryptoDetails?.data?.coin?.symbol}</Text>
      </Col>
      <Select value={timePeriod} className="select-timeperiod" placeholder="Select Time Period" onChange={(value) => setTimePeriod(value)}>
        {timePeriods.map(({value, label}) => <Option key={value} value={value}>{label}</Option>)}
      </Select>
      <LineChart coinHistory={cryptoHistory} currentPrice={coin?.price} coinName={coin?.name} isFetching={isCryptoHistoryFetching} />
      <Col className="stats-container">
        <Col className="coin-value-statistics">
          <Col className="coin-value-statistics-heading">
            <Title level={3} className="coin-details-heading">
              {cryptoDetails?.data?.coin?.name} Value Statistics
            </Title>
            <p>
              An overview showing the statistics of {cryptoDetails?.data?.coin?.name}, such as the base and quote currency, the rank, and trading volume.
            </p>
          </Col>
          {stats.map(({icon, title, value}) => (
            <Col className="coin-stats" key={title}>
              <Col className="coin-stats-name">
                <Text>{icon}</Text>
                <Text>{title}</Text>
              </Col>
              <Text className="stats">{value}</Text>
            </Col>
          ))}
        </Col>
        <Col className="other-stats-info">
          <Col className="coin-value-statistics-heading">
            <Title level={3} className="coin-details-heading">
              Other Statistics
            </Title>
            <p>
              An overview showing the stats of {cryptoDetails?.data?.coin?.name}
            </p>
          </Col>
          {genericStats.map(({icon, title, value}) => (
            <Col className="coin-stats" key={title}>
              <Col className="coin-stats-name">
                <Text>{icon}</Text>
                <Text>{title}</Text>
              </Col>
              <Text className="stats">{value}</Text>
            </Col>
          ))}
        </Col>
      </Col>
      <Col className="coin-desc-link">
        <Col className="coin-desc">
          <Title level={3} className="coin-details-heading">
            What is {cryptoDetails?.data?.coin?.name}?
          </Title>
          {overview && <p className="coin-desc-overview">{renderParagraph(overview)}</p>}
          {sections.length > 0 && (
            <div className="coin-desc-sections">
              {sections.map(({heading, paragraphs}) => (
                <div className="coin-desc-section" key={heading}>
                  <Title level={4} className="coin-desc-section-heading">{heading}</Title>
                  {paragraphs.map((paragraph) => <p key={paragraph}>{renderParagraph(paragraph)}</p>)}
                </div>
              ))}
            </div>
          )}
        </Col>
      </Col>
    </Col>
  )
}

export default CryptoDetails
