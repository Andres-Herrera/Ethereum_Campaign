import web3 from "./web3";
import Campaign from './build/Campaign.json';

export default (address) => {
    return new web3.eth.Contract(
        JSON.parse(Campaign.interface),
        address
    );
};

// we are creating a function that gets an address.  This is the address of a given campaign, so this function can return an instance
// of that campaign using the web3 library so that we can make use of the values contained in the campaign.
// we will import this camapign file to be able to call this function and received an instance of the campaign

// we will make use of this for example when creating a new request for a given campaign