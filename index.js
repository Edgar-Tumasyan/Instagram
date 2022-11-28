const app = new (require('koa'))();

const config = require('./config');
const Routes = require('./routes');

const port = config.PORT || 3000;

app.use(require('./middleware/requestNormalizer')());
app.use(require('./middleware/restify')());

app.use(Routes.routes());
app.use(Routes.allowedMethods());

app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});
