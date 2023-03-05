
var booksNumber;
var timeoutID = 0;
//todo Book Class: Represents a Book
class Book {
    constructor(title, author, isbn) {
        this.title = title;
        this.author = author;
        this.isbn = isbn;
    }

}
//todo UI Class: Handle UI Tasks

class UI {
    static displayBooks() {
        const books = Store.getBooks();
        booksNumber = books.length;
        books.forEach((book, index) => UI.addBookToList(book, index));
    }
    static addBookToList(book, index) {
        const list = document.querySelector('#book-list');
        const row = document.createElement('tr');
        row.innerHTML = `
        <td>${index + 1}</td>
        <td>${book.title}</td>
        <td>${book.author}</td>
        <td>${book.isbn}</td>
        <td><button class="delete">X</button></td>
        `;

        list.appendChild(row);
    }
    static deleteBook(element) {
        element.parentElement.parentElement.remove();
    }
    static showAlert(message, className) {

        clearTimeout(timeoutID);
        const div = document.createElement('div');
        div.className = `alert alert-${className}`;
        div.appendChild(document.createTextNode(message));
        const form = document.querySelector('#book-form');
        if (document.querySelector('.alert')) {
            document.querySelector('.alert').remove();
            form.appendChild(div);
        } else {
            form.appendChild(div);
        }
        timeoutID = setTimeout(() => document.querySelector('.alert').remove(), 3000);
    }

    static clearFields() {
        document.querySelector('#title').value = '';
        document.querySelector('#author').value = '';
        document.querySelector('#isbn').value = '';

    }

}
//todo Store Class: Handle Storage
class Store {
    static getBooks() {
        let books;
        if (localStorage.getItem('books') === null) {
            books = [];
        } else {
            books = JSON.parse(localStorage.getItem('books'));
        }
        return books;
    }
    static addBook(book) {
        const books = Store.getBooks();

        books.push(book);

        localStorage.setItem('books', JSON.stringify(books));
    }
    static removeBook(isbn) {
        const books = Store.getBooks();

        books.forEach((book, index) => {
            if (book.isbn === isbn) {
                books.splice(index, 1);
            }
        });
        localStorage.setItem('books', JSON.stringify(books));
    }
}
//todo Event: Display Books
document.addEventListener('DOMContentLoaded', UI.displayBooks);
//todo Event: Add a Book
document.querySelector('#book-form').addEventListener('submit', (e) => {
    e.preventDefault();
    // Get Form Values
    const title = document.querySelector('#title').value;
    const author = document.querySelector('#author').value;
    const isbn = document.querySelector('#isbn').value;

    // Validate
    if (title === '' || author === '' || isbn === '') {
        UI.showAlert('Please fill in all fields!', 'danger');
    } else {
        // Instantiate book
        const book = new Book(title, author, isbn);

        // Add Book to UI
        UI.addBookToList(book, booksNumber++);

        // Add Book to Store
        Store.addBook(book);

        //Show Success Message
        UI.showAlert('Book Added!', 'success');

        // Clear Fields
        UI.clearFields();
    }

});
//todo Event: Remove a Book
// event propagation, event for the row
document.querySelector('#book-list').addEventListener('click', (e) => {
    if (e.target.classList.contains('delete')) {
        if (confirm("Are you sure?")) {
            UI.deleteBook(e.target);
            //Remove Book from Store
            Store.removeBook(e.target.parentElement.previousElementSibling.textContent);
            //Show Success Message
            UI.showAlert('Book Removed!', 'success');
        }
    }
});
//todo Filter
const search = document.querySelector('#search');
search.addEventListener('keyup', (e) => {
    const table = document.querySelector("#book-list");
    const filter = search.value.toLowerCase();
    const tr = table.getElementsByTagName("tr");

    for (let i = 0; i < tr.length; i++) {
        const td = tr[i].getElementsByTagName("td");
        let valid = -1;
        for (let j = 0; j < td.length; j++) {
            const txtValue = td[j].textContent || td[j].innerText;
            if (txtValue.toLowerCase().indexOf(filter) > -1) {
                valid++;
            }
        }
        if (valid > -1) {
            tr[i].style.display = "";
        } else {
            tr[i].style.display = "none";
        }
    }
});

// todo Sort Table
const getCellValue = (tr, idx) => tr.children[idx].innerText || tr.children[idx].textContent;

var comparer = function (idx, asc) {
    // This is used by the array.sort() function...
    return function (a, b) {
        return function (v1, v2) {
            // sort based on a numeric or localeCompare, based on type...
            return (v1 !== '' && v2 !== '' && !isNaN(v1) && !isNaN(v2))
                ? v1 - v2
                : v1.toString().localeCompare(v2);
        }
            (getCellValue(asc ? a : b, idx), getCellValue(asc ? b : a, idx));
    }
};

// do the work...
document.querySelectorAll('th').forEach(th => th.addEventListener('click', (() => {

    const table = document.querySelector('#book-list');
    Array.from(table.querySelectorAll('tr'))
        .sort(comparer(Array.from(th.parentNode.children).indexOf(th), this.asc = !this.asc))
        .forEach(tr => table.appendChild(tr));
})));
