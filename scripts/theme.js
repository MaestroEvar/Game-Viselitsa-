document.addEventListener('DOMContentLoaded', function() {
    // Переключение темы
    const themeToggle = document.getElementById('theme-toggle');
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        themeToggle.checked = true;
    }
    themeToggle.addEventListener('change', function() {
        if (this.checked) {
            document.body.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.removeAttribute('data-theme');
            localStorage.removeItem('theme');
        }
    });
    
    // Элементы интерфейса
    const startScreen = document.getElementById('start-screen');
    const themeSelect = document.getElementById('theme-select');
    const difficultySelect = document.getElementById('difficulty-select');
    const errorsSelect = document.getElementById('errors-select');
    const startButton = document.getElementById('start-game');
    const letterInput = document.getElementById('letter-input');
    const gameInfo = document.getElementById('game-info');
    const errorMessage = document.getElementById('error-message');
    const submitButton = document.getElementById('submit-letter');
    const usedDisplay = document.querySelector('.purple');
    const wordDisplay = document.getElementById('word-display');
    const gallowsContainer = document.getElementById('gallows-container');
    const restartButton = document.getElementById('restart-button');
    const errorsGrid = document.getElementById('errors-grid');
    
    // Игровые переменные
    let secretWord = "";
    let maxErrors = 9;
    let currentErrors = 0;
    let guessedLetters = [];
    let usedLetters = [];
    let gameOver = false;
    let wordsData = {};
    let gallowsImages = [];

    // Инициализация изображений виселицы
    function initGallowsImages() {
        for (let i = 1; i <= 9; i++) {
            const img = document.createElement('img');
            img.className = 'gallows-image';
            img.id = `gallows-${i}`;
            img.src = `images/${i}.png`;
            img.alt = `Стадия виселицы ${i}`;
            gallowsContainer.appendChild(img);
            gallowsImages.push(img);
        }
    }
    
    // Инициализация сетки ошибок
    function initErrorsGrid() {
        errorsGrid.innerHTML = '';
        for (let i = 0; i < currentErrors; i++) {
            const cell = document.createElement('div');
            cell.className = 'error-cell';
            cell.id = `error-${i}`;
            errorsGrid.appendChild(cell);
        }
    }
    
    // Обновление сетки ошибок
    function updateErrorsGrid() {
        for (let i = 0; i < 9; i++) {
            const cell = document.getElementById(`error-${i}`);
            if (i < currentErrors) {
                cell.classList.add('filled');
            } else {
                cell.classList.remove('filled');
            }
        }
    }
    
    initGallowsImages();
    initErrorsGrid();

    // Загрузка слов из JSON
    fetch('words.json')
        .then(response => response.json())
        .then(data => {
            wordsData = data.words;
        })
        .catch(error => {
            console.error('Error loading words:', error);
            wordsData = {
                "животные": {
                    "легкие": ["кот", "собака", "лев", "тигр", "лось"],
                    "средние": ["жираф", "бегемот", "кенгуру", "пантера", "бурундук"],
                    "сложные": ["антилопа", "коала", "шимпанзе", "крокодил", "муравьед"]
                }
            };
        });
    
    // Рестарт игры
    restartButton.addEventListener('click', function() {
        startScreen.style.display = 'flex';
        currentErrors = 0;
        updateErrorsGrid();
        
        // Сбрасываем игровое поле
        wordDisplay.innerHTML = '';
        gameInfo.textContent = '';
        usedDisplay.textContent = '';
        letterInput.value = '';
        letterInput.disabled = false;
        letterInput.style.backgroundColor = '';
        letterInput.placeholder = 'Введите букву';
        submitButton.disabled = true;
        
        // Убираем красные/зеленые подсветки ячеек
        const cells = document.querySelectorAll('.word-cell');
        cells.forEach(cell => {
            cell.style.backgroundColor = '';
        });
        
        // Скрываем все изображения виселицы
        gallowsImages.forEach(img => img.style.display = 'none');
    });
    
    // Начало игры
    startButton.addEventListener('click', function() {
        const theme = themeSelect.value;
        const difficulty = difficultySelect.value;
        maxErrors = parseInt(errorsSelect.value);
        
        if (wordsData[theme] && wordsData[theme][difficulty]) {
            const wordsList = wordsData[theme][difficulty];
            secretWord = wordsList[Math.floor(Math.random() * wordsList.length)].toLowerCase();
            guessedLetters = new Array(secretWord.length).fill('_');
            usedLetters = [];
            gameOver = false;
            currentErrors = 0;
            startScreen.style.display = 'none';
            initGame();
        } else {
            alert('Ошибка: не удалось загрузить слова. Попробуйте еще раз.');
        }
    });

    // Создание отображения слова
    function createWordDisplay() {
        wordDisplay.innerHTML = '';
        for (let i = 0; i < secretWord.length; i++) {
            const cell = document.createElement('div');
            cell.className = 'word-cell';
            cell.id = `letter-${i}`;
            
            if (secretWord[i] === ' ') {
                cell.textContent = ' ';
                cell.style.backgroundColor = 'transparent';
                cell.style.border = 'none';
                guessedLetters[i] = ' '; 
            } else {
                cell.textContent = guessedLetters[i] === '_' ? '' : guessedLetters[i];
            }
            
            wordDisplay.appendChild(cell);
        }
    }
    
    // Обновление информации о игре
    function updateGameInfo(message) {
        gameInfo.textContent = message;
        usedDisplay.textContent = `Использованные буквы: ${usedLetters.join(', ')}`;
    }
    
    // Инициализация игры
    function initGame() {
        createWordDisplay();
        updateGameInfo(`Введите букву, чтобы начать игру! Осталось ошибок: ${maxErrors - currentErrors}`);
        letterInput.disabled = false;
        submitButton.disabled = true;
        letterInput.value = '';
        letterInput.style.backgroundColor = '';
        letterInput.placeholder = 'Введите букву';
        updateGallowsImage();
        updateErrorsGrid();
    }
    
    // Обновление изображения виселицы
    function updateGallowsImage() {
        gallowsImages.forEach(img => img.style.display = 'none');
        const stage = Math.min(9, Math.ceil(9 * currentErrors / maxErrors));
        if (stage > 0) {
            const currentImage = document.getElementById(`gallows-${stage}`);
            if (currentImage) currentImage.style.display = 'block';
        }
    }
    
    // Проверка, угадано ли слово
    function isWordGuessed() {
        for (let i = 0; i < secretWord.length; i++) {
            if (secretWord[i] !== ' ' && guessedLetters[i] === '_') {
                return false;
            }
        }
        return true;
    }

    // Обработка ввода буквы
    letterInput.addEventListener('input', function() {
        if (gameOver) return;
        
        const userLetter = this.value.toLowerCase();
        const isValid = /^[а-яА-ЯёЁ]?$/.test(userLetter);
        
        if (!isValid) {
            errorMessage.textContent = "Пожалуйста, введите одну русскую букву!";
            errorMessage.style.display = 'block';
            this.value = '';
            submitButton.disabled = true;
            return;
        }
        
        if (userLetter && usedLetters.includes(userLetter)) {
            errorMessage.textContent = "Эта буква была введена ранее!";
            errorMessage.style.display = 'block';
            submitButton.disabled = true;
            return;
        }
        
        errorMessage.style.display = 'none';
        submitButton.disabled = this.value.length === 0;
    });

    // Отправка буквы
    submitButton.addEventListener('click', function() {
        const userLetter = letterInput.value.toLowerCase();
        let letterFound = false;
        
        for (let i = 0; i < secretWord.length; i++) {
            if (secretWord[i] === userLetter) {
                guessedLetters[i] = userLetter;
                document.getElementById(`letter-${i}`).textContent = userLetter;
                document.getElementById(`letter-${i}`).style.backgroundColor = 'rgb(251, 255, 0)';
                letterFound = true;
            }
        }
        
        usedLetters.push(userLetter);
        usedLetters.sort();
        
        if (letterFound) {
            updateGameInfo(`Правильно! Буква "${userLetter.toUpperCase()}" есть в слове!`);
            
            if (isWordGuessed()) {
                updateGameInfo(`Поздравляем! Вы угадали слово: ${secretWord.toUpperCase()}`);
                endGame(true);
                for (let i = 0; i < secretWord.length; i++) {
                    if (secretWord[i] !== ' ') {
                        document.getElementById(`letter-${i}`).style.backgroundColor = 'rgb(51, 255, 0)';
                    }
                }
            }
        } else {
            currentErrors++;
            updateErrorsGrid();
            updateGallowsImage();
            const remaining = maxErrors - currentErrors;
            updateGameInfo(`Ошибка! Буквы "${userLetter.toUpperCase()}" нет в слове. Осталось ошибок: ${remaining}`);
        }
        letterInput.value = '';
        submitButton.disabled = true;
        
        if (currentErrors >= maxErrors) {
            updateGameInfo(`Вы проиграли! Загаданное слово: ${secretWord.toUpperCase()}`);
            endGame(false);
        }
    });

    // Завершение игры
    function endGame(isWin) {
        if (!isWin) {
            gallowsImages.forEach(img => img.style.display = 'none');
            const lastImage = document.getElementById('gallows-9');
            if (lastImage) lastImage.style.display = 'block';
        }
        gameOver = true;
        letterInput.disabled = true;
        submitButton.disabled = true;
        letterInput.style.backgroundColor = isWin ? 'rgb(133, 226, 82)' : 'rgb(230, 12, 12)';
        letterInput.placeholder = isWin ? 'Победа!' : 'Поражение!';
        
        if (!isWin) {
            for (let i = 0; i < secretWord.length; i++) {
                if (secretWord[i] !== ' ' && document.getElementById(`letter-${i}`).textContent.length === 0) {
                    document.getElementById(`letter-${i}`).style.backgroundColor = 'rgb(255, 0, 0)';
                }
            }
        }
    }

    // Обработка нажатия Enter
    letterInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !submitButton.disabled) {
            submitButton.click();
        }
    });
});