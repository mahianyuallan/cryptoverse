import React from 'react'
import {useGetCryptoNewsQuery} from '../services/cryptoNewsApi'
import {Card, Row, Col, Typography} from 'antd';
import moment from 'moment';
import demoImage from '../images/cryptocurrency.png';

const {Text, Title} = Typography;

const News = ({simplified}) => {
  const {data: cryptoNews} = useGetCryptoNewsQuery({newsCategory: 'Cryptocurrency', count: simplified ? 10 : 100});

  if(!cryptoNews?.items) return 'Loading...';
  return (
    <>
      <Row gutter={[24, 24]}>
        {cryptoNews.items.map((news, i) => (
          <Col xs={24} sm={12} lg={8} key={i}>
            <a href={news.link} target="_blank" rel="noreferrer">
              <Card
                hoverable
                className="news-card"
              >
                <div className="news-image-container">
                  <Title className="news-title" level={4}>{news.title}</Title>
                  <img src={news.enclosure?.link || demoImage} alt="" loading="lazy" />
                </div>
                <Text>{news.description}</Text>
                <br />
                <Text>{moment(news.pubDate).format('MMM Do YYYY')}</Text>
              </Card>
            </a>
          </Col>
        ))}
      </Row>
    </>
  )
}

export default News
