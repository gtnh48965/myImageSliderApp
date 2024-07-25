const slider = document.getElementById('slider');
let images = [];
let currentIndex = 0;
let lastActivity = Date.now();


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


// Функция для получения изображений 
async function fetchImages() {
    try {
        const response = await fetch('http://127.0.0.1:3005/api/images');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        images = await response.json();
        updateSlider();
    } catch (error) {
        console.error('Ошибка получения изображений:', error);
    }
}

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
  if (images.length === 0) return;
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
  if (images.length === 0) return;
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

// Автоматическое переключение изображения через 10 секунд без активности
setInterval(() => {
    if (Date.now() - lastActivity > 1500) {
        nextImage();
    }
}, 3000);

// Получение изображений один раз при загрузке
fetchImages();