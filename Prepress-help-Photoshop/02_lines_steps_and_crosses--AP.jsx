#target photoshop

var doc = app.activeDocument;

// Окно для настройки параметров
var dialog = new Window('dialog', 'Настройка линий и крестиков');
dialog.orientation = 'column';
dialog.alignChildren = 'left';

// Выбор артборда
var artboardGroup = dialog.add('group');
artboardGroup.add('statictext', undefined, 'Выберите артборд:');
var artboardDropdown = artboardGroup.add('dropdownlist');
for (var i = 0; i < doc.artboards.length; i++) {
    artboardDropdown.add('item', doc.artboards[i].name);
}
artboardDropdown.selection = 0; // По умолчанию выбираем первый артборд

// Ввод отступов
var paddingGroup = dialog.add('group');
paddingGroup.add('statictext', undefined, 'Введите отступы (в мм):');
var paddingInput = paddingGroup.add('edittext', undefined, '100');
paddingInput.characters = 5;

// Индивидуальный отступ
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

// Настройка толщины линии
var lineWeightGroup = dialog.add('group');
lineWeightGroup.add('statictext', undefined, 'Толщина линии (в мм):');
var lineWeightInput = lineWeightGroup.add('edittext', undefined, '2');
lineWeightInput.characters = 5;

// Настройка размера крестиков
var crossSizeGroup = dialog.add('group');
crossSizeGroup.add('statictext', undefined, 'Размер крестиков (в мм):');
var crossSizeInput = crossSizeGroup.add('edittext', undefined, '10');
crossSizeInput.characters = 5;

// Настройка толщины линий крестиков
var crossLineWeightGroup = dialog.add('group');
crossLineWeightGroup.add('statictext', undefined, 'Толщина линий крестиков (в мм):');
var crossLineWeightInput = crossLineWeightGroup.add('edittext', undefined, '2');
crossLineWeightInput.characters = 5;

// Настройка прозрачности
var opacityGroup = dialog.add('group');
opacityGroup.add('statictext', undefined, 'Введите прозрачность (в процентах, минимум 0%, максимум 100%):');
var opacityInput = opacityGroup.add('edittext', undefined, '25'); // Примерная прозрачность в процентах
opacityInput.characters = 3;

// Добавление крестиков на пересечении
var crossCheckbox = dialog.add('checkbox', undefined, 'Добавить крестики на пересечении');
crossCheckbox.value = true; // Включаем крестики по умолчанию

// Кнопки OK и Отмена
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
    var lineWeight = parseFloat(lineWeightInput.text) || 2;
    var crossSize = parseFloat(crossSizeInput.text) || 10;
    var crossLineWeight = parseFloat(crossLineWeightInput.text) || 2;
    var opacity = Math.max(0, Math.min(parseFloat(opacityInput.text), 100)); // Устанавливаем прозрачность от 0% до 100%
    addLayoutLines(selectedArtboardIndex, padding, customPadding, topPadding, bottomPadding, leftPadding, rightPadding, addCross, lineWeight, crossSize, crossLineWeight, opacity);
    dialog.close();
};

cancelButton.onClick = function() {
    dialog.close();
};

dialog.show();

function addLayoutLines(artboardIndex, padding, customPadding, topPadding, bottomPadding, leftPadding, rightPadding, addCross, lineWeight, crossSize, crossLineWeight, opacity) {
    var doc = app.activeDocument;
    doc.artboards.setActiveArtboardIndex(artboardIndex);
    var ab = doc.artboards[artboardIndex];
    var abBounds = ab.artboardRect; // [left, top, right, bottom]

    // Создаем слой для линий
    var linesLayer = doc.artLayers.add();
    linesLayer.name = "LayoutLines";
    linesLayer.opacity = opacity; // Устанавливаем прозрачность слоя линий

    // Создаем слой для крестиков
    var crossLayer = doc.artLayers.add();
    crossLayer.name = "Crosses";
    crossLayer.opacity = opacity; // Устанавливаем прозрачность слоя крестиков

    if (customPadding) {
        // Используем индивидуальные отступы
        createLine([abBounds[0] + mmToPx(leftPadding), abBounds[1]], [abBounds[0] + mmToPx(leftPadding), abBounds[3]], lineWeight, linesLayer);
        createLine([abBounds[2] - mmToPx(rightPadding), abBounds[1]], [abBounds[2] - mmToPx(rightPadding), abBounds[3]], lineWeight, linesLayer);
        createLine([abBounds[0], abBounds[1] - mmToPx(topPadding)], [abBounds[2], abBounds[1] - mmToPx(topPadding)], lineWeight, linesLayer);
        createLine([abBounds[0], abBounds[3] + mmToPx(bottomPadding)], [abBounds[2], abBounds[3] + mmToPx(bottomPadding)], lineWeight, linesLayer);

        if (addCross) {
            // Добавляем крестики на пересечениях
            addCrosses(abBounds, leftPadding, topPadding, rightPadding, bottomPadding, crossLayer, crossSize, crossLineWeight);
        }
    } else {
        // Используем одинаковые отступы для всех сторон
        createLine([abBounds[0] + mmToPx(padding), abBounds[1]], [abBounds[0] + mmToPx(padding), abBounds[3]], lineWeight, linesLayer);
        createLine([abBounds[2] - mmToPx(padding), abBounds[1]], [abBounds[2] - mmToPx(padding), abBounds[3]], lineWeight, linesLayer);
        createLine([abBounds[0], abBounds[1] - mmToPx(padding)], [abBounds[2], abBounds[1] - mmToPx(padding)], lineWeight, linesLayer);
        createLine([abBounds[0], abBounds[3] + mmToPx(padding)], [abBounds[2], abBounds[3] + mmToPx(padding)], lineWeight, linesLayer);

        if (addCross) {
            // Добавляем крестики на пересечениях
            addCrosses(abBounds, padding, padding, padding, padding, crossLayer, crossSize, crossLineWeight);
        }
    }
}

function addCrosses(abBounds, leftPadding, topPadding, rightPadding, bottomPadding, layer, crossSize, crossLineWeight) {
    createCross(abBounds[0] + mmToPx(leftPadding), abBounds[1] - mmToPx(topPadding), layer, crossSize, crossLineWeight);
    createCross(abBounds[0] + mmToPx(leftPadding), abBounds[3] + mmToPx(bottomPadding), layer, crossSize, crossLineWeight);
    createCross(abBounds[2] - mmToPx(rightPadding), abBounds[1] - mmToPx(topPadding), layer, crossSize, crossLineWeight);
    createCross(abBounds[2] - mmToPx(rightPadding), abBounds[3] + mmToPx(bottomPadding), layer, crossSize, crossLineWeight);
}

function createLine(start, end, lineWeight, layer) {
    var lineShape = layer.pathItems.add("Line", [start, end], mmToPx(lineWeight), "normal");
    lineShape.strokeWidth = mmToPx(lineWeight);
    lineShape.strokeColor = new SolidColor();
    lineShape.strokeColor.rgb.red = 0;
    lineShape.strokeColor.rgb.green = 0;
    lineShape.strokeColor.rgb.blue = 0;
}

function createCross(x, y, layer, crossSize, crossLineWeight) {
    // Размер крестика (половина размера одного сегмента в мм, переводим в пиксели)
    var crossSizePx = mmToPx(crossSize);
    var lineWeightPx = mmToPx(crossLineWeight);

    // Создаем горизонтальную линию крестика
    createLine([x - crossSizePx, y], [x + crossSizePx, y], lineWeightPx, layer);

    // Создаем вертикальную линию крестика
    createLine([x, y - crossSizePx], [x, y + crossSizePx], lineWeightPx, layer);
}

function mmToPx(mm) {
    return mm * 2.83465; // Перевод миллиметров в пиксели (пункты)
}
