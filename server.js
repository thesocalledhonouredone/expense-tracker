const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const app = express();

const mongo_uri = "mongodb+srv://ani:ani@cluster0.wy5ovst.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(mongo_uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(methodOverride('_method'));

app.set('view engine', 'ejs');

const expenseRoutes = require('./routes/expenseRoutes');
app.use('/', expenseRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
