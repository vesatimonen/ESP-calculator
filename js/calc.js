/*****************************************************************************
 * Calculator state
 *****************************************************************************/
const CALC_MAX_DIGITS = 12; /* Most digits that fit in display */

const calc = {
    entry: "0" /* Number being typed, as text */
};


/*****************************************************************************
 * Number input
 *****************************************************************************/
/* Add digit to end of entry, first digit replaces lone zero */
function calcDigit(digit) {
    if (calc.entry == "0") {
        calc.entry = digit;
        return;
    }
    if (calc.entry.length >= CALC_MAX_DIGITS) {
        return;
    }
    calc.entry = calc.entry + digit;
}
