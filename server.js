const express = require('express');
const app = express();
const port = 3000;

// Middleware to parse JSON data
app.use(express.json());

// In-memory task data (an array to store tasks)
let tasks = [];

// Authentication middleware (for protection of POST, PUT, DELETE)
function checkAuth(req, res, next) {
    const apiKey = req.header('x-api-key');
    if (apiKey !== 'your-secure-api-key') {
        return res.status(403).send('Forbidden');
    }
    next();
}

// 1. GET /tasks - Retrieve all tasks with pagination and sorting
app.get('/tasks', (req, res) => {
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 5; // Default to limit of 5 tasks per page
    const sortBy = req.query.sortBy || 'title'; // Default to sorting by title
    const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1; // Default to ascending order

    // Sort tasks
    const sortedTasks = [...tasks].sort((a, b) => {
        if (a[sortBy] < b[sortBy]) return -1 * sortOrder;
        if (a[sortBy] > b[sortBy]) return 1 * sortOrder;
        return 0;
    });

    // Paginate tasks
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedTasks = sortedTasks.slice(startIndex, endIndex);

    res.status(200).json({
        page,
        totalPages: Math.ceil(tasks.length / limit),
        tasks: paginatedTasks,
    });
});

// 2. GET /tasks/:id - Retrieve task by ID
app.get('/tasks/:id', (req, res) => {
    const task = tasks.find(t => t.id === parseInt(req.params.id));
    if (!task) return res.status(404).send('Task not found');
    res.status(200).json(task);
});

// 3. POST /tasks - Create a new task (requires authentication)
app.post('/tasks', checkAuth, (req, res) => {
    const { title, description } = req.body;

    // Basic validation: Title and description are required
    if (!title || !description) return res.status(400).send('Title and description are required');

    const newTask = {
        id: tasks.length + 1,
        title,
        description
    };

    tasks.push(newTask);
    res.status(201).json(newTask);
});

// 4. PUT /tasks/:id - Update a task by ID (requires authentication)
app.put('/tasks/:id', checkAuth, (req, res) => {
    const { title, description } = req.body;
    const task = tasks.find(t => t.id === parseInt(req.params.id));
    if (!task) return res.status(404).send('Task not found');

    if (!title || !description) return res.status(400).send('Title and description are required');

    task.title = title;
    task.description = description;
    res.status(200).json(task);
});

// 5. DELETE /tasks/:id - Delete a task by ID (requires authentication)
app.delete('/tasks/:id', checkAuth, (req, res) => {
    const taskIndex = tasks.findIndex(t => t.id === parseInt(req.params.id));
    if (taskIndex === -1) return res.status(404).send('Task not found');

    tasks.splice(taskIndex, 1);
    res.status(200).send('Task deleted');
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
