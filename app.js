const slider = document.getElementById('slider');
const errorMessage = document.getElementById('error-message');
let images = [];
let currentIndex = 0;
let lastActivity = Date.now();
let fetchRetryInterval = null;
const socket = new WebSocket('ws://188.225.45.123:3005');

// Функция устранения тротлинга
function throttle(func, limit) {
  let lastFunc;
  let lastRan;
  return function() {
      const context = this;
      const args = arguments;
      if (!lastRan) {
          func.apply(context, args);
          lastRan = Date.now();
      } else {
          clearTimeout(lastFunc);
          lastFunc = setTimeout(function() {
              if ((Date.now() - lastRan) >= limit) {
                  func.apply(context, args);
                  lastRan = Date.now();
              }
          }, limit - (Date.now() - lastRan));
      }
  };
}


// сокет для получения данных
socket.onopen = () => {
    console.log('WebSocket соединение открыто');
};

socket.onmessage = (event) => {
    images = JSON.parse(event.data);
    
    // если у нас только 2 элемента, увеличиваем до 4, чтобы реализовать бесконечный слайдер
    if (images.length === 2) {
        images.push(images[0], images[1]);
    }
    updateSlider();
  
};

socket.onclose = () => {
    errorMessage.style.display = 'none';
    console.log('WebSocket соединение закрыто');
    errorMessage.style.display = 'none';
    errorMessage.style.display = 'block'; // Показать сообщение об ошибке
};

socket.onerror = (error) => {
    errorMessage.style.display = 'none';
    console.error('Ошибка WebSocket:', error);
    errorMessage.style.display = 'block'; // Показать сообщение об ошибке
};


// Функция для обновления слайдера
function updateSlider() {
    slider.innerHTML = '';
    images.forEach((image, index) => {
        const imgElement = document.createElement('img');
        imgElement.src = image.url;
        if (index === currentIndex) {
            imgElement.classList.add('active');
        } else if (index === (currentIndex + 1) % images.length) {
            imgElement.classList.add('next');
        } else if (index === (currentIndex - 1 + images.length) % images.length) {
            imgElement.classList.add('previous');
        }
        slider.appendChild(imgElement);
    });
}

// Функция для переключения на следующее изображение
const nextImage = throttle(() => {
  if (images.length < 2) return;
  const imgElements = slider.getElementsByTagName('img');

  // Обновляем текущее изображение на 'previous'
  imgElements[currentIndex].classList.remove('active');
  imgElements[currentIndex].classList.add('previous');

  // Переходим к следующему изображению
  currentIndex = (currentIndex + 1) % images.length;
  imgElements[currentIndex].classList.remove('next');
  imgElements[currentIndex].classList.add('active');

  // Настраиваем следующее изображение
  const nextIndex = (currentIndex + 1) % images.length;
  imgElements[nextIndex].classList.remove('previous');
  imgElements[nextIndex].classList.add('next');

  // Обновляем zIndex для правильного наложения
  imgElements[currentIndex].style.zIndex = '3'; // Текущее изображение
  imgElements[(currentIndex + 1) % images.length].style.zIndex = '1'; // Следующее изображение
  imgElements[(currentIndex - 1 + images.length) % images.length].style.zIndex = '2'; // Предыдущее изображение
}, 500);

// Функция для переключения на предыдущее изображение
const previousImage = throttle(() => {
  if (images.length < 2) return;
  const imgElements = slider.getElementsByTagName('img');

  // Обновляем текущее изображение на 'next'
  imgElements[currentIndex].classList.remove('active');
  imgElements[currentIndex].classList.add('next');

  // Переходим к предыдущему изображению
  currentIndex = (currentIndex - 1 + images.length) % images.length;
  imgElements[currentIndex].classList.remove('previous');
  imgElements[currentIndex].classList.add('active');

  // Настраиваем предыдущее изображение
  const previousIndex = (currentIndex - 1 + images.length) % images.length;
  imgElements[previousIndex].classList.remove('next');
  imgElements[previousIndex].classList.add('previous');

  // Обновляем zIndex для правильного наложения
  imgElements[currentIndex].style.zIndex = '3'; // Текущее изображение
  imgElements[(currentIndex + 1) % images.length].style.zIndex = '2'; // Следующее изображение
  imgElements[previousIndex].style.zIndex = '1'; // Предыдущее изображение
}, 500);

// Обработка нажатий клавиш
document.addEventListener('keydown', (e) => {
    lastActivity = Date.now();
    if (e.key === 'ArrowDown') {
        nextImage();
    } else if (e.key === 'ArrowUp') {
        previousImage();
    }
});

// Автоматическое переключение изображения через 15 секунд без активности
setInterval(() => {
    if (Date.now() - lastActivity > 15000 && images.length > 1) {
        nextImage();
    }
}, 3000);



