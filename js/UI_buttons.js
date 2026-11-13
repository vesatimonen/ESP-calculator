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
