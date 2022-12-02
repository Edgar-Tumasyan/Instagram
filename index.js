const app = new (require('koa'))();
const server = require('http').createServer(app.callback());
const { Server } = require('socket.io');
const io = new Server(server, { cors: { origin: '*' } });

const config = require('./config');
const Routes = require('./routes');
const socket = require('./service/socket');

const port = config.PORT || 3000;

app.use(require('./middleware/requestNormalizer')());
app.use(require('./middleware/restify')());

app.use(Routes.routes());
app.use(Routes.allowedMethods());

server.listen(port, () => {
    socket.connect(io);
    console.log(`Server running on port: ${port}`);
});
