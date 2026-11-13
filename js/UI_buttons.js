/*****************************************************************************
 * Keypad, one handler reads data-key of pressed key
 *****************************************************************************/
/* Keys 0-9 */
function uiKeyIsDigit(key) {
    return key.length == 1 && key >= "0" && key <= "9";
}

/* ESP keys by data-key: times, plus, minus, divide icons */
const UI_ESP_OPERATIONS = {
    "*": "multiply",
    "-": "add",
    "+": "subtract",
    "/": "divide"
};

function uiKeyIsEsp(key) {
    return key in UI_ESP_OPERATIONS;
}

function uiKeypadClick(event) {
    const button = event.target.closest("button");
    if (button == null) {
        return;
    }

    const key = button.dataset.key;
    if (uiKeyIsDigit(key)) {
        calcDigit(key);
        uiDisplayRedraw();
        return;
    }
    if (uiKeyIsEsp(key)) {
        calcEsp(UI_ESP_OPERATIONS[key]);
        uiDisplayRedraw();
        return;
    }
    if (key == ".") {
        calcPoint();
        uiDisplayRedraw();
        return;
    }
    if (key == "=") {
        calcEquals();
        uiDisplayRedraw();
        return;
    }
    if (key == "clear") {
        calcClear();
        uiDisplayRedraw();
    }
}

elements.keys.addEventListener("click", uiKeypadClick);
