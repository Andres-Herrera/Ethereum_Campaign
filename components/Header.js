import React from "react";
import { Menu } from 'semantic-ui-react';
import { Link } from '../routes'; // help us navigate the page

const Header = (props) => {
    return (
        <Menu style= {{ marginTop: '15px'}}>
            
            <Link route="/">
                <a className="item">CrowdCoin</a>
            </Link>

            <Menu.Menu position="right">
            <Link route="/">
                <a className="item">Campaigns</a>
            </Link>

            <Link route="/campaigns/new">
                <a className="item">+</a>
            </Link>
            </Menu.Menu>
        </Menu>
    );
};

export default Header;

// this componenet is the header that is displayed on all of the pages and it provides links to the different parts of the webapp