#target photoshop

// Функция для создания текста в каждом углу документа с отступом в 10 мм
function placeTextInCorners(settings, offset) {
    var doc = app.activeDocument;

    // Сохраняем текущие настройки единиц измерения
    var originalRulerUnits = app.preferences.rulerUnits;

    // Устанавливаем единицы измерения в миллиметры
    app.preferences.rulerUnits = Units.MM;

    // Получаем размеры документа и округляем их до целых чисел
    var docWidth = Math.round(doc.width.as("mm"));
    var docHeight = Math.round(doc.height.as("mm"));

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

        // Устанавливаем непрозрачность текста
        textLayer.opacity = settings.opacity;

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

// Функция для отображения UI и получения настроек от пользователя
function showCombinedDialog(defaultText, defaultFontSize, defaultOpacity) {
    var doc = app.activeDocument;

    // Получаем свойства документа и округляем размеры до целых
    var docName = doc.name;
    var docWidth = Math.round(doc.width.as("mm"));
    var docHeight = Math.round(doc.height.as("mm"));
    var docResolution = doc.resolution;

    // Создаем окно для настроек текста и отображения свойств документа
    var dialog = new Window('dialog', 'Свойства документа и настройки текста');
    dialog.orientation = 'column';

    // Группа для отображения свойств документа
    var docPropsGroup = dialog.add('panel', undefined, 'Свойства документа');
    docPropsGroup.orientation = 'column';
    docPropsGroup.alignment = 'fill';

    docPropsGroup.add("statictext", undefined, "Название документа: " + docName);
    docPropsGroup.add("statictext", undefined, "Ширина (мм): " + docWidth);
    docPropsGroup.add("statictext", undefined, "Высота (мм): " + docHeight);
    docPropsGroup.add("statictext", undefined, "Разрешение (dpi): " + docResolution);

    // Группа для ввода текста и размера шрифта
    var textSettingsGroup = dialog.add('panel', undefined, 'Настройки текста');
    textSettingsGroup.orientation = 'column';
    textSettingsGroup.alignment = 'fill';

    var textGroup = textSettingsGroup.add('group');
    textGroup.add('statictext', undefined, 'Введите текст:');
    var textInput = textGroup.add('edittext', undefined, defaultText);
    textInput.characters = 30;

    var fontSizeGroup = textSettingsGroup.add('group');
    fontSizeGroup.add('statictext', undefined, 'Высота текста (мм):');
    var fontSizeInput = fontSizeGroup.add('edittext', undefined, defaultFontSize);
    fontSizeInput.characters = 5;

    var arrowGroup = textSettingsGroup.add('group');
    var arrowCheckbox = arrowGroup.add('checkbox', undefined, 'Добавить стрелку перед текстом');
    arrowCheckbox.value = true; // по умолчанию стрелка включена

    // Группа для настройки прозрачности текста
    var opacityGroup = textSettingsGroup.add('group');
    opacityGroup.add('statictext', undefined, 'Прозрачность текста:');

    var opacitySlider = opacityGroup.add('slider', undefined, defaultOpacity, 0, 100);
    opacitySlider.preferredSize.width = 150;

    var opacityValue = opacityGroup.add('edittext', undefined, defaultOpacity);
    opacityValue.characters = 4;

    // Обновляем значение прозрачности при изменении ползунка
    opacitySlider.onChanging = function() {
        opacityValue.text = Math.round(opacitySlider.value);
    };
    opacityValue.onChange = function() {
        var val = parseInt(opacityValue.text);
        if (!isNaN(val) && val >= 0 && val <= 100) {
            opacitySlider.value = val;
        }
    };

    // Кнопки OK и Cancel
    var buttonGroup = dialog.add('group');
    buttonGroup.alignment = 'right';
    buttonGroup.add('button', undefined, 'Cancel', {name: 'cancel'});
    var okButton = buttonGroup.add('button', undefined, 'OK', {name: 'ok'});

    // Обработка нажатия OK
    okButton.onClick = function() {
        dialog.close(1); // Закрываем окно с кодом 1 (OK)
    };

    if (dialog.show() == 1) {
        return {
            text: arrowCheckbox.value ? "↑ " + textInput.text : textInput.text,
            fontSize: parseFloat(fontSizeInput.text),
            opacity: parseFloat(opacitySlider.value) // значение прозрачности
        };
    } else {
        return null;
    }
}

// Основная функция скрипта
function main() {
    var doc = app.activeDocument;

    // Получаем имя файла по умолчанию
    var defaultText = doc.name;
    var defaultFontSize = 10; // по умолчанию высота текста 10 мм
    var defaultOpacity = 50;  // по умолчанию прозрачность 50%

    // Получаем настройки от пользователя и отображаем свойства документа
    var userSettings = showCombinedDialog(defaultText, defaultFontSize, defaultOpacity);

    if (userSettings !== null) {
        // Размещаем текст в каждом углу с отступом 10 мм
        placeTextInCorners(userSettings, 10);
        alert("Текст расставлен в углах документа.");
    }
}

// Запуск основной функции
main();
