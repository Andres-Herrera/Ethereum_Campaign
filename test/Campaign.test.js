const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());

const compiledFactory = require('../ethereum/build/CampaignFactory.json'); // bringing the compiled version of the contracts
const compiledCampaign = require('../ethereum/build/Campaign.json');
const { send } = require('process');

let accounts;
let factory;
let campaignAddress;
let campaign;

beforeEach(async () =>{
    accounts = await web3.eth.getAccounts();

    factory = await new web3.eth.Contract(JSON.parse(compiledFactory.interface))
    .deploy({ data: compiledFactory.bytecode })
    .send({ from: accounts[0], gas: '1000000' }); // deploying the CampaignFacotry contract

    await factory.methods.createCampaign('100').send({ //creating an instance of a campaign using the factory.  
        // this allows to have a created instace ready ofr our tests
        from: accounts[0],
        gas: '1000000'
    });

    
    [campaignAddress] = await factory.methods.getDeployedCampaigns().call(); // this is fancy syntax for: since the getDeployedCampaigns
    // returns an array, with this syntax we are saying, take the 1st element of the array, and assign its value to the campaignAddress const
    // we are requiring the 1st element as we have only deplyed 1 contract so for sure we want the 1st element of the returned array

    campaign = await new web3.eth.Contract(
        JSON.parse(compiledCampaign.interface),
        campaignAddress
    ); // since the campaign contract has already been deployed using the factory, note the call here is different from the one
    // we used above.  We are not using the .deploy nor the .send, insted we are passing 2 arguments to the Contract function.
    // we are passing the parsed ABI (AKA Interface) and we are passing the address of the already deployed contract
});

describe('Campaigns', () => {
    it ('deploys a facotry and a campaign', () => {
        assert.ok(factory.options.address);
        assert.ok(campaign.options.address); // these 2 test make sure that we successfully deployed our contracts.  we do that by
        // making sure that we got back an address where the contract was deployed
    });

    it('marks caller as the campaign manager', async () => { // ensuring that we mark the creator of the contract as the manager
        const manager = await campaign.methods.manager().call();
        assert.equal(accounts[0], manager); // remember that the 1st argument 'accounts[0]' is what you hope it is and the 2nd is
        // what is actully is
    });

    it('allows people to contribute money and mark them as approvers', async () => { // to make sure that you can contribute and be
        // marked as a contributor
        await campaign.methods.contribute().send({
            value: '200',
            from: accounts[1]
        }); // we use accounts[1] as we want to use a different account than the one used as the manager which is accounts[0]
        const isContributor = await campaign.methods.approvers(accounts[1]).call();
        assert(isContributor); // remember that here we are accessing a mapping defined in solidity, and therefore we cannot retrieve
        // the whole mapping, we can only look up for 1 single element, so that is why we are passing account[1] to make sure that
        // that account exist as a contributor in the approvers mapping defined in the campaign contract (look Campaign.sol file)
    });

    it('requires a minimum contribution', async () => { // to check if an error is thrown when contribute withe less money than required
        try {
            await campaign.methods.contribute().send({
                value: '100', //if set to 100 or less we are sending less that we have to (minimum 101)
                from: accounts[1]
            });
        } catch (err){
            assert(err); // checking if an error exists. if it does, test passes
            return; // this line is neccesary to exit the whole try block and avoid that the line below is executed
        }
        assert(false); // if no error is thrown, we force-fail the test
    });

    it('allows a manager to make a payment request', async () =>{ // checks that a manager can submit a payment request
        await campaign.methods
        .createRequest('Buy batteries', '100', accounts[1]) // accounts[0] is ofcourse the manager address
        .send({ 
            from: accounts[0],
            gas: '1000000'
        });
        const request = await campaign.methods.requests(0).call(); // since requests is an array of requests, we need to pass the index
        // of the particular request we want to check, since we have only created one for testing, we can safely request index 0
        // as that is the 1st and only request in the requests array
        assert.equal('Buy batteries', request.description); // checking if the description of the request saved in the requests array
        // is the same as 'Buy batteries'
    }); 

    it('processes requests', async () => {  //checks end to end if the request can be contributed, approved and finalized
        let recipientBalance = await web3.eth.getBalance(accounts[1]); // getting initial balance of recipient of the request
        recipientBalance = web3.utils.fromWei(recipientBalance, 'ether'); //parsing from ether to wei
        recipientBalance = parseFloat(recipientBalance); // parsing from string to float

        let campaignBalance = await web3.eth.getBalance(campaignAddress); // getting initial balance of the contract address
        campaignBalance = web3.utils.fromWei(campaignBalance, 'ether');
        campaignBalance = parseFloat(campaignBalance);

        console.log(recipientBalance);
        console.log(campaignBalance);


        await campaign.methods.contribute().send({  // contributing to the campaign
            from: accounts[0],
            value: web3.utils.toWei('10', 'ether') //contrinuting with 10 ether
        });
        console.log(campaignBalance);

        await campaign.methods // creating a request intending to send 5 ether to recipient (accounts[1])
        .createRequest('Any description', web3.utils.toWei('5', 'ether'), accounts[1])
        .send({ 
            from: accounts[0],
            gas: '1000000'
        });

        await campaign.methods.approveRequest(0).send({ // approving the request
            from: accounts[0],
            gas: '1000000'
        });

        
        console.log(recipientBalance);
        await campaign.methods.finalizeRequest(0).send({ // finalizing the requet. by doing, among other things we are sending 5 ether
            // to the recipient (accounts[1])
            from: accounts[0],
            gas: '1000000'
        });

        
        
        console.log(recipientBalance);
        console.log(campaignBalance);

        let postRecipientBalance = await web3.eth.getBalance(accounts[1]); // geting the balance of the recipient (accounts[1]) after
        // the request was finalized
        postRecipientBalance = web3.utils.fromWei(postRecipientBalance, 'ether');
        postRecipientBalance = parseFloat(postRecipientBalance);

        let postCampaignBalance = await web3.eth.getBalance(campaignAddress); // getting the balance of the contract address after
        // the request was finalized
        postCampaignBalance = web3.utils.fromWei(postCampaignBalance, 'ether');
        postCampaignBalance = parseFloat(postCampaignBalance);

        console.log(postRecipientBalance);
        console.log(postCampaignBalance);
        assert(postRecipientBalance > recipientBalance); // checking if the the postbalalance of recipient is greater than preblaance
    });


    it('makes sure only contributors can approve requests', async () => {
        await campaign.methods.createRequest('Buy batteries', web3.utils.toWei('5', 'ether'), accounts[1])
        .send({ 
            from: accounts[0],
            gas: '1000000'
        });

        await campaign.methods.contribute().send({ 
            from: accounts[0],
            value: web3.utils.toWei('10', 'ether')
        });

        try {
            await campaign.methods.approveRequest(0).send ({ 
                from: accounts[1], // will pass when set to an account that has not contributed to the campaign.  will fail if you
                // use an account that has already contributed
                gas: '1000000'
            });
        } catch (err){
            //console.log('error');  // for debugging purposes
            assert(err);
            return;
        }
        //console.log('no error'); // for debugging purposes
        assert(false);
    });


    it('makes sure only manager can finalize a request', async () => { // checks that only managager accounts can finalize requests
        await campaign.methods.createRequest('Buy batteries', web3.utils.toWei('5', 'ether'), accounts[1])
        .send({ 
            from: accounts[0],
            gas: '1000000'
        });

        await campaign.methods.contribute().send({ 
            from: accounts[0],
            value: web3.utils.toWei('10', 'ether')
        });

        await campaign.methods.approveRequest(0).send({ 
            from: accounts[0],
            gas: '1000000'
        });

        try {
            await campaign.methods.finalizeRequest(0).send({ 
                from: accounts[1], // test will pass when the account used is other than the manager's account
                gas: 1000000
            });
        } catch (err) {
            assert(err);
            return;
        }
        assert(false);

    });

    it('makes sure a request is not attempted to be finalized twice', async () => { 
        await campaign.methods.createRequest('Buy batteries', web3.utils.toWei('5', 'ether'), accounts[1])
        .send({ 
            from: accounts[0],
            gas: '1000000'
        });

        await campaign.methods.contribute().send({ 
            from: accounts[0],
            value: web3.utils.toWei('10', 'ether')
        });

        await campaign.methods.approveRequest(0).send({ 
            from: accounts[0],
            gas: '1000000'
        });

        await campaign.methods.createRequest('Buy food', web3.utils.toWei('5', 'ether'), accounts[1])
        .send({ 
            from: accounts[0],
            gas: '1000000'
        });

        await campaign.methods.approveRequest(1).send({ 
            from: accounts[0],
            gas: '1000000'
        });

        await campaign.methods.finalizeRequest(0).send({ 
            from: accounts[0], 
            gas: '1000000'
        });

        try {
            await campaign.methods.finalizeRequest(0).send({ // trying to finalize the same request again
                // will fail when we finalize a non finalized request such as request 1 (Buy Food)
                // will pass when we try to finalize a request that has already been marked as completed
                from: accounts[0], 
            });
        } catch (err) {
            assert(err);
            return;
        }
        assert(false);
    });

    it('makes sure only approved requests can be finalized', async () => {
        await campaign.methods.createRequest('Buy batteries', web3.utils.toWei('5', 'ether'), accounts[1])
        .send({ 
            from: accounts[0],
            gas: '1000000'
        });

        await campaign.methods.contribute().send({ 
            from: accounts[0],
            value: web3.utils.toWei('10', 'ether')
        });

        /*await campaign.methods.approveRequest(0).send({
            from: accounts[0],
            gas: '1000000'
        });*/  // uncomment this block of code to make the test fail

        try {
            await campaign.methods.finalizeRequest(0).send({ // trying to finalize a request that has not been approved
                from: accounts[0],
                gas: '1000000'
            });
        } catch (err) {
            assert(err);
            return;
        }
        assert(false);
    });

    it('makes sure number of approvers is not incremented when the same contributor contributes to the same campaign more than 1'
    , async () => {

        const initalApproverCount= await campaign.methods.approversCount().call();

        await campaign.methods.contribute().send({
            value: '200',
            from: accounts[1]
        });

        const secondApproverCount = await campaign.methods.approversCount().call();

        await campaign.methods.contribute().send({
            value: '200',
            from: accounts[1]
        });

        const thirdApproverCount = await campaign.methods.approversCount().call();

        await campaign.methods.contribute().send({
            value: '200',
            from: accounts[2]
        });

        const forthApproverCount = await campaign.methods.approversCount().call();

        await campaign.methods.contribute().send({
            value: '200',
            from: accounts[2]
        });

        const fifthApproverCount = await campaign.methods.approversCount().call();

        await campaign.methods.contribute().send({
            value: '200',
            from: accounts[2]
        });

        const sixthApproverCount = await campaign.methods.approversCount().call();

        console.log('initial count is: ' + initalApproverCount + ' And second count is: ' + secondApproverCount);
        assert(initalApproverCount<secondApproverCount);
            
        console.log('second count is: ' + secondApproverCount + ' And third count is: ' + thirdApproverCount);
        assert(secondApproverCount==thirdApproverCount);
            
        console.log('third count is: ' + thirdApproverCount + ' And fourth count is: ' + forthApproverCount);
        assert(thirdApproverCount<forthApproverCount);
            
        console.log('fourth count is: ' + forthApproverCount+ ' And fifth count is: ' + fifthApproverCount);
        assert(forthApproverCount==fifthApproverCount);

        console.log('fifth count is: ' + fifthApproverCount + ' And sixth count is: ' + sixthApproverCount);
        assert(fifthApproverCount==sixthApproverCount);
    });




});