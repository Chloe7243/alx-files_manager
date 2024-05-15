import express from 'express';
import bodyParser from "body-parser";
import mainRoutes from './routes/index';


const PORT = process.env.DB_PORT || '5000';

const app = express();

app.use('/', mainRoutes);
app.use(bodyParser.urlencoded({ extended: false }));
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
