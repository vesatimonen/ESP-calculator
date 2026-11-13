/*****************************************************************************
 * Calculator state
 *****************************************************************************/
const calc = {
    entry:       "0",  /* Number being typed, as text */
    resultShown: false /* Display shows result, next digit starts new entry */
};


/*****************************************************************************
 * Number input
 *****************************************************************************/
/* Add digit to end of entry, first digit replaces lone zero, no length limit */
function calcDigit(digit) {
    if (calc.resultShown) {
        calc.entry       = "0";
        calc.resultShown = false;
    }

    if (calc.entry == "0") {
        calc.entry = digit;
        return;
    }
    calc.entry = calc.entry + digit;
}


/*****************************************************************************
 * Equals
 *****************************************************************************/
/* Sum of all digits in text */
function calcDigitSum(text) {
    let sum = 0;

    for (const digit of text) {
        sum = sum + Number(digit);
    }
    return sum;
}

/* Result is digit sum modulo 9, any amount of digits */
function calcDigitResult(text) {
    return calcDigitSum(text) % 9;
}

/* Show result of digits typed */
function calcEquals() {
    if (calc.resultShown) {
        return;
    }
    calc.entry       = String(calcDigitResult(calc.entry));
    calc.resultShown = true;
}


/*****************************************************************************
 * Clear
 *****************************************************************************/
/* Back to start, display shows 0 */
function calcClear() {
    calc.entry       = "0";
    calc.resultShown = false;
}
