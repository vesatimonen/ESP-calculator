/*****************************************************************************
 * Calculator state
 *****************************************************************************/
const calc = {
    entry:         "0",       /* Number being typed, as text */
    resultShown:   false,     /* Display shows result, next digit starts new entry */
    first:         undefined, /* First number, set by operator key */
    operation:     undefined, /* Operation of operator key */
    secondStarted: false      /* Digit typed after operator key */
};


/*****************************************************************************
 * Number input
 *****************************************************************************/
/* After result or operator key, next key starts new number at 0 */
function calcStartEntry() {
    if (calc.resultShown) {
        calc.entry       = "0";
        calc.resultShown = false;
    }

    /* First digit after operator key starts second number */
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
}


/* Decimal point, one per number, alone starts as 0. */
function calcPoint() {
    calcStartEntry();
    if (calc.entry.includes(".")) {
        return;
    }
    calc.entry = calc.entry + ".";
}


/* Change sign of number on display, 0 and Error stay, not right after operator key */
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
 * Operator keys, work like ordinary calculator
 *****************************************************************************/
/* Number on display becomes first number, key gives operation */
function calcEsp(operation) {
    if (!calcEntryIsNumber()) {
        return;
    }

    /* Second number given: chain calculations */
    if (calc.first != undefined && calc.secondStarted) {
        calc.entry = calcOperate(calc.first, calc.operation, calc.entry);
    }

    calc.first         = calc.entry;
    calc.operation     = operation;
    calc.secondStarted = false;
    calc.resultShown   = false;
}


/*****************************************************************************
 * Equals and digit sums
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

/* Count of digits in text, point and minus are skipped */
function calcDigitCount(text) {
    let count = 0;

    for (const digit of text) {
        if (digit >= "0" && digit <= "9") {
            count = count + 1;
        }
    }
    return count;
}

/* Result is digit sum modulo 9, any amount of digits */
function calcDigitResult(text) {
    return calcDigitSum(text) % 9;
}

/* Result shown, next digit starts new number */
function calcShowResult(result) {
    calc.entry       = result;
    calc.first       = undefined;
    calc.resultShown = true;
}

/* Normal calculator equals */
function calcEquals() {
    if (!calcEntryIsNumber()) {
        return;
    }
    if (calc.first == undefined) {
        calcShowResult(calc.entry);
        return;
    }
    if (!calc.secondStarted) {
        return; /* Wait for second number */
    }
    calcShowResult(calcOperate(calc.first, calc.operation, calc.entry));
}


/*****************************************************************************
 * Wave key, special results
 *****************************************************************************/
/* Multiple digits typed, no operator before them */
function calcWaveSpecial() {
    if (calc.first != undefined || calc.resultShown) {
        return false;
    }
    return calcDigitCount(calc.entry) > 1;
}

/* Exactly two digits typed, no point or minus */
function calcIsTwoDigits(text) {
    return text.length == 2 && calcDigitCount(text) == 2;
}

/* Two different digits 1-8 use circle rule */
function calcIsCirclePair(text) {
    if (!calcIsTwoDigits(text)) {
        return false;
    }
    const a = Number(text[0]);
    const b = Number(text[1]);

    return a != b && circleIsNumber(a) && circleIsNumber(b);
}

/* Circle rule for two digits 1-8, else modulo 9 (0, 9, same digits, more digits) */
function calcSpecialResult(text) {
    if (calcIsCirclePair(text)) {
        return String(circleThird(Number(text[0]), Number(text[1])));
    }
    return String(calcDigitResult(text));
}

/* Special result right after multiple digits, else same as = */
function calcWave() {
    if (calcWaveSpecial()) {
        calcShowResult(calcSpecialResult(calc.entry));
        return;
    }
    calcEquals();
}


/*****************************************************************************
 * Circle rule: numbers 1-8 around a clock, 8 is followed by 1
 *****************************************************************************/
const CIRCLE_SIZE = 8;

/* Whole number from 1 to 8 */
function circleIsNumber(number) {
    return Number.isInteger(number) && number >= 1 && number <= CIRCLE_SIZE;
}

/* Throw clear error if not whole number 1-8 */
function circleCheckNumber(number, name) {
    if (!circleIsNumber(number)) {
        throw new Error(name + " must be a whole number from 1 to 8, got " + number);
    }
}

/* Number some steps forward, wraps from 8 to 1 */
function circleForward(start, steps) {
    return (start - 1 + steps) % CIRCLE_SIZE + 1;
}

/* Steps forward from a to b, 1 to 7 */
function circleSteps(a, b) {
    return (b - a + CIRCLE_SIZE) % CIRCLE_SIZE;
}

/* Third number: 1-4 steps, one past b, 5-7 steps, two past a */
function circleThird(a, b) {
    circleCheckNumber(a, "a");
    circleCheckNumber(b, "b");
    if (a == b) {
        throw new Error("a and b must be different, both are " + a);
    }

    if (circleSteps(a, b) <= 4) {
        return circleForward(b, 1);
    }
    return circleForward(a, 2);
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
