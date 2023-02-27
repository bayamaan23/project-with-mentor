//команда чтобы запускать json-server -w db.json -p 8000
//! Это АПИ для запросов
const API = "http://localhost:8000/products";
//! Блок куда добавляются карточки
const list = document.querySelector("#products-list");
//! Форма с инпутами для ввода данных
const addForm = document.querySelector("#add-form");
const titleInp = document.querySelector("#title");
const priceInp = document.querySelector("#price");
const descriptionInp = document.querySelector("#description");
const imageInp = document.querySelector("#image");

//! инпуты и кнопка из модалки
const editTitleInp = document.querySelector("#edit-title");
const editPriceInp = document.querySelector("#edit-price");
const editDescriptionInp = document.querySelector("#edit-descr");
const editImageInp = document.querySelector("#edit-image");
const editaveBtn = document.querySelector("#btn-save-edit");
//! инпут для поиска
const searchInput = document.querySelector("#search");
//! переменная по которой делаем запрос
let searchVal = "";
//! то нде отображаем наши кнопки для
const paginationList = document.querySelector(".pagination-list");
const pref = document.querySelector(".prev");
const next = document.querySelector(".next");
const limit = 2; // максимальноек количество продуктов на одной странице
let currentPage = 1; // текущая страница
let pageTotalCount = 1; // общее количество страниц

// Первоначальное отображение данных
getProducts();
// Стягиваем данные с сервера
async function getProducts() {
  // ?title_like для поиска по ключу title
  // q для поиска по всем ключам
  // _limit чтобы указать максвимальное количество элементов на одной странице
  // _page получить данные на определенной странице
  const res = await fetch(
    `${API}?title_like=${searchVal}&_limit=${limit}&_page=${currentPage}`
  );
  // x-total-count общее количество продуктов 
  const count = res.headers.get("x-total-count");
  // формула, чтобы высчитать максимальное количество страниц
  pageTotalCount = Math.ceil(count / limit);
  const data = await res.json(); // расшифровка данных
  // отображаем актуальные данные
  render(data);
}

// функция для добавления в db.json
async function addProduct(product) {
  // await для того чтобы gerProducts подождала пока данные данные добавятся
  await fetch(API, {
    method: "POST",
    body: JSON.stringify(product),
    headers: {
      "Content-Type": "application/json",
    },
  });
  // стянуть и отобразить актуальные данные
  getProducts();
}

// функция для удаления
async function deleteProduct(id) {
  // await для того чтобы gerProducts подождала пока данные данные добавятся
  await fetch(`${API}/${id}`, {
    method: "DELETE",
  });
  // стянуть и отобразить актуальные данные
  getProducts();
}
// функция для получения одного продукта
async function getOneProduct(id) {
  const res = await fetch(`${API}/${id}`);
  const data = await res.json(); // расшифровка данных
  return data; // возвращаем продукт с db.json
}
// функция чтобы изменить данные
async function editProduct(id, editedProduct) {
  await fetch(`${API}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(editedProduct),
    headers: {
      "Content-Type": "application/json",
    },
  });
  getProducts();
}

// Для отображения на странице
async function render(arr) {
  // Очищаем чтобы карточки не дублировались
  list.innerHTML = "";
  arr.forEach((item) => {
    list.innerHTML += `
    <div class="card m-5" style="width: 18rem">
        <img src="${item.image}" class="card-img-top" alt="..." />
        <div class="card-body">
          <h5 class="card-title">${item.title}</h5>
          <p class="card-text">
            ${item.description.slice(0, 70)}...
          </p>
          <p class="card-text">
            $ ${item.price}
          </p>
          <button id="${
            item.id
          }" class="btn btn-danger btn-delete">DELETE</button>
          <button data-bs-toggle="modal" data-bs-target="#exampleModal" id="${
            item.id
          }" class="btn btn-dark btn-edit">Edit</button>
        </div>
      </div>
        `;
  });
  renderPagination();
}

// вешаем обработчик события для добавления(CREATE)
addForm.addEventListener("submit", (e) => {
  // чтобы страница не перезагружалась
  e.preventDefault();
  //проверка на заполненость полей
  if (
    !titleInp.value.trim() ||
    !priceInp.value.trim() ||
    !descriptionInp.value.trim() ||
    !imageInp.value.trim()
  ) {
    alert("Заполните все поля");
    return;
  }
  // создаем обьект для добавления
  const product = {
    title: titleInp.value,
    price: priceInp.value,
    description: descriptionInp.value,
    image: imageInp.value,
  };
  // отправляем обьект db.jsxon
  addProduct(product);
  // очищаем инпуты
  titleInp.value = "";
  priceInp.value = "";
  descriptionInp.value = "";
  imageInp.value = "";
});

document.addEventListener("click", (e) => {
  if (e.target.classList.contains("btn-delete")) {
    deleteProduct(e.target.id);
  }
});

let id = null; // перемпенная чтобы сохарнить id продукта на который мы нажали

// обработчик события на открытие модалки и заполнение модалки
document.addEventListener("click", async (e) => {
  if (e.target.classList.contains("btn-edit")) {
    // сохраняем id продукта
    id = e.target.id;
    // получаем обьект на который мы нажали
    // await потому что getOneProduct ассинхронная функция
    const product = await getOneProduct(e.target.id);
    // заполняем инпуты данными продукта
    editTitleInp.value = product.title;
    editPriceInp.value = product.price;
    editDescriptionInp.value = product.description;
    editImageInp.value = product.image;
  }
});
// обработчик события на сохранения данных
editaveBtn.addEventListener("click", () => {
  // проверка на пустату инпутов
  if (
    !editTitleInp.value.trim() ||
    !editPriceInp.value.trim() ||
    !editDescriptionInp.value.trim() ||
    !editImageInp.value.trim()
  ) {
    alert("Заполните все поля");
    // если хотя бы один инпут пустой выводим предупреждение и останавливаем функцию
    return;
  }
  // собираем измененый обьект для изменения продукта
  const editedProduct = {
    title: editTitleInp.value,
    price: editPriceInp.value,
    description: editDescriptionInp.value,
    image: editImageInp.value,
  };
  // вызываем функцию
  editProduct(id, editedProduct);
});
// обработчик события для поиска
searchInput.addEventListener("input", () => {
  searchVal = searchInput.value;
  currentPage = 1;
  getProducts();
});
// функция для отображения кнопок пагинации
function renderPagination() {
  paginationList.innerHTML = "";
  for (let i = 1; i <= pageTotalCount; i++) {
    paginationList.innerHTML += `
    <li class="page-item ${currentPage == i ? "active" : ""}">
            <a class="page-link page_number" href="#">${i}</a>
          </li>
    `;
  }
  // чтобы кнопка была не активна на первой странице
  if (currentPage == 1) {
    pref.classList.add("disabled");
  } else {
    pref.classList.remove("disabled");
  }
  // чтобы кнопка была не активна на последней странице
  if (currentPage == pageTotalCount) {
    next.classList.add("disabled");
  } else {
    next.classList.remove("disabled");
  }
}
// обработчик события чтобы перейти на определеннуб страницу
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("page_number")) {
    currentPage = e.target.innerText;
    getProducts();
  }
});
// обработчик события чтобы перейти на следующую страницу
next.addEventListener("click", () => {
  if (currentPage == pageTotalCount) {
    return;
  }
  currentPage++;
  getProducts();
});
// обработчик события чтобы перейти на предыдущую страницу

pref.addEventListener("click", () => {
  if (currentPage == 1) {
    return;
  }
  currentPage--;
  getProducts();
});
console.log('new branch');