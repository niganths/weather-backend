const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Could not connect to MongoDB', err));

const favoriteSchema = new mongoose.Schema({
  location: String,
  data: Object,
});

const Favorite = mongoose.model('Favorite', favoriteSchema);

app.get('/weather', async (req, res) => {
  const location = req.query.location;
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&units=imperial&appid=${process.env.WEATHER_API_KEY}`;

  try {
    const response = await axios.get(url);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/favorites', async (req, res) => {
  const { location, data } = req.body;

  const favorite = new Favorite({ location, data });
  try {
    await favorite.save();
    res.status(201).json(favorite);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/favorites', async (req, res) => {
  try {
    const favorites = await Favorite.find();
    res.json(favorites);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/favorites/:id', async (req, res) => {
  try {
    await Favorite.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
