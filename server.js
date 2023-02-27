const { createServer} = require('http');
const next = require('next');

const app = next({ 
    dev: process.env.NODE_ENV !== 'production' // specifies if we are running in production or not.  when is production, next will
    // behave differently
});

const routes = require('./routes');
const handler = routes.getRequestHandler(app);

app.prepare().then(() => {
    createServer(handler).listen(3000, (err) => {
        if (err) throw err;
        console.log('Ready on localholst:3000')
    })
});

