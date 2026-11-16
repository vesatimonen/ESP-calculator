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
/* After result, next digit starts new number at 0 */
function calcStartEntry() {
    if (calc.resultShown) {
        calc.entry       = "0";
        calc.resultShown = false;
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


/*****************************************************************************
 * Digit sums
 *****************************************************************************/
/* Sum of all digits in text */
function calcDigitSum(text) {
    let sum = 0;

    for (const digit of text) {
        if (digit >= "0" && digit <= "9") {
            sum = sum + Number(digit);
        }
    }
    return sum;
}

/* Count of digits in text */
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
    calc.resultShown = true;
}


/*****************************************************************************
 * Wave key, special results
 *****************************************************************************/
/* Multiple digits typed, not a result */
function calcWaveSpecial() {
    if (calc.resultShown) {
        return false;
    }
    return calcDigitCount(calc.entry) > 1;
}

/* Exactly two digits typed */
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

/* Special result right after multiple digits, else number shown as result */
function calcWave() {
    if (calcWaveSpecial()) {
        calcShowResult(calcSpecialResult(calc.entry));
        return;
    }
    calcShowResult(calc.entry);
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
    calc.entry       = "0";
    calc.resultShown = false;
}
