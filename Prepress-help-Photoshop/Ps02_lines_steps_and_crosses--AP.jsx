#target photoshop

// Функция для конвертации миллиметров в пиксели
function mmToPx(mm) {
    var resolution = app.activeDocument.resolution;
    return (mm * resolution) / 25.4;
}

// Функция для создания UI окна
function createUI() {
    var dialog = new Window("dialog", "Настройки размещения крестиков");

    // Размер креста
    dialog.add("statictext", undefined, "Размер креста (мм):");
    var sizeGroup = dialog.add("group");
    sizeGroup.add("statictext", undefined, "Ширина:");
    var crossWidth = sizeGroup.add("edittext", undefined, "10");
    crossWidth.characters = 5;
    sizeGroup.add("statictext", undefined, "Высота:");
    var crossHeight = sizeGroup.add("edittext", undefined, "10");
    crossHeight.characters = 5;
    sizeGroup.add("statictext", undefined, "Толщина:");
    var crossThickness = sizeGroup.add("edittext", undefined, "1");
    crossThickness.characters = 5;

    // Отступ от края листа
    dialog.add("statictext", undefined, "Отступ от края листа (мм):");
    var offsetGroup = dialog.add("group");
    var offset = offsetGroup.add("edittext", undefined, "150");
    offset.characters = 5;

    // Кнопки OK и Cancel
    var buttonGroup = dialog.add("group");
    buttonGroup.alignment = "right";
    buttonGroup.add("button", undefined, "OK", {name: "ok"});
    buttonGroup.add("button", undefined, "Отмена", {name: "cancel"});

    if (dialog.show() == 1) {
        return {
            width: parseFloat(crossWidth.text),
            height: parseFloat(crossHeight.text),
            thickness: parseFloat(crossThickness.text),
            offset: parseFloat(offset.text)
        };
    } else {
        return null;
    }
}

// Функция для рисования одного креста кистью
function drawSingleCross(doc, centerX, centerY, width, height, thickness, layerName) {
    var crossLayer = doc.artLayers.add();
    crossLayer.name = layerName;

    var widthPx = mmToPx(width);
    var heightPx = mmToPx(height);
    var thicknessPx = mmToPx(thickness);

    var halfThickness = thicknessPx / 2;

    // Сохранить текущий цвет переднего плана
    var originalColor = app.foregroundColor;

    // Установить черный цвет переднего плана
    var blackColor = new SolidColor();
    blackColor.rgb.red = 0;
    blackColor.rgb.green = 0;
    blackColor.rgb.blue = 0;
    app.foregroundColor = blackColor;

    // Рисуем горизонтальную линию
    doc.selection.select([
        [centerX - widthPx / 2, centerY - halfThickness],
        [centerX + widthPx / 2, centerY - halfThickness],
        [centerX + widthPx / 2, centerY + halfThickness],
        [centerX - widthPx / 2, centerY + halfThickness]
    ]);
    doc.selection.fill(app.foregroundColor);
    doc.selection.deselect();

    // Рисуем вертикальную линию
    doc.selection.select([
        [centerX - halfThickness, centerY - heightPx / 2],
        [centerX + halfThickness, centerY - heightPx / 2],
        [centerX + halfThickness, centerY + heightPx / 2],
        [centerX - halfThickness, centerY + heightPx / 2]
    ]);
    doc.selection.fill(app.foregroundColor);
    doc.selection.deselect();

    // Восстановить цвет переднего плана
    app.foregroundColor = originalColor;

    return crossLayer;
}

// Функция для копирования креста на другие позиции и присвоения имен
function copyCrossToPositions(doc, firstLayer, positions, names) {
    for (var i = 1; i < positions.length; i++) {
        var pos = positions[i];
        var duplicateLayer = firstLayer.duplicate();
        duplicateLayer.name = names[i];
        duplicateLayer.translate(pos[0] - positions[0][0], pos[1] - positions[0][1]);
    }
    firstLayer.name = names[0];
}

// Основная функция
function main() {
    if (app.documents.length === 0) {
        alert("Пожалуйста, откройте документ перед запуском этого скрипта.");
        return;
    }

    var doc = app.activeDocument;
    var settings = createUI();
    if (settings === null) {
        return;
    }

    var crossWidth = settings.width;
    var crossHeight = settings.height;
    var crossThickness = settings.thickness;
    var offset = settings.offset;

    var docWidthPx = mmToPx(doc.width.as('mm'));
    var docHeightPx = mmToPx(doc.height.as('mm'));
    var offsetPx = mmToPx(offset);

    var positions = [
        [offsetPx, offsetPx],
        [docWidthPx - offsetPx, offsetPx],
        [offsetPx, docHeightPx - offsetPx],
        [docWidthPx - offsetPx, docHeightPx - offsetPx]
    ];

    var names = [
        "крест-лево-верх",
        "крест-право-верх",
        "крест-лево-низ",
        "крест-право-низ"
    ];

    app.activeDocument.suspendHistory("Рисование крестиков", "mainProcess()");

    function mainProcess() {
        var firstCrossLayer = drawSingleCross(doc, positions[0][0], positions[0][1], crossWidth, crossHeight, crossThickness, names[0]);
        copyCrossToPositions(doc, firstCrossLayer, positions, names);

        // Создаем папку и перемещаем слои крестов в нее
        var group = doc.layerSets.add();
        group.name = "крест";
        for (var i = 0; i < names.length; i++) {
            var layer = doc.artLayers.getByName(names[i]);
            layer.move(group, ElementPlacement.INSIDE);
        }
    }
}

main();
