// Данные опроса (10 вопросов)
const surveyQuestions = [
    {
        id: 1,
        question: "Какие новогодние традиции вы соблюдаете в своей семье?",
        type: "checkbox",
        options: ["Украшение ёлки", "Приготовление оливье", "Просмотр 'Иронии судьбы'", "Письмо Деду Морозу", "Загадывание желаний под бой курантов", "Подарки под ёлкой", "Другое (укажите)"],
        required: true
    },
    {
        id: 2,
        question: "Как вы планируете встретить Новый 2026 год?",
        type: "radio",
        options: ["Дома с семьей", "В гостях у друзей", "В ресторане/кафе", "На природе/за городом", "В путешествии", "Еще не решил(а)", "Другое (укажите)"],
        required: true
    },
    {
        id: 3,
        question: "Какой подарок вы хотели бы получить на Новый 2026 год?",
        type: "text",
        placeholder: "Опишите подарок, который вы хотели бы получить",
        required: false
    },
    {
        id: 4,
        question: "Какие у вас ожидания от 2026 года?",
        type: "radio",
        options: ["Очень позитивные", "Скорее позитивные", "Нейтральные", "Скорее негативные", "Очень негативные", "Затрудняюсь ответить"],
        required: true
    },
    {
        id: 5,
        question: "Какой ваш любимый новогодний фильм?",
        type: "text",
        placeholder: "Название фильма",
        required: false
    },
    {
        id: 6,
        question: "Какое у вас новогоднее настроение?",
        type: "select",
        options: ["Отличное, жду праздник", "Нормальное", "Слегка грустное", "Не чувствую праздничного настроения", "Затрудняюсь ответить"],
        required: true
    },
    {
        id: 7,
        question: "Где вы предпочитаете отмечать Новый год?",
        type: "checkbox",
        options: ["Дома", "На даче/загородом", "В гостях у родственников", "В ресторане/кафе", "В отеле", "За границей", "На природе", "Другое (укажите)"],
        required: true
    },
    {
        id: 8,
        question: "Сколько времени вы обычно тратите на подготовку к Новому году?",
        type: "radio",
        options: ["Несколько дней", "Неделю", "2-3 недели", "Месяц и больше", "Практически не готовлюсь"],
        required: true
    },
    {
        id: 9,
        question: "Во сколько лет вы перестали верить в Деда Мороза?",
        type: "number",
        placeholder: "Укажите возраст (или 0, если все еще верите)",
        min: 0,
        max: 100,
        required: false
    },
    {
        id: 10,
        question: "Что бы вы пожелали всем в наступающем 2026 году?",
        type: "textarea",
        placeholder: "Введите ваши пожелания",
        required: false
    }
];

// Состояние приложения
const appState = {
    currentPage: 'register',
    currentUser: null,
    isAdmin: false,
    currentQuestionIndex: 0,
    userAnswers: {},
    adminPassword: "dima20092013"
};

// Инициализация приложения
document.addEventListener('DOMContentLoaded', function() {
    initEventListeners();
    loadFromLocalStorage();
    showPage(appState.currentPage);
    
    // Если пользователь уже вошел, показываем опрос
    if (appState.currentUser && !appState.isAdmin) {
        showPage('survey');
        updateUserInfo();
        loadQuestion(appState.currentQuestionIndex);
        createQuestionNavigation();
        updateProgressBar();
    }
});

// Инициализация обработчиков событий
function initEventListeners() {
    // Ссылки для навигации
    document.getElementById('login-link').addEventListener('click', function(e) {
        e.preventDefault();
        showPage('login');
        clearErrors('login');
    });
    
    document.getElementById('register-link').addEventListener('click', function(e) {
        e.preventDefault();
        showPage('register');
        clearErrors('register');
    });
    
    document.getElementById('admin-login-link').addEventListener('click', function(e) {
        e.preventDefault();
        showPage('admin-login');
        clearErrors('admin-login');
    });
    
    document.getElementById('back-to-login-link').addEventListener('click', function(e) {
        e.preventDefault();
        showPage('login');
        clearErrors('login');
    });
    
    // Вкладки в админ-панели
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', function() {
            // Убираем активный класс у всех вкладок
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            // Добавляем активный класс текущей вкладке
            this.classList.add('active');
            const tabId = this.dataset.tab;
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // Кнопки
    document.getElementById('register-btn').addEventListener('click', registerUser);
    document.getElementById('login-btn').addEventListener('click', loginUser);
    document.getElementById('admin-login-btn').addEventListener('click', loginAdmin);
    document.getElementById('logout-btn').addEventListener('click', logoutUser);
    document.getElementById('admin-logout-btn').addEventListener('click', logoutAdmin);
    document.getElementById('prev-btn').addEventListener('click', prevQuestion);
    document.getElementById('next-btn').addEventListener('click', nextQuestion);
    document.getElementById('submit-survey-btn').addEventListener('click', submitSurvey);
    document.getElementById('back-to-survey-btn').addEventListener('click', () => showPage('survey'));
    document.getElementById('view-admin-btn').addEventListener('click', () => {
        appState.isAdmin = true;
        showPage('admin');
        loadAdminData();
    });
    
    // Кнопки админ-панели
    document.getElementById('refresh-data-btn').addEventListener('click', loadAdminData);
    document.getElementById('export-data-btn').addEventListener('click', exportToCSV);
    document.getElementById('clear-data-btn').addEventListener('click', clearAllData);
    
    // Валидация форм при вводе
    document.getElementById('username')?.addEventListener('input', function() {
        clearError('username-group');
    });
    
    document.getElementById('email')?.addEventListener('input', function() {
        clearError('email-group');
    });
    
    document.getElementById('password')?.addEventListener('input', function() {
        clearError('password-group');
    });
    
    document.getElementById('confirm-password')?.addEventListener('input', function() {
        clearError('confirm-password-group');
    });
    
    document.getElementById('login-email')?.addEventListener('input', function() {
        clearError('login-email-group');
    });
    
    document.getElementById('login-password')?.addEventListener('input', function() {
        clearError('login-password-group');
    });
    
    document.getElementById('admin-password')?.addEventListener('input', function() {
        clearError('admin-password-group');
    });
    
    // Обработка выбора "Другое" в вопросах
    document.addEventListener('change', function(e) {
        if (e.target.type === 'radio' || e.target.type === 'checkbox') {
            const questionId = e.target.name.replace('q', '');
            const isOtherOption = e.target.value.includes('Другое');
            
            if (isOtherOption) {
                const otherInput = document.getElementById(`other-input-${questionId}`);
                if (otherInput) {
                    otherInput.classList.toggle('active', e.target.checked);
                    if (e.target.checked) {
                        const input = otherInput.querySelector('input');
                        if (input) {
                            setTimeout(() => input.focus(), 50);
                        }
                    }
                }
            }
            
            // Сохраняем ответ при изменении
            if (appState.currentUser) {
                saveAnswer(parseInt(questionId));
                updateQuestionNavigation();
                updateProgressBar();
            }
        }
    });
    
    // Обработка текстовых полей
    document.addEventListener('input', function(e) {
        if (e.target.type === 'text' || e.target.type === 'textarea' || e.target.type === 'number') {
            const questionId = e.target.dataset.questionId;
            if (questionId && appState.currentUser) {
                saveAnswer(parseInt(questionId));
                updateQuestionNavigation();
                updateProgressBar();
            }
        }
    });
    
    // Обработка select
    document.addEventListener('change', function(e) {
        if (e.target.tagName === 'SELECT') {
            const questionId = e.target.dataset.questionId;
            if (questionId && appState.currentUser) {
                saveAnswer(parseInt(questionId));
                updateQuestionNavigation();
                updateProgressBar();
            }
        }
    });
}

// Показать страницу
function showPage(pageId) {
    // Скрыть все страницы
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Показать выбранную страницу
    document.getElementById(`${pageId}-page`).classList.add('active');
    appState.currentPage = pageId;
    
    // Загрузить данные админ-панели при входе
    if (pageId === 'admin' && appState.isAdmin) {
        loadAdminData();
    }
}

// Регистрация пользователя
function registerUser() {
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    let hasError = false;
    
    // Валидация
    if (!username) {
        showError('username-group', 'Пожалуйста, введите имя пользователя');
        hasError = true;
    }
    
    if (!email) {
        showError('email-group', 'Пожалуйста, введите email');
        hasError = true;
    } else if (!isValidEmail(email)) {
        showError('email-group', 'Введите корректный email адрес');
        hasError = true;
    }
    
    if (!password) {
        showError('password-group', 'Пожалуйста, введите пароль');
        hasError = true;
    } else if (password.length < 6) {
        showError('password-group', 'Пароль должен содержать не менее 6 символов');
        hasError = true;
    }
    
    if (!confirmPassword) {
        showError('confirm-password-group', 'Пожалуйста, подтвердите пароль');
        hasError = true;
    } else if (password !== confirmPassword) {
        showError('confirm-password-group', 'Пароли не совпадают');
        hasError = true;
    }
    
    if (hasError) return;
    
    // Проверка, существует ли пользователь
    const users = JSON.parse(localStorage.getItem('newYearSurveyUsers') || '[]');
    const userExists = users.some(user => user.email === email);
    
    if (userExists) {
        showError('email-group', 'Пользователь с таким email уже зарегистрирован');
        return;
    }
    
    // Регистрация пользователя
    const newUser = {
        id: Date.now(),
        username,
        email,
        password,
        registrationDate: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('newYearSurveyUsers', JSON.stringify(users));
    
    // Автоматический вход
    appState.currentUser = newUser;
    appState.userAnswers = {};
    saveToLocalStorage();
    
    showNotification('Регистрация прошла успешно!', 'success');
    showPage('survey');
    updateUserInfo();
    loadQuestion(0);
    createQuestionNavigation();
    updateProgressBar();
}

// Вход пользователя
function loginUser() {
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    
    if (!email) {
        showError('login-email-group', 'Пожалуйста, введите email');
        return;
    }
    
    if (!password) {
        showError('login-password-group', 'Пожалуйста, введите пароль');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('newYearSurveyUsers') || '[]');
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
        showError('login-email-group', 'Неверный email или пароль');
        showError('login-password-group', 'Неверный email или пароль');
        return;
    }
    
    appState.currentUser = user;
    
    // Загружаем сохраненные ответы пользователя
    const allAnswers = JSON.parse(localStorage.getItem('newYearSurveyAnswers') || '{}');
    if (allAnswers[user.id]) {
        appState.userAnswers = allAnswers[user.id];
        
        // Определяем, на каком вопросе остановился пользователь
        const answeredQuestions = Object.keys(appState.userAnswers);
        if (answeredQuestions.length > 0) {
            appState.currentQuestionIndex = Math.min(
                answeredQuestions.length, 
                surveyQuestions.length - 1
            );
        }
    } else {
        appState.userAnswers = {};
    }
    
    saveToLocalStorage();
    showNotification(`Добро пожаловать, ${user.username}!`, 'success');
    showPage('survey');
    updateUserInfo();
    loadQuestion(appState.currentQuestionIndex);
    createQuestionNavigation();
    updateProgressBar();
}

// Вход администратора
function loginAdmin() {
    const password = document.getElementById('admin-password').value;
    
    if (!password) {
        showError('admin-password-group', 'Пожалуйста, введите пароль администратора');
        return;
    }
    
    if (password === appState.adminPassword) {
        appState.isAdmin = true;
        showNotification('Вы вошли как администратор', 'success');
        showPage('admin');
        loadAdminData();
    } else {
        showError('admin-password-group', 'Неверный пароль администратора');
    }
}

// Выход пользователя
function logoutUser() {
    appState.currentUser = null;
    appState.userAnswers = {};
    appState.currentQuestionIndex = 0;
    saveToLocalStorage();
    showPage('login');
    showNotification('Вы вышли из системы', 'info');
}

// Выход администратора
function logoutAdmin() {
    appState.isAdmin = false;
    showPage('login');
    showNotification('Вы вышли из админ-панели', 'info');
}

// Загрузка вопроса
function loadQuestion(index) {
    if (index < 0 || index >= surveyQuestions.length) return;
    
    appState.currentQuestionIndex = index;
    const question = surveyQuestions[index];
    const container = document.getElementById('question-container');
    
    let html = `
        <div class="question-text">${question.question} ${question.required ? '<span class="required">*</span>' : ''}</div>
    `;
    
    // В зависимости от типа вопроса
    switch(question.type) {
        case 'radio':
            html += `<div class="radio-group">`;
            question.options.forEach((option, i) => {
                const isOther = option.includes('Другое');
                const optionId = `q${question.id}_option${i}`;
                const savedAnswer = appState.userAnswers[question.id];
                let isChecked = false;
                
                if (savedAnswer) {
                    if (typeof savedAnswer === 'object' && savedAnswer.value) {
                        isChecked = savedAnswer.value === option;
                    } else if (typeof savedAnswer === 'string') {
                        isChecked = savedAnswer === option;
                    }
                }
                
                html += `
                    <div class="radio-option">
                        <input type="radio" id="${optionId}" name="q${question.id}" value="${option}" ${isChecked ? 'checked' : ''}>
                        <label for="${optionId}">${option}</label>
                    </div>
                `;
                
                // Поле для "Другое"
                if (isOther) {
                    const otherValue = (savedAnswer && savedAnswer.other) || '';
                    html += `
                        <div id="other-input-${question.id}" class="other-input ${isChecked ? 'active' : ''}">
                            <input type="text" data-question-id="${question.id}" placeholder="Укажите ваш вариант" value="${otherValue}">
                        </div>
                    `;
                }
            });
            html += `</div>`;
            break;
            
        case 'checkbox':
            html += `<div class="checkbox-group">`;
            question.options.forEach((option, i) => {
                const isOther = option.includes('Другое');
                const optionId = `q${question.id}_option${i}`;
                let isChecked = false;
                
                if (appState.userAnswers[question.id]) {
                    const savedAnswer = appState.userAnswers[question.id];
                    if (typeof savedAnswer === 'object' && savedAnswer.value && Array.isArray(savedAnswer.value)) {
                        isChecked = savedAnswer.value.includes(option);
                    } else if (Array.isArray(savedAnswer)) {
                        isChecked = savedAnswer.includes(option);
                    }
                }
                
                html += `
                    <div class="checkbox-option">
                        <input type="checkbox" id="${optionId}" name="q${question.id}" value="${option}" ${isChecked ? 'checked' : ''}>
                        <label for="${optionId}">${option}</label>
                    </div>
                `;
                
                // Поле для "Другое"
                if (isOther) {
                    const otherValue = (appState.userAnswers[question.id] && appState.userAnswers[question.id].other) || '';
                    html += `
                        <div id="other-input-${question.id}" class="other-input ${isChecked ? 'active' : ''}">
                            <input type="text" data-question-id="${question.id}" placeholder="Укажите ваш вариант" value="${otherValue}">
                        </div>
                    `;
                }
            });
            html += `</div>`;
            break;
            
        case 'select':
            const savedAnswer = appState.userAnswers[question.id] || '';
            html += `<select id="q${question.id}" data-question-id="${question.id}">`;
            html += `<option value="">Выберите вариант</option>`;
            question.options.forEach(option => {
                html += `<option value="${option}" ${savedAnswer === option ? 'selected' : ''}>${option}</option>`;
            });
            html += `</select>`;
            break;
            
        case 'textarea':
            const textValue = appState.userAnswers[question.id] || '';
            html += `<textarea id="q${question.id}" data-question-id="${question.id}" rows="5" placeholder="${question.placeholder || 'Введите ваш ответ...'}">${textValue}</textarea>`;
            break;
            
        case 'text':
            const textInputValue = appState.userAnswers[question.id] || '';
            html += `<input type="text" id="q${question.id}" data-question-id="${question.id}" placeholder="${question.placeholder || 'Введите ваш ответ...'}" value="${textInputValue}">`;
            break;
            
        case 'number':
            const numberValue = appState.userAnswers[question.id] || '';
            html += `<input type="number" id="q${question.id}" data-question-id="${question.id}" placeholder="${question.placeholder || 'Введите число'}" value="${numberValue}" min="${question.min || ''}" max="${question.max || ''}">`;
            break;
    }
    
    container.innerHTML = html;
    
    // Обновляем счетчик вопросов
    document.getElementById('current-question').textContent = index + 1;
    document.getElementById('total-questions').textContent = surveyQuestions.length;
    
    // Обновляем кнопки навигации
    document.getElementById('prev-btn').disabled = index === 0;
    
    if (index === surveyQuestions.length - 1) {
        document.getElementById('next-btn').style.display = 'none';
        document.getElementById('submit-survey-btn').style.display = 'inline-block';
    } else {
        document.getElementById('next-btn').style.display = 'inline-block';
        document.getElementById('submit-survey-btn').style.display = 'none';
    }
    
    // Обновляем навигацию по вопросам
    updateQuestionNavigation();
    updateProgressBar();
}

// Создание навигации по вопросам
function createQuestionNavigation() {
    const navContainer = document.getElementById('question-navigation');
    navContainer.innerHTML = '';
    
    surveyQuestions.forEach((question, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'question-nav-btn';
        button.textContent = index + 1;
        button.dataset.index = index;
        
        button.addEventListener('click', () => {
            // Сохраняем текущий ответ перед переходом
            if (appState.currentQuestionIndex !== index) {
                saveAnswer(surveyQuestions[appState.currentQuestionIndex].id);
            }
            loadQuestion(index);
        });
        
        navContainer.appendChild(button);
    });
    
    updateQuestionNavigation();
}

// Обновление навигации по вопросам
function updateQuestionNavigation() {
    const buttons = document.querySelectorAll('.question-nav-btn');
    buttons.forEach((button, index) => {
        button.classList.remove('active', 'answered');
        
        if (index === appState.currentQuestionIndex) {
            button.classList.add('active');
        }
        
        // Проверяем, есть ли ответ на этот вопрос
        const questionId = surveyQuestions[index].id;
        if (appState.userAnswers[questionId]) {
            button.classList.add('answered');
        }
    });
}

// Обновление прогресс-бара
function updateProgressBar() {
    const answeredQuestions = Object.keys(appState.userAnswers).length;
    const progress = (answeredQuestions / surveyQuestions.length) * 100;
    document.getElementById('survey-progress').style.width = `${progress}%`;
}

// Сохранение ответа
function saveAnswer(questionId) {
    const question = surveyQuestions.find(q => q.id === questionId);
    if (!question) return;
    
    let answerValue;
    
    switch(question.type) {
        case 'radio':
            const selectedRadio = document.querySelector(`input[name="q${questionId}"]:checked`);
            if (selectedRadio) {
                answerValue = selectedRadio.value;
                
                // Если выбран вариант "Другое", сохраняем текст из поля
                if (answerValue.includes('Другое')) {
                    const otherInput = document.querySelector(`#other-input-${questionId} input`);
                    if (otherInput && otherInput.value.trim()) {
                        appState.userAnswers[questionId] = {
                            value: answerValue,
                            other: otherInput.value.trim()
                        };
                    } else {
                        appState.userAnswers[questionId] = answerValue;
                    }
                } else {
                    appState.userAnswers[questionId] = answerValue;
                }
            } else {
                delete appState.userAnswers[questionId];
            }
            break;
            
        case 'checkbox':
            const checkedBoxes = document.querySelectorAll(`input[name="q${questionId}"]:checked`);
            const values = Array.from(checkedBoxes).map(cb => cb.value);
            
            if (values.length > 0) {
                // Если выбран вариант "Другое", сохраняем текст из поля
                if (values.some(v => v.includes('Другое'))) {
                    const otherInput = document.querySelector(`#other-input-${questionId} input`);
                    if (otherInput && otherInput.value.trim()) {
                        appState.userAnswers[questionId] = {
                            value: values,
                            other: otherInput.value.trim()
                        };
                    } else {
                        appState.userAnswers[questionId] = { value: values };
                    }
                } else {
                    appState.userAnswers[questionId] = values;
                }
            } else {
                delete appState.userAnswers[questionId];
            }
            break;
            
        case 'select':
            const select = document.getElementById(`q${questionId}`);
            answerValue = select.value;
            if (answerValue) {
                appState.userAnswers[questionId] = answerValue;
            } else {
                delete appState.userAnswers[questionId];
            }
            break;
            
        case 'textarea':
        case 'text':
        case 'number':
            const input = document.getElementById(`q${questionId}`);
            answerValue = input.value.trim();
            if (answerValue) {
                appState.userAnswers[questionId] = answerValue;
            } else {
                delete appState.userAnswers[questionId];
            }
            break;
    }
    
    saveToLocalStorage();
}

// Следующий вопрос
function nextQuestion() {
    const currentQuestion = surveyQuestions[appState.currentQuestionIndex];
    
    // Проверка обязательных вопросов
    if (currentQuestion.required && !appState.userAnswers[currentQuestion.id]) {
        showNotification('Пожалуйста, ответьте на этот вопрос', 'error');
        return;
    }
    
    if (appState.currentQuestionIndex < surveyQuestions.length - 1) {
        saveAnswer(currentQuestion.id);
        loadQuestion(appState.currentQuestionIndex + 1);
    }
}

// Предыдущий вопрос
function prevQuestion() {
    if (appState.currentQuestionIndex > 0) {
        saveAnswer(surveyQuestions[appState.currentQuestionIndex].id);
        loadQuestion(appState.currentQuestionIndex - 1);
    }
}

// Отправка опроса
function submitSurvey() {
    const currentQuestion = surveyQuestions[appState.currentQuestionIndex];
    
    // Проверка обязательных вопросов
    if (currentQuestion.required && !appState.userAnswers[currentQuestion.id]) {
        showNotification('Пожалуйста, ответьте на этот вопрос', 'error');
        return;
    }
    
    // Сохраняем последний ответ
    saveAnswer(currentQuestion.id);
    
    // Сохраняем все ответы пользователя
    const allAnswers = JSON.parse(localStorage.getItem('newYearSurveyAnswers') || '{}');
    allAnswers[appState.currentUser.id] = appState.userAnswers;
    localStorage.setItem('newYearSurveyAnswers', JSON.stringify(allAnswers));
    
    // Сохраняем информацию о завершении опроса
    const completions = JSON.parse(localStorage.getItem('newYearSurveyCompletions') || '[]');
    const existingCompletion = completions.find(c => c.userId === appState.currentUser.id);
    
    if (!existingCompletion) {
        completions.push({
            userId: appState.currentUser.id,
            date: new Date().toISOString()
        });
        localStorage.setItem('newYearSurveyCompletions', JSON.stringify(completions));
    }
    
    showNotification('Спасибо за участие в опросе!', 'success');
    showPage('confirmation');
}

// Загрузка данных для админ-панели
function loadAdminData() {
    const users = JSON.parse(localStorage.getItem('newYearSurveyUsers') || '[]');
    const allAnswers = JSON.parse(localStorage.getItem('newYearSurveyAnswers') || '{}');
    const completions = JSON.parse(localStorage.getItem('newYearSurveyCompletions') || '[]');
    
    // Обновляем статистику
    document.getElementById('total-participants').textContent = completions.length;
    
    // Загружаем статистику по вопросам
    loadQuestionStats(allAnswers);
    
    // Заполняем таблицу ответов
    loadResponsesTable(users, allAnswers, completions);
    
    // Загружаем таблицу совпадений
    loadMatchesTable(users, allAnswers, completions);
}

// Загрузка статистики по вопросам
function loadQuestionStats(allAnswers) {
    const statsContainer = document.getElementById('stats-container');
    if (!statsContainer) return;
    
    // Собираем статистику по каждому вопросу
    const questionStats = {};
    
    // Инициализируем статистику для каждого вопроса
    surveyQuestions.forEach(question => {
        if (question.type === 'radio' || question.type === 'select') {
            // Для вопросов с одним вариантом
            questionStats[question.id] = {
                question: question.question,
                type: question.type,
                options: {},
                total: 0
            };
            
            // Инициализируем счетчики для каждого варианта
            question.options.forEach(option => {
                questionStats[question.id].options[option] = 0;
            });
        } else if (question.type === 'checkbox') {
            // Для вопросов с несколькими вариантами
            questionStats[question.id] = {
                question: question.question,
                type: question.type,
                options: {},
                total: 0
            };
            
            // Инициализируем счетчики для каждого варианта
            question.options.forEach(option => {
                questionStats[question.id].options[option] = 0;
            });
        }
    });
    
    // Считаем ответы
    Object.values(allAnswers).forEach(userAnswers => {
        Object.entries(userAnswers).forEach(([questionId, answer]) => {
            const questionIdNum = parseInt(questionId);
            const question = surveyQuestions.find(q => q.id === questionIdNum);
            if (!question || !questionStats[questionIdNum]) return;
            
            questionStats[questionIdNum].total++;
            
            if (question.type === 'radio' || question.type === 'select') {
                // Для вопросов с одним вариантом
                let answerValue = '';
                if (typeof answer === 'string') {
                    answerValue = answer;
                } else if (answer && answer.value) {
                    answerValue = answer.value;
                }
                
                if (answerValue && questionStats[questionIdNum].options[answerValue] !== undefined) {
                    questionStats[questionIdNum].options[answerValue]++;
                }
            } else if (question.type === 'checkbox') {
                // Для вопросов с несколькими вариантами
                let answers = [];
                if (Array.isArray(answer)) {
                    answers = answer;
                } else if (answer && answer.value && Array.isArray(answer.value)) {
                    answers = answer.value;
                }
                
                answers.forEach(ans => {
                    if (questionStats[questionIdNum].options[ans] !== undefined) {
                        questionStats[questionIdNum].options[ans]++;
                    }
                });
            }
        });
    });
    
    // Отображаем статистику
    let statsHTML = '';
    
    Object.entries(questionStats).forEach(([questionId, stats]) => {
        if (stats.total === 0) return;
        
        statsHTML += `
            <div class="stat-card">
                <h4><i class="fas fa-chart-bar"></i> Вопрос ${questionId}: ${stats.question.substring(0, 50)}${stats.question.length > 50 ? '...' : ''}</h4>
                <p style="margin-bottom: 15px; color: #666; font-size: 0.9rem;">Всего ответов: ${stats.total}</p>
        `;
        
        // Сортируем варианты по популярности
        const sortedOptions = Object.entries(stats.options)
            .filter(([option, count]) => count > 0)
            .sort((a, b) => b[1] - a[1]);
        
        sortedOptions.forEach(([option, count]) => {
            const percentage = ((count / stats.total) * 100).toFixed(1);
            statsHTML += `
                <div class="stat-item">
                    <div class="stat-label">
                        <span>${option}</span>
                        <span>${percentage}%</span>
                    </div>
                    <div class="stat-bar">
                        <div class="stat-fill" style="width: ${percentage}%"></div>
                    </div>
                    <div class="stat-count">${count} из ${stats.total}</div>
                </div>
            `;
        });
        
        statsHTML += `</div>`;
    });
    
    statsContainer.innerHTML = statsHTML || '<p style="text-align: center; padding: 40px; color: #666;">Нет данных для отображения статистики.</p>';
}

// Загрузка таблицы ответов
function loadResponsesTable(users, allAnswers, completions) {
    const tableBody = document.getElementById('responses-table-body');
    tableBody.innerHTML = '';
    
    completions.forEach((completion, index) => {
        const user = users.find(u => u.id === completion.userId);
        if (!user) return;
        
        const answers = allAnswers[user.id] || {};
        
        const row = document.createElement('tr');
        
        // Форматируем ответы для отображения
        const traditions = formatAnswer(answers[1], 'checkbox');
        const plans = formatAnswer(answers[2], 'radio');
        const gift = answers[3] || 'Нет ответа';
        const expectations = formatAnswer(answers[4], 'radio');
        const movie = answers[5] || 'Нет ответа';
        const mood = answers[6] || 'Нет ответа';
        const place = formatAnswer(answers[7], 'checkbox');
        const prepTime = formatAnswer(answers[8], 'radio');
        const wishes = answers[10] || 'Нет ответа';
        
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td>${traditions}</td>
            <td>${plans}</td>
            <td>${gift}</td>
            <td>${expectations}</td>
            <td>${movie}</td>
            <td>${mood}</td>
            <td>${place}</td>
            <td>${prepTime}</td>
            <td>${wishes}</td>
            <td>${new Date(completion.date).toLocaleDateString('ru-RU')}</td>
        `;
        
        tableBody.appendChild(row);
    });
    
    if (completions.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="13" style="text-align: center; padding: 40px;">
                    <i class="fas fa-inbox" style="font-size: 2rem; color: #ccc; margin-bottom: 15px; display: block;"></i>
                    Пока нет данных об ответах. Дождитесь, пока пользователи заполнят опрос.
                </td>
            </tr>
        `;
    }
}

// Загрузка таблицы совпадений
function loadMatchesTable(users, allAnswers, completions) {
    const tableBody = document.getElementById('matches-table-body');
    if (!tableBody) return;
    
    // Сначала собираем статистику по популярным ответам
    const popularAnswers = getPopularAnswers(allAnswers);
    
    tableBody.innerHTML = '';
    
    completions.forEach((completion) => {
        const user = users.find(u => u.id === completion.userId);
        if (!user) return;
        
        const answers = allAnswers[user.id] || {};
        
        // Вычисляем процент совпадения
        const matchResult = calculateMatchPercentage(answers, popularAnswers);
        
        // Определяем цвет баджа в зависимости от процента совпадения
        let matchClass = 'match-low';
        if (matchResult.percentage >= 70) matchClass = 'match-high';
        else if (matchResult.percentage >= 40) matchClass = 'match-medium';
        
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td><strong>${user.username}</strong></td>
            <td>${user.email}</td>
            <td>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span class="match-value">${matchResult.percentage}%</span>
                    <span class="match-badge ${matchClass}">${matchResult.percentage >= 70 ? 'Высокое' : matchResult.percentage >= 40 ? 'Среднее' : 'Низкое'}</span>
                </div>
            </td>
            <td>${matchResult.matchedQuestions} из ${matchResult.totalQuestions}</td>
            <td>${matchResult.matchedAnswers.join(', ').substring(0, 50)}${matchResult.matchedAnswers.join(', ').length > 50 ? '...' : ''}</td>
            <td>${new Date(completion.date).toLocaleDateString('ru-RU')}</td>
        `;
        
        tableBody.appendChild(row);
    });
    
    if (completions.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 40px;">
                    <i class="fas fa-users" style="font-size: 2rem; color: #ccc; margin-bottom: 15px; display: block;"></i>
                    Нет данных для сравнения совпадений.
                </td>
            </tr>
        `;
    }
}

// Получение популярных ответов
function getPopularAnswers(allAnswers) {
    const answerCounts = {};
    
    // Инициализируем структуру для подсчета
    surveyQuestions.forEach(question => {
        if (question.type === 'radio' || question.type === 'select' || question.type === 'checkbox') {
            answerCounts[question.id] = {};
            question.options.forEach(option => {
                answerCounts[question.id][option] = 0;
            });
        }
    });
    
    // Считаем ответы
    Object.values(allAnswers).forEach(userAnswers => {
        Object.entries(userAnswers).forEach(([questionId, answer]) => {
            const questionIdNum = parseInt(questionId);
            const question = surveyQuestions.find(q => q.id === questionIdNum);
            if (!question || !answerCounts[questionIdNum]) return;
            
            if (question.type === 'radio' || question.type === 'select') {
                let answerValue = '';
                if (typeof answer === 'string') {
                    answerValue = answer;
                } else if (answer && answer.value) {
                    answerValue = answer.value;
                }
                
                if (answerValue && answerCounts[questionIdNum][answerValue] !== undefined) {
                    answerCounts[questionIdNum][answerValue]++;
                }
            } else if (question.type === 'checkbox') {
                let answers = [];
                if (Array.isArray(answer)) {
                    answers = answer;
                } else if (answer && answer.value && Array.isArray(answer.value)) {
                    answers = answer.value;
                }
                
                answers.forEach(ans => {
                    if (answerCounts[questionIdNum][ans] !== undefined) {
                        answerCounts[questionIdNum][ans]++;
                    }
                });
            }
        });
    });
    
    // Находим самый популярный ответ для каждого вопроса
    const popularAnswers = {};
    Object.entries(answerCounts).forEach(([questionId, counts]) => {
        let maxCount = 0;
        let popularAnswer = '';
        
        Object.entries(counts).forEach(([option, count]) => {
            if (count > maxCount) {
                maxCount = count;
                popularAnswer = option;
            }
        });
        
        if (popularAnswer) {
            popularAnswers[questionId] = popularAnswer;
        }
    });
    
    return popularAnswers;
}

// Вычисление процента совпадения
function calculateMatchPercentage(userAnswers, popularAnswers) {
    let matchedQuestions = 0;
    let totalQuestions = 0;
    const matchedAnswers = [];
    
    Object.entries(userAnswers).forEach(([questionId, answer]) => {
        const questionIdNum = parseInt(questionId);
        const question = surveyQuestions.find(q => q.id === questionIdNum);
        if (!question || !popularAnswers[questionId]) return;
        
        totalQuestions++;
        
        let userAnswerValue = '';
        if (question.type === 'radio' || question.type === 'select') {
            if (typeof answer === 'string') {
                userAnswerValue = answer;
            } else if (answer && answer.value) {
                userAnswerValue = answer.value;
            }
        } else if (question.type === 'checkbox') {
            // Для checkbox считаем совпадением, если пользователь выбрал популярный вариант
            let answers = [];
            if (Array.isArray(answer)) {
                answers = answer;
            } else if (answer && answer.value && Array.isArray(answer.value)) {
                answers = answer.value;
            }
            
            if (answers.includes(popularAnswers[questionId])) {
                matchedQuestions++;
                matchedAnswers.push(`Вопрос ${questionId}`);
                return;
            }
        }
        
        if (userAnswerValue === popularAnswers[questionId]) {
            matchedQuestions++;
            matchedAnswers.push(`Вопрос ${questionId}`);
        }
    });
    
    const percentage = totalQuestions > 0 ? Math.round((matchedQuestions / totalQuestions) * 100) : 0;
    
    return {
        percentage,
        matchedQuestions,
        totalQuestions,
        matchedAnswers
    };
}

// Форматирование ответа для отображения
function formatAnswer(answer, type) {
    if (!answer && answer !== 0) return 'Нет ответа';
    
    if (typeof answer === 'string') return answer;
    
    if (type === 'checkbox') {
        if (Array.isArray(answer)) {
            return answer.join(', ');
        } else if (answer.value && Array.isArray(answer.value)) {
            let result = answer.value.join(', ');
            if (answer.other) {
                result += ` (${answer.other})`;
            }
            return result;
        }
    } else if (type === 'radio') {
        if (answer.value) {
            return answer.other ? `${answer.value} (${answer.other})` : answer.value;
        }
        return answer;
    }
    
    return String(answer);
}

// Экспорт данных в CSV
function exportToCSV() {
    const users = JSON.parse(localStorage.getItem('newYearSurveyUsers') || '[]');
    const allAnswers = JSON.parse(localStorage.getItem('newYearSurveyAnswers') || '{}');
    const completions = JSON.parse(localStorage.getItem('newYearSurveyCompletions') || '[]');
    
    if (completions.length === 0) {
        showNotification('Нет данных для экспорта', 'error');
        return;
    }
    
    let csv = 'ID,Пользователь,Email,Традиции,Планы на 2026,Подарок,Ожидания,Фильм,Настроение,Место празднования,Время подготовки,Возраст (Дед Мороз),Пожелания,Дата\n';
    
    completions.forEach((completion, index) => {
        const user = users.find(u => u.id === completion.userId);
        if (!user) return;
        
        const answers = allAnswers[user.id] || {};
        
        const traditions = `"${formatAnswer(answers[1], 'checkbox').replace(/"/g, '""')}"`;
        const plans = `"${formatAnswer(answers[2], 'radio').replace(/"/g, '""')}"`;
        const gift = `"${(answers[3] || 'Нет ответа').replace(/"/g, '""')}"`;
        const expectations = `"${formatAnswer(answers[4], 'radio').replace(/"/g, '""')}"`;
        const movie = `"${(answers[5] || 'Нет ответа').replace(/"/g, '""')}"`;
        const mood = `"${(answers[6] || 'Нет ответа').replace(/"/g, '""')}"`;
        const place = `"${formatAnswer(answers[7], 'checkbox').replace(/"/g, '""')}"`;
        const prepTime = `"${formatAnswer(answers[8], 'radio').replace(/"/g, '""')}"`;
        const santaAge = `"${(answers[9] !== undefined ? answers[9] : 'Нет ответа').toString().replace(/"/g, '""')}"`;
        const wishes = `"${(answers[10] || 'Нет ответа').replace(/"/g, '""')}"`;
        
        csv += `${index + 1},"${user.username}","${user.email}",${traditions},${plans},${gift},${expectations},${movie},${mood},${place},${prepTime},${santaAge},${wishes},"${new Date(completion.date).toLocaleDateString('ru-RU')}"\n`;
    });
    
    // Создаем ссылку для скачивания
    const blob = new Blob(['\ufeff', csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'новогодний_опрос_2026_результаты.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('Данные успешно экспортированы в CSV', 'success');
}

// Очистка всех данных
function clearAllData() {
    if (confirm('Вы уверены, что хотите удалить ВСЕ данные опроса? Это действие нельзя отменить.')) {
        localStorage.removeItem('newYearSurveyUsers');
        localStorage.removeItem('newYearSurveyAnswers');
        localStorage.removeItem('newYearSurveyCompletions');
        localStorage.removeItem('newYearSurveyState');
        
        appState.currentUser = null;
        appState.userAnswers = {};
        appState.currentQuestionIndex = 0;
        
        showNotification('Все данные успешно удалены', 'success');
        loadAdminData();
        showPage('register');
    }
}

// Обновление информации о пользователе
function updateUserInfo() {
    if (appState.currentUser) {
        document.getElementById('current-user').textContent = appState.currentUser.username;
    }
}

// Показать уведомление
function showNotification(message, type) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';
    
    setTimeout(() => {
        notification.style.display = 'none';
    }, 4000);
}

// Показать ошибку в поле
function showError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.classList.add('has-error');
        const errorMessage = element.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.textContent = message;
        }
    }
}

// Очистить ошибку в поле
function clearError(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.classList.remove('has-error');
    }
}

// Очистить все ошибки на странице
function clearErrors(pageId) {
    const page = document.getElementById(`${pageId}-page`);
    if (page) {
        const errorElements = page.querySelectorAll('.has-error');
        errorElements.forEach(el => {
            el.classList.remove('has-error');
        });
    }
}

// Проверка email
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Сохранение состояния в localStorage
function saveToLocalStorage() {
    localStorage.setItem('newYearSurveyState', JSON.stringify({
        currentUser: appState.currentUser,
        currentQuestionIndex: appState.currentQuestionIndex,
        userAnswers: appState.userAnswers
    }));
}

// Загрузка состояния из localStorage
function loadFromLocalStorage() {
    const savedState = JSON.parse(localStorage.getItem('newYearSurveyState') || '{}');
    
    if (savedState.currentUser) {
        appState.currentUser = savedState.currentUser;
    }
    
    if (savedState.currentQuestionIndex !== undefined) {
        appState.currentQuestionIndex = savedState.currentQuestionIndex;
    }
    
    if (savedState.userAnswers) {
        appState.userAnswers = savedState.userAnswers;
    }
}

// Создание снежинок
function createSnowflakes() {
    const snowflakesContainer = document.createElement('div');
    snowflakesContainer.id = 'snowflakes-container';
    snowflakesContainer.style.position = 'fixed';
    snowflakesContainer.style.top = '0';
    snowflakesContainer.style.left = '0';
    snowflakesContainer.style.width = '100%';
    snowflakesContainer.style.height = '100%';
    snowflakesContainer.style.pointerEvents = 'none';
    snowflakesContainer.style.zIndex = '1';
    document.body.appendChild(snowflakesContainer);
    
    // Создаем ограниченное количество снежинок для производительности
    for (let i = 0; i < 20; i++) {
        createSnowflake(snowflakesContainer);
    }
}

function createSnowflake(container) {
    const snowflake = document.createElement('div');
    snowflake.className = 'snowflake';
    snowflake.innerHTML = '❄';
    
    // Начальная позиция
    const startX = Math.random() * 100;
    snowflake.style.left = `${startX}vw`;
    snowflake.style.top = '-20px';
    
    // Размер
    const size = Math.random() * 20 + 15;
    snowflake.style.fontSize = `${size}px`;
    
    // Скорость падения
    const speed = Math.random() * 3 + 2;
    
    container.appendChild(snowflake);
    
    // Анимация падения
    let y = -20;
    function fall() {
        y += speed;
        if (y > 100) {
            y = -20;
            snowflake.style.left = `${Math.random() * 100}vw`;
        }
        
        // Небольшое колебание в стороны
        const sway = Math.sin(y / 20) * 2;
        snowflake.style.left = `${startX + sway}vw`;
        snowflake.style.top = `${y}vh`;
        
        requestAnimationFrame(fall);
    }
    
    // Запускаем с задержкой для разнообразия
    setTimeout(fall, Math.random() * 5000);
}

// Инициализируем снежинки при загрузке страницы
createSnowflakes();