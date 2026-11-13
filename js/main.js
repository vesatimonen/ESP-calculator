/*****************************************************************************
 * Modal window handling (about)
 *****************************************************************************/
/* Tap that closed modal, its click is not used */
let modalDropClick = false;

function modalVisible() {
    return elements.modal.style.visibility == "visible";
}

/* Show modal in middle of board, empty text hides second line */
function modalShow(title, text, fadeIn) {
    elements.modalTitle.textContent = title;
    elements.modalText.textContent  = text;
    elements.modal.style.visibility = "visible";

    /* Fade in, or show at once */
    elements.modal.style.animation = "none";
    if (fadeIn) {
        elements.modal.offsetHeight; /* trigger reflow */
        elements.modal.style.animation = "image-appear 0.6s ease-in 0.2s 1 normal both";
    }
}

function modalHide() {
    elements.modal.style.visibility = "hidden";
}

/* Tap anywhere closes modal, tap does nothing else */
function modalPointerDown(event) {
    if (!modalVisible()) {
        modalDropClick = false; /* New tap, its click is used */
        return;
    }

    event.preventDefault();
    event.stopPropagation();

    modalHide();
    modalDropClick = true;
}

/* Drop click of closing tap, so buttons do not act */
function modalClick(event) {
    if (modalDropClick) {
        modalDropClick = false;
        event.preventDefault();
        event.stopPropagation();
    }
}

/* Capture, so modal sees taps before buttons */
document.addEventListener("pointerdown", modalPointerDown, true);
document.addEventListener("click",       modalClick,       true);


/*****************************************************************************
 * Initialization
 *****************************************************************************/
window.onload = function () {
    uiSetup();

    /* Show window */
    elements.screen.style.visibility = "visible";
}
