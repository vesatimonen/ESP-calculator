/*****************************************************************************
 * Element sizes
 *****************************************************************************/
const FRAME_WIDTH      = 0.04; /* Frame line, part of base cell */
const FRAME_MAX_WIDTH  = 1.7;  /* Frame max in CSS px, as on iPhone */

/* Screen width in base cells, same as old 8x8 board with margins */
const SCREEN_CELLS = 8.65;

/* Title and buttons grow and shrink with screen */
const ELEMENT_SCALE_BASE_CELL = 50;  /* Cell size where scale is 1 */
const ELEMENT_SCALE_MAX       = 1.3; /* Biggest scale */


/*****************************************************************************
 * Scale for page elements, shrinks with screen, max ELEMENT_SCALE_MAX
 *****************************************************************************/
function uiElementScale(cellSize) {
    const scale = cellSize / ELEMENT_SCALE_BASE_CELL;

    if (scale > ELEMENT_SCALE_MAX) {
        return ELEMENT_SCALE_MAX;
    }
    return scale;
}


/*****************************************************************************
 * Frame line width snapped to whole device pixels, at least 1
 *****************************************************************************/
function uiFrameWidth(cellSize) {
    const pixelRatio  = window.devicePixelRatio || 1;
    const frameWidth  = Math.min(FRAME_WIDTH * cellSize, FRAME_MAX_WIDTH);
    const framePixels = Math.max(1, Math.round(frameWidth * pixelRatio));

    return framePixels / pixelRatio;
}


/*****************************************************************************
 * Set frame width and element scale from screen width
 *****************************************************************************/
function uiSetup() {
    const cellSize = Math.floor(elements.screen.clientWidth / SCREEN_CELLS);

    document.documentElement.style.setProperty("--frame-width", uiFrameWidth(cellSize) + "px");
    document.documentElement.style.setProperty("--element-scale", uiElementScale(cellSize));
}
