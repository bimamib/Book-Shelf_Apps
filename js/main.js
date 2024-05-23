const books = [];
const RENDER_EVENT = 'render-book';
const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOKSHELF-APPS';
const INCOMPLETED_LIST_BOOK_ID = 'incompleteBookshelfList';
const COMPLETED_LIST_BOOK_ID = 'completeBookshelfList';
const BOOK_ITEMID = 'itemId';

function isStorageExist() {
    if (typeof (Storage) === undefined) {
        alert('Browser kamu tidak mendukung local storage');
        return false;
    }

    return true;
}

function generateId() {
    return +new Date();
}

function generateBookObject(id, title, author, year, isCompleted) {
    return {
        id,
        title,
        author,
        year,
        isCompleted
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const submitForm = document.getElementById('inputBook');
    submitForm.addEventListener('submit', function (event) {
        event.preventDefault();
        addBook();
    });

    if (isStorageExist()) {
        loadDataFromStorage();
    }
});

function addBook() {
    const incompletedBookList = document.getElementById(INCOMPLETED_LIST_BOOK_ID);
    const listCompleted = document.getElementById(COMPLETED_LIST_BOOK_ID);

    const bookTitle = document.getElementById('inputBookTitle').value;
    const bookAuthor = document.getElementById('inputBookAuthor').value;
    const bookYear = document.getElementById('inputBookYear').value;
    const isComplete = document.getElementById('inputBookIsComplete').checked; 

    const generatedID = generateId();
    const bookObject = generateBookObject(generatedID, bookTitle, bookAuthor, bookYear, isComplete);
    books.push(bookObject);

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function makeBook(bookObject) {
    const {id, title, author, year, isCompleted} = bookObject;

    const bookTitle = document.createElement('h3');
    bookTitle.innerHTML = `Judul: <span>${title}</span>`;

    const bookAuthor = document.createElement('p');
    bookAuthor.innerHTML = `Penulis: <span>${author}</span>`;

    const bookYear = document.createElement('p');
    bookYear.innerHTML = `Tahun: <span>${year}</span>`;

    const textContainer = document.createElement('div');
    textContainer.classList.add('inner');
    textContainer.append(bookTitle, bookAuthor, bookYear);

    const container = document.createElement('div');
    container.classList.add('book_list', 'shadow');
    container.append(textContainer);
    container.setAttribute('id', `book-${bookObject}`);

    if (isCompleted) {
        const undoButton = document.createElement('button');
        undoButton.classList.add('undo-button');

        undoButton.addEventListener('click', function () {
            undoBookFromCompleted(id);
        });

        const trashButton = document.createElement('button');
        trashButton.classList.add('trash-button');

        trashButton.addEventListener('click', function () {
            removeBookFromCompleted(id);
        });

        container.append(undoButton, trashButton);
    } else {
        const checkButton = document.createElement('button');
        checkButton.classList.add('check-button');

        checkButton.addEventListener('click', function () {
            addBookToCompleted(id);
        });
        
        const trashButton = document.createElement('button');
        trashButton.classList.add('trash-button');
        
        trashButton.addEventListener('click', function () {
            removeBookFromCompleted(id);
        });

        container.append(checkButton, trashButton);
    }

    return container;
}

document.addEventListener(RENDER_EVENT, function () {
    const incompletedBOOKList = document.getElementById('books');
    incompleteBookshelfList.innerHTML = '';

    const completedBOOKList = document.getElementById('completed-books');
    completeBookshelfList.innerHTML = '';

    for (const bookItem of books) {
        const bookElement = makeBook(bookItem);
        if (!bookItem.isCompleted)
        incompleteBookshelfList.append(bookElement);
        else
        completeBookshelfList.append(bookElement);
    }
});

function addBookToCompleted (bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isCompleted = true;

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function findBook(bookId) {
    for (const bookItem of books) {
        if (bookItem.id === bookId) {
            return bookItem;
        }
    }

    return null;
}

function removeBookFromCompleted(bookId) {
    const bookTarget = findBookIndex(bookId);

    if (bookTarget === -1) return;

    books.splice(bookTarget, 1);

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function undoBookFromCompleted(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isCompleted = false;

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function findBookIndex(bookId) {
    for (const index in books) {
        if (books[index].id === bookId) {
            return index;
        }
    }

    return -1;
}

incompleteBookshelfList.innerHTML = '';
completeBookshelfList.innerHTML = '';

for (bookItem of books) {
    const bookElement = makeBook(bookItem);
    if (bookItem.isCompleted) {
        completeBookshelfList.append(bookElement);
    } else {
        incompleteBookshelfList.append(bookElement);
    }
}

document.getElementById('searchBook').addEventListener('submit', function (event) {
    event.preventDefault();
    const searchBook = document.getElementById('searchBookTitle').value.toLowerCase();
    const bookList = document.querySelectorAll('.book_item');
    for (let book of bookList) {
        const title = book.firstElementChild.innerText.toLowerCase();
        if (title.includes(searchBook)) {
            book.style.display = "block";
        } else {
            book.style.display = "none";
        }
    }
})

function saveData() {
    if (isStorageExist()) {
        const parsed = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(SAVED_EVENT));
    }
}

document.addEventListener(SAVED_EVENT, function () {
    console.log(localStorage.getItem(STORAGE_KEY));
});

function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);

    if (data !== null) {
        for (const book of data) {
            books.push(book);
        }
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
}

document.addEventListener("ondatasaved", () => {
    console.log("Data Berhasil Disimpan.");
});

const checkbox = document.getElementById('inputBookIsComplete');
checkbox.addEventListener("click", function() {
    button = document.querySelector("#bookSubmit span");
    if (checkbox.checked) {
        button.innerText = "Selesai dibaca";
    } else {
        button.innerText = "Belum selesai dibaca"
    }
}); 