#target photoshop

// Проверка на наличие открытого документа
if (app.documents.length === 0) {
    alert("Нет открытых документов.");
} else {
    var doc = app.activeDocument;

    // Создание диалогового окна для ввода параметров
    var dialog = new Window('dialog', 'Настройка линий и крестиков');
    dialog.orientation = 'column';
    dialog.alignChildren = 'left';

    // Ввод отступов
    var paddingGroup = dialog.add('group');
    paddingGroup.add('statictext', undefined, 'Введите отступы (в мм):');
    var paddingInput = paddingGroup.add('edittext', undefined, '100');
    paddingInput.characters = 5;

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
    opacityGroup.add('statictext', undefined, 'Прозрачность (0-100%):');
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
        var lineWeight = parseFloat(lineWeightInput.text) || 2;
        var crossSize = parseFloat(crossSizeInput.text) || 10;
        var crossLineWeight = parseFloat(crossLineWeightInput.text) || 2;
        var opacity = Math.max(0, Math.min(parseFloat(opacityInput.text), 100));
        var addCross = crossCheckbox.value;
        addLayoutLines(padding, lineWeight, crossSize, crossLineWeight, opacity, addCross);
        dialog.close();
    };

    cancelButton.onClick = function() {
        dialog.close();
    };

    dialog.show();

    function addLayoutLines(padding, lineWeight, crossSize, crossLineWeight, opacity, addCross) {
        var doc = app.activeDocument;
        var docBounds = [0, 0, doc.width.value, doc.height.value];

        // Создание слоя для линий
        var linesLayer = doc.artLayers.add();
        linesLayer.name = "LayoutLines";
        linesLayer.opacity = opacity;

        // Создание слоя для крестиков
        var crossLayer = doc.artLayers.add();
        crossLayer.name = "Crosses";
        crossLayer.opacity = opacity;

        // Создание линий
        createLine(docBounds[0] + mmToPx(padding), docBounds[1], docBounds[0] + mmToPx(padding), docBounds[3], lineWeight, linesLayer);
        createLine(docBounds[2] - mmToPx(padding), docBounds[1], docBounds[2] - mmToPx(padding), docBounds[3], lineWeight, linesLayer);
        createLine(docBounds[0], docBounds[1] - mmToPx(padding), docBounds[2], docBounds[1] - mmToPx(padding), lineWeight, linesLayer);
        createLine(docBounds[0], docBounds[3] + mmToPx(padding), docBounds[2], docBounds[3] + mmToPx(padding), lineWeight, linesLayer);

        // Добавление крестиков на пересечении
        if (addCross) {
            createCross(docBounds[0] + mmToPx(padding), docBounds[1] - mmToPx(padding), crossSize, crossLineWeight, crossLayer);
            createCross(docBounds[0] + mmToPx(padding), docBounds[3] + mmToPx(padding), crossSize, crossLineWeight, crossLayer);
            createCross(docBounds[2] - mmToPx(padding), docBounds[1] - mmToPx(padding), crossSize, crossLineWeight, crossLayer);
            createCross(docBounds[2] - mmToPx(padding), docBounds[3] + mmToPx(padding), crossSize, crossLineWeight, crossLayer);
        }
    }

    function createLine(x1, y1, x2, y2, lineWeight, layer) {
        var line = layer.pathItems.add();
        line.setEntirePath([[x1, y1], [x2, y2]]);
        line.stroked = true;
        line.strokeWidth = mmToPx(lineWeight);
        line.strokeColor = new SolidColor();
        line.strokeColor.rgb.red = 0;
        line.strokeColor.rgb.green = 0;
        line.strokeColor.rgb.blue = 0;
    }

    function createCross(x, y, crossSize, crossLineWeight, layer) {
        var crossSizePx = mmToPx(crossSize) / 2;
        var lineWeightPx = mmToPx(crossLineWeight);

        createLine(x - crossSizePx, y, x + crossSizePx, y, lineWeightPx, layer);
        createLine(x, y - crossSizePx, x, y + crossSizePx, lineWeightPx, layer);
    }

    function mmToPx(mm) {
        return mm * 2.83465;
    }
}
