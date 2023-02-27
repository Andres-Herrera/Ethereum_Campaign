import React from 'react';
import { Component, Container } from 'semantic-ui-react';
import Head from 'next/head';  // this enable us to put anything that is inside the <Head> tag as the head of the document.
//  using the <Head> below is neccessary to be able to display the styling of the header in the rest of pages where it gets imported
import Header from './Header';

const Layout = (props) => { // you can view this as the default components that will be displayed on all pages, so you can just import Layouts in the
    // pages that you want this to appear and then insert it onto the render method. (have a look at the index.js where this is used)
    return (
        <Container>
            <Head>
                <link // if you are still seeing this, this is not good practise, just here to make it work temporarily
                    rel="stylesheet"
                    href="//cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.2.12/semantic.min.css" // this imports the styling from the internet
                ></link>
            </Head>
            <Header/>
            {props.children} 
            <hr></hr>
        </Container> // I am using a footer as an example, we are not really implementing it
    );  //  {props.children} represent the elements that you create on every page
};

export default Layout;

// If you import the layout and use it on any of the pages that you create, and you put the {props.children} in between of footer and header, basically
// the header and footer will appear at top and bottom respectively and the rest of the components in the middle