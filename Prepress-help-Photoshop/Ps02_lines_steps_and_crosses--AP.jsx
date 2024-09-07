#target photoshop

// Функция для создания знака "+" в указанной позиции
function createPlus(x, y, size, opacity, plusGroup) {
    var doc = app.activeDocument;
    var textLayer = doc.artLayers.add();
    textLayer.kind = LayerKind.TEXT;
    textLayer.textItem.contents = "+";
    textLayer.textItem.size = new UnitValue(size, "mm");  // Размер знака в мм
    textLayer.textItem.position = [x, y];  // Позиционирование по координатам
    textLayer.opacity = opacity;  // Устанавливаем прозрачность
    textLayer.textItem.font = "ArialMT";  // Шрифт
    textLayer.textItem.justification = Justification.CENTER;
    textLayer.move(plusGroup, ElementPlacement.INSIDE);  // Помещаем слой в группу

    return textLayer;  // Возвращаем слой
}

// Функция для сдвига всей группы по осям X и Y
function moveGroup(group, size) {
    // Сдвиг по X и Y, заданный в дробных числах
    var shiftX = 0;  // Сдвиг по X на 0.5 высоты знака "+"
    var shiftY = 0.36; // Сдвиг по Y на 0.25 высоты знака "+"

    var xShift = size * shiftX;  // Рассчитываем сдвиг по X
    var yShift = size * shiftY;  // Рассчитываем сдвиг по Y
    group.translate(xShift, yShift);  // Сдвигаем группу
}

// Функция для размещения знаков "+" в углах документа
function placePlusInCorners(settings, offsets) {
    var doc = app.activeDocument;

    // Получаем размеры документа
    var docWidth = doc.width.as("mm");
    var docHeight = doc.height.as("mm");

    // Создаем группу для всех знаков "+"
    var plusGroup = doc.layerSets.add();
    plusGroup.name = "Plus Signs";

    // Размещаем знаки "+" в углах документа
    createPlus(offsets.left, offsets.top, settings.size, settings.opacity, plusGroup);  // Левый верхний угол
    createPlus(docWidth - offsets.right, offsets.top, settings.size, settings.opacity, plusGroup);  // Правый верхний угол
    createPlus(offsets.left, docHeight - offsets.bottom, settings.size, settings.opacity, plusGroup);  // Левый нижний угол
    createPlus(docWidth - offsets.right, docHeight - offsets.bottom, settings.size, settings.opacity, plusGroup);  // Правый нижний угол

    // Сдвигаем группу по осям X и Y
    moveGroup(plusGroup, settings.size);
}

// Функция для отображения графического интерфейса и получения настроек от пользователя
function showPlusDialog() {
    var doc = app.activeDocument;

    // Получаем свойства документа
    var docName = doc.name;
    var docWidth = Math.round(doc.width.as("mm"));
    var docHeight = Math.round(doc.height.as("mm"));
    var docResolution = doc.resolution;

    var dialog = new Window('dialog', 'Настройки знаков "+"');
    dialog.orientation = 'column';

    // Группа для отображения свойств документа
    var docPropsGroup = dialog.add('panel', undefined, 'Свойства документа');
    docPropsGroup.orientation = 'column';
    docPropsGroup.alignment = 'fill';

    docPropsGroup.add("statictext", undefined, "Название документа: " + docName);
    docPropsGroup.add("statictext", undefined, "Ширина (мм): " + docWidth);
    docPropsGroup.add("statictext", undefined, "Высота (мм): " + docHeight);
    docPropsGroup.add("statictext", undefined, "Разрешение (dpi): " + docResolution);

    // Панель для ввода отступов
    var offsetGroup = dialog.add('panel', undefined, 'Отступы (мм)');
    offsetGroup.orientation = 'column';

    var uniformOffset = dialog.add('checkbox', undefined, 'Одинаковые отступы для всех сторон');
    uniformOffset.value = true;  // По умолчанию одинаковые отступы

    var offsetInput = offsetGroup.add('edittext', undefined, '150');  // Поле ввода одинакового отступа (дефолт 150 мм)
    offsetInput.characters = 5;

    // Поля для индивидуальных отступов
    var leftOffsetInput = offsetGroup.add('edittext', undefined, '150');
    leftOffsetInput.characters = 5;
    var rightOffsetInput = offsetGroup.add('edittext', undefined, '150');
    rightOffsetInput.characters = 5;
    var topOffsetInput = offsetGroup.add('edittext', undefined, '150');
    topOffsetInput.characters = 5;
    var bottomOffsetInput = offsetGroup.add('edittext', undefined, '150');
    bottomOffsetInput.characters = 5;

    // Показываем/скрываем поля для индивидуальных отступов в зависимости от выбора
    function toggleIndividualOffsets(enabled) {
        leftOffsetInput.enabled = rightOffsetInput.enabled = topOffsetInput.enabled = bottomOffsetInput.enabled = enabled;
        offsetInput.enabled = !enabled;
    }

    toggleIndividualOffsets(false);

    uniformOffset.onClick = function () {
        toggleIndividualOffsets(!uniformOffset.value);
    };

    // Панель для ввода размера знаков "+"
    var sizeGroup = dialog.add('panel', undefined, 'Размер знаков "+" (мм)');
    sizeGroup.orientation = 'column';
    var sizeInput = sizeGroup.add('edittext', undefined, '10');  // Дефолтный размер знака 10 мм
    sizeInput.characters = 5;

    // Панель для настройки прозрачности
    var opacityGroup = dialog.add('panel', undefined, 'Прозрачность (%)');
    opacityGroup.orientation = 'column';
    var opacitySlider = opacityGroup.add('slider', undefined, 50, 0, 100);  // Дефолтная прозрачность 50%
    opacitySlider.preferredSize.width = 150;
    var opacityValue = opacityGroup.add('edittext', undefined, '50');
    opacityValue.characters = 4;

    // Обновление значения при изменении ползунка
    opacitySlider.onChanging = function () {
        opacityValue.text = Math.round(opacitySlider.value);
    };
    opacityValue.onChange = function () {
        var val = parseFloat(opacityValue.text);  // Преобразуем в дробное число
        if (!isNaN(val) && val >= 0 && val <= 100) {  // Проверка корректности значения
            opacitySlider.value = val;
        }
    };

    // Кнопки OK и Cancel
    var buttonGroup = dialog.add('group');
    buttonGroup.add('button', undefined, 'Cancel', { name: 'cancel' });
    var okButton = buttonGroup.add('button', undefined, 'OK', { name: 'ok' });

    okButton.onClick = function () {
        dialog.close(1);
    };

    if (dialog.show() == 1) {
        return {
            uniformOffset: uniformOffset.value,
            offset: parseFloat(offsetInput.text),  // Преобразуем отступ в дробное число
            individualOffsets: {
                left: parseFloat(leftOffsetInput.text),
                right: parseFloat(rightOffsetInput.text),
                top: parseFloat(topOffsetInput.text),
                bottom: parseFloat(bottomOffsetInput.text)
            },
            size: parseFloat(sizeInput.text),  // Преобразуем размер в дробное число
            opacity: parseFloat(opacitySlider.value)  // Преобразуем прозрачность в дробное число
        };
    } else {
        return null;
    }
}

// Основная функция скрипта
function main() {
    var userSettings = showPlusDialog();  // Получаем настройки от пользователя

    if (userSettings !== null) {
        var offsets = {};

        if (userSettings.uniformOffset) {
            offsets = {
                top: userSettings.offset,
                bottom: userSettings.offset,
                left: userSettings.offset,
                right: userSettings.offset
            };
        } else {
            offsets = userSettings.individualOffsets;
        }

        placePlusInCorners(userSettings, offsets);  // Размещаем знаки "+"

        alert('Знаки "+" успешно добавлены.');
    }
}

// Запуск скрипта
main();
