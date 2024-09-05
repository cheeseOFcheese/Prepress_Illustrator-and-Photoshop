#target illustrator

// Функция для перевода пунктов (pt) в миллиметры (мм)
function pointsToMM(points) {
    return points * 0.352778;
}

// Функция для перевода миллиметров (мм) в пункты (pt)
function mmToPoints(mm) {
    return mm * 2.83465;
}

// Проверка, что открыт документ
if (app.documents.length > 0) {
    var doc = app.activeDocument;
    var artboardIndex = 0; // Индекс выбранного артборда по умолчанию
    var textItems = []; // Список для хранения текстовых объектов
    
    // Получение цветового пространства документа
    var colorSpace = doc.documentColorSpace == DocumentColorSpace.RGB ? 'RGB' : 'CMYK';

    // Получение активного артборда и его размеров
    var activeArtboard = doc.artboards[doc.artboards.getActiveArtboardIndex()];
    var artboardRect = activeArtboard.artboardRect;

    // Вычисление ширины и высоты артборда в миллиметрах с округлением до 1 мм
    var artboardWidthMM = Math.round(pointsToMM(artboardRect[2] - artboardRect[0]));
    var artboardHeightMM = Math.round(pointsToMM(artboardRect[1] - artboardRect[3]));

    // Показываем диалоговое окно для выбора параметров
    var dialog = new Window('dialog', 'Настройки текста');
    dialog.orientation = 'column';
    dialog.alignChildren = 'left';

    // Добавление текстовой метки с цветовым пространством документа
    dialog.add('statictext', undefined, 'Цветовое пространство: ' + colorSpace);
    
    // Добавление текстовой метки с размерами артборда
    dialog.add('statictext', undefined, 'Размер артборда: ' + artboardWidthMM + ' мм x ' + artboardHeightMM + ' мм');

    // Чекбокс и поле для ввода имени
    var nameGroup = dialog.add('group');
    var useFileNameCheckbox = nameGroup.add('checkbox', undefined, 'Использовать имя файла');
    useFileNameCheckbox.value = true; // По умолчанию использовать имя файла
    var nameInput = nameGroup.add('edittext', undefined, doc.name);
    nameInput.enabled = false;

    useFileNameCheckbox.onClick = function() {
        nameInput.enabled = !this.value;
        if (this.value) {
            nameInput.text = doc.name;
        }
    };

    // Создаем выпадающий список для выбора шрифта
    var fontGroup = dialog.add('group');
    fontGroup.add('statictext', undefined, 'Выберите шрифт:');
    var fontDropdown = fontGroup.add('dropdownlist');
    var fonts = app.textFonts; // Получаем доступные шрифты
    var defaultFontIndex = 0; // Индекс шрифта Impact по умолчанию

    // Заполняем выпадающий список именами шрифтов
    for (var k = 0; k < fonts.length; k++) {
        var fontItem = fontDropdown.add('item', fonts[k].name);
        fontItem.font = fonts[k];
        if (fonts[k].name === "Impact") {
            defaultFontIndex = k; // Запоминаем позицию шрифта Impact
        }
    }
    fontDropdown.selection = defaultFontIndex; // Выбираем шрифт Impact по умолчанию

    // Добавляем выпадающий список артбордов, если их больше одного
    if (doc.artboards.length > 1) {
        var artboardGroup = dialog.add('group');
        artboardGroup.add('statictext', undefined, 'Выберите артборд:');
        var artboardDropdown = artboardGroup.add('dropdownlist');
        for (var i = 0; i < doc.artboards.length; i++) {
            var item = artboardDropdown.add('item', doc.artboards[i].name);
            item.artboardIndex = i;
        }
        artboardDropdown.selection = 0; // По умолчанию выбираем первый артборд
        artboardDropdown.onChange = function() {
            artboardIndex = this.selection.artboardIndex;
        };
    }

    // Чекбокс для добавления стрелок
    var arrowCheckbox = dialog.add('checkbox', undefined, 'Добавить стрелки');
    arrowCheckbox.value = true; // Включен по умолчанию

    // Создаем группу чекбоксов для выбора сторон
    var sidesGroup = dialog.add('panel', undefined, 'Выберите позиции для текста:');
    sidesGroup.orientation = 'column';
    sidesGroup.alignChildren = 'left';
    var topLeftCheckbox = sidesGroup.add('checkbox', undefined, 'Лево Верх');
    var bottomLeftCheckbox = sidesGroup.add('checkbox', undefined, 'Лево Низ');
    var topRightCheckbox = sidesGroup.add('checkbox', undefined, 'Право Верх');
    var bottomRightCheckbox = sidesGroup.add('checkbox', undefined, 'Право Низ');

    // Устанавливаем все чекбоксы по умолчанию включенными
    topLeftCheckbox.value = true;
    bottomLeftCheckbox.value = true;
    topRightCheckbox.value = true;
    bottomRightCheckbox.value = true;

    // Поле для ввода размера текста в мм
    var sizeGroup = dialog.add('group');
    sizeGroup.add('statictext', undefined, 'Введите размер шрифта (в мм, минимум 4 мм):');
    var sizeInput = sizeGroup.add('edittext', undefined, '10.00'); // Дефолтный размер — 10 мм
    sizeInput.characters = 5;

    // Ползунок для настройки прозрачности
    var opacityGroup = dialog.add('group');
    opacityGroup.add('statictext', undefined, 'Прозрачность текста:');
    
    // Ползунок для изменения прозрачности (от 0 до 100)
    var opacitySlider = opacityGroup.add('slider', undefined, 50, 0, 100);
    opacitySlider.preferredSize.width = 300;

    // Поле для отображения текущего значения прозрачности
    var opacityValue = dialog.add('edittext', undefined, '50%');
    opacityValue.preferredSize.width = 50;

    // Обновление значения прозрачности при движении ползунка
    opacitySlider.onChanging = function () {
        opacityValue.text = Math.round(opacitySlider.value) + '%';
    };

    // Кнопки для подтверждения или отмены
    var buttonGroup = dialog.add('group');
    var okButton = buttonGroup.add('button', undefined, 'OK');
    var cancelButton = buttonGroup.add('button', undefined, 'Отмена');

    okButton.onClick = function() {
        var fontSizeMm = Math.max(parseFloat(sizeInput.text), 4.00); // Минимальный размер — 4 мм
        var fontSizePt = mmToPoints(fontSizeMm); // Конвертация мм в пункты (точная привязка к мм)
        var name = useFileNameCheckbox.value ? doc.name : nameInput.text; // Используем имя файла или введенное имя

        // Установка активного артборда
        doc.artboards.setActiveArtboardIndex(artboardIndex);

        // Создаем новый слой для текста и стрелок
        var layer = doc.layers.add();
        layer.name = "Text and Arrows Layer";

        // Функция для создания текста в углу
        function createTextAtCorner(corner, fontSizePt, bounds, name, layer) {
            var text = doc.textFrames.add();
            text.textRange.characterAttributes.textFont = fontDropdown.selection.font; // Установка шрифта
            var arrow = arrowCheckbox.value ? " ↑ " : "";
            text.textRange.size = fontSizePt; // Применение корректного размера шрифта

            // Позиционирование текста в зависимости от угла
            switch (corner) {
                case 'topLeft':
                    text.contents = arrow + " " + name;
                    text.left = bounds[0];
                    text.top = bounds[1] - text.height;
                    break;
                case 'bottomLeft':
                    text.contents = arrow + " " + name;
                    text.left = bounds[0];
                    text.top = bounds[3];
                    break;
                case 'topRight':
                    text.contents = name + " " + arrow;
                    text.left = bounds[2] - text.width;
                    text.top = bounds[1] - text.height;
                    break;
                case 'bottomRight':
                    text.contents = name + " " + arrow;
                    text.left = bounds[2] - text.width;
                    text.top = bounds[3];
                    break;
            }

            // Применение прозрачности
            text.opacity = opacitySlider.value;
            text.position = [text.left, text.top];
            text.top += text.height; // Корректировка позиции по высоте текста

            // Перемещаем текст на новый слой
            text.move(layer, ElementPlacement.PLACEATEND);
            return text; // Возвращаем текст для дальнейшего использования
        }

        // Обрабатываем чекбоксы и создаем текст в углах
        var bounds = doc.artboards[artboardIndex].artboardRect;
        if (topLeftCheckbox.value) {
            textItems.push(createTextAtCorner('topLeft', fontSizePt, bounds, name, layer));
        }
        if (bottomLeftCheckbox.value) {
            textItems.push(createTextAtCorner('bottomLeft', fontSizePt, bounds, name, layer));
        }
        if (topRightCheckbox.value) {
            textItems.push(createTextAtCorner('topRight', fontSizePt, bounds, name, layer));
        }
        if (bottomRightCheckbox.value) {
            textItems.push(createTextAtCorner('bottomRight', fontSizePt, bounds, name, layer));
        }

        dialog.close();
    };

    // Закрытие диалога при отмене
    cancelButton.onClick = function() {
        dialog.close();
    };

    // Показываем диалог
    dialog.show();
} else {
    alert('Откройте документ, чтобы использовать этот скрипт.');
}
