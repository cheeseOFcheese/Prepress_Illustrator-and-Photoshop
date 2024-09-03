var doc = app.activeDocument;

// Функция для создания диалогового окна
function createDialog() {
    var dialog = new Window("dialog", "распределить кресты по кривой");

    // Размер крестиков
    dialog.add("statictext", undefined, "Размер крестиков (мм):");
    var crossSizeInput = dialog.add("edittext", undefined, "10");
    crossSizeInput.characters = 5;

    // Толщина линий крестиков
    dialog.add("statictext", undefined, "Толщина линий крестиков (мм):");
    var crossLineWeightInput = dialog.add("edittext", undefined, "2");
    crossLineWeightInput.characters = 5;

    // Количество крестиков
    dialog.add("statictext", undefined, "Количество крестиков:");
    var crossCountInput = dialog.add("edittext", undefined, "10");
    crossCountInput.characters = 5;

    // Кнопки
    var buttonGroup = dialog.add("group");
    buttonGroup.alignment = "right";
    buttonGroup.add("button", undefined, "OK", {name: "ok"});
    buttonGroup.add("button", undefined, "Cancel", {name: "cancel"});

    // Обработчик нажатия кнопки OK
    dialog.defaultElement = buttonGroup.children[0];
    dialog.cancelElement = buttonGroup.children[1];
    
    // Показать диалоговое окно
    if (dialog.show() == 1) {
        return {
            crossSize: parseFloat(crossSizeInput.text),
            crossLineWeight: parseFloat(crossLineWeightInput.text),
            crossCount: parseInt(crossCountInput.text, 10)
        };
    } else {
        return null;
    }
}

// Получение настроек от пользователя
var settings = createDialog();
if (settings === null) {
    // Пользователь отменил действие
    alert("Действие отменено пользователем.");
} else {
    // Перевод мм в пункты
    var crossSizePt = settings.crossSize * 2.83465;
    var strokeWeight = settings.crossLineWeight * 2.83465;

    // Проверка на наличие выделенной кривой
    if (doc.selection.length == 0 || !(doc.selection[0] instanceof PathItem)) {
        alert("Выберите кривую перед запуском скрипта.");
    } else {
        var selectedPath = doc.selection[0];

        // Создание слоя для крестиков
        var crossLayer = doc.layers.add();
        crossLayer.name = "CrossLayer";

        // Проходим по всем узлам выделенной кривой
        for (var i = 0; i < selectedPath.pathPoints.length && i < settings.crossCount; i++) {
            var point = selectedPath.pathPoints[i].anchor;
            createCross(point[0], point[1], crossLayer, crossSizePt, strokeWeight);
        }
    }
}

// Функция для создания крестика
function createCross(x, y, layer, crossSizePt, strokeWeight) {
    // Создаем группу для крестика
    var group = layer.groupItems.add();

    // Создаем горизонтальную линию крестика
    createLine([x - crossSizePt / 2, y], [x + crossSizePt / 2, y], strokeWeight, group, 'black');

    // Создаем вертикальную линию крестика
    createLine([x, y - crossSizePt / 2], [x, y + crossSizePt / 2], strokeWeight, group, 'black');
}

// Функция для создания линии
function createLine(start, end, strokeWeight, layer, color) {
    var pathItem = layer.pathItems.add();
    pathItem.setEntirePath([start, end]);
    pathItem.strokeWidth = strokeWeight;

    var strokeColor = new RGBColor();
    strokeColor.red = 0;
    strokeColor.green = 0;
    strokeColor.blue = 0;
    pathItem.strokeColor = strokeColor;

    pathItem.filled = false;
}
