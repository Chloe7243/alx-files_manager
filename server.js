import express from 'express';
import mainRoutes from './routes/index';

const PORT = process.env.DB_PORT || '5000';

const app = express();

app.use(express.json());
app.use('/', mainRoutes);
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
