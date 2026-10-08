import React, {useState, useEffect} from 'react'
import {Link} from 'react-router-dom';
import {Card, Row, Col, Input} from 'antd';

import {useGetCryptosQuery} from '../services/cryptoApi';
import formatValue from '../utils/formatValue';

const Cryptocurrencies = ({simplified}) => {
  // 5000 is the most the API allows per request, which covers every coin it lists
  const count = simplified ? 10 : 5000;
  const {data: cryptosList, isFetching} = useGetCryptosQuery(count);
  const [cryptos, setCryptos] = useState();
  const [searchTerm, setSearchTerm] = useState('');



  useEffect(() => {
    const filteredData = cryptosList?.data?.coins.filter((coin) => coin.name.toLowerCase().includes(searchTerm.toLowerCase()));

    setCryptos(filteredData);
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
        {cryptos?.map((currency) => (
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


    </>
  )
}

export default Cryptocurrencies
