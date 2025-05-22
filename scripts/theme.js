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
    const letterInput = document.getElementById('letter-input');
    const gameInfo = document.getElementById('game-info');
    const errorMessage = document.getElementById('error-message');
    const submitButton = document.getElementById('submit-letter');
    const usedDisplay = document.querySelector('.purple');
    const wordDisplay = document.getElementById('word-display');
    
    // Загаданное слово
    let secretWordd = "цезарь";
    let failCount = 5;
    const secretWord = secretWordd.toLowerCase();
    let guessedLetters = new Array(secretWord.length).fill('_');
    let usedLetters = [];
    let gameOver = false;
    
    // Создаем ячейки для букв слова
    function createWordDisplay() {
        wordDisplay.innerHTML = '';
        for (let i = 0; i < secretWord.length; i++) {
            const cell = document.createElement('div');
            cell.className = 'word-cell';
            cell.id = `letter-${i}`;
            cell.textContent = guessedLetters[i] === '_' ? '' : guessedLetters[i];
            wordDisplay.appendChild(cell);
        }
    }
    
    // Обновляем отображение игры
    function updateGameInfo(message) {
        gameInfo.textContent = message;
        usedDisplay.textContent = `Использованные буквы: ${usedLetters.join(', ')}`;
    }
    
    // Инициализация игры
    function initGame() {
        createWordDisplay();
        updateGameInfo(`Введите букву, чтобы начать игру! Всего попыток: ${failCount}`);
    }
    
    initGame();

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

    submitButton.addEventListener('click', function() {
        const userLetter = letterInput.value.toLowerCase();
        let letterFound = false;
        
        // Проверяем каждую букву в слове
        for (let i = 0; i < secretWord.length; i++) {
            if (secretWord[i] === userLetter) {
                guessedLetters[i] = userLetter;
                document.getElementById(`letter-${i}`).textContent = userLetter;
                document.getElementById(`letter-${i}`).style.backgroundColor ='rgb(251, 255, 0)';
                letterFound = true;
            }
        }
        
        usedLetters.push(userLetter);
        usedLetters.sort();
        
        if (letterFound) {
            updateGameInfo(`Правильно! Буква "${userLetter.toUpperCase()}" есть в слове!`);
            
            // Проверяем, полностью ли угадано слово
            if (!guessedLetters.includes('_')) {
                updateGameInfo(`Поздравляем! Вы угадали слово: ${secretWord.toUpperCase()}`);
                endGame(true);
                for (let i = 0; i < secretWord.length; i++) {
                    document.getElementById(`letter-${i}`).style.backgroundColor ='rgb(51, 255, 0)';
                }
            }
        } else {
            failCount = failCount - 1;
            updateGameInfo(`Ошибка! Буквы "${userLetter.toUpperCase()}" нет в слове. Осталось попыток: ${failCount}`);
        }
        letterInput.value = '';
        submitButton.disabled = true;
        if(failCount == 0){
            updateGameInfo(`Вы проиграли! Загаданное слово: ${secretWord.toUpperCase()}`);
            endGame(false);
        }
    });

    function endGame(isWin) {
        gameOver = true;
        letterInput.disabled = true;
        submitButton.disabled = true;
        letterInput.style.backgroundColor = isWin ?'rgb(133, 226, 82)' :'rgb(230, 12, 12)';
        letterInput.placeholder = isWin ? 'Победа!' : 'Поражение!';
        if(!isWin){
        for (let i = 0; i < secretWord.length; i++) {
            if(document.getElementById(`letter-${i}`).textContent.length==0){
            document.getElementById(`letter-${i}`).style.backgroundColor ='rgb(255, 0, 0)';
        }
        }
    }
    }

    letterInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !submitButton.disabled) {
            submitButton.click();
        }
    });
});