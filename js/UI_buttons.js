/*****************************************************************************
 * Button handlers
 *****************************************************************************/
/* ABOUT, show in modal, tap anywhere closes */
function uiAbout(event) {
    const text = "No ads, no tracking.\n" +
                 "\n" +
                 "© vesa.timonen[at]kolumbus.fi";
    modalShow("ESP CALCULATOR", text, false);
}

elements.buttonAbout.addEventListener("click", uiAbout);


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
