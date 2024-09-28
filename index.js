require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const { MongoClient } = require('mongodb');

const app = express();
const port = process.env.PORT || 3000;
const client = new MongoClient(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// Middleware to parse incoming request bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

mongoose
  .connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to database'))
  .catch((err) => console.error('Failed to connect to database', err));

// Handle form submission
app.post('/tasks', async (req, res) => {
  const { description, priority } = req.body;

  try {
    // Connect to MongoDB
    await client.connect();
    const database = client.db('taskDB');
    const tasks = database.collection('tasks');

    // Create and insert a new task document
    const task = { description, priority };
    await tasks.insertOne(task);

    // Send response back to the user
    res.send(`<h2>Task added:</h2><p>Description: ${description}</p><p>Priority: ${priority}</p><br><a href="/">Go Back</a>`);
  } catch (err) {
    console.error('Error handling task submission:', err);
    res.status(500).send('Error adding task');
  } finally {
    // Closing the connection is no longer necessary in long-running apps like Express
    // await client.close();
  }
});

// Serve the HTML form
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
