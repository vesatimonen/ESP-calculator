/*****************************************************************************
 * Calculator state
 *****************************************************************************/
const calc = {
    entry:         "0",       /* Number being typed, as text */
    resultShown:   false,     /* Display shows result, next digit starts new entry */
    first:         undefined, /* First number of ESP sum, set by ESP key */
    secondStarted: false      /* Digit typed after ESP key */
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

    /* First digit after ESP key starts second number */
    if (calc.first != undefined && !calc.secondStarted) {
        calc.entry         = "0";
        calc.secondStarted = true;
    }

    if (calc.entry == "0") {
        calc.entry = digit;
        return;
    }
    calc.entry = calc.entry + digit;
}


/*****************************************************************************
 * ESP keys, all four work the same
 *****************************************************************************/
/* Single digit on display becomes first number, one ESP sum at a time */
function calcEsp() {
    if (calc.first != undefined) {
        return;
    }
    if (calc.entry.length > 1) {
        return; /* Multiple digits, ESP keys do nothing */
    }

    calc.first         = calc.entry;
    calc.secondStarted = false;
    calc.resultShown   = false;
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

/* Exact sum of two numbers given as text, any length */
function calcAdd(first, second) {
    return (BigInt(first) + BigInt(second)).toString();
}

/* After ESP key: sum of both numbers, waits for second number */
function calcEspEquals() {
    if (!calc.secondStarted) {
        return;
    }

    calc.entry       = calcAdd(calc.first, calc.entry);
    calc.first       = undefined;
    calc.resultShown = true;
}

/* Show result: ESP sum, or digit sum modulo 9 without ESP key */
function calcEquals() {
    if (calc.resultShown) {
        return;
    }
    if (calc.first != undefined) {
        calcEspEquals();
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
    calc.entry         = "0";
    calc.resultShown   = false;
    calc.first         = undefined;
    calc.secondStarted = false;
}
