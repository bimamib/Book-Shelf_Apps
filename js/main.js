document.addEventListener("DOMContentLoaded", function () {
    const books = [];
    const bookSubmitBtn = document.getElementById("bookSubmit");
    const bookSearchBtn = document.getElementById("searchSubmit");
    const checkbox = document.getElementById("inputBookIsComplete");
    const STORAGE_KEY = "Bookshelf_Apps";
    const RENDER_EVENT = "render-bookshelf";

    bookSubmitBtn.addEventListener("click", function (event) {
        event.preventDefault();
        addBook();
    });

    bookSearchBtn.addEventListener("click", function (event) {
        event.preventDefault();
        searchTitle = document.getElementById("searchBookTitle").value.toLowerCase();
        console.log(searchTitle);
        for (const bookItem of books) {
            if (bookItem.title.toLowerCase().search(searchTitle) === -1) {
                document.getElementById(bookItem.id).style.display = "none";
            } else {
                document.getElementById(bookItem.id).style.display = "flex";
            }
        }
    });

    checkbox.addEventListener("change", function () {
        if (checkbox.checked === true) {
            document.getElementById("bookshelfSection").innerText = "Selesai dibaca";
        } else {
            document.getElementById("bookshelfSection").innerText = "Belum selesai dibaca";
        }
    });

    document.addEventListener(RENDER_EVENT, function () {
        document.getElementById("inputBookTitle").value = '';
        document.getElementById("inputBookAuthor").value = '';
        document.getElementById("inputBookYear").value = '';
        checkbox.checked = false;
        document.getElementById("searchBookTitle").value = '';
        const incompleteBookshelfList = document.getElementById("incompleteBookshelfList");
        const completeBookshelfList = document.getElementById("completeBookshelfList");
        incompleteBookshelfList.innerHTML = '';
        completeBookshelfList.innerHTML = '';
        for (const bookItem of books) {
            const bookElement = makeBookElement(bookItem);
            if (!bookItem.isCompleted) {
                incompleteBookshelfList.appendChild(bookElement);
            } else {
                completeBookshelfList.appendChild(bookElement);
            }
        }
    });

    function generateBookObject(id, title, author, year, isCompleted) {
        return {
            id,
            title,
            author,
            year,
            isCompleted
        };
    }

    function isStorageExist() {
        if (typeof (Storage) === undefined) {
            alert('Browser kamu tidak mendukung local storage');
            return false;
        }
        return true;
    }

    function saveDataToStorage() {
        if (isStorageExist()) {
            const bookObjectParsed = JSON.stringify(books);
            localStorage.setItem(STORAGE_KEY, bookObjectParsed);
            document.dispatchEvent(new Event(RENDER_EVENT));
        }
    }

    function findBook(bookId) {
        for (const bookItem of books) {
            if (bookItem.id === bookId) {
                return bookItem;
            }
        }
        return null;
    }

    function findBookIndex(bookId) {
        for (const index in books) {
            if (books[index].id === bookId) {
                return index;
            }
        }
        return -1;
    }

    function cancelledEdit(id) {
        document.getElementById(id).style.display = "flex";
        Swal.fire({
            icon: "error",
            title: "Perubahan dibatalkan!",
            showConfirmButton: false,
            timer: 1500
        });
    }

    function addBook() {
        const bookTitle = document.getElementById("inputBookTitle").value;
        const bookAuthor = document.getElementById("inputBookAuthor").value;
        const bookYear = document.getElementById("inputBookYear").value;
        const bookIsComplete = checkbox.checked;
        const id = +new Date();
        const bookObject = generateBookObject(id, bookTitle, bookAuthor, bookYear, bookIsComplete);
        books.push(bookObject);
        showAlert("Buku berhasil ditambahkan", "success");
        saveDataToStorage();
    }

    function makeBookElement(bookObject) {
        const textTitle = document.createElement("h3");
        textTitle.innerText = bookObject.title;

        const textAuthor = document.createElement("p");
        textAuthor.innerText = "Penulis: " + bookObject.author;

        const textYear = document.createElement("p");
        textYear.innerText = "Tahun: " + bookObject.year;

        const textContainer = document.createElement("div");
        textContainer.classList.add("book-info");
        textContainer.append(textTitle, textAuthor, textYear);

        const actionContainer = document.createElement("div");
        actionContainer.classList.add("action");

        const bookContainer = document.createElement("article");
        bookContainer.classList.add("book_item", "shadow");
        bookContainer.appendChild(textContainer);
        bookContainer.setAttribute("id", bookObject.id);

        const trashButton = document.createElement("button");
        trashButton.classList.add("trash-button");
        trashButton.setAttribute("title", "Delete");
        trashButton.addEventListener("click", function () {
            confirmDeleteBook(bookObject);
        });

        if (bookObject.isCompleted) {
            const undoButton = document.createElement("button");
            undoButton.classList.add("undo-button");
            undoButton.setAttribute("title", "Undo");
            undoButton.addEventListener("click", function () {
                undoBookFromCompleted(bookObject.id);
            });

            actionContainer.append(undoButton, trashButton);
            bookContainer.appendChild(actionContainer);
        } else {
            const checkButton = document.createElement("button");
            checkButton.classList.add("check-button");
            checkButton.setAttribute("title", "Completed");
            checkButton.addEventListener("click", function () {
                addBookToCompleted(bookObject.id);
            });

            const editButton = document.createElement("button");
            editButton.classList.add("edit-button");
            editButton.setAttribute("title", "Edit");
            editButton.addEventListener("click", function () {
                editBook(bookObject.id);
            });

            actionContainer.append(checkButton, editButton, trashButton);
            bookContainer.appendChild(actionContainer);
        }
        return bookContainer;
    }

    function undoBookFromCompleted(bookId) {
        const bookTarget = findBook(bookId);
        if (bookTarget == null) return;
        bookTarget.isCompleted = false;
        saveDataToStorage();
    }

    function removeBook(bookId) {
        const bookIndex = findBookIndex(bookId);
        if (bookIndex === -1) return;
        books.splice(bookIndex, 1);
        saveDataToStorage();
    }

    function confirmDeleteBook(book) {
        Swal.fire({
          text: `Apakah Anda yakin ingin menghapus buku "${book.title}"?`,
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Ya, hapus buku",
        }).then((result) => {
          if (result.isConfirmed) {
            removeBook(book.id);
            showAlert("Buku berhasil dihapus", "success");
          }
        });
      }

      function showAlert(text, icon) {
        Swal.fire({
          text: text,
          icon: icon,
        });
      }

    function editBook(bookId) {
        const bookTarget = findBook(bookId);
        const bookEditIndex = findBookIndex(bookId);
        if (bookTarget == null) return;
        document.getElementById(bookTarget.id).style.display = "none";
        let editedTitle = null;
        let editedAuthor = null;
        let editedYear = null;
        Swal.fire({
            title: "Judul",
            icon: "info",
            input: "text",
            inputValue: bookTarget.title,
            showDenyButton: true,
            focusConfirm: false,
            confirmButtonText: "<i class='fa fa-check'></i> Lanjut!",
            denyButtonText: "<i class='fa fa-close'></i> Batal!"
        }).then((result) => {
            if (result.value) {
                editedTitle = result.value;
                Swal.fire({
                    title: "Penulis",
                    icon: "info",
                    input: "text",
                    inputValue: bookTarget.author,
                    showDenyButton: true,
                    focusConfirm: false,
                    confirmButtonText: "<i class='fa fa-check'></i> Lanjut!",
                    denyButtonText: "<i class='fa fa-close'></i> Batal!"
                }).then((result) => {
                    if (result.value) {
                        editedAuthor = result.value;
                        Swal.fire({
                            title: "Tahun",
                            icon: "info",
                            input: "number",
                            inputValue: bookTarget.year,
                            showDenyButton: true,
                            focusConfirm: false,
                            confirmButtonText: "<i class='fa fa-save'></i> Simpan!",
                            denyButtonText: "<i class='fa fa-close'></i> Batal!"
                        }).then((result) => {
                            if (result.value) {
                                editedYear = result.value;
                                Swal.fire({
                                    title: "Apakah Anda yakin dengan perubahan?",
                                    icon: "warning",
                                    showCancelButton: true,
                                    confirmButtonColor: "#3085d6",
                                    cancelButtonColor: "#d33",
                                    confirmButtonText: "Ya!",
                                    cancelButtonText: "Tidak!"
                                }).then((result) => {
                                    if (result.isConfirmed) {
                                        books[bookEditIndex].title = editedTitle;
                                        books[bookEditIndex].author = editedAuthor;
                                        books[bookEditIndex].year = editedYear;
                                        saveDataToStorage();
                                        Swal.fire({
                                            icon: "success",
                                            title: "Perubahan berhasil disimpan!",
                                            showConfirmButton: false,
                                            timer: 1500
                                        });
                                    } else {
                                        cancelledEdit(bookTarget.id);
                                    }
                                });
                            } else {
                                cancelledEdit(bookTarget.id);
                            }
                        });
                    } else {
                        cancelledEdit(bookTarget.id);
                    }
                });
            } else {
                cancelledEdit(bookTarget.id);
            }
        });
    }

    function addBookToCompleted(bookId) {
        const bookTarget = findBook(bookId);
        if (bookTarget == null) return;
        bookTarget.isCompleted = true;
        showAlert("Buku selesai dibaca", "success");
        saveDataToStorage();
    }

    function loadDataFromStorage() {
        const dataBooks = JSON.parse(localStorage.getItem(STORAGE_KEY));
        if (dataBooks !== null) {
            for (const book of dataBooks) {
                books.push(book);
            }
        }
        document.dispatchEvent(new Event(RENDER_EVENT));
    }

    if (isStorageExist()) {
        loadDataFromStorage();
    }
})
