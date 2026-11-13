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

/* After result or ESP key, next key starts new number at 0 */
function calcStartEntry() {
    if (calc.resultShown) {
        calc.entry       = "0";
        calc.resultShown = false;
    }

    /* First digit after ESP key starts second number */
    if (calc.first != undefined && !calc.secondStarted) {
        calc.entry         = "0";
        calc.secondStarted = true;
    }
}

/* Add digit to end of entry, first digit replaces lone zero, no length limit */
function calcDigit(digit) {
    calcStartEntry();

    if (calc.entry == "0") {
        calc.entry = digit;
    } else {
        calc.entry = calc.entry + digit;
    }
    calcCheckOrdinary();
}


/* Decimal point, one per number, alone starts as 0. */
function calcPoint() {
    calcStartEntry();
    if (calc.entry.includes(".")) {
        return;
    }
    calc.entry = calc.entry + ".";
    calcCheckOrdinary();
}


/* Change sign of number on display, 0 and Error stay, not right after ESP key */
function calcSign() {
    if (!calcEntryIsNumber() || Number(calc.entry) == 0) {
        return;
    }
    if (calc.first != undefined && !calc.secondStarted) {
        return;
    }

    if (calc.entry.startsWith("-")) {
        calc.entry = calc.entry.slice(1);
    } else {
        calc.entry = "-" + calc.entry;
    }
    calcCheckOrdinary();
}


/*****************************************************************************
 * Ordinary math
 *****************************************************************************/
const CALC_RESULT_DIGITS = 8; /* Result rounded to fit display, also hides float errors */

const CALC_SMALLEST_FIXED = 0.001; /* Smaller results use exponential format */

/* Too big or too small for 8 digits without exponent */
function calcNeedsExponent(result) {
    const size = Math.abs(result);

    if (size >= 10 ** CALC_RESULT_DIGITS) {
        return true;
    }
    return size > 0 && size < CALC_SMALLEST_FIXED;
}

/* Minus sign takes room of one digit */
function calcSignDigits(result) {
    if (result < 0) {
        return 1;
    }
    return 0;
}

/* Like 1.2346e11, exponent, one more digit and minus use up mantissa digits */
function calcExponentResult(result) {
    const exponentText = "e" + Math.floor(Math.log10(Math.abs(result)));
    const digits       = CALC_RESULT_DIGITS - exponentText.length - calcSignDigits(result);
    const parts        = result.toExponential(digits - 1).split("e");

    return String(Number(parts[0])) + "e" + Number(parts[1]);
}

/* Round decimals so minus, digits and point take at most 8 places */
function calcFixedResult(result) {
    const wholeDigits = String(Math.trunc(Math.abs(result))).length;
    const room        = CALC_RESULT_DIGITS - wholeDigits - calcSignDigits(result);
    let decimals      = 0;

    if (room >= 2) {
        decimals = room - 1; /* Point takes one place */
    }
    return String(Number(result.toFixed(decimals)));
}

/* Fixed format if it fits, else exponent */
function calcRoundResult(result) {
    if (calcNeedsExponent(result)) {
        return calcExponentResult(result);
    }

    const fixed = calcFixedResult(result);
    if (fixed.length > CALC_RESULT_DIGITS) {
        return calcExponentResult(result); /* Negative or rounded up too long */
    }
    return fixed;
}

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
    return calcRoundResult(result);
}

/* Display shows a number, not Error */
function calcEntryIsNumber() {
    return !Number.isNaN(Number(calc.entry));
}


/*****************************************************************************
 * ESP keys: ESP sum only for digit, ESP key, digit, =
 * Anything else is ordinary math
 *****************************************************************************/
/* Number on display becomes first number, key gives operation */
function calcEsp(operation) {
    if (!calcEntryIsNumber()) {
        return;
    }
    calcCheckOrdinary();

    /* Second ESP key, or ESP key on a result: no ESP sum */
    if (calc.first != undefined || calc.resultShown) {
        calc.ordinary = true;
    }

    /* Second number given: chain like ordinary calculator */
    if (calc.first != undefined && calc.secondStarted) {
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
        if (digit >= "0" && digit <= "9") {
            sum = sum + Number(digit); /* Point and minus are skipped */
        }
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
