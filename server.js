const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
var session = require('express-session');
var nocache = require('nocache');

const app = express();
const port =4000;
const secretKey = 'your_secret_key'; // Replace with a strong secret key

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.json());

app.use(session({secret:'key',cookie:{maxAge:1800000}}))
app.use(nocache())

// API to fetch all bus schedules
app.get('/api/booking-schedules', (req, res) => {
    db.query('SELECT * FROM bookings', (err, result) => {
        if (err) {
            res.status(500).json({ message: 'Error fetching turf schedules' });
        } else {
            res.status(200).json(result);
        }
    });
});

app.get('/api/turf-bookings', (req, res) => {
    db.query('SELECT data.*,bookings.* FROM data INNER JOIN bookings ON data.turf_id = bookings.id', (err, result) => {
        if (err) {
            res.status(500).json({ message: 'Error fetching turf schedules' });
        } else {
            res.status(200).json(result);
        }
    });
});

// API to add a new bus schedule
app.post('/api/booking-schedules', (req, res) => {
    const { turf_name,time, date, game_type} = req.body;
    const query = 'INSERT INTO bookings (turf_name, time, date, game_type) VALUES (?, ?, ?, ?)';
    db.query(query, [turf_name, time, date, game_type], (err, result) => {
        if (err) {
            res.status(500).json({ message: 'Error adding turf schedule' });
        } else {
            res.status(200).json({ message: 'Turf schedule added successfully' });
        }
    });
});

// API to update bus schedule
app.put('/api/booking-schedules/:id', (req, res) => {
    const { turf_name, time, date, game_type } = req.body;
    const { id } = req.params;
    const query = 'UPDATE bookings SET turf_name = ?, time = ?, date = ?, game_type = ? WHERE id = ?';
    db.query(query, [turf_name, time, date, game_type, id], (err, result) => {
        if (err) {
            res.status(500).json({ message: 'Error updating turf schedule' });
        } else {
            res.status(200).json({ message: 'Turf schedule updated successfully' });
        }
    });
});

app.post('/api/booking-schedules', (req, res) => {
    const { turf_name, time, date, game_type } = req.body;
    const query = 'INSERT INTO bookings (turf_name, time, date, game_type) VALUES (?, ?, ?, ?)';
    db.query(query, [turf_name, time, date, game_type], (err, result) => {
        if (err) {
            res.status(500).json({ message: 'Error adding turf schedule' });
        } else {
            res.status(200).json({ message: 'Turf schedule added successfully' });
        }
    });
});

app.post('/api/book-turf', function(req,res){
    // console.log(req.body);
    const{turfId,email} = req.body;
    // console.log(busId);
    // console.log(email);
    
    
    const query = "INSERT INTO data (turf_id,User_name) VALUES (? ,?)"
    db.query(query,[turfId,email],(err,result)=>{
        if(err){
            res.status(500).json({message:'Error booking turf'})
        }else{
            res.status(200).json({message:'Turf booked successfully'})
        }
    })
})

// API to delete bus schedule
app.delete('/api/booking-schedules/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM bookings WHERE id = ?';
    db.query(query, [id], (err, result) => {
        if (err) {
            res.status(500).json({ message: 'Error deleting turf schedule' });
        } else {
            res.status(200).json({ message: 'Turf schedule deleted successfully' });
        }
    });
});

// MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // Default XAMPP username
    password: '', // Default XAMPP password
    database: 'turf_booking',
});

db.connect(err => {
    if (err) throw err;
    console.log('Connected to MySQL database.');
});

// Routes
app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;



    
    // Check if the user already exists
    const checkUserSql = 'SELECT * FROM users WHERE email = ?';
    db.query(checkUserSql, [email], async (err, results) => {
        if (err) return res.status(500).send(err);
        if (results.length > 0) return res.status(400).send('User already exists.');

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        const sql = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
        db.query(sql, [username, email, hashedPassword], (err, result) => {
            if (err) return res.status(500).send(err);
            res.status(200).send('User registered successfully!');
        });
    });
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    console.log(email);
    req.session.email = email

    // const sql = 'SELECT * FROM users WHERE email = ?';
    // db.query(sql, [email], async (err, results) => {
    //     if (err) return res.status(500).send(err);
    //     if (results.length === 0) return res.status(400).send('User not found.');

    //     // Compare the hashed password
    //     const match = await bcrypt.compare(password, results[0].password);
    //     if (!match) {
    //         return res.status(401).send('Invalid credentials.');
    //     }

    //     // Create a JWT token
    //     const token = jwt.sign({ userId: results[0].id }, secretKey, { expiresIn: '1h' });

    //     // Respond with a success message and the token
    //     res.status(200).json({
    //         message: 'Login successful!',
    //         token: token
    //     });
    // });
});

// Start server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
