import { logger, getCached, $$ } from './utils.js';

// ============================================================================
// TRANSLATION STATE
// ============================================================================

export let translations = { ru: {}, en: {}, az: {} };
export let currentLang = localStorage.getItem('appLanguage') || 'ru';

// ============================================================================
// TRANSLATION LOADING
// ============================================================================

export async function loadTranslations() {
    const isFileProtocol = window.location.protocol === 'file:';
    if (isFileProtocol) {
        logger.debug('File protocol detected, using inline translations');
        useFallbackTranslations();
        return;
    }

    try {
        const [ruRes, enRes, azRes] = await Promise.all([
            fetch('locales/locale-ru.json').catch(() => null),
            fetch('locales/locale-en.json').catch(() => null),
            fetch('locales/locale-az.json').catch(() => null)
        ]);

        if (ruRes && ruRes.ok && enRes && enRes.ok && azRes && azRes.ok) {
            const ru = await ruRes.json();
            const en = await enRes.json();
            const az = await azRes.json();
            translations = { ru, en, az };
            if (currentLang) {
                applyDynamicTranslations();
            }
        } else {
            throw new Error('One or more translation files failed to load');
        }
    } catch (error) {
        logger.debug('Error loading translations, using fallback:', error);
        useFallbackTranslations();
    }
}

const useFallbackTranslations = () => {
    // Fallback translations (copied from original script)
    // For brevity, I'll include a subset or the full set if needed. 
    // Given the size, I'll rely on the fact that the user has the JSON files or I should copy the huge object.
    // To be safe and ensure it works offline/locally as the original did, I should include the fallback.
    // However, it's huge. I'll assume for now the JSONs are present or I'll copy the fallback logic if I can.
    // Actually, I'll copy the fallback object from the read file content.

    translations = {
        ru: {
            appTitle: "ORDINA", appSubtitle: "Управляй своей жизнью с легкостью",
            tabDashboard: "Сводка", tabDebts: "Долги", tabRecurringExpenses: "Ежемесячные расходы", tabMonthlyExpenses: "Расходы месяца", tabTasks: "Список задач", tabCalendar: "Календарь",
            dashboardTitle: "Сводка за месяц", loading: "Загрузка данных...",
            dashRecurringPaid: "Ежемесячные (оплачено)", dashRecurringRemaining: "Ежемесячные (осталось)", dashMonthlyExpenses: "Расходы за месяц", dashTotalDebt: "Остаток общего долга", dashTopCategories: "Топ категорий расходов",
            debtsTitle: "Общие долги", addDebt: "Добавить долг", debtName: "Долг (Имя)", amount: "Сумма", paid: "Оплачено", remaining: "Осталось", lastPaymentDate: "Дата последней оплаты", comments: "Комментарии", actions: "Действия", emptyDebts: "Список долгов пуст. Нажмите кнопку 'Добавить долг', чтобы начать.",
            recurringTitle: "Ежемесячные расходы", addTemplate: "Добавить шаблон", paymentDay: "День оплаты", status: "Статус", details: "Детали", templateActions: "Действия с шаблоном", emptyRecurring: "Список ежемесячных расходов пуст. Создайте шаблон.",
            expensesTitle: "Все расходы за", addExpense: "Добавить расход", category: "Категория", date: "Дата", emptyExpenses: "Расходов в этом месяце еще нет.",
            taskToday: "На сегодня", taskMonth: "На месяц", taskYear: "Долгосрочный", taskTodayTitle: "Задачи на сегодня", taskMonthTitle: "Задачи на месяц", taskYearTitle: "Долгосрочные задачи", addTask: "Добавить задачу", name: "Имя", notes: "Заметки", deadline: "Дедлайн", emptyTasks: "Список задач пуст.",
            cancel: "Отмена", save: "Сохранить", add: "Добавить", delete: "Удалить", close: "Закрыть",
            debtorName: "Имя должника/Название", totalAmount: "Общая сумма", paidAmount: "Оплаченная сумма", comment: "Комментарий",
            addDebtPayment: "Добавить платеж по долгу", paymentAmount: "Сумма платежа", paymentDayNum: "День оплаты (1-31)",
            deleteConfirm: "Вы уверены, что хотите удалить это?",
            paidStatus: "Оплачено", unpaidStatus: "Не оплачено",
            statusDone: "Выполнено", statusNotDone: "Не выполнено", statusSkipped: "Пропущено",
            editDebt: "Редактировать долг", editTemplate: "Редактировать шаблон", editExpense: "Редактировать расход", editTask: "Редактировать задачу",
            addTaskForToday: "Добавить задачу на сегодня", addTaskForMonth: "Добавить задачу на месяц", addTaskForYear: "Добавить долгосрочную задачу",
            chartLabel: "Расходы",
            dashTasksMonth: "Осталось задач (месяц)", dashTasksYear: "Осталось задач (год)",
            debtRepayments: "Погашение долгов", recurringPayments: "Ежемесячные платежи",
            placeholderComment: "Добавить комментарий...",
            addEvent: "Добавить событие", editEvent: "Редактировать событие", eventName: "Название события", createTaskForEvent: "Создать задачу для этого события",
            weekdays: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"],
            categoryEvent: "Событие", categoryBirthday: "День рождения", categoryMeeting: "Встреча", categoryWedding: "Свадьба",
            birthdayName: "Имя именинника", birthYear: "Год рождения (опционально)", meetingWith: "С кем", time: "Время (опц.)", place: "Место (опц.)", weddingNames: "Имена пары",
            taskCongratulate: "Поздравить", taskTurning: "исполняется", taskYearsOld: "лет", taskMeetWith: "Встретиться с", taskWeddingOf: "Свадьба",
            authTitle: "Войдите в свой аккаунт", login: "Войти", register: "Зарегистрироваться", logout: "Выйти", loginWithGoogle: "Войти через Google",
            authInvalidEmail: "Неверный формат email адреса.",
            authEmailInUse: "Этот email уже зарегистрирован.",
            authWeakPassword: "Пароль слишком слабый. Он должен содержать не менее 6 символов.",
            authInvalidCredentials: "Неверный email или пароль.",
            authGenericError: "Произошла ошибка. Попробуйте снова.",
            manageCategories: "Управление категориями", manageCategoriesTitle: "Управление категориями",
            toastSuccess: "Успешно сохранено!", toastError: "Ошибка сохранения!", toastDeleted: "Запись удалена.",
            radioTitle: "AzerbaiJazz Radio",
            tabPayments: "Оплата",
            shoppingListTitle: "Список покупок",
            shoppingListCopy: "Копировать",
            shoppingListQuantity: "Кол-во",
            shoppingListProduct: "Название товара",
            shoppingListPrice: "Цена (AZN)",
            shoppingListAdd: "Добавить",
            shoppingListTotal: "Итого",
            shoppingListQuantityColumn: "Кол-во",
            shoppingListProductColumn: "Товар",
            shoppingListPriceColumn: "Цена",
            shoppingListSumColumn: "Сумма",
            shoppingListActionsColumn: "Действия",
            toPurchase: "К ПРИОБРЕТЕНИЮ",
            purchased: "КУПЛЕНО",
            generalTotal: "ОБЩАЯ СУММА",
            newsBoxTitle: "Новости",
            prev: "Назад",
            next: "Вперед",
            quickActionsTitle: "Быстрые действия",
            weatherLocation: "Локация",
            newsCountry: "Страна",
            newsCategory: "Категория",
            newsAllCountries: "Все страны",
            newsAzerbaijan: "Азербайджан",
            newsRussia: "Россия",
            newsUSA: "США",
            newsUK: "Великобритания",
            newsGermany: "Германия",
            newsTurkey: "Турция",
            newsUkraine: "Украина",
            newsFrance: "Франция",
            newsItaly: "Италия",
            newsSpain: "Испания",
            newsChina: "Китай",
            newsGeneral: "Общее",
            newsBusiness: "Бизнес",
            newsTech: "Технологии",
            newsScience: "Наука",
            newsPolitics: "Политика",
            newsEconomy: "Экономика",
            newsWar: "Война",
            newsCulture: "Культура",
            newsHealth: "Здоровье",
            newsSport: "Спорт",
            weatherLoading: "Загрузка...",
            weatherError: "Ошибка загрузки",
            weatherLocationError: "Геолокация недоступна",
            weatherLocationSuccess: "Геолокация получена",
            weatherUpdated: "Погода обновлена для города",
            radioTitle: "AzerbaiJazz Radio",
            radioPlaying: "Играет",
            radioPaused: "Пауза",
            newsNotFound: "Новости не найдены",
            lastActivity: "Последняя активность",
            activityExpenseAdded: "Расход добавлен",
            activityTaskDone: "Задача выполнена",
            activityDebtUpdated: "Долг обновлен",
            noRecentActivity: "Нет недавней активности",
            months: ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"],
            monthsShort: ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"],
            weekdaysFull: ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресенье"],
            weatherCityPlaceholder: "Баку",
            weatherCitySearchPlaceholder: "Город...",
            weatherGeoTitle: "По геолокации",
            weatherRefresh: "Обновить погоду",
            newsSource: "Источник",
            newsPublished: "Опубликовано",
            newsLoadingNews: "Загрузка новостей...",
            newsNoNews: "Новости не найдены",
            newsAllCategories: "Все категории",
            newsTechnology: "💻 Технологии",
            newsBusiness: "💼 Бизнес",
            newsScience: "🔬 Наука",
            newsSports: "⚽ Спорт",
            newsHealth: "🏥 Здоровье",
            newsEntertainment: "🎬 Развлечения",
            newsSearchPlaceholder: "Поиск...",
            newsRefresh: "Обновить",
            newsArticlesLoaded: "новостей загружено",
            newsError: "Ошибка загрузки новостей",
        },
        en: {
            appTitle: "ORDINA", appSubtitle: "Manage your life with ease",
            tabDashboard: "Dashboard", tabDebts: "Debts", tabRecurringExpenses: "Recurring Expenses", tabMonthlyExpenses: "Monthly Expenses", tabTasks: "Task List", tabCalendar: "Calendar",
            dashboardTitle: "Monthly Dashboard", loading: "Loading data...",
            dashRecurringPaid: "Recurring (Paid)", dashRecurringRemaining: "Recurring (Remaining)", dashMonthlyExpenses: "Monthly Expenses", dashTotalDebt: "Total Debt Remaining", dashTopCategories: "Top Expense Categories",
            debtsTitle: "All Debts", addDebt: "Add Debt", debtName: "Debt (Name)", amount: "Amount", paid: "Paid", remaining: "Remaining", lastPaymentDate: "Last Payment Date", comments: "Comments", actions: "Actions", emptyDebts: "Debt list is empty. Click 'Add Debt' to start.",
            recurringTitle: "Recurring Expenses", addTemplate: "Add Template", paymentDay: "Payment Day", status: "Status", details: "Details", templateActions: "Template Actions", emptyRecurring: "Recurring expense list is empty. Create a template.",
            expensesTitle: "All Expenses for", addExpense: "Add Expense", category: "Category", date: "Date", emptyExpenses: "No expenses for this month yet.",
            taskToday: "Today", taskMonth: "Month", taskYear: "Long-term", taskTodayTitle: "Today's Tasks", taskMonthTitle: "Monthly Tasks", taskYearTitle: "Long-term Tasks", addTask: "Add Task", name: "Name", notes: "Notes", deadline: "Deadline", emptyTasks: "Task list is empty.",
            cancel: "Cancel", save: "Save", add: "Add", delete: "Delete", close: "Close",
            debtorName: "Debtor Name/Title", totalAmount: "Total Amount", paidAmount: "Paid Amount", comment: "Comment",
            addDebtPayment: "Add Debt Payment", paymentAmount: "Payment Amount", paymentDayNum: "Payment Day (1-31)",
            deleteConfirm: "Are you sure you want to delete this?",
            paidStatus: "Paid", unpaidStatus: "Unpaid",
            statusDone: "Done", statusNotDone: "Not Done", statusSkipped: "Skipped",
            editDebt: "Edit Debt", editTemplate: "Edit Template", editExpense: "Edit Expense", editTask: "Edit Task",
            addTaskForToday: "Add Task for Today", addTaskForMonth: "Add Task for Month", addTaskForYear: "Add Long-term Task",
            chartLabel: "Expenses",
            dashTasksMonth: "Tasks Remaining (Month)", dashTasksYear: "Tasks Remaining (Year)",
            debtRepayments: "Debt Repayments", recurringPayments: "Recurring Payments",
            placeholderComment: "Add a comment...",
            addEvent: "Add Event", editEvent: "Edit Event", eventName: "Event Name", createTaskForEvent: "Create a task for this event",
            weekdays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            categoryEvent: "Event", categoryBirthday: "Birthday", categoryMeeting: "Meeting", categoryWedding: "Wedding",
            birthdayName: "Birthday person's name", birthYear: "Year of birth (optional)", meetingWith: "With whom", time: "Time (opt.)", place: "Place (opt.)", weddingNames: "Couple's names",
            taskCongratulate: "Congratulate", taskTurning: "turning", taskYearsOld: "years old", taskMeetWith: "Meet with", taskWeddingOf: "Wedding of",
            authTitle: "Sign in to your account", login: "Sign in", register: "Register", logout: "Log out", loginWithGoogle: "Sign in with Google",
            authInvalidEmail: "Invalid email format.",
            authEmailInUse: "This email is already in use.",
            authWeakPassword: "Password is too weak. It should be at least 6 characters.",
            authInvalidCredentials: "Invalid email or password.",
            authGenericError: "An error occurred. Please try again.",
            manageCategories: "Manage Categories", manageCategoriesTitle: "Manage Categories",
            toastSuccess: "Saved successfully!", toastError: "Error saving!", toastDeleted: "Entry deleted.",
            shoppingListTitle: "Shopping List",
            shoppingListCopy: "Copy",
            shoppingListQuantity: "Qty",
            shoppingListProduct: "Product Name",
            shoppingListPrice: "Price (AZN)",
            shoppingListAdd: "Add",
            shoppingListTotal: "Total",
            shoppingListQuantityColumn: "Qty",
            shoppingListProductColumn: "Product",
            shoppingListPriceColumn: "Price",
            shoppingListSumColumn: "Sum",
            shoppingListActionsColumn: "Actions",
            toPurchase: "TO PURCHASE",
            purchased: "PURCHASED",
            generalTotal: "GRAND TOTAL",
            newsBoxTitle: "News",
            prev: "Previous",
            next: "Next",
            quickActionsTitle: "Quick Actions",
            weatherLocation: "Location",
            newsCountry: "Country",
            newsCategory: "Category",
            newsAllCountries: "All Countries",
            newsAzerbaijan: "Azerbaijan",
            newsRussia: "Russia",
            newsUSA: "USA",
            newsUK: "United Kingdom",
            newsGermany: "Germany",
            newsTurkey: "Turkey",
            newsUkraine: "Ukraine",
            newsFrance: "France",
            newsItaly: "Italy",
            newsSpain: "Spain",
            newsChina: "China",
            newsGeneral: "General",
            newsBusiness: "Business",
            newsTech: "Technology",
            newsScience: "Science",
            newsPolitics: "Politics",
            newsEconomy: "Economy",
            newsWar: "War",
            newsCulture: "Culture",
            newsHealth: "Health",
            newsSport: "Sports",
            weatherLoading: "Loading...",
            weatherError: "Loading error",
            weatherLocationError: "Geolocation unavailable",
            weatherLocationSuccess: "Geolocation obtained",
            weatherUpdated: "Weather updated for city",
            radioTitle: "AzerbaiJazz Radio",
            radioPlaying: "Playing",
            radioPaused: "Paused",
            newsNotFound: "No news found",
            lastActivity: "Recent Activity",
            activityExpenseAdded: "Expense added: Groceries - 25 AZN",
            activityTaskDone: "Task completed: Call the bank",
            activityDebtUpdated: "Debt updated: Credit - 150 AZN",
            months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
            monthsShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
            weekdaysFull: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
            weatherCityPlaceholder: "Baku",
            weatherCitySearchPlaceholder: "City...",
            weatherGeoTitle: "By geolocation",
            weatherRefresh: "Refresh weather",
            newsSource: "Source",
            newsPublished: "Published",
            newsLoadingNews: "Loading news...",
            newsNoNews: "No news found",
            newsAllCategories: "All Categories",
            newsTechnology: "💻 Technology",
            newsBusiness: "💼 Business",
            newsScience: "🔬 Science",
            newsSports: "⚽ Sports",
            newsHealth: "🏥 Health",
            newsEntertainment: "🎬 Entertainment",
            newsSearchPlaceholder: "Search...",
            newsRefresh: "Refresh",
            newsArticlesLoaded: "news articles loaded",
            newsError: "Failed to load news",
            tabPayments: "Payments",
        },
        az: {
            appTitle: "ORDINA", appSubtitle: "Həyatını asanlıqla idarə et",
            tabDashboard: "Ümumi", tabDebts: "Borclar", tabRecurringExpenses: "Aylıq xərclər", tabMonthlyExpenses: "Aylıq xərclər", tabTasks: "Tapşırıqlar", tabCalendar: "Təqvim",
            dashboardTitle: "Aylıq ümumi", loading: "Məlumatlar yüklənir...",
            dashRecurringPaid: "Aylıq (ödənilmiş)", dashRecurringRemaining: "Aylıq (qalan)", dashMonthlyExpenses: "Aylıq xərclər", dashTotalDebt: "Ümumi borc qalığı", dashTopCategories: "Əsas xərc kateqoriyaları",
            debtsTitle: "Bütün borclar", addDebt: "Borç əlavə et", debtName: "Borç (Ad)", amount: "Məbləğ", paid: "Ödənilmiş", remaining: "Qalan", lastPaymentDate: "Son ödəniş tarixi", comments: "Şərhlər", actions: "Əməлијјатлар", emptyDebts: "Borclar siyahısı boşdur. Başlamaq üçün 'Borç əlavə et' düyməsini basın.",
            recurringTitle: "Aylıq xərclər", addTemplate: "Şablon əlavə et", paymentDay: "Ödəniş günü", status: "Status", details: "Təfərrüatlar", templateActions: "Şablon əməliyyatları", emptyRecurring: "Aylıq xərclər siyahısı boşdur. Şablon yaradın.",
            expensesTitle: "Bütün xərclər", addExpense: "Xərc əlavə et", category: "Kateqoriya", date: "Tarix", emptyExpenses: "Bu ay üçün hələ xərc yoxdur.",
            taskToday: "Bu gün", taskMonth: "Ay", taskYear: "Uzunmüddətli", taskTodayTitle: "Bu günkü tapşırıqlar", taskMonthTitle: "Aylıq tapşırıqlar", taskYearTitle: "Uzunmüddətli tapşırıqlar", addTask: "Tapşırıq əlavə et", name: "Ad", notes: "Qeydlər", deadline: "Müddət", emptyTasks: "Tapşırıqlar siyahısı boşdur.",
            cancel: "Ləğv et", save: "Saxla", add: "Əlavə et", delete: "Sil", close: "Bağla",
            debtorName: "Borclu adı/Başlıq", totalAmount: "Ümumi məbləğ", paidAmount: "Ödənilmiş məbləğ", comment: "Şərh",
            addDebtPayment: "Borç ödənişi əlavə et", paymentAmount: "Ödəniş məbləği", paymentDayNum: "Ödəniş günü (1-31)",
            deleteConfirm: "Bunu silmək istədiyinizə əminsiniz?",
            paidStatus: "Ödənilmiş", unpaidStatus: "Ödənilməmiş",
            statusDone: "Tamamlanmış", statusNotDone: "Tamamlanmamış", statusSkipped: "Keçilmiş",
            editDebt: "Borcu redaktə et", editTemplate: "Şablonu redaktə et", editExpense: "Xərci redaktə et", editTask: "Tapşırığı redaktə et",
            addTaskForToday: "Bu gün üçün tapşırıq əlavə et", addTaskForMonth: "Ay üçün tapşırıq əlavə et", addTaskForYear: "Uzunmüddətli tapşırıq əlavə et",
            chartLabel: "Xərclər",
            dashTasksMonth: "Qalan tapşırıqlar (ay)", dashTasksYear: "Qalan tapşırıqlar (il)",
            debtRepayments: "Borç ödənişləri", recurringPayments: "Aylıq ödənişlər",
            placeholderComment: "Şərh əlavə edin...",
            addEvent: "Tədbir əlavə et", editEvent: "Tədbiri redaktə et", eventName: "Tədbir adı", createTaskForEvent: "Bu tədbir üçün tapşırıq yaradın",
            weekdays: ["B.E", "Ç.A", "Ç", "C.A", "C", "Ş", "B"],
            categoryEvent: "Tədbir", categoryBirthday: "Ad günü", categoryMeeting: "Görüş", categoryWedding: "Toy",
            birthdayName: "Ad günü olan şəxsin adı", birthYear: "Doğum ili (istəyə bağlı)", meetingWith: "Kiminlə", time: "Vaxt (istəyə bağlı)", place: "Yer (istəyə bağlı)", weddingNames: "Cütlüyün adları",
            taskCongratulate: "Təbrik et", taskTurning: "yaşını tamamlayır", taskYearsOld: "yaşında", taskMeetWith: "ilə görüş", taskWeddingOf: "Toyu",
            authTitle: "Hesabınıza daxil olun", login: "Daxil ol", register: "Qeydiyyat", logout: "Çıxış", loginWithGoogle: "Google ilə daxil ol",
            authInvalidEmail: "Yanlış email formatı.",
            authEmailInUse: "Bu email artıq istifadə olunur.",
            authWeakPassword: "Parol çox zəifdir. Ən azı 6 simvol olmalıdır.",
            authInvalidCredentials: "Yanlış email və ya parol.",
            authGenericError: "Xəta baş verdi. Yenidən cəhd edin.",
            manageCategories: "Kateqoriyaları idarə et", manageCategoriesTitle: "Kateqoriyaları idarə et",
            toastSuccess: "Uğurla yadda saxlanıldı!", toastError: "Yaddaş xətası!", toastDeleted: "Yazı silindi.",
            shoppingListTitle: "Alış-veriş siyahısı",
            shoppingListCopy: "Kopyala",
            shoppingListQuantity: "Miqdar",
            shoppingListProduct: "Məhsul adı",
            shoppingListPrice: "Qiymət (AZN)",
            shoppingListAdd: "Əlavə et",
            shoppingListTotal: "Cəmi",
            shoppingListQuantityColumn: "Miqdar",
            shoppingListProductColumn: "Məhsul",
            shoppingListPriceColumn: "Qiymət",
            shoppingListSumColumn: "Məbləğ",
            shoppingListActionsColumn: "Əməliyyatlar",
            toPurchase: "ALINMALI",
            purchased: "ALINMIŞ",
            generalTotal: "ÜMUMİ CƏMİ",
            newsBoxTitle: "Xəbərlər",
            prev: "Geri",
            next: "İrəli",
            quickActionsTitle: "Sürətli əməliyyatlar",
            weatherLocation: "Yer",
            newsCountry: "Ölkə",
            newsCategory: "Kateqoriya",
            newsAllCountries: "Bütün ölkələr",
            newsAzerbaijan: "Azərbaycan",
            newsRussia: "Rusiya",
            newsUSA: "ABŞ",
            newsUK: "Böyük Britaniya",
            newsGermany: "Almaniya",
            newsTurkey: "Türkiyə",
            newsUkraine: "Ukrayna",
            newsFrance: "Fransa",
            newsItaly: "İtaliya",
            newsSpain: "İspaniya",
            newsChina: "Çin",
            newsGeneral: "Ümumi",
            newsBusiness: "Biznes",
            newsTech: "Texnologiya",
            newsScience: "Elm",
            newsPolitics: "Siyasət",
            newsEconomy: "İqtisadiyyat",
            newsWar: "Müharibə",
            newsCulture: "Mədəniyyət",
            newsHealth: "Sağlamlıq",
            newsSport: "İdman",
            weatherLoading: "Yüklənir...",
            weatherError: "Yükləmə xətası",
            weatherLocationError: "Geolokasiya əlçatan deyil",
            weatherLocationSuccess: "Geolokasiya əldə edildi",
            weatherUpdated: "Hava şəhər üçün yeniləndi",
            radioTitle: "AzerbaiJazz Radio",
            radioPlaying: "Oynayır",
            radioPaused: "Pauza",
            newsNotFound: "Xəbər tapılmadı",
            lastActivity: "Son fəaliyyət",
            activityExpenseAdded: "Xərc əlavə edildi",
            activityTaskDone: "Tapşırıq tamamlandı",
            activityDebtUpdated: "Borc yeniləndi",
            noRecentActivity: "Son aktivlik yoxdur",
            months: ["Yanvar", "Fevral", "Mart", "Aprel", "May", "İyun", "İyul", "Avqust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr"],
            monthsShort: ["Yan", "Fev", "Mar", "Apr", "May", "İyn", "İyl", "Avq", "Sen", "Okt", "Noy", "Dek"],
            weekdaysFull: ["Bazar ertəsi", "Çərşənbə axşamı", "Çərşənbə", "Cümə axşamı", "Cümə", "Şənbə", "Bazar"],
            weatherCityPlaceholder: "Bakı",
            weatherCitySearchPlaceholder: "Şəhər...",
            weatherGeoTitle: "Geolokasiya ilə",
            weatherRefresh: "Hava məlumatını yenilə",
            newsSource: "Mənbə",
            newsPublished: "Dərc edilib",
            newsLoadingNews: "Xəbərlər yüklənir...",
            newsNoNews: "Xəbər tapılmadı",
            newsAllCategories: "Bütün kateqoriyalar",
            newsTechnology: "💻 Texnologiya",
            newsBusiness: "💼 Biznes",
            newsScience: "🔬 Elm",
            newsSports: "⚽ İdman",
            newsHealth: "🏥 Sağlamlıq",
            newsEntertainment: "🎬 Əyləncə",
            newsSearchPlaceholder: "Axtarış...",
            newsRefresh: "Yenilə",
            newsArticlesLoaded: "xəbər yükləndi",
            newsError: "Xəbərlərin yüklənməsində xəta",
            tabPayments: "Ödənişlər",
        }
    };

    if (currentLang) {
        applyDynamicTranslations();
    }
}

export function applyDynamicTranslations() {
    const t = translations[currentLang];
    if (!t) return;

    // textContent translations - use cached selectors
    $$('[data-i18n]').forEach(el => {
        if (el.closest('#lang-menu') || el.classList.contains('language-dropdown-item') || el.classList.contains('flag')) return;
        const key = el.dataset.i18n;
        if (t[key]) el.textContent = t[key];
    });

    // Placeholder translations
    $$('[data-placeholder-i18n]').forEach(el => {
        const key = el.dataset.placeholderI18n;
        if (t[key]) el.placeholder = t[key];
    });

    // Legacy placeholders - use cached
    const wc = getCached('weather-city-input');
    if (wc && t.weatherCityPlaceholder) wc.placeholder = t.weatherCityPlaceholder;
    const ws = getCached('weather-search-input');
    if (ws && t.weatherCitySearchPlaceholder) ws.placeholder = t.weatherCitySearchPlaceholder;
    const loc = getCached('weather-location-btn');
    if (loc && t.weatherGeoTitle) loc.title = t.weatherGeoTitle;

    const ns = getCached('news-search');
    if (ns && t.newsSearchPlaceholder) ns.placeholder = t.newsSearchPlaceholder;

    const ncs = getCached('news-category');
    if (ncs) {
        ncs.querySelectorAll('option[data-i18n-option]').forEach(opt => {
            const key = opt.dataset.i18nOption;
            if (t[key]) {
                // Используем перевод напрямую, так как он уже содержит эмодзи
                opt.textContent = t[key];
            }
        });
    }

    const nrb = getCached('news-refresh');
    if (nrb && t.newsRefresh) nrb.title = t.newsRefresh;
}

export const setLanguage = (lang, callback) => {
    if (!translations[lang] || Object.keys(translations[lang]).length === 0) {
        // If translations not loaded yet, wait a bit and try again
        setTimeout(() => {
            if (translations[lang] && Object.keys(translations[lang]).length > 0) {
                setLanguage(lang, callback);
            }
        }, 100);
        return;
    }
    currentLang = lang;
    localStorage.setItem('appLanguage', lang);
    document.documentElement.lang = lang;
    applyDynamicTranslations();
    if (callback) callback();
};
