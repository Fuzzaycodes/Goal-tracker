const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');
const { Sequelize, DataTypes } = require('sequelize');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// Connect to MySQL
const sequelize = new Sequelize('goal_tracker', 'goal_user', 'password', {
  host: 'localhost',
  dialect: 'mysql'
});

sequelize.authenticate()
  .then(() => {
    console.log('Connection to MySQL has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

// Define models
const Goal = sequelize.define('Goal', {
  text: {
    type: DataTypes.STRING,
    allowNull: false
  },
  dueDate: {
    type: DataTypes.STRING,
    allowNull: false
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false
  },
  totalSteps: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  stepsCompleted: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  milestone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  progressPercentage: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  completed: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  }
});

const Achievement = sequelize.define('Achievement', {
  achievement: {
    type: DataTypes.STRING,
    allowNull: false
  },
  date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false
  }
});

// Sync models with the database
sequelize.sync()
  .then(() => {
    console.log('Database & tables created!');
  })
  .catch(err => {
    console.error('Error creating database & tables:', err);
  });

// Routes for Goals
app.get('/goals', async (req, res) => {
  try {
    const goals = await Goal.findAll();
    res.json(goals);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.post('/goals', async (req, res) => {
  try {
    const goal = await Goal.create(req.body);
    res.json(goal);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.put('/goals/:id', async (req, res) => {
  try {
    const goal = await Goal.findByPk(req.params.id);
    if (goal) {
      await goal.update(req.body);
      res.json(goal);
    } else {
      res.status(404).send('Goal not found');
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.delete('/goals/:id', async (req, res) => {
  try {
    const goal = await Goal.findByPk(req.params.id);
    if (goal) {
      await goal.destroy();
      res.json({ message: 'Goal deleted' });
    } else {
      res.status(404).send('Goal not found');
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Routes for Achievements
app.get('/achievements', async (req, res) => {
  try {
    const achievements = await Achievement.findAll();
    res.json(achievements);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.post('/achievements', async (req, res) => {
  try {
    const achievement = await Achievement.create(req.body);
    res.json(achievement);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Route to fetch a random quote
app.get('/random-quote', async (req, res) => {
  try {
    const response = await axios.get('https://api.quotable.io/random');
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching quote:', error.message);
    res.status(500).send('Error fetching quote');
  }
});

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to the Quotes and Goals App');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
