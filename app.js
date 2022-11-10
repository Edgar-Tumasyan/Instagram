require('dotenv').config();
const Koa = require('koa');
const app = new Koa();

const sequelize = require('./db/connectDB');
const User = require('./models/user');

const port = process.env.PORT || 3001;

const Routes = require('./routes');
const bodyParser = require('koa-bodyparser');

app.use(bodyParser());
app.use(Routes.routes());

const start = async () => {
  try {
    await sequelize.sync();
    app.listen(port, () => {
      console.log(`Server running on port: ${port}`);
    });
  } catch (error) {
    console.log(error);
  }
};

start();
