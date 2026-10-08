import React, {useState, useEffect} from 'react'
import {Link} from 'react-router-dom';
import {Button, Card, Row, Col, Empty, Input, Typography} from 'antd';

import {useGetCryptosQuery} from '../services/cryptoApi';
import formatValue from '../utils/formatValue';

const {Text} = Typography;

// Building thousands of cards at once makes the page slow, so show 100 at a time. Search still covers every coin.
const PAGE_SIZE = 100;

const Cryptocurrencies = ({simplified}) => {
  // 5000 is the most the API allows per request, which covers every coin it lists
  const count = simplified ? 10 : 5000;
  const {data: cryptosList, isFetching} = useGetCryptosQuery(count);
  const [cryptos, setCryptos] = useState();
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);



  useEffect(() => {
    const filteredData = cryptosList?.data?.coins.filter((coin) => coin.name.toLowerCase().includes(searchTerm.toLowerCase()));

    setCryptos(filteredData);
    setVisibleCount(PAGE_SIZE);
  }, [cryptosList, searchTerm]);

  console.log(cryptos);

  if(isFetching) return 'Loading...';

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
      {cryptos?.length === 0 && <Empty description="No coins match your search" />}
      {cryptos?.length > visibleCount && (
        <div className="load-more">
          <Text type="secondary">Showing {visibleCount} of {cryptos.length.toLocaleString()} coins</Text>
          <Button size="large" onClick={() => setVisibleCount(visibleCount + PAGE_SIZE)}>Load more</Button>
        </div>
      )}


    </>
  )
}

export default Cryptocurrencies
