import React, { Component} from "react";
import { Button, Input, Form, Message } from "semantic-ui-react";
import Layout from "../../components/Layouts";
import factory from '../../ethereum/factory';  // importing the factory contract as we will create new campaigns here
import web3 from "../../ethereum/web3";  // so that we can make use of the differente methods such as getAccounts
import { Link, Router} from '../../routes'; // Link is a React component that let us render anchor tags into a react component and
// navigate around the application.  The Router object allowa us to programatically redirect users from one page to another (you dont 
// really need to import the Link compoenet, it's here for explanation)



class CampaignNew extends Component {
    state = { // everytime the state changes, it causes the components to re-render
        minimumContribution: '',  // eventhough we want a number, whenever we deal with input, is good practice to handle it as a string
        errorMessage: '',
        loading: false
    };

    onSubmit = async (event) => {
        event.preventDefault();  // we want to avoid the front end to automatically send the imput on submition of the form to the back-end.  
        // this will keep the browser from attempting to submit the form

        this.setState({ loading: true, errorMessage: ''}); // as soon as user clicks button, we change state_loading
        // we are also clearing the error message for improved user experience

        try {
            const accounts = await web3.eth.getAccounts();  // getting the accounts via metamask
            await factory.methods
            .createCampaign(this.state.minimumContribution)
            .send({  // note that when we send transactions via the webrowser with metamask, we don't have to calculate the gas to be used, metamask does it for us
                from: accounts[0]
            });

            Router.pushRoute('/');  // after successfully creating a campaign, we want the user to be redirected to the root page(home)
            //we use this using the routes library

        } catch (err) {
            this.setState({ errorMessage: err.message}); // the err object from react has a property called message that contains the reason for the error.
            // we can use this property to print it onto the screen and inform the user what went wrong
        }

        this.setState({ loading: false}); // changing state_loading back to false
    };

    render() {
        return(  // by using the error attribute on the form below, we pass the error behaviour to the form so it knows when to display error messages
                 // when we start the app, the errorMessage from the state is an emtpy string so it evaluate to false down where were declared:
                 // error={this.state.errorMessage}.  Later, when an error does occur, it will show the error   
                 // note that '!!' is syntax to turn the string returned by this.state.errorMessage into its equivalent boolean value
            <Layout>
                <h3>Create a Campaign</h3>
                
                <Form onSubmit={this.onSubmit} error={!!this.state.errorMessage}> 
                    <Form.Field>
                        <label>Minimum Contribution</label>
                        <Input 
                            label="wei" 
                            labelPosition="right"
                            value={this.state.minimumContribution} // stating that this, even when noone has typed anything, is equal to 
                            // this.state.minimumContribution in other words, is equel to ''
                            onChange={event => 
                                this.setState({ minimumContribution: event.target.value})} // changing the state with whatever we enter in the input element
                        />
                    </Form.Field>

                    <Message error header="Oops!" content={this.state.errorMessage} />
                    <Button loading={this.state.loading} primary>Create!</Button>
                </Form>
            </Layout>
        );  // in order for the button to know when to spin (think) it looks at the loading property whether it's true or false
        //  since the loading property is changed up in the code in the submit button, the this will start spinning every time
        // the button is clicked
    };
};

export default CampaignNew;