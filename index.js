const express = require("express");
const fs = require("fs").promises;
const jwt = require("jsonwebtoken");
const JWT_SECRET_KEY = "ANYTHING";
const PORT = 5000;
const app = express();

app.use(express.json());

const auth = async (req, res, next) => {
    const header = req.header["authorization"];
    if (!header) { return res.status(403).send({ message: "Acces Denied!" }) };
    const user = await jwt.verify(header, JWT_SECRET_KEY);
    req.user = user;
    next();
}

app.post("/addBook", async (req, res) => {
    const { bookName, bookDescription } = req.body;
    const getBooks = await fs.readFile("bookStore.json", "utf-8");
    let addedBook = JSON.parse(getBooks);
    addedBook.push({ id: addedBook.length + 1, name: bookName, description: bookDescription })
    await fs.writeFile("bookStore.json", JSON.stringify(addedBook));
    return res.send({
        message: "Book added Successfully!",
    });
});

app.get("/getAllBook", async (req, res) => {
    const getBooks = await fs.readFile("bookStore.json", "utf-8");
    if (!getBooks.length) {
        return res.status(404).send({ message: "No books found!" })
    }
    return res.status(200).send({
        message: "Book found!",
        data: JSON.parse(getBooks)
    })
});

app.get("/getBookById", async (req, res) => {
    const { bookId } = req.query;
    const getBooks = await fs.readFile("bookStore.json", "utf-8");
    if (!getBooks.length) {
        return res.status(404).send({ message: "There is no book in the bookStore!" })
    }
    let parsedData = JSON.parse(getBooks);
    const bookByID = parsedData.filter(item => { return bookId == item.id });
    if (!bookByID.length) {
        return res.status(404).send({ message: "No book found!" })
    }
    return res.status(200).send({
        message: "Book found!",
        data: bookByID
    })
});

app.delete("/deleteBook", async (req, res) => {
    const { bookId } = req.query;
    const getBooks = await fs.readFile("bookStore.json", "utf-8");
    if (!getBooks.length) {
        return res.status(404).send({ message: "There is no book in the bookStore!" })
    }
    let parsedData = JSON.parse(getBooks);
    const bookByID = parsedData.filter(item => { return bookId == item.id });
    if (!bookByID.length) {
        return res.status(404).send({ message: "No book found!" })
    }
    const finalBooks = [];
    parsedData.map(item => {
        if (item.id != bookId) {
            finalBooks.push(item)
        }
    });
    await fs.writeFile("bookStore.json", JSON.stringify(finalBooks));
    return res.send({
        message: "Book deleted Successfully!",
    });
});

app.put("/editBook", async (req, res) => {
    const { bookId, bookName, bookDescription } = req.query;
    const getBooks = await fs.readFile("bookStore.json", "utf-8");
    if (!getBooks.length) {
        return res.status(404).send({ message: "There is no book in the bookStore!" })
    }
    let parsedData = JSON.parse(getBooks);
    const bookByID = parsedData.filter(item => { return bookId == item.id });
    if (!bookByID.length) {
        return res.status(404).send({ message: "No book found!" })
    }
    const finalBooks = [];
    parsedData.map(item => {
        if (item.id == bookId) {
            item.name = bookName
            item.description = bookDescription
            finalBooks.push(item)
        } else {
            finalBooks.push(item)
        }
    });
    await fs.writeFile("bookStore.json", JSON.stringify(finalBooks));
    return res.send({
        message: "Book edited Successfully!",
    });
});

app.listen(PORT, console.log("Server is listening to 5000!"))