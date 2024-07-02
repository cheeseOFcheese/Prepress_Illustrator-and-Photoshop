#target photoshop

var doc = app.activeDocument;

// Окно для настройки параметров
var dialog = new Window('dialog', 'Настройка линий и крестиков');
dialog.orientation = 'column';
dialog.alignChildren = 'left';

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
var opacityInput = opacityGroup.add('edittext', undefined, '25');
opacityInput.characters = 3;

// Добавление крестиков на пересечении
var crossCheckbox = dialog.add('checkbox', undefined, 'Добавить крестики на пересечении');
crossCheckbox.value = true;

// Кнопки OK и Отмена
var buttonGroup = dialog.add('group');
var okButton = buttonGroup.add('button', undefined, 'OK');
var cancelButton = buttonGroup.add('button', undefined, 'Отмена');

okButton.onClick = function() {
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
    var opacity = Math.max(0, Math.min(parseFloat(opacityInput.text), 100));
    addLayoutLines(padding, customPadding, topPadding, bottomPadding, leftPadding, rightPadding, addCross, lineWeight, crossSize, crossLineWeight, opacity);
    dialog.close();
};

cancelButton.onClick = function() {
    dialog.close();
};

dialog.show();

function addLayoutLines(padding, customPadding, topPadding, bottomPadding, leftPadding, rightPadding, addCross, lineWeight, crossSize, crossLineWeight, opacity) {
    var doc = app.activeDocument;
    var abBounds = [0, 0, doc.width.value, doc.height.value]; // Assuming single document without artboards

    // Создаем слои для линий и крестиков
    var linesLayer = doc.artLayers.add();
    linesLayer.name = "LayoutLines";
    linesLayer.opacity = opacity;

    var crossLayer = doc.artLayers.add();
    crossLayer.name = "Crosses";
    crossLayer.opacity = opacity;

    // Толщина линий в мм, переведенная в пиксели (1 мм = 2.83465 пикселя)
    var strokeWeight = lineWeight * 2.83465;

    if (customPadding) {
        // Используем индивидуальные отступы
        createLine([abBounds[0] + mmToPx(leftPadding), abBounds[1]], [abBounds[0] + mmToPx(leftPadding), abBounds[3]], strokeWeight, linesLayer);
        createLine([abBounds[2] - mmToPx(rightPadding), abBounds[1]], [abBounds[2] - mmToPx(rightPadding), abBounds[3]], strokeWeight, linesLayer);
        createLine([abBounds[0], abBounds[1] - mmToPx(topPadding)], [abBounds[2], abBounds[1] - mmToPx(topPadding)], strokeWeight, linesLayer);
        createLine([abBounds[0], abBounds[3] + mmToPx(bottomPadding)], [abBounds[2], abBounds[3] + mmToPx(bottomPadding)], strokeWeight, linesLayer);

        if (addCross) {
            addCrosses(abBounds, leftPadding, topPadding, rightPadding, bottomPadding, crossLayer, crossSize, crossLineWeight);
        }
    } else {
        // Используем одинаковые отступы для всех сторон
        createLine([abBounds[0] + mmToPx(padding), abBounds[1]], [abBounds[0] + mmToPx(padding), abBounds[3]], strokeWeight, linesLayer);
        createLine([abBounds[2] - mmToPx(padding), abBounds[1]], [abBounds[2] - mmToPx(padding), abBounds[3]], strokeWeight, linesLayer);
        createLine([abBounds[0], abBounds[1] - mmToPx(padding)], [abBounds[2], abBounds[1] - mmToPx(padding)], strokeWeight, linesLayer);
        createLine([abBounds[0], abBounds[3] + mmToPx(padding)], [abBounds[2], abBounds[3] + mmToPx(padding)], strokeWeight, linesLayer);

        if (addCross) {
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

function createLine(start, end, strokeWeight, layer) {
    var lineLayer = layer.artLayers.add();
    var linePath = doc.pathItems.add("Line", [start, end]);
    linePath.strokePath();
    linePath.strokeWidth = strokeWeight;

    var strokeColor = new SolidColor();
    strokeColor.rgb.red = 128;
    strokeColor.rgb.green = 128;
    strokeColor.rgb.blue = 128;
    linePath.strokeColor = strokeColor;

    linePath.filled = false;
}

function createCross(x, y, layer, crossSize, crossLineWeight) {
    var crossSizePt = crossSize * 2.83465;
    var strokeWeight = crossLineWeight * 2.83465;

    var group = layer.layerSets.add();

    createLine([x - crossSizePt, y], [x + crossSizePt, y], strokeWeight, group);
    createLine([x, y - crossSizePt], [x, y + crossSizePt], strokeWeight, group);
}

function mmToPx(mm) {
    return mm * 2.83465;
}
