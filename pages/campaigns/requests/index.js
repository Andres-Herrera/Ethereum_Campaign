import React, { Component } from "react";
import Layout from "../../../components/Layouts";
import { Link } from "../../../routes";
import { Button, Table, Message } from "semantic-ui-react";
import Campaign from '../../../ethereum/campaign';
import RequestRow from "../../../components/RequestRow";




class RequestIndex extends Component {
   
   

    static async getInitialProps(props) { //this allows us among other things to get the address of the current campaign
        const { address } = props.query;
        const campaign = Campaign(address);
        const requestCount = await campaign.methods.getRequestsCount().call(); //retrieves the number of requests created for a given campaign
        const approversCount = await campaign.methods.approversCount().call();

        const requests = await Promise.all(
            Array(parseInt(requestCount))
                .fill() // this fills as many indexes automatically as expressed in the requestCount variable
                .map((element, index) => {
                    return campaign.methods.requests(index).call();
            }) // this whole funtion is similar to a for loop, we "create" an array with as many elements as in the requestCount
            // then we use fill to create as many elements automatically, and for every element, we put each element of that
            // we get when we call the requests method with the corresponding index.  This function also takes care of incrementing
            // the index automatically 
        );

        // console.log(requests);  // just for debbuging

        
        return { address, requests, requestCount, approversCount };
    }

    renderRows() { // this takes the requests array and returns a requestRow for each element in the array
        
        return this.props.requests.map((request, index) => { // map 'loops' through the array
            return (
             
            <RequestRow 
                key={index}
                id={index}
                request={request}
                address={this.props.address}
                approversCount={this.props.approversCount}
                   
            />
            
            );
        });
    }

    render() {

        const { Header, Row, HeaderCell, Body } = Table; // Allows us to avoid repeating over and over the same properties of the table
        
        return(
            <Layout>
                 <h3>Requests</h3>

                 <Link route={`/campaigns/${this.props.address}/requests/new`}>
                    <a>
                        <Button primary floated="right" style={{ marginBottom: 10 }}>
                            Add Request
                        </Button>
                    </a>
                 </Link>

                <Table>
                    <Header>
                        <Row>
                            <HeaderCell>ID</HeaderCell>
                            <HeaderCell>Description</HeaderCell>
                            <HeaderCell>Amount</HeaderCell>
                            <HeaderCell>Recipient</HeaderCell>
                            <HeaderCell>Approval Count</HeaderCell>
                            <HeaderCell></HeaderCell>
                            <HeaderCell>Approve</HeaderCell>
                            <HeaderCell>Finalize</HeaderCell>
                        </Row>
                    </Header>

                    <Body>
                        {this.renderRows()}
                    </Body>

                </Table>

                
                
                <div>Found {this.props.requestCount} requests.</div>

            </Layout>
        );
    }
}

export default RequestIndex;