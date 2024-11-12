const express = require('express');
const path = require('path');
const app = express();

// Serve the static files from the Angular dist directory
app.use(express.static(path.join(__dirname, 'dist/expense-calc')));

// For any other routes, serve the index.html file from the dist folder
app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname, 'dist/expense-calc/browser/', 'index.html'));
});

// Start the server on port 8080
const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});