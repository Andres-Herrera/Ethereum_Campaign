import React, { Component } from "react";
import { Card, Grid, Button, GridRow } from 'semantic-ui-react';
import Layout from "../../components/Layouts";
import Campaign from '../../ethereum/campaign';
import web3 from "../../ethereum/web3";
import ContributeForm from "../../components/contributeForm";
import { Link } from '../../routes';



class CampaignShow extends Component {
    static async getInitialProps(props) {
        const campaign = Campaign(props.query.address);

        const summary = await campaign.methods.getSummary().call();


        return{ // since calling the getSummary function returns an object with no so descriptive labels, we are 'relableling' them here
            // Note we are also returning the address as we need it when we export this component
            address: props.query.address,
            minimumContribution: summary[0],
            balance: summary[1],
            requestCount: summary[2],
            approversCount: summary[3],
            manager: summary[4]
         };
    }

    renderCards() {
        const {
            balance,
            manager,
            minimumContribution,
            requestCount,
            approversCount
        } = this.props // getting what we need from the props to be able to use them in this function

        const items = [
            {
                header:manager,
                meta:'Address of Manager',
                description: 'The managager created this camapaign and can create requests to withdraw money',
                style: { overflowWrap: 'break-word' }
            }, // style allows us to modify how the card is presented, here we are wrapping the text of the address, otherwise
            // it would overflow the card and not look good
            {
                header: minimumContribution,
                meta: 'Minimum Contribution (wei)',
                description: 'You must contribute at least this much wei to become an approver'
            },
            {
                header: requestCount,
                meta: 'Number of Requests',
                description: 'A requests is a proposal from the manager that implies the spending of money to get goods ' +
                'or services needed for the current campaign.  If a majority of approvers agree with the request, the manager ' +
                'finalizes the request and the stated amount of money is sent to the address of the stated recipient.  The funds ' +
                'to pay the value of the requests are taken from the balance of the campaign contract.'

            },
            {
                header: approversCount,
                meta: 'Number of Approvers',
                description: 'Number of people who have already contributed to this campaign with the minimum contribution.  ' + 
                'People under this category can approve requests'

            },
            {
                header: web3.utils.fromWei(balance, 'ether'),
                meta: 'Campaign Balance (ether)',
                description: 'The balance is how much money this campaign has left to spend.  These funds come from the contributions '+
                'that people make to participate in the campaign and become an approver'

            }
        ];

        return <Card.Group items={items} />; // this makes used of the Semantic library.  Checks docs of Semantics
    }

    render() {
        return (
            <Layout>
                <h3> Campaign Show</h3>
                <Grid>
                    <Grid.Row>
                        <Grid.Column width={10}>
                            {this.renderCards()}
                                
                        </Grid.Column>
                        <Grid.Column width={6}>
                            <ContributeForm address={this.props.address}/>
                        </Grid.Column>
                    </Grid.Row>

                    <GridRow>
                        <Grid.Column>
                            <Link route={`/campaigns/${this.props.address}/requests`}>
                                            <a>
                                                <Button primary>View Requests</Button>
                                            </a>
                            </Link>
                        </Grid.Column>
                    </GridRow>
                </Grid>
            </Layout>
        )
    }
}

export default CampaignShow;

// this will work in conjuction with the routes.js file.  This is a dynamic page that will be used to display the 
// campaigns individually

//When we added the <Link route={`/campaigns/${this.props.address}/requests`}> this forces us to go and update the routes.js file to 
//update the new link

//We need to put the button inside a Grid.Colum otherwise the button will look off the margin