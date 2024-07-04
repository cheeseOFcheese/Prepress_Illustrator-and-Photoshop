#target photoshop

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

// Функция для создания креста
function createCross(doc, width, height, thickness) {
    var crossLayer = doc.artLayers.add();
    crossLayer.name = "Cross";

    var lineArray = [];
    var subPathArray = [];

    // Горизонтальная линия
    var horizontalLine = [
        [0, thickness / 2], [width, thickness / 2],
        [width, -thickness / 2], [0, -thickness / 2]
    ];

    var horizontalPathPoints = horizontalLine.map(function(point) {
        var pathPoint = new PathPointInfo();
        pathPoint.kind = PointKind.CORNERPOINT;
        pathPoint.anchor = point;
        pathPoint.leftDirection = point;
        pathPoint.rightDirection = point;
        return pathPoint;
    });

    var horizontalSubPath = new SubPathInfo();
    horizontalSubPath.closed = true;
    horizontalSubPath.operation = ShapeOperation.SHAPEADD;
    horizontalSubPath.entireSubPath = horizontalPathPoints;
    subPathArray.push(horizontalSubPath);

    // Вертикальная линия
    var verticalLine = [
        [thickness / 2, 0], [thickness / 2, height],
        [-thickness / 2, height], [-thickness / 2, 0]
    ];

    var verticalPathPoints = verticalLine.map(function(point) {
        var pathPoint = new PathPointInfo();
        pathPoint.kind = PointKind.CORNERPOINT;
        pathPoint.anchor = point;
        pathPoint.leftDirection = point;
        pathPoint.rightDirection = point;
        return pathPoint;
    });

    var verticalSubPath = new SubPathInfo();
    verticalSubPath.closed = true;
    verticalSubPath.operation = ShapeOperation.SHAPEADD;
    verticalSubPath.entireSubPath = verticalPathPoints;
    subPathArray.push(verticalSubPath);

    var crossPath = doc.pathItems.add("CrossPath", subPathArray);
    crossPath.strokePath(ToolType.PENCIL);
    crossPath.remove();
    
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
    
    var docWidth = doc.width.as('mm');
    var docHeight = doc.height.as('mm');
    
    var positions = [
        [offset, offset],
        [docWidth - offset - crossWidth, offset],
        [offset, docHeight - offset - crossHeight],
        [docWidth - offset - crossWidth, docHeight - offset - crossHeight]
    ];
    
    for (var i = 0; i < positions.length; i++) {
        var pos = positions[i];
        var crossLayer = createCross(doc, crossWidth, crossHeight, crossThickness);
        crossLayer.translate(pos[0], pos[1]);
    }
}

main();
