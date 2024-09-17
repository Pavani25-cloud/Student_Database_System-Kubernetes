const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bodyParser = require('body-parser');

// Initialize express app
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://mongodb:27017/studentDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('MongoDB connected successfully');
}).catch(err => {
    console.error('MongoDB connection error:', err.message);
});

// Define a student schema with a password field
const studentSchema = new mongoose.Schema({
    name: String,
    rollNumber: { type: String, unique: true },
    class: String,
    gender: String,
    attendance: Number,
    academic: Number,
    performance: String,
    mobile: String,
    email: String,
    councillor: String,
    password: String // Add password field
});

// Create a model from the schema
const Student = mongoose.model('Student', studentSchema);

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Root route
app.get('/', (req, res) => {
    res.redirect('/index.html');
});

// Endpoint to register a student
app.post('/register', async (req, res) => {
    const { password } = req.body;

    // Regular expression for password validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8}$/;

    // Validate the password
    if (!passwordRegex.test(password)) {
        return res.status(400).json({ error: 'Password must be exactly 8 characters long, including one uppercase letter, one lowercase letter, one number, and one special character.' });
    }

    try {
        const student = new Student(req.body);
        await student.save();
        res.status(201).json({ message: 'Student registered successfully' });
    } catch (error) {
        res.status(400).json({ error: 'Error registering student', details: error.message });
    }
});

// Endpoint to search for a student
app.get('/search', async (req, res) => {
    const { rollNumber, password } = req.query;

    // Password validation is not implemented in this example
    // Add your own logic for password validation here if needed

    try {
        const student = await Student.findOne({ rollNumber });
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        res.json(student);
    } catch (error) {
        res.status(500).json({ error: 'Error retrieving student data', details: error.message });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
