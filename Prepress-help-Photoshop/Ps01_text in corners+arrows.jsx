#target photoshop

// === КОНСТАНТЫ ===
var TEXT_GROUP_NAME = "↑_text";
var DEFAULT_FONT = "Impact";
var DEFAULT_OFFSET_MM = 10;
var DEFAULT_FONT_SIZE_MM = 10;
var DEFAULT_OPACITY = 50;

// === УДАЛЕНИЕ СТАРЫХ ГРУПП ===
function removePreviousTextGroup(groupName) {
    var doc = app.activeDocument;
    for (var i = doc.layerSets.length - 1; i >= 0; i--) {
        if (doc.layerSets[i].name === groupName) {
            doc.layerSets[i].remove();
        }
    }
}

// === ДОБАВЛЕНИЕ ТЕКСТА В УГЛЫ ===
function placeTextInCorners(settings, offset) {
    var doc = app.activeDocument;
    var originalRulerUnits = app.preferences.rulerUnits;
    try {
        app.preferences.rulerUnits = Units.MM;
        var docWidth = Math.round(doc.width.as("mm"));
        var docHeight = Math.round(doc.height.as("mm"));

        var textGroup = doc.layerSets.add();
        textGroup.name = TEXT_GROUP_NAME;

        function createTextLayer(x, y, justification) {
            var textLayer = doc.artLayers.add();
            textLayer.kind = LayerKind.TEXT;
            textLayer.textItem.contents = settings.text;
            textLayer.textItem.size = new UnitValue(settings.fontSize, "mm");
            textLayer.textItem.justification = justification;
            try {
                textLayer.textItem.font = DEFAULT_FONT;
            } catch (e) {
                alert('Шрифт "' + DEFAULT_FONT + '" не найден. Используется стандартный шрифт.');
            }
            textLayer.textItem.position = [x, y];
            textLayer.opacity = settings.opacity;
            textLayer.move(textGroup, ElementPlacement.INSIDE);
        }

        // 4 угла
        createTextLayer(offset, offset, Justification.LEFT);
        createTextLayer(docWidth - offset, offset, Justification.RIGHT);
        createTextLayer(offset, docHeight - offset, Justification.LEFT);
        createTextLayer(docWidth - offset, docHeight - offset, Justification.RIGHT);

    } finally {
        app.preferences.rulerUnits = originalRulerUnits;
    }
}

// === ДИАЛОГ НАСТРОЕК ===
function showCombinedDialog(defaultText, defaultFontSize, defaultOpacity) {
    var doc = app.activeDocument;
    var docName = doc.name;
    var docWidth = Math.round(doc.width.as("mm"));
    var docHeight = Math.round(doc.height.as("mm"));
    var docResolution = doc.resolution;

    var dialog = new Window('dialog', 'Свойства документа и настройки текста');
    dialog.orientation = 'column';

    var docPropsGroup = dialog.add('panel', undefined, 'Свойства документа');
    docPropsGroup.orientation = 'column';
    docPropsGroup.alignment = 'fill';
    docPropsGroup.add("statictext", undefined, "Название документа: " + docName);
    docPropsGroup.add("statictext", undefined, "Ширина (мм): " + docWidth);
    docPropsGroup.add("statictext", undefined, "Высота (мм): " + docHeight);
    docPropsGroup.add("statictext", undefined, "Разрешение (dpi): " + docResolution);

    var textSettingsGroup = dialog.add('panel', undefined, 'Настройки текста');
    textSettingsGroup.orientation = 'column';
    textSettingsGroup.alignment = 'fill';

    var textGroup = textSettingsGroup.add('group');
    textGroup.add('statictext', undefined, 'Введите текст:');
    var textInput = textGroup.add('edittext', undefined, defaultText);
    textInput.characters = 30;

    var fontSizeGroup = textSettingsGroup.add('group');
    fontSizeGroup.add('statictext', undefined, 'Высота текста (мм):');
    var fontSizeInput = fontSizeGroup.add('edittext', undefined, defaultFontSize);
    fontSizeInput.characters = 5;

    var arrowGroup = textSettingsGroup.add('group');
    var arrowCheckbox = arrowGroup.add('checkbox', undefined, 'Добавить стрелку перед текстом');
    arrowCheckbox.value = true;

    var opacityGroup = textSettingsGroup.add('group');
    opacityGroup.add('statictext', undefined, 'Прозрачность текста:');
    var opacitySlider = opacityGroup.add('slider', undefined, defaultOpacity, 0, 100);
    opacitySlider.preferredSize.width = 150;
    var opacityValue = opacityGroup.add('edittext', undefined, defaultOpacity);
    opacityValue.characters = 4;

    opacitySlider.onChanging = function() {
        opacityValue.text = Math.round(opacitySlider.value);
    };
    opacityValue.onChange = function() {
        var val = parseInt(opacityValue.text);
        if (!isNaN(val) && val >= 0 && val <= 100) {
            opacitySlider.value = val;
        }
    };

    var buttonGroup = dialog.add('group');
    buttonGroup.alignment = 'right';
    buttonGroup.add('button', undefined, 'Cancel', {name: 'cancel'});
    var okButton = buttonGroup.add('button', undefined, 'OK', {name: 'ok'});

    okButton.onClick = function() {
        if (!textInput.text || isNaN(parseFloat(fontSizeInput.text))) {
            alert("Проверьте корректность введённых данных! Текст не может быть пустым, размер — числом.");
            return;
        }
        dialog.close(1);
    };

    if (dialog.show() == 1) {
        return {
            text: arrowCheckbox.value ? "↑ " + textInput.text : textInput.text,
            fontSize: parseFloat(fontSizeInput.text),
            opacity: parseFloat(opacitySlider.value)
        };
    } else {
        return null;
    }
}

// === MAIN ===
function main() {
    try {
        if (!app.documents.length) {
            alert("Нет открытого документа.");
            return;
        }
        removePreviousTextGroup(TEXT_GROUP_NAME);

        var doc = app.activeDocument;
        var userSettings = showCombinedDialog(
            doc.name,
            DEFAULT_FONT_SIZE_MM,
            DEFAULT_OPACITY
        );
        if (userSettings !== null) {
            placeTextInCorners(userSettings, DEFAULT_OFFSET_MM);
            alert("Текст расставлен в углах документа.");
        }
    } catch (e) {
        alert("Ошибка: " + e.message);
    }
}

main();
