import web3 from './web3';

import CampaignFactory from './build/CampaignFactory.json'; 
const instance = new web3.eth.Contract(
    JSON.parse(CampaignFactory.interface),
    '0xDB22D787A93Cb97234A555013B4b36AEE91500ec' // address of the factory contract
); 

export default instance;

