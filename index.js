const app = new (require('koa'))();
const server = require('http').createServer(app.callback());
const { Server } = require('socket.io');
const io = new Server(server, { cors: { origin: '*' } });

const config = require('./config');
const v1Routes = require('./routes');
const dashboardRoutes = require('./routes/dashboard');
const socket = require('./service/socket');

const port = config.PORT || 3000;

app.use(require('./middleware/requestNormalizer')());
app.use(require('./middleware/restify')());

app.use(v1Routes.routes());
app.use(dashboardRoutes.routes());
app.use(v1Routes.allowedMethods());
app.use(dashboardRoutes.allowedMethods());

server.listen(port, () => {
    socket.connect(io);
    console.log(`Server running on port: ${port}`);
});
