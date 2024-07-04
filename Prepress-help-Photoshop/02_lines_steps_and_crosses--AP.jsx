#target photoshop

// Функция для конвертации миллиметров в пиксели
function mmToPx(mm) {
    var resolution = app.activeDocument.resolution;
    return (mm * resolution) / 25.4;
}

// Функция для создания UI окна
function createUI() {
    var dialog = new Window("dialog", "Cross Placement Settings");
    
    // Размер креста
    dialog.add("statictext", undefined, "Cross Size (mm):");
    var sizeGroup = dialog.add("group");
    sizeGroup.add("statictext", undefined, "Width:");
    var crossWidth = sizeGroup.add("edittext", undefined, "10");
    crossWidth.characters = 5;
    sizeGroup.add("statictext", undefined, "Height:");
    var crossHeight = sizeGroup.add("edittext", undefined, "10");
    crossHeight.characters = 5;
    sizeGroup.add("statictext", undefined, "Thickness:");
    var crossThickness = sizeGroup.add("edittext", undefined, "1");
    crossThickness.characters = 5;
    
    // Отступ от края листа
    dialog.add("statictext", undefined, "Offset from Edge (mm):");
    var offsetGroup = dialog.add("group");
    var offset = offsetGroup.add("edittext", undefined, "150");
    offset.characters = 5;
    
    // Кнопки OK и Cancel
    var buttonGroup = dialog.add("group");
    buttonGroup.alignment = "right";
    buttonGroup.add("button", undefined, "OK", {name: "ok"});
    buttonGroup.add("button", undefined, "Cancel", {name: "cancel"});
    
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

// Функция для создания креста с использованием прямоугольников
function createCross(doc, width, height, thickness) {
    var crossLayer = doc.artLayers.add();
    crossLayer.name = "Cross";

    var widthPx = mmToPx(width);
    var heightPx = mmToPx(height);
    var thicknessPx = mmToPx(thickness);

    // Горизонтальная линия
    var horLine = doc.artLayers.add();
    horLine.kind = LayerKind.NORMAL;
    horLine.name = "Horizontal Line";

    doc.selection.select([
        [0, (heightPx - thicknessPx) / 2],
        [widthPx, (heightPx - thicknessPx) / 2],
        [widthPx, (heightPx + thicknessPx) / 2],
        [0, (heightPx + thicknessPx) / 2]
    ]);
    doc.selection.fill(app.foregroundColor);
    doc.selection.deselect();

    // Вертикальная линия
    var verLine = doc.artLayers.add();
    verLine.kind = LayerKind.NORMAL;
    verLine.name = "Vertical Line";

    doc.selection.select([
        [(widthPx - thicknessPx) / 2, 0],
        [(widthPx + thicknessPx) / 2, 0],
        [(widthPx + thicknessPx) / 2, heightPx],
        [(widthPx - thicknessPx) / 2, heightPx]
    ]);
    doc.selection.fill(app.foregroundColor);
    doc.selection.deselect();

    return crossLayer;
}

// Основная функция
function main() {
    if (app.documents.length === 0) {
        alert("Please open a document before running this script.");
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
    
    var docWidth = doc.width.as('px');
    var docHeight = doc.height.as('px');
    
    var positions = [
        [offset, offset],
        [docWidth - offset - mmToPx(crossWidth), offset],
        [offset, docHeight - offset - mmToPx(crossHeight)],
        [docWidth - offset - mmToPx(crossWidth), docHeight - offset - mmToPx(crossHeight)]
    ];
    
    for (var i = 0; i < positions.length; i++) {
        var pos = positions[i];
        var crossLayer = createCross(doc, crossWidth, crossHeight, crossThickness);
        crossLayer.translate(pos[0], pos[1]);
    }
}

main();
