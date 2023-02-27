import React, { Component } from "react";
import { Button, Card } from "semantic-ui-react";
import factory from '../ethereum/factory';
import Layout from '../components/Layouts';
import { Link } from '../routes'

class CampaignIndex extends Component {  // this is a class based component.  Remember to import Component from React at the top

    static async getInitialProps() {  // allows us to load the required initial data when using the next server without the need
        // to render the component.  So by doing this, we will get what we need, pass it to ths component as props and then
        // when we actually render the component, we can reference the object 'campaings'
        const campaigns = await factory.methods.getDeployedCampaigns().call(); // getting the deployed campaings and assign them to campaigns
        return { campaigns }; // this is the same as { campaigns: campaigns}
    }

    renderCampaigns() {
        const items = this.props.campaigns.map(address => { //  passing a function into map, this function will then be called one time for each element inside
            // the campaigns array and whatever it returns, gets assigned to the items const
            return {
                header: address,
                description: (
                    <Link route = { `/campaigns/${address}` }>
                        <a>View Campaign</a>
                    </Link>
                ), // the above dymamically takes us to the page of the appropriate campaign which is /campaigns/<address of the contract>
                fluid: true
            };
        });

        return <Card.Group items={items} />;
    }

    render() {
        //return <div> { this.props.campaigns[0]} </div>  // now that we have the campaigns object from the getInitialProps method, we can reference it from
        // other parts of our app.  here we are getting the first element of the camapings array. (this is part of initial testing)

        return ( // check the Layout.js file to understand what is the Layout tag.
            <Layout> 
                <div>
                    <h3>Open campaigns</h3>
                    <Link route="/campaigns/new">
                        <a>
                            <Button 
                                floated="right"
                                content= "Create Campaign"
                                icon = "add circle"
                                primary // this is the same as primary ={true}.  primary makes the button blue and makes it 'important'.  Since creating a Campaign is aa very
                                // important event, we are definitely using the primary property for this button
                            />
                        </a>
                    </Link>
                    {this.renderCampaigns()}

                </div> 
            </Layout>
        ); // calling the renderCampaigns methos so we can display the campaings in a 'cards' fashion
        // what ever is placed in between of the <Layout> tag, gets passed to the Layout component as props, more specifically as
        // props.children
    }
}

export default CampaignIndex;

// whatever is inside the <Layout> tag, gets sent to the Layout component in the Layout.js file as props.children ( see Layout.js file)