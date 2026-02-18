const dotenv = require('dotenv');
dotenv.config({ path: './.env' });

const express = require('express');
const pool = require('./config/db.js');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT NOW() AS now');
        res.json({ message: 'Server is running!', dbTime: rows[0].now });
    } catch (err) {
        res.status(500).json({ error: 'Database query failed', details: err.message });
    }
});

// get departments
app.get('/api/departments', async (req, res) => {
  try {
    const [departments] = await pool.query('SELECT * FROM departments');
    res.status(200).json(departments) || json({message: 'No record found'});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// get employees
app.get('/api/employees', async (req, res) => {
  try {
    const [employees] = await pool.query('SELECT * FROM employees');
    res.status(200).json(employees) || json({message: 'No record found'});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

//get employee by id
app.get('/api/employees/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Optional: Validate ID (if it's numeric)
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid employee ID' });
    }

    const [rows] = await pool.query(
      'SELECT * FROM employees WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.status(200).json(rows[0]);

  } catch (error) {
    console.error('Error fetching employee:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// post a department
app.post('/api/departments', async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Department name is required' });
    }

    const [result] = await pool.query(
      'INSERT INTO departments (name) VALUES (?)',
      [name]
    );

    res.status(201).json({
      message: 'Department created successfully',
      id: result.insertId,
      name
    });
  } catch (error) {
    console.error('Error creating department:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

//post employee
app.post('/api/employees', async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email,
      phone,
      department_id,
      salary,
      hire_date
    } = req.body;

    // Basic validation
    if (!first_name || !last_name || !email) {
      return res.status(400).json({ message: 'First name, last name, and email are required' });
    }

    const [result] = await pool.query(
      `INSERT INTO employees 
        (first_name, last_name, email, phone, department_id, salary, hire_date)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [first_name, last_name, email, phone || null, department_id || null, salary || null, hire_date || null]
    );

    res.status(201).json({
      message: 'Employee created successfully',
      id: result.insertId,
      first_name,
      last_name,
      email,
      phone,
      department_id,
      salary,
      hire_date
    });
  } catch (error) {
    console.error('Error creating employee:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Email already exists' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
});

async function startServer() {
  try {
    // Test DB connection
    await pool.query('SELECT 1');
    console.log('✅ Database connected successfully');

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to connect to the database:', err.message);
    process.exit(1);
  }
}

startServer();