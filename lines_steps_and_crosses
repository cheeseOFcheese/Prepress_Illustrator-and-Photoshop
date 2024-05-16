var doc = app.activeDocument;

// Окно для выбора артборда
var dialog = new Window('dialog', 'Настройка линий');
dialog.orientation = 'column';
dialog.alignChildren = 'left';

var artboardGroup = dialog.add('group');
artboardGroup.add('statictext', undefined, 'Выберите артборд:');
var artboardDropdown = artboardGroup.add('dropdownlist');
for (var i = 0; i < doc.artboards.length; i++) {
    artboardDropdown.add('item', doc.artboards[i].name);
}
artboardDropdown.selection = 0; // По умолчанию выбираем первый артборд

var paddingGroup = dialog.add('group');
paddingGroup.add('statictext', undefined, 'Введите отступы (в мм):');
var paddingInput = paddingGroup.add('edittext', undefined, '100');
paddingInput.characters = 5;

var customPaddingCheckbox = dialog.add('checkbox', undefined, 'Индивидуальный отступ');

var customPaddingGroup = dialog.add('group');
customPaddingGroup.orientation = 'column';
customPaddingGroup.alignChildren = 'left';
customPaddingGroup.enabled = false;

var topPaddingGroup = customPaddingGroup.add('group');
topPaddingGroup.add('statictext', undefined, 'Верхний отступ:');
var topPaddingInput = topPaddingGroup.add('edittext', undefined, '100');
topPaddingInput.characters = 5;

var bottomPaddingGroup = customPaddingGroup.add('group');
bottomPaddingGroup.add('statictext', undefined, 'Нижний отступ:');
var bottomPaddingInput = bottomPaddingGroup.add('edittext', undefined, '100');
bottomPaddingInput.characters = 5;

var leftPaddingGroup = customPaddingGroup.add('group');
leftPaddingGroup.add('statictext', undefined, 'Левый отступ:');
var leftPaddingInput = leftPaddingGroup.add('edittext', undefined, '100');
leftPaddingInput.characters = 5;

var rightPaddingGroup = customPaddingGroup.add('group');
rightPaddingGroup.add('statictext', undefined, 'Правый отступ:');
var rightPaddingInput = rightPaddingGroup.add('edittext', undefined, '100');
rightPaddingInput.characters = 5;

customPaddingCheckbox.onClick = function() {
    customPaddingGroup.enabled = this.value;
    paddingGroup.enabled = !this.value;
};

var crossCheckbox = dialog.add('checkbox', undefined, 'Добавить крестики на пересечении');
crossCheckbox.value = true; // Включаем крестики по умолчанию

var buttonGroup = dialog.add('group');
var okButton = buttonGroup.add('button', undefined, 'OK');
var cancelButton = buttonGroup.add('button', undefined, 'Отмена');

okButton.onClick = function() {
    var selectedArtboardIndex = artboardDropdown.selection.index;
    var padding = parseFloat(paddingInput.text) || 0;
    var customPadding = customPaddingCheckbox.value;
    var topPadding = parseFloat(topPaddingInput.text) || 0;
    var bottomPadding = parseFloat(bottomPaddingInput.text) || 0;
    var leftPadding = parseFloat(leftPaddingInput.text) || 0;
    var rightPadding = parseFloat(rightPaddingInput.text) || 0;
    var addCross = crossCheckbox.value;
    addLayoutLines(selectedArtboardIndex, padding, customPadding, topPadding, bottomPadding, leftPadding, rightPadding, addCross);
    dialog.close();
};

cancelButton.onClick = function() {
    dialog.close();
};

dialog.show();

function addLayoutLines(artboardIndex, padding, customPadding, topPadding, bottomPadding, leftPadding, rightPadding, addCross) {
    var doc = app.activeDocument;
    doc.artboards.setActiveArtboardIndex(artboardIndex);
    var ab = doc.artboards[artboardIndex];
    var abBounds = ab.artboardRect; // [left, top, right, bottom]

    // Создаем векторные линии
    var linesLayer = doc.layers.add();
    linesLayer.name = "LayoutLines";
    var crossLayer = doc.layers.add();
    crossLayer.name = "Crosses";

    // Толщина линий в мм, переведенная в пиксели (1 мм = 2.83465 пикселя)
    var strokeWeight = 2 * 2.83465;

    if (customPadding) {
        // Используем индивидуальные отступы
        createLine([abBounds[0] + mmToPt(leftPadding), abBounds[1]], [abBounds[0] + mmToPt(leftPadding), abBounds[3]], strokeWeight, linesLayer, 'gray');
        createLine([abBounds[2] - mmToPt(rightPadding), abBounds[1]], [abBounds[2] - mmToPt(rightPadding), abBounds[3]], strokeWeight, linesLayer, 'gray');
        createLine([abBounds[0], abBounds[1] - mmToPt(topPadding)], [abBounds[2], abBounds[1] - mmToPt(topPadding)], strokeWeight, linesLayer, 'gray');
        createLine([abBounds[0], abBounds[3] + mmToPt(bottomPadding)], [abBounds[2], abBounds[3] + mmToPt(bottomPadding)], strokeWeight, linesLayer, 'gray');

        if (addCross) {
            // Добавляем крестики на пересечениях
            addCrosses(abBounds, leftPadding, topPadding, rightPadding, bottomPadding, crossLayer);
        }
    } else {
        // Используем одинаковые отступы для всех сторон
        createLine([abBounds[0] + mmToPt(padding), abBounds[1]], [abBounds[0] + mmToPt(padding), abBounds[3]], strokeWeight, linesLayer, 'gray');
        createLine([abBounds[2] - mmToPt(padding), abBounds[1]], [abBounds[2] - mmToPt(padding), abBounds[3]], strokeWeight, linesLayer, 'gray');
        createLine([abBounds[0], abBounds[1] - mmToPt(padding)], [abBounds[2], abBounds[1] - mmToPt(padding)], strokeWeight, linesLayer, 'gray');
        createLine([abBounds[0], abBounds[3] + mmToPt(padding)], [abBounds[2], abBounds[3] + mmToPt(padding)], strokeWeight, linesLayer, 'gray');

        if (addCross) {
            // Добавляем крестики на пересечениях
            addCrosses(abBounds, padding, padding, padding, padding, crossLayer);
        }
    }
}

function addCrosses(abBounds, leftPadding, topPadding, rightPadding, bottomPadding, layer) {
    createCross(abBounds[0] + mmToPt(leftPadding), abBounds[1] - mmToPt(topPadding), layer);
    createCross(abBounds[0] + mmToPt(leftPadding), abBounds[3] + mmToPt(bottomPadding), layer);
    createCross(abBounds[2] - mmToPt(rightPadding), abBounds[1] - mmToPt(topPadding), layer);
    createCross(abBounds[2] - mmToPt(rightPadding), abBounds[3] + mmToPt(bottomPadding), layer);
}

function createLine(start, end, strokeWeight, layer, color) {
    var pathItem = layer.pathItems.add();
    pathItem.setEntirePath([start, end]);
    pathItem.strokeWidth = strokeWeight;

    var strokeColor = new RGBColor();
    if (color === 'gray') {
        strokeColor.red = 128;
        strokeColor.green = 128;
        strokeColor.blue = 128;
    } else {
        strokeColor.red = 0;
        strokeColor.green = 0;
        strokeColor.blue = 0;
    }
    pathItem.strokeColor = strokeColor;

    pathItem.filled = false;
}

function createCross(x, y, layer) {
    // Размер крестика (половина размера одного сегмента в мм, переводим в пиксели)
    var crossSize = 10 * 2.83465;
    var strokeWeight = 2 * 2.83465; // Толщина линии крестика в мм

    // Создаем группу для крестика
    var group = layer.groupItems.add();

    // Создаем горизонтальную линию крестика
    createLine([x - crossSize, y], [x + crossSize, y], strokeWeight, group, 'black');

    // Создаем вертикальную линию крестика
    createLine([x, y - crossSize], [x, y + crossSize], strokeWeight, group, 'black');
}

function mmToPt(mm) {
    return mm * 2.83465; // Перевод миллиметров в пиксели (пункты)
}
