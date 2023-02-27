import React, { Component } from "react";
import { Table, Button, Message, Form } from 'semantic-ui-react';
import web3 from "../ethereum/web3";
import Campaign from '../ethereum/campaign';
import { Router} from '../routes';



class RequestRow extends Component {

    

    state = {
        errorMessage: '',
        loadingApprove: false,
        loadingFinalize: false
    };

    onApprove = async () => {
        const campaign = Campaign(this.props.address);
        const accounts = await web3.eth.getAccounts();

        this.setState({ loadingApprove: true, errorMessage: '' })
        try{
            await campaign.methods.approveRequest(this.props.id).send({
                from: accounts[0]
            });

            Router.replaceRoute(`/campaigns/${this.props.address}/requests`)
        } catch (err) {
            this.setState({ errorMessage: err.message });
        }

        this.setState({ loadingApprove: false});
    }

    onFinalize = async () => {
        const campaign = Campaign(this.props.address);
        const accounts = await web3.eth.getAccounts();

        this.setState({ loadingFinalize: true, errorMessage: ''})
        try{
            await campaign.methods.finalizeRequest(this.props.id).send({
                from: accounts[0]
            });

            Router.replaceRoute(`/campaigns/${this.props.address}/requests`)
        } catch (err) {
            this.setState({ errorMessage: err.message });
        }
        this.setState({ loadingFinalize: false});
        
    }

    render() {
        const { Row, Cell } = Table;
        const { id, request, approversCount } = this.props; // this allows us to save some typing, without this, in eac cell bellow I would need to type
        // <Cell>{this.props.request.<something}</Cell>
        const readyToFinalize = request.approvalCount >= approversCount / 2; // checks if the request is ready to be finalized

        return (
            
            <Row disabled={request.complete} positive={readyToFinalize && !request.complete}>
                
                <Cell>{id}</Cell>
                <Cell>{request.description}</Cell>
                <Cell>{web3.utils.fromWei(request.value, 'ether')}</Cell>
                <Cell>{request.recipient}</Cell>
                <Cell>{request.approvalCount}/{approversCount}</Cell>
                <Cell>
                    <Form error={!!this.state.errorMessage}>
                        <Message error header="Oops!" content={this.state.errorMessage} />
                    </Form>
                </Cell>
                <Cell>
                    {request.complete ? null : ( //if request is finalized, we will not show the button, if not finalized, show button
                        
                        <Button color="green" basic loading={this.state.loadingApprove} onClick={this.onApprove} >
                            Approve
                        </Button>
                    )}   
                </Cell>
                <Cell>
                    {request.complete ? null : (
                            <Button color="teal" loading={this.state.loadingFinalize} onClick={this.onFinalize} >
                                Finalize
                            </Button>
                        )}      
                </Cell> 
            </Row>
            
            
        )
    
    }
}

export default RequestRow;