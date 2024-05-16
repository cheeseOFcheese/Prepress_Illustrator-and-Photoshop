// Показываем диалоговое окно для выбора параметров
var dialog = new Window('dialog', 'Настройки текста');
dialog.orientation = 'column';
dialog.alignChildren = 'left';

var doc = app.activeDocument;
var artboardIndex = 0; // Индекс выбранного артборда по умолчанию
var textItems = []; // Список для хранения текстовых объектов

// Добавляем выпадающий список артбордов, только если их больше одного
if (doc.artboards.length > 1) {
    var artboardGroup = dialog.add('group');
    artboardGroup.add('statictext', undefined, 'Выберите артборд:');
    var artboardDropdown = artboardGroup.add('dropdownlist');
    for (var i = 0; i < doc.artboards.length; i++) {
        var item = artboardDropdown.add('item', doc.artboards[i].name);
        item.artboardIndex = i;
    }
    artboardDropdown.selection = 0; // По умолчанию выбираем первый артборд
    artboardDropdown.onChange = function() {
        artboardIndex = this.selection.artboardIndex;
    };
}

// Чекбокс для добавления стрелок
var arrowCheckbox = dialog.add('checkbox', undefined, 'Добавить стрелки');

// Создаем группу чекбоксов для выбора сторон
var sidesGroup = dialog.add('panel', undefined, 'Выберите позиции для текста:');
sidesGroup.orientation = 'column';
sidesGroup.alignChildren = 'left';
var topLeftCheckbox = sidesGroup.add('checkbox', undefined, 'Лево Верх');
var bottomLeftCheckbox = sidesGroup.add('checkbox', undefined, 'Лево Низ');
var topRightCheckbox = sidesGroup.add('checkbox', undefined, 'Право Верх');
var bottomRightCheckbox = sidesGroup.add('checkbox', undefined, 'Право Низ');

var sizeGroup = dialog.add('group');
sizeGroup.add('statictext', undefined, 'Введите размер шрифта (в миллиметрах):');
var sizeInput = sizeGroup.add('edittext', undefined, '4.23'); // Примерный размер в мм
sizeInput.characters = 5;

var buttonGroup = dialog.add('group');
var okButton = buttonGroup.add('button', undefined, 'OK');
var cancelButton = buttonGroup.add('button', undefined, 'Отмена');

okButton.onClick = function() {
    var fontSizeMm = parseFloat(sizeInput.text);
    var fontSizePt = fontSizeMm * 2.83465; // Конвертация мм в пункты

    // Установка активного артборда
    doc.artboards.setActiveArtboardIndex(artboardIndex);

    // Получаем активный артборд
    var activeArtboard = doc.artboards[artboardIndex];
    var artboardBounds = activeArtboard.artboardRect; // Границы артборда

    // Обрабатываем каждый выбранный чекбокс
    if (topLeftCheckbox.value) {
        textItems.push(createTextAtCorner('topLeft', fontSizePt, artboardBounds));
    }
    if (bottomLeftCheckbox.value) {
        textItems.push(createTextAtCorner('bottomLeft', fontSizePt, artboardBounds));
    }
    if (topRightCheckbox.value) {
        textItems.push(createTextAtCorner('topRight', fontSizePt, artboardBounds));
    }
    if (bottomRightCheckbox.value) {
        textItems.push(createTextAtCorner('bottomRight', fontSizePt, artboardBounds));
    }

    // Создаем группу и добавляем все текстовые объекты в нее
    var group = doc.groupItems.add();
    group.name = "text_artboard";
    for (var j = 0; j < textItems.length; j++) {
        textItems[j].move(group, ElementPlacement.INSIDE);
    }

    dialog.close();
};

cancelButton.onClick = function() {
    dialog.close();
};

dialog.show();

// Функция для создания и перемещения текста
function createTextAtCorner(corner, fontSizePt, bounds) {
    var text = doc.textFrames.add();
    text.textRange.characterAttributes.textFont = app.textFonts.getByName("Impact"); // Установка шрифта "Impact"
    var arrow = arrowCheckbox.value ? " ↑ " : "";
    switch (corner) {
        case 'topLeft':
            text.contents = arrow + "   " + doc.name; // Добавляем стрелку перед текстом
            text.left = bounds[0];
            text.top = bounds[1] - text.height;
            break;
        case 'bottomLeft':
            text.contents = arrow + "   " + doc.name; // Добавляем стрелку перед текстом
            text.left = bounds[0];
            text.top = bounds[3];
            break;
        case 'topRight':
            text.contents = doc.name + "   " + arrow; // Добавляем стрелку после текста
            text.left = bounds[2] - text.width;
            text.top = bounds[1] - text.height;
            break;
        case 'bottomRight':
            text.contents = doc.name + "   " + arrow; // Добавляем стрелку после текста
            text.left = bounds[2] - text.width;
            text.top = bounds[3];
            break;
    }
    text.position = [text.left, text.top];
    // Перемещаем текст на высоту самого текста вверх
    text.top += text.height;

    return text; // Возвращаем текстовый объект для добавления в группу
}
