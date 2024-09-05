var doc = app.activeDocument;

// Функция для перевода пикселей в миллиметры
function ptToMm(pt) {
    return pt / 2.83465;
}

// Функция для перевода миллиметров в пиксели
function mmToPt(mm) {
    return mm * 2.83465; // Перевод миллиметров в пиксели (пункты)
}

// Окно для настройки параметров
var dialog = new Window('dialog', 'Настройка линий и крестиков');
dialog.orientation = 'column';
dialog.alignChildren = 'left';

// Показ размера артборда в мм
var artboardSizeGroup = dialog.add('group');
artboardSizeGroup.add('statictext', undefined, 'Размер артборда (мм):');
var ab = doc.artboards[doc.artboards.getActiveArtboardIndex()];
var abBounds = ab.artboardRect; // [left, top, right, bottom]
var abWidth = Math.abs(ptToMm(abBounds[2] - abBounds[0])).toFixed(0); // Ширина артборда
var abHeight = Math.abs(ptToMm(abBounds[1] - abBounds[3])).toFixed(0); // Высота артборда
artboardSizeGroup.add('statictext', undefined, abWidth + ' мм x ' + abHeight + ' мм');

// Показ цветового пространства документа
var colorSpaceGroup = dialog.add('group');
colorSpaceGroup.add('statictext', undefined, 'Цветовое пространство документа:');
var colorSpace = doc.documentColorSpace; // Возвращает 'RGB' или 'CMYK'
colorSpaceGroup.add('statictext', undefined, colorSpace);

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
var paddingInput = paddingGroup.add('edittext', undefined, '150');
paddingInput.characters = 5;

// Индивидуальный отступ
var customPaddingCheckbox = dialog.add('checkbox', undefined, 'Индивидуальный отступ');

var customPaddingGroup = dialog.add('group');
customPaddingGroup.orientation = 'column';
customPaddingGroup.alignChildren = 'left';
customPaddingGroup.enabled = false;

var topPaddingGroup = customPaddingGroup.add('group');
topPaddingGroup.add('statictext', undefined, 'Верхний отступ:');
var topPaddingInput = topPaddingGroup.add('edittext', undefined, '150');
topPaddingInput.characters = 5;

var bottomPaddingGroup = customPaddingGroup.add('group');
bottomPaddingGroup.add('statictext', undefined, 'Нижний отступ:');
var bottomPaddingInput = bottomPaddingGroup.add('edittext', undefined, '150');
bottomPaddingInput.characters = 5;

var leftPaddingGroup = customPaddingGroup.add('group');
leftPaddingGroup.add('statictext', undefined, 'Левый отступ:');
var leftPaddingInput = leftPaddingGroup.add('edittext', undefined, '150');
leftPaddingInput.characters = 5;

var rightPaddingGroup = customPaddingGroup.add('group');
rightPaddingGroup.add('statictext', undefined, 'Правый отступ:');
var rightPaddingInput = rightPaddingGroup.add('edittext', undefined, '150');
rightPaddingInput.characters = 5;

customPaddingCheckbox.onClick = function() {
    customPaddingGroup.enabled = this.value;
    paddingGroup.enabled = !this.value;
};

// Настройка толщины линии (по умолчанию 2 мм)
var lineWeightGroup = dialog.add('group');
lineWeightGroup.add('statictext', undefined, 'Толщина линии (в мм):');
var lineWeightInput = lineWeightGroup.add('edittext', undefined, '2'); // Значение по умолчанию 2 мм
lineWeightInput.characters = 5;

// Настройка размера крестиков (по умолчанию 10 мм)
var crossSizeGroup = dialog.add('group');
crossSizeGroup.add('statictext', undefined, 'Размер крестиков (в мм):');
var crossSizeInput = crossSizeGroup.add('edittext', undefined, '10'); // Значение по умолчанию 10 мм
crossSizeInput.characters = 5;

// Настройка толщины линий крестиков (по умолчанию 2 мм)
var crossLineWeightGroup = dialog.add('group');
crossLineWeightGroup.add('statictext', undefined, 'Толщина линий крестиков (в мм):');
var crossLineWeightInput = crossLineWeightGroup.add('edittext', undefined, '2'); // Значение по умолчанию 2 мм
crossLineWeightInput.characters = 5;

// Настройка прозрачности линий и крестиков (по умолчанию 50%)
var opacityGroup = dialog.add('group');
opacityGroup.add('statictext', undefined, 'Прозрачность (в %):');
var opacitySlider = opacityGroup.add('slider', undefined, 50, 0, 100); // По умолчанию 50% прозрачности
var opacityValue = opacityGroup.add('statictext', undefined, '50%');
opacitySlider.onChanging = function() {
    opacityValue.text = Math.round(opacitySlider.value) + '%';
};

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
    var lineWeight = parseFloat(lineWeightInput.text) || 2; // Толщина линий, по умолчанию 2 мм
    var crossSize = parseFloat(crossSizeInput.text) || 10; // Размер крестиков, по умолчанию 10 мм
    var crossLineWeight = parseFloat(crossLineWeightInput.text) || 2; // Толщина линий крестиков, по умолчанию 2 мм
    var opacity = opacitySlider.value / 100; // Прозрачность в диапазоне от 0 до 1
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

    // Создаем векторные линии
    var linesLayer = doc.layers.add();
    linesLayer.name = "LayoutLines";
    var crossLayer = doc.layers.add();
    crossLayer.name = "Crosses";

    // Толщина линий в мм, переведенная в пиксели (1 мм = 2.83465 пикселя)
    var strokeWeight = lineWeight * 2.83465;

    if (customPadding) {
        // Используем индивидуальные отступы
        createLine([abBounds[0] + mmToPt(leftPadding), abBounds[1]], [abBounds[0] + mmToPt(leftPadding), abBounds[3]], strokeWeight, linesLayer, 'gray', opacity);
        createLine([abBounds[2] - mmToPt(rightPadding), abBounds[1]], [abBounds[2] - mmToPt(rightPadding), abBounds[3]], strokeWeight, linesLayer, 'gray', opacity);
        createLine([abBounds[0], abBounds[1] - mmToPt(topPadding)], [abBounds[2], abBounds[1] - mmToPt(topPadding)], strokeWeight, linesLayer, 'gray', opacity);
        createLine([abBounds[0], abBounds[3] + mmToPt(bottomPadding)], [abBounds[2], abBounds[3] + mmToPt(bottomPadding)], strokeWeight, linesLayer, 'gray', opacity);

        if (addCross) {
            // Добавляем крестики на пересечениях
            addCrosses(abBounds, leftPadding, topPadding, rightPadding, bottomPadding, crossLayer, crossSize, crossLineWeight, opacity);
        }
    } else {
        // Используем одинаковые отступы для всех сторон
        createLine([abBounds[0] + mmToPt(padding), abBounds[1]], [abBounds[0] + mmToPt(padding), abBounds[3]], strokeWeight, linesLayer, 'gray', opacity);
        createLine([abBounds[2] - mmToPt(padding), abBounds[1]], [abBounds[2] - mmToPt(padding), abBounds[3]], strokeWeight, linesLayer, 'gray', opacity);
        createLine([abBounds[0], abBounds[1] - mmToPt(padding)], [abBounds[2], abBounds[1] - mmToPt(padding)], strokeWeight, linesLayer, 'gray', opacity);
        createLine([abBounds[0], abBounds[3] + mmToPt(padding)], [abBounds[2], abBounds[3] + mmToPt(padding)], strokeWeight, linesLayer, 'gray', opacity);

        if (addCross) {
            // Добавляем крестики на пересечениях
            addCrosses(abBounds, padding, padding, padding, padding, crossLayer, crossSize, crossLineWeight, opacity);
        }
    }
}

function addCrosses(abBounds, leftPadding, topPadding, rightPadding, bottomPadding, layer, crossSize, crossLineWeight, opacity) {
    createCross(abBounds[0] + mmToPt(leftPadding), abBounds[1] - mmToPt(topPadding), layer, crossSize, crossLineWeight, opacity);
    createCross(abBounds[0] + mmToPt(leftPadding), abBounds[3] + mmToPt(bottomPadding), layer, crossSize, crossLineWeight, opacity);
    createCross(abBounds[2] - mmToPt(rightPadding), abBounds[1] - mmToPt(topPadding), layer, crossSize, crossLineWeight, opacity);
    createCross(abBounds[2] - mmToPt(rightPadding), abBounds[3] + mmToPt(bottomPadding), layer, crossSize, crossLineWeight, opacity);
}

function createLine(start, end, strokeWeight, layer, color, opacity) {
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

    pathItem.opacity = opacity * 100; // Установка прозрачности
    pathItem.filled = false;
}

function createCross(x, y, layer, crossSize, crossLineWeight, opacity) {
    // Размер крестика (половина размера одного сегмента в мм, переводим в пиксели)
    var crossSizePt = crossSize * 2.83465;
    var strokeWeight = crossLineWeight * 2.83465; // Толщина линии крестика в мм

    // Создаем группу для крестика
    var group = layer.groupItems.add();

    // Создаем горизонтальную линию крестика
    createLine([x - crossSizePt, y], [x + crossSizePt, y], strokeWeight, group, 'black', opacity);

    // Создаем вертикальную линию крестика
    createLine([x, y - crossSizePt], [x, y + crossSizePt], strokeWeight, group, 'black', opacity);
}
