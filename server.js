import express from 'express';
import bodyParser from 'body-parser';
import mainRoutes from './routes/index';

const PORT = process.env.DB_PORT || '5000';

const app = express();

app.use(bodyParser.json({ extended: false }));
app.use('/', mainRoutes);
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
