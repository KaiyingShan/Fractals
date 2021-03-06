// import {Decimal} from 'decimal.js';

Decimal.set({
    precision: 100,
    toExpNeg: -100,
    toExpPos: 100
});

function hexToFloat() {
    const hexStr = document.getElementById('hex').value;
    let exp = document.getElementById('exponent').value;
    let mts = document.getElementById('mantissa').value;

    const procedure = document.getElementById('proc');
    document.getElementById('convert-result').innerHTML = '';

    const dec = parseInt('0x' + hexStr, 16);
    exp = parseInt(exp, 10);
    mts = parseInt(mts, 10);

    if (isNaN(dec) || isNaN(exp) || isNaN(mts)) {
        alert('Illegal Input!!!');
        return;
    }

    procedure.innerHTML = 'Procedure: <br>';

    const bin = dec.toString(2);
    const binStr = ('0000' + '0'.repeat(1 + exp + mts) + bin).substr(-1 - exp - mts);

    procedure.innerHTML += 'Converted to binary: ' + binStr + '<br>';

    const end = document.getElementsByName('endianess');

    let raw = '';

    if (end[1].checked) {
        // process for little endian
        for (let i = binStr.length; i > 0; i -= 8) {
            raw += binStr.substring(i - 8, i);
        }

        procedure.innerHTML += 'Convert to big endian form: ' + raw + '<br>';
    } else if (end[0].checked) {
        // big endian
        raw = binStr;
    } else {
        // neither was selected
        alert("please select an endianess. If you don't know what this is, select big endian.");
        return;
    }

    let sign = raw.substring(0, 1);
    let exponent = raw.substring(1, 1 + exp);
    let mantissa = raw.substring(1 + exp, 1 + exp + mts);

    procedure.innerHTML += 'Sign bit: ' + sign + ' => ' + (sign === '1' ? 'Negative' : 'Positive');
    procedure.innerHTML += '<br>Exponent bits: ' + exponent + '\\(\\ \\rightarrow\\ \\)';

    let exponentNum = 0;
    let first_exp = true;
    for (let i = 0; i < exponent.length; i++) {
        if (exponent.substring(i, i + 1) === '1') {
            exponentNum += 2 ** (exp - 1 - i);
            if (!first_exp) {
                procedure.innerHTML += '\\(+\\)';
            } else {
                first_exp = false;
            }
            procedure.innerHTML += '\\(2^{' + (exp - 1 - i) + '}\\)';
        }
    }
    procedure.innerHTML += '\\(\\ \\rightarrow\\ ' + exponentNum + '-(2^{' + (exp - 1) + '} - 1)';

    exponentNum -= 2 ** (exp - 1) - 1;

    procedure.innerHTML += '\\ =\\ ' + exponentNum + '\\)';

    procedure.innerHTML += '<br>Mantissa bits: ' + mantissa + '\\(\\rightarrow\\)';

    let mantissaNum = 1;
    procedure.innerHTML += '\\(1\\)';
    for (let i = 0; i < mantissa.length; i++) {
        if (mantissa.substring(i, i + 1) === '1') {
            mantissaNum += 2 ** (-1 * (i + 1));
            procedure.innerHTML += '\\(+\\frac{1}{2^{' + (i + 1) + '}}\\)';
        }
    }

    const mts_decimal = new Decimal(mantissaNum);

    const exp_decimal = new Decimal(exponentNum);

    const two = new Decimal(2);

    const ten = new Decimal(10);

    // result = mts * (2 ** exp)

    const result = mts_decimal.mul(Decimal.pow(two, exp_decimal));

    procedure.innerHTML += '<br>';

    procedure.innerHTML +=
        'result = \\(' +
        (sign === '1' ? '-' : '') +
        mantissaNum +
        '\\cdot 2^{' +
        exponentNum +
        '}\\)<br>';

    let dec_coeff = result;
    let dec_exp = 0;

    while (dec_coeff.greaterThan(ten) || dec_coeff.equals(ten)) {
        dec_coeff = dec_coeff.div(ten);
        dec_exp += 1;
    }

    while (dec_coeff.lessThan(1)) {
        dec_coeff = dec_coeff.mul(ten);
        dec_exp -= 1;
    }

    const zeros = new Decimal(100000000000000000000);

    document.getElementById('convert-result').innerHTML =
        '\\(' +
        (sign === '1' ? '-' : '') +
        dec_coeff
            .mul(zeros)
            .round(5)
            .div(zeros) +
        '\\cdot 10^{' +
        dec_exp +
        '}\\)';

    // document.getElementById('convert-result').innerHTML += mantissaNum * 2 ** exponentNum;

    if (!document.getElementById('procedure').checked) {
        procedure.innerHTML = '';
    }

    MathJax.Hub.Queue(['Typeset', MathJax.Hub]);
}

function floattohex() {
    let f_temp = document.getElementById('float').value;

    let exp_bit = document.getElementById('exponent2').value;
    let mts_bit = document.getElementById('mantissa2').value;

    exp_bit = parseInt(exp_bit);
    mts_bit = parseInt(mts_bit);

    let f_float = parseFloat(f_temp);

    // if(isNaN(f_float) || isNaN(exp_bit) || isNaN()){
    //     alert("Illegal Input!!!");
    // }

    if (f_temp === 0) {
        document.getElementById('hex-result').innerHTML = '0x00000000';
        return;
    }
    let f = new Decimal(f_temp);
    let exp = 0;
    let sign = f.greaterThan(0) ? 0 : 1;
    f = f.mul(f.greaterThan(0) ? 1 : -1);

    let procedure = document.getElementById('hex-proc');
    procedure.innerHTML = '';
    procedure.innerHTML += 'Sign bit: \\(' + sign + '\\)<br>';
    procedure.innerHTML += 'Exponent bit: ';

    while (f.greaterThan(2)) {
        f = f.div(2);
        exp++;
    }

    while (f.lessThan(1)) {
        f = f.mul(2);
        exp--;
    }

    procedure.innerHTML += exp + ' => \\(' + (exp + 2 ** (exp_bit - 1) - 1).toString(2) + '\\)<br>';
    procedure.innerHTML += 'Mantissa bit: ';

    let mantissa = f.minus(1);
    let mStr = '';

    const two = new Decimal(2);

    let firstBit = true;

    for (let i = 1; i <= mts_bit; i++) {
        let temp = two.pow(-i);
        if (mantissa.greaterThan(temp) || mantissa.equals(temp)) {
            if (firstBit) {
                procedure.innerHTML += '\\(\\frac{' + 1 + '}{' + i + '}\\)';
                firstBit = false;
            } else {
                procedure.innerHTML += '\\( + \\frac{' + 1 + '}{' + i + '}\\)';
            }
            mStr += '1';
            mantissa = mantissa.minus(two.pow(-i));
        } else {
            mStr += '0';
        }
    }

    let bin = sign.toString(2) + (exp + 2 ** (exp_bit - 1) - 1).toString(2) + mStr;

    procedure.innerHTML += '=> \\(' + mStr + '\\)';

    let hex = parseInt(bin, 2).toString(16);

    document.getElementById('hex-result').innerHTML = '0x' + hex;

    if (!document.getElementById('procedure-hex').checked) {
        procedure.innerHTML = '';
    }

    MathJax.Hub.Queue(['Typeset', MathJax.Hub]);
}

function useFloat2() {
    document.getElementById('exponent2').value = '8';
    document.getElementById('mantissa2').value = '23';
}

function useDouble2() {
    document.getElementById('exponent2').value = '11';
    document.getElementById('mantissa2').value = '52';
}

function useFloat() {
    document.getElementById('exponent').value = '8';
    document.getElementById('mantissa').value = '23';
}

function useDouble() {
    document.getElementById('exponent').value = '11';
    document.getElementById('mantissa').value = '52';
    console.log('???');
}
