const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(bodyParser.json());


const dataFilePath = path.join(__dirname, 'data.json');

const loadBooks = () => {
    try {
        const data = fs.readFileSync(dataFilePath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        return []; 
    }
};


const saveBooks = (books) => {
    try {
        fs.writeFileSync(dataFilePath, JSON.stringify(books, null, 2), 'utf8');
    } catch (err) {
        console.error('Error saving data to file', err);
    }
};


let books = loadBooks();


app.post('/books', (req, res) => {
    const { book_id, title, author, genre, year, copies } = req.body;

    
    if (!book_id || !title || !author || !genre || !year || !copies) {
        return res.status(400).json({ error: 'All fields are required: book_id, title, author, genre, year, copies' });
    }

    
    const existingBook = books.find(b => b.book_id === book_id);
    if (existingBook) {
        return res.status(400).json({ error: 'Book with this ID already exists' });
    }

      const newBook = { book_id, title, author, genre, year, copies };
    books.push(newBook);

    
    saveBooks(books);

    res.status(201).json(newBook);
});


app.get('/books', (req, res) => {
    res.json(books);
});


app.get('/books/:id', (req, res) => {
    const book = books.find(b => b.book_id === req.params.id);
    if (!book) {
        return res.status(404).json({ error: 'Book not found' });
    }
    res.json(book);
});


app.put('/books/:id', (req, res) => {
    const book = books.find(b => b.book_id === req.params.id);
    if (!book) {
        return res.status(404).json({ error: 'Book not found' });
    }

    const { title, author, genre, year, copies } = req.body;

    
    if (title) book.title = title;
    if (author) book.author = author;
    if (genre) book.genre = genre;
    if (year) book.year = year;
    if (copies) book.copies = copies;

    
    saveBooks(books);

    res.json(book);
});

// **DELETE /books/:id** - Delete a book by ID
app.delete('/books/:id', (req, res) => {
    const bookIndex = books.findIndex(b => b.book_id === req.params.id);
    if (bookIndex === -1) {
        return res.status(404).json({ error: 'Book not found' });
    }

    // Remove the book from the array
    books.splice(bookIndex, 1);

    // Save the updated books to data.json
    saveBooks(books);

    res.json({ message: 'Book deleted' });
});

// Start the server
const PORT = process.env.PORT || 3010;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
