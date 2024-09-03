#target photoshop

// Функция для вычисления размеров документа в миллиметрах
function calculateDocumentSizeInMM(doc) {
    var dpi = Math.round(doc.resolution); // Получаем и округляем DPI документа

    // Получаем размеры в пикселях
    var widthPx = doc.width.as("px");
    var heightPx = doc.height.as("px");

    // Рассчитываем размеры в миллиметрах
    var widthMM = (widthPx / dpi) * 25.4; // 1 дюйм = 25.4 мм
    var heightMM = (heightPx / dpi) * 25.4;

    // Определяем цветовое пространство
    var colorMode;
    switch (doc.mode) {
        case DocumentMode.RGB:
            colorMode = "RGB";
            break;
        case DocumentMode.CMYK:
            colorMode = "CMYK";
            break;
        case DocumentMode.GRAYSCALE:
            colorMode = "Grayscale";
            break;
        case DocumentMode.BITMAP:
            colorMode = "Bitmap";
            break;
        case DocumentMode.LAB:
            colorMode = "Lab";
            break;
        case DocumentMode.INDEXEDCOLOR:
            colorMode = "Indexed Color";
            break;
        case DocumentMode.MULTICHANNEL:
            colorMode = "Multichannel";
            break;
        default:
            colorMode = "Unknown";
    }

    // Получаем цветовой профиль
    var colorProfile = doc.colorProfileName || "Нет профиля";

    return {
        width: widthMM,
        height: heightMM,
        dpi: dpi,
        colorMode: colorMode,
        colorProfile: colorProfile
    };
}

// Функция для отображения UI с информацией о размере документа и цветовом профиле
function showDocumentSizeInfo(sizeInfo, title) {
    var infoDialog = new Window('dialog', title);
    infoDialog.orientation = 'column';

    var sizeText = "Размер документа:\n" +
                   "Ширина: " + sizeInfo.width.toFixed(2) + " мм\n" +
                   "Высота: " + sizeInfo.height.toFixed(2) + " мм\n" +
                   "DPI: " + sizeInfo.dpi + "\n" +
                   "Цветовое пространство: " + sizeInfo.colorMode + "\n" +
                   "Цветовой профиль: " + sizeInfo.colorProfile;

    infoDialog.add('statictext', undefined, sizeText, {multiline: true});

    var buttonGroup = infoDialog.add('group');
    buttonGroup.alignment = 'center';
    buttonGroup.add('button', undefined, 'OK', {name: 'ok'});

    infoDialog.show();
}

// Основная функция скрипта
function main() {
    var doc = app.activeDocument;

    // Рассчитываем размеры документа с учетом цветового пространства и профиля
    var sizeInfo = calculateDocumentSizeInMM(doc);

    // Выводим информацию о размере документа и цветовом профиле в начале
    showDocumentSizeInfo(sizeInfo, 'Информация о документе (начало)');

    // Получаем имя файла
    var defaultText = doc.name;

    // Добавляем "↑" перед именем файла, если включен чекбокс
    var defaultFontSize = 10; // по умолчанию высота текста 10 мм

    // Получаем настройки от пользователя
    var userSettings = getTextSettings(defaultText, defaultFontSize);

    if (userSettings !== null) {
        // Удаляем цветовой профиль, если выбран соответствующий чекбокс
        if (userSettings.removeProfile) {
            doc.convertProfile("", Intent.PERCEPTUAL, true, true); // удаление цветового профиля
            sizeInfo.colorProfile = "Нет профиля";
        }

        // Если пользователь хочет добавить стрелку, добавляем ее перед текстом
        if (userSettings.addArrow) {
            userSettings.text = "↑ " + userSettings.text;
        }

        // Размещаем текст в каждом углу с отступом 10 мм
        placeTextInCorners(userSettings, 10);

        // Показ UI сообщения о завершении работы скрипта с информацией о документе
        alert("Стрелки и надписи расставлены\n\n" +
              "Размер документа: " + sizeInfo.width.toFixed(2) + " мм x " +
              sizeInfo.height.toFixed(2) + " мм\n" +
              "DPI: " + sizeInfo.dpi + "\n" +
              "Цветовое пространство: " + sizeInfo.colorMode + "\n" +
              "Цветовой профиль: " + sizeInfo.colorProfile);

        // Повторный вывод информации о размере документа и цветовом профиле в конце
        showDocumentSizeInfo(sizeInfo, 'Информация о документе (конец)');
    }
}

// Функция для отображения UI и получения настроек от пользователя
function getTextSettings(defaultText, defaultFontSize) {
    var dialog = new Window('dialog', 'Настройки текста');
    dialog.orientation = 'column';

    var textGroup = dialog.add('group');
    textGroup.add('statictext', undefined, 'Введите текст:');
    var textInput = textGroup.add('edittext', undefined, defaultText);
    textInput.characters = 30;

    var fontSizeGroup = dialog.add('group');
    fontSizeGroup.add('statictext', undefined, 'Высота текста (мм):');
    var fontSizeInput = fontSizeGroup.add('edittext', undefined, defaultFontSize);
    fontSizeInput.characters = 5;

    var arrowGroup = dialog.add('group');
    var arrowCheckbox = arrowGroup.add('checkbox', undefined, 'Добавить стрелку перед текстом');
    arrowCheckbox.value = true; // по умолчанию стрелка включена

    var profileGroup = dialog.add('group');
    var removeProfileCheckbox = profileGroup.add('checkbox', undefined, 'Удалить цветовой профиль');

    var buttonGroup = dialog.add('group');
    buttonGroup.alignment = 'right';
    buttonGroup.add('button', undefined, 'OK');
    buttonGroup.add('button', undefined, 'Cancel', {name: 'cancel'});

    if (dialog.show() == 1) {
        return {
            text: textInput.text,
            fontSize: parseFloat(fontSizeInput.text),
            addArrow: arrowCheckbox.value,
            removeProfile: removeProfileCheckbox.value
        };
    } else {
        return null;
    }
}

// Функция для создания текста в каждом углу документа с отступом в 10 мм
function placeTextInCorners(settings, offset) {
    var doc = app.activeDocument;

    // Сохраняем текущие настройки единиц измерения
    var originalRulerUnits = app.preferences.rulerUnits;

    // Устанавливаем единицы измерения в миллиметры
    app.preferences.rulerUnits = Units.MM;

    // Получаем размеры документа
    var docWidth = doc.width.as("mm");
    var docHeight = doc.height.as("mm");

    // Создаем папку для текстовых слоев
    var textGroup = doc.layerSets.add();
    textGroup.name = "↑_text";

    // Функция для создания текстового слоя в указанной позиции
    function createTextLayer(x, y, justification) {
        var textLayer = doc.artLayers.add();
        textLayer.kind = LayerKind.TEXT;
        textLayer.textItem.contents = settings.text;
        textLayer.textItem.size = new UnitValue(settings.fontSize, "mm"); // размер текста в мм
        textLayer.textItem.justification = justification;

        // Установка шрифта Arial
        textLayer.textItem.font = "ArialMT"; // Для обычного Arial используем "ArialMT"

        // Устанавливаем позицию текста
        textLayer.textItem.position = [x, y];

        // Устанавливаем непрозрачность текста на 50%
        textLayer.opacity = 50;

        // Перемещаем текстовый слой в папку
        textLayer.move(textGroup, ElementPlacement.INSIDE);
    }

    // Левый верхний угол
    createTextLayer(offset, offset, Justification.LEFT);

    // Правый верхний угол
    createTextLayer(docWidth - offset, offset, Justification.RIGHT);

    // Левый нижний угол
    createTextLayer(offset, docHeight - offset, Justification.LEFT);

    // Правый нижний угол
    createTextLayer(docWidth - offset, docHeight - offset, Justification.RIGHT);

    // Восстанавливаем исходные настройки единиц измерения
    app.preferences.rulerUnits = originalRulerUnits;
}

// Запуск основной функции
main();
