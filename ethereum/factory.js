import web3 from './web3';

import CampaignFactory from './build/CampaignFactory.json'; // this is neccessary to tell web3 about the already deployed Campaign facotry
// contract

const instance = new web3.eth.Contract(
    JSON.parse(CampaignFactory.interface),
    '0xDB22D787A93Cb97234A555013B4b36AEE91500ec' // address of the factory contract
); // passing the contract ABI(interface) to the variable instance so that we can use the factory contract in other parts of the app

export default instance;

// this file allows us to have a preconfigured instance of the facotry contract, so that we don't have to parse the ABI and pass
// the address all the time in other parts of the app.  We now simply need to export the factory.js file wherever we want to 
// use this contract