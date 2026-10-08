import React, {useState, useEffect} from 'react'
import {Link} from 'react-router-dom';
import {Button, Card, Row, Col, Empty, Input, Typography} from 'antd';

import {useGetCryptosQuery} from '../services/cryptoApi';
import formatValue from '../utils/formatValue';

const {Text} = Typography;

// Building thousands of cards at once makes the page slow, so show 100 at a time. Search still covers every coin.
const PAGE_SIZE = 100;

const Cryptocurrencies = ({simplified}) => {
  // The first coins come from a small, fast request so cards appear quickly. On the full page, every coin then loads in
  // the background for search and "Load more" (5000 is the most the API allows per request, which covers every coin).
  const {data: firstCoins, isFetching} = useGetCryptosQuery(simplified ? 10 : PAGE_SIZE);
  const {data: allCoins} = useGetCryptosQuery(5000, {skip: simplified});
  const cryptosList = allCoins || firstCoins;
  const [cryptos, setCryptos] = useState();
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);



  useEffect(() => {
    const filteredData = cryptosList?.data?.coins.filter((coin) => coin.name.toLowerCase().includes(searchTerm.toLowerCase()));

    setCryptos(filteredData);
  }, [cryptosList, searchTerm]);

  // A new search starts again from the first 100 results
  useEffect(() => setVisibleCount(PAGE_SIZE), [searchTerm]);

  console.log(cryptos);

  if(isFetching) return 'Loading...';

  // Until every coin has loaded, the total comes from the API's stats
  const totalCount = searchTerm || allCoins ? cryptos?.length : cryptosList?.data?.stats?.total;

  return (
    <>
      {!simplified && (
        <div className="search-crypto">
          <Input placeholder="Search Cryptocurrency" onChange={(e) => setSearchTerm(e.target.value)}/>
        </div>
      )}
      <Row gutter={[32, 32]} className="crypto-card-container">
        {cryptos?.slice(0, visibleCount).map((currency) => (
          <Col xs={24} sm={12} lg={6} className="crypto-card" key={currency.uuid}>
            <Link to={`/crypto/${currency.uuid}`}>
              <Card
                title={`${currency.rank}. ${currency.name}`}
                extra={<img className="crypto-image" src={currency.iconUrl} alt={currency.name} loading="lazy" />}
                hoverable
              >
                <p>Price: {formatValue(currency.price)}</p>
                <p>Market Cap: {formatValue(currency.marketCap)}</p>
                <p>Daily Change: {formatValue(currency.change, '%')}</p>
              </Card>
            </Link>
          </Col>
        ))}
      </Row>
      {cryptos?.length === 0 && <Empty description={allCoins ? 'No coins match your search' : 'Searching all coins...'} />}
      {cryptos && !simplified && totalCount > visibleCount && (
        <div className="load-more">
          <Text type="secondary">Showing {Math.min(visibleCount, cryptos.length)} of {totalCount.toLocaleString()} coins</Text>
          <Button size="large" loading={!allCoins} onClick={() => setVisibleCount(visibleCount + PAGE_SIZE)}>Load more</Button>
        </div>
      )}


    </>
  )
}

export default Cryptocurrencies
