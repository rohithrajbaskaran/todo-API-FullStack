import express from 'express';
import cors from 'cors';
import pkg from 'pg';

const { Client } = pkg;

const app = express();
const port = 3001; // or any port you prefer

// PostgreSQL connection details
const db = new Client({
  user: "postgres",
  host: "localhost",
  database: "world",
  password: "Kavitha123@",
  port: 5432,
});

// Connect to the database
db.connect()
  .then(() => console.log('Connected to PostgreSQL'))
  .catch(err => console.error('Database connection error', err.stack));

// Middleware
app.use(cors()); 
app.use(express.json()); 

// Get all todo from db
app.get('/api/all-todos', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM todo');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching todos:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add a new todo to db
app.post('/api/new-todos', async (req, res) => {
  const { data, id } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO todo (id, text, completed) VALUES ($1, $2, $3) RETURNING *',
      [id, data, false]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding todo:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update a todo's text or completion status
app.put('/api/edit-todo/:id', async (req, res) => {
  const { id } = req.params;
  const { text, completed } = req.body; 
  try {
    const result = await db.query(
      'UPDATE todo SET text = COALESCE($1, text), completed = COALESCE($2, completed) WHERE id = $3 RETURNING *',
      [text, completed, id]
    );
    if (result.rowCount > 0) {
      res.status(200).json(result.rows[0]);
    } else {
      res.status(404).json({ message: 'Todo not found' });
    }
  } catch (error) {
    console.error('Error updating todo:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a todo
app.delete('/api/all-todos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('DELETE FROM todo WHERE id = $1 RETURNING *', [id]);
    if (result.rowCount > 0) {
      res.status(200).json(result.rows[0]);
    } else {
      res.status(404).json({ message: 'Todo not found' });
    }
  } catch (error) {
    console.error('Error deleting todo:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});



