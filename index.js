const app = new (require('koa'))();
const server = require('http').createServer(app.callback());
const io = require('socket.io')(server);

const config = require('./config');
const Routes = require('./routes');
const socketConnection = require('./service/socket');

const port = config.PORT || 3000;

app.use(require('./middleware/requestNormalizer')());
app.use(require('./middleware/restify')());

app.use(Routes.routes());
app.use(Routes.allowedMethods());

io.on('connection', socketConnection);

server.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});
