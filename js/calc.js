/*****************************************************************************
 * Calculator state
 *****************************************************************************/
const calc = {
    entry:         "0",       /* Number being typed, as text */
    resultShown:   false,     /* Display shows result, next digit starts new entry */
    first:         undefined, /* First number, set by ESP key */
    operation:     undefined, /* Operation of ESP key, used in ordinary mode */
    secondStarted: false,     /* Digit typed after ESP key */
    ordinary:      false      /* Multiple digits given since C or =, ESP keys do math */
};


/*****************************************************************************
 * Number input
 *****************************************************************************/
/* Multiple digits on display switch to ordinary mode until C or = */
function calcCheckOrdinary() {
    if (calc.entry.length > 1) {
        calc.ordinary = true;
    }
}

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
    } else {
        calc.entry = calc.entry + digit;
    }
    calcCheckOrdinary();
}


/*****************************************************************************
 * Ordinary math
 *****************************************************************************/
const CALC_DECIMALS = 10; /* Rounding hides float errors like 0.1 + 0.2 */

/* Result of operation, as text */
function calcOperate(first, operation, second) {
    const a = Number(first);
    const b = Number(second);
    let result = 0;

    if (operation == "add") {
        result = a + b;
    } else if (operation == "subtract") {
        result = a - b;
    } else if (operation == "multiply") {
        result = a * b;
    } else {
        if (b == 0) {
            return "Error";
        }
        result = a / b;
    }
    return String(Number(result.toFixed(CALC_DECIMALS)));
}

/* Display shows a number, not Error */
function calcEntryIsNumber() {
    return !Number.isNaN(Number(calc.entry));
}


/*****************************************************************************
 * ESP keys: ESP sum with single digits, ordinary math with multiple digits
 *****************************************************************************/
/* Number on display becomes first number, key gives operation */
function calcEsp(operation) {
    if (!calcEntryIsNumber()) {
        return;
    }
    calcCheckOrdinary();

    /* Second number given: ordinary mode chains, ESP sum waits for = */
    if (calc.first != undefined && calc.secondStarted) {
        if (!calc.ordinary) {
            return;
        }
        calc.entry = calcOperate(calc.first, calc.operation, calc.entry);
    }

    calc.first         = calc.entry;
    calc.operation     = operation;
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

/* Result of two numbers: ordinary math or ESP sum */
function calcPairResult() {
    if (calc.ordinary) {
        return calcOperate(calc.first, calc.operation, calc.entry);
    }
    return calcAdd(calc.first, calc.entry);
}

/* Show result, then next number starts in ESP mode again */
function calcEquals() {
    if (calc.resultShown) {
        return;
    }
    if (calc.first != undefined && !calc.secondStarted) {
        return; /* Wait for second number */
    }

    if (calc.first != undefined) {
        calc.entry = calcPairResult();
    } else {
        calc.entry = String(calcDigitResult(calc.entry));
    }
    calc.first       = undefined;
    calc.ordinary    = false;
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
    calc.ordinary      = false;
}
