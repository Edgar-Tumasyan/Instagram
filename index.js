const app = new (require('koa'))();
const cloudinary = require('cloudinary').v2;

const config = require('./config');
const Routes = require('./routes');
const { errorHandler } = require('./middleware');

cloudinary.config(config.cloudinary);

const port = config.port || 3001;

app.use(require('koa-bodyparser')());

app.use(
  require('koa-respond')({
    statusMethods: {
      unprocessable_entity: 422,
    },
  })
);

app.use(errorHandler());

app.use(Routes.routes());
app.use(Routes.allowedMethods());

app.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});
