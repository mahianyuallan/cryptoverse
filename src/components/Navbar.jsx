import React, {useState, useEffect} from 'react'
import {Button, Menu, Typography, Avatar} from 'antd';
import { Link, useLocation } from 'react-router-dom';
import { HomeOutlined, MoneyCollectOutlined, BulbOutlined, FundOutlined, MenuOutlined } from '@ant-design/icons';
import icon from '../images/cryptocurrency.png';

// Same width as the 800px breakpoint in App.css, where the sidebar turns into a top bar with a menu button
const MOBILE_BREAKPOINT = 800;

const Navbar = () => {
  const [screenSize, setScreenSize] = useState(window.innerWidth);
  const [activeMenu, setActiveMenu] = useState(window.innerWidth > MOBILE_BREAKPOINT);
  const {pathname} = useLocation();
  const isMobile = screenSize <= MOBILE_BREAKPOINT;

  useEffect(() => {
    const handleResize = () => setScreenSize(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Wide screens always show the menu. On phones it stays closed until the menu button is tapped, and closes again
  // whenever you go to another page
  useEffect(() => {
    setActiveMenu(!isMobile);
  }, [isMobile, pathname]);

  // Coin detail pages (/crypto/:coinId) belong under Cryptocurrencies
  const selectedKey = pathname.startsWith('/crypto') ? '/cryptocurrencies' : pathname;

  return (
    <div className="nav-container">
        <div className="logo-container">
            <Avatar src={icon} size="large"/>
            <Typography.Title level={2} className="logo">
                <Link to="/">CryptoVerse</Link>
            </Typography.Title>
            <Button className="menu-control-container" aria-label="Toggle menu" onClick={() => setActiveMenu(!activeMenu)}>
                <MenuOutlined/>
            </Button>
        </div>
        {activeMenu && (
            <Menu theme="dark" selectedKeys={[selectedKey]} onClick={() => isMobile && setActiveMenu(false)}>
                <Menu.Item key="/" icon={<HomeOutlined/>}>
                    <Link to="/">Home</Link>
                </Menu.Item>
                <Menu.Item key="/cryptocurrencies" icon={<FundOutlined/>}>
                    <Link to="/cryptocurrencies">Cryptocurrencies</Link>
                </Menu.Item>
                <Menu.Item key="/exchanges" icon={<MoneyCollectOutlined/>}>
                    <Link to="/exchanges">Exchanges</Link>
                </Menu.Item>
                <Menu.Item key="/news" icon={<BulbOutlined/>}>
                    <Link to="/news">News</Link>
                </Menu.Item>
            </Menu>
        )}
    </div>
  )
}

export default Navbar
