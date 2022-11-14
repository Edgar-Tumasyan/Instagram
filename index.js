const app = new (require('koa'))();
const bodyParser = require('koa-bodyparser');
const cloudinary = require('cloudinary').v2;

const config = require('./config');
const Routes = require('./routes');

cloudinary.config(config.cloudinary);

const port = config.port || 3001;

app.use(bodyParser());
app.use(Routes.routes());

app.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});
