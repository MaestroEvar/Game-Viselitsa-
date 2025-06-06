document.addEventListener('DOMContentLoaded', function () {
    // Переключение темы
    const themeToggle = document.getElementById('theme-toggle');
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        themeToggle.checked = true;
    }
    // Обработчик переключения темы
    themeToggle.addEventListener('change', function () {
        if (this.checked) {
            document.body.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.removeAttribute('data-theme');
            localStorage.removeItem('theme');
        }

        if (currentTheme) {
            setThemeBackground();
        }
    });

    // Элементы интерфейса
    const startScreen = document.getElementById('start-screen');
    const themeSelect = document.getElementById('theme-select');
    const difficultySelect = document.getElementById('difficulty-select');
    const errorsSelect = document.getElementById('errors-select');
    const startButton = document.getElementById('start-game');
    const letterInput = document.getElementById('letter-input');
    const themeDisplay = document.getElementById('theme-display');
    const messageContainer = document.getElementById('message-container');
    const submitButton = document.getElementById('submit-letter');
    const wordDisplay = document.getElementById('word-display');
    const gallowsContainer = document.getElementById('gallows-container');
    const restartButton = document.getElementById('restart-button');
    const errorsGrid = document.getElementById('errors-grid');
    const keyboardContainer = document.getElementById('keyboard-container');

    // Игровые переменные
    let secretWord = "";
    let maxErrors = 9;
    let currentErrors = 0;
    let guessedLetters = [];
    let usedLetters = [];
    let gameOver = false;
    let wordsData = {};
    let gallowsImages = [];
    let currentTheme = "";
    let keyboardButtons = {};
    setThemeBackground();

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

    // Создание виртуальной клавиатуры
    function createKeyboard() {
        keyboardContainer.innerHTML = '';
        keyboardButtons = {};

        const russianLetters = 'абвгдеёжзийклмнопрстуфхцчшщъыьэюя';

        for (let letter of russianLetters) {
            const button = document.createElement('button');
            button.className = 'keyboard-button';
            button.textContent = letter.toUpperCase();
            button.dataset.letter = letter;
            button.addEventListener('click', () => {
                if (gameOver || button.disabled) return;
                handleKeyboardInput(letter);
            });
            keyboardContainer.appendChild(button);
            keyboardButtons[letter] = button;
        }
    }

    // Обработка ввода с клавиатуры
    function handleKeyboardInput(letter) {
        if (gameOver) return;

        letterInput.value = letter;
        const event = new Event('input', { bubbles: true });
        letterInput.dispatchEvent(event);

        if (!submitButton.disabled) {
            submitButton.click();
        }
    }

    // Обновление состояния кнопок клавиатуры
    function updateKeyboard() {
        for (const letter in keyboardButtons) {
            const button = keyboardButtons[letter];
            if (usedLetters.includes(letter)) {
                button.disabled = true;
                if (secretWord.includes(letter)) {
                    button.classList.add('correct');
                } else {
                    button.classList.add('incorrect');
                }
            } else {
                button.disabled = false;
                button.classList.remove('correct', 'incorrect');
            }
        }
    }

    // Установка фонового изображения для темы
    function setThemeBackground() {
        const isDarkTheme = document.body.getAttribute('data-theme') === 'dark';
        const themeSuffix = isDarkTheme ? '2' : '1';
        const imageUrl = `images/${currentTheme}${themeSuffix}.jpg`;

        const blueContainer = document.querySelector('.blue');
        blueContainer.style.backgroundImage = `url('${imageUrl}')`;
        const orangeContainer = document.querySelector('.orange');
        const orangeImage = `images/titl${themeSuffix}.jpg`;
        orangeContainer.style.backgroundImage = `url('${orangeImage}')`;

        const purpleContainers = document.querySelectorAll('.purple');
        const purpleTexture = `images/colum${themeSuffix}.jpg`;
        purpleContainers.forEach(container => {
            container.style.backgroundImage = `url('${purpleTexture}')`;
        });

        const pinkContainer = document.querySelector('.pink');
        const pinkTexture = `images/str${themeSuffix}.jpg`;
        pinkContainer.style.backgroundImage = `url('${pinkTexture}')`;
    }

    // Показ сообщений
    function showMessage(message, isError = false) {
        messageContainer.textContent = message;
        messageContainer.style.backgroundColor = isError ? 'rgba(255, 0, 0, 0.3)' : 'rgba(0, 255, 0, 0.3)';
        messageContainer.style.display = 'block';
    }

    // Инициализация сетки ошибок
    function initErrorsGrid() {
        errorsGrid.innerHTML = '';
        for (let i = 0; i < maxErrors; i++) {
            const cell = document.createElement('div');
            cell.className = 'error-cell';
            cell.id = `error-${i}`;
            errorsGrid.appendChild(cell);
        }
    }

    // Обновление сетки ошибок
    function updateErrorsGrid() {
        for (let i = 0; i < maxErrors; i++) {
            const cell = document.getElementById(`error-${i}`);
            if (i < currentErrors) {
                cell.classList.add('filled');
            } else {
                cell.classList.remove('filled');
            }
        }
    }

    initGallowsImages();
    createKeyboard();

    // Загрузка слов из JSON
    fetch('data/words.json')
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
    restartButton.addEventListener('click', function () {
        startScreen.style.display = 'flex';
        currentErrors = 0;
        updateErrorsGrid();
        wordDisplay.innerHTML = '';
        themeDisplay.textContent = '';
        letterInput.value = '';
        letterInput.disabled = false;
        letterInput.style.backgroundColor = '';
        letterInput.placeholder = 'Введите букву';
        submitButton.disabled = true;
        messageContainer.style.display = 'none';

        const cells = document.querySelectorAll('.word-cell');
        cells.forEach(cell => {
            cell.style.backgroundColor = '';
        });

        gallowsImages.forEach(img => img.style.display = 'none');

        // Сброс клавиатуры
        usedLetters = [];
        updateKeyboard();
    });

    // Начало игры
    startButton.addEventListener('click', function () {
        const theme = themeSelect.value;
        const difficulty = difficultySelect.value;
        maxErrors = parseInt(errorsSelect.value);
        currentTheme = theme;
        initErrorsGrid();

        if (wordsData[theme] && wordsData[theme][difficulty]) {
            const wordsList = wordsData[theme][difficulty];
            secretWord = wordsList[Math.floor(Math.random() * wordsList.length)].toLowerCase();
            guessedLetters = new Array(secretWord.length).fill('_');
            usedLetters = [];
            gameOver = false;
            currentErrors = 0;
            startScreen.style.display = 'none';
            themeDisplay.textContent = `Тема: ${theme}`;
            showMessage(`Игра началась! У вас ${maxErrors} попыток.`, false);
            initGame();
        } else {
            showMessage('Ошибка: не удалось загрузить слова. Попробуйте еще раз.', true);
        }
    });

    // Создание отображения слова
    function createWordDisplay() {
    wordDisplay.innerHTML = '';
    for (let i = 0; i < secretWord.length; i++) {
        // Если символ - пробел, создаем пустой контейнер без стилей ячейки
        if (secretWord[i] === ' ') {
            const space = document.createElement('div');
            space.className = 'word-space';
            space.style.width = '20px'; // Ширина пробела
            wordDisplay.appendChild(space);
            guessedLetters[i] = ' ';
            continue;
        }

        const cell = document.createElement('div');
        cell.className = 'word-cell';
        cell.id = `letter-${i}`;
        cell.textContent = guessedLetters[i] === '_' ? '' : guessedLetters[i];
        wordDisplay.appendChild(cell);
    }
}

    // Инициализация игры
    function initGame() {
        createWordDisplay();
        letterInput.disabled = false;
        submitButton.disabled = true;
        letterInput.value = '';
        letterInput.style.backgroundColor = '';
        letterInput.placeholder = 'Введите букву';
        updateGallowsImage();
        setThemeBackground();

        // Сброс клавиатуры
        updateKeyboard();
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
        // Пропускаем пробелы
        if (secretWord[i] === ' ') continue;
        
        if (guessedLetters[i] === '_') {
            return false;
        }
    }
    return true;
}

    // Обработка ввода буквы
    letterInput.addEventListener('input', function () {
        if (gameOver) return;

        const userLetter = this.value.toLowerCase();
        const isValid = /^[а-яА-ЯёЁ]?$/.test(userLetter);

        if (!isValid) {
            showMessage("Пожалуйста, введите одну русскую букву!", true);
            this.value = '';
            submitButton.disabled = true;
            return;
        }

        if (userLetter && usedLetters.includes(userLetter)) {
            showMessage("Эта буква уже использовалась!", true);
            submitButton.disabled = true;
            return;
        }

        messageContainer.style.display = 'none';
        submitButton.disabled = this.value.length === 0;
    });

    // Отправка буквы
    submitButton.addEventListener('click', function () {
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

        // Обновление клавиатуры
        updateKeyboard();

        if (letterFound) {
            showMessage(`Правильно! Буква "${userLetter.toUpperCase()}" есть в слове!`, false);

            if (isWordGuessed()) {
                showMessage(`Поздравляем! Вы угадали слово: ${secretWord.toUpperCase()}`, false);
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
            showMessage(`Ошибка! Буквы "${userLetter.toUpperCase()}" нет в слове. Осталось попыток: ${remaining}`, true);
        }
        letterInput.value = '';
        submitButton.disabled = true;

        if (currentErrors >= maxErrors) {
            showMessage(`Вы проиграли! Загаданное слово: ${secretWord.toUpperCase()}`, true);
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
            // Пропускаем пробелы
            if (secretWord[i] === ' ') continue;
            
            const cell = document.getElementById(`letter-${i}`);
            if (cell && cell.textContent.length === 0) {
                cell.style.backgroundColor = 'rgb(255, 0, 0)';
            }
        }
    }
}

    // Обработка нажатия Enter
    letterInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && !submitButton.disabled) {
            submitButton.click();
        }
    });

});