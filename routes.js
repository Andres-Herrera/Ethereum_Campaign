const routes = require('next-routes')(); // note we are passing a second set of '()'. this is as this statement will return a function

routes
    .add('/campaigns/new', '/campaigns/new') // this prevents the next following line to break the routing.  Without this line
    // if we click on the 'create campaign' button in the home page, we will be redirected to the /campaigns/show page, which is 
    // incorrect.  IMPORTANT: this line of code must be before the following line, if put after, it will break
    .add('/campaigns/:address', '/campaigns/show') // This adds a new routing 'rule'. 1st parameter is what we are matching
// second parameter is where we should redirect.
// The ':' denotes a wildcard, so in this case, we are matching the url to something that needs
// to 'look' like an address
    .add('/campaigns/:address/requests', '/campaigns/requests/index')
    .add('/campaigns/:address/requests/new', '/campaigns/requests/new');

module.exports = routes;
