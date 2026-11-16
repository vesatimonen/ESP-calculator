/*****************************************************************************
 * Keypad, one handler reads data-key of pressed key
 *****************************************************************************/
/* Keys 0-9 */
function uiKeyIsDigit(key) {
    return key.length == 1 && key >= "0" && key <= "9";
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
    if (key == "waves") {
        calcWave();
        uiDisplayRedraw();
        return;
    }
    if (key == "clear") {
        calcClear();
        uiDisplayRedraw();
    }
}

elements.keys.addEventListener("click", uiKeypadClick);
