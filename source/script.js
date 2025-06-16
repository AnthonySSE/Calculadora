// Variables
let display = document.getElementById("display");
let buttons = Array.from(document.getElementsByClassName("btn"));
let currentInput = "0"; // Almacena el número actual que el usuario está ingresando
let operator = null;    // Almacena el operador seleccionado 
let previousInput = null; // Almacena el primer operando para cálculos
let waitingForSecondOperand = false; // Indica si estamos esperando el segundo número después de un operador
let historyDisplay = document.getElementById("historyDisplay"); // Referencia al display de historial
let currentExpression = ""; // Almacena la cadena de la expresión (ej. "1 + 2 -")

// Variables para repetición de operación con '='
let lastOperand = null;   // Almacena el segundo operando de la última operación para repetición
let lastOperator = null;  // Almacena el operador de la última operación para repetición

// Función para formatear un número para el display
function formatNumberForDisplay(numberString) {
    if (numberString === "" || numberString === null || numberString === undefined) {
        return "0";
    }

    // Para evitar formatear mensajes de error como "Cannot divide by zero"
    if (isNaN(parseFloat(numberString)) && !numberString.includes('.')) {
        return numberString;
    }

    // Maneja el caso de "0." o un número que termina en "." mientras se escribe
    if (numberString.endsWith('.') && numberString.length > 1) {
        let tempNum = parseFloat(numberString.slice(0, -1));
        return new Intl.NumberFormat('en-US').format(tempNum) + '.';
    }
    if (numberString === "0.") {
        return "0.";
    }
    if (numberString === ".") { // Si solo se ha ingresado un punto
        return "0."; // Mostrar "0." en lugar de solo "."
    }

    let num = parseFloat(numberString);
    if (isNaN(num)) {
        return "0";
    }

    const parts = numberString.split('.');
    const integerPart = parts[0];
    const decimalPart = parts[1];

    let formattedIntegerPart = new Intl.NumberFormat('en-US').format(parseFloat(integerPart));

    if (decimalPart !== undefined) {
        // Asegurar que los ceros finales en la parte decimal se mantengan
        return formattedIntegerPart + '.' + decimalPart;
    } else {
        return formattedIntegerPart;
    }
}

// Helper para obtener el símbolo de operador (debe estar disponible globalmente)
const getOperatorSymbol = (opId) => {
    switch (opId) {
        case 'add': return ' + ';
        case 'subtract': return ' - ';
        case 'multiply': return ' x ';
        case 'divide': return ' / ';
        default: return '';
    }
};

// Función principal para actualizar el display HTML
function updateDisplay() {
    display.value = formatNumberForDisplay(currentInput);
}

// Función para actualizar el display de historial
function updateHistoryDisplay() {
    let historyText = "";

    if (currentExpression.includes('=')) {
        historyText = currentExpression;
    } else if (previousInput !== null && operator !== null) {
        historyText += formatNumberForDisplay(previousInput.toString()) + getOperatorSymbol(operator);
        if (!waitingForSecondOperand) {
            historyText += formatNumberForDisplay(currentInput);
        }
    } else {
        historyText = "";
    }

    historyDisplay.innerText = historyText;
}

// --- Inicialización ---
updateDisplay();
updateHistoryDisplay();

// Función para realizar el cálculo basado en el operador actual
function calculate() {
    let result;
    const prev = parseFloat(previousInput);
    const current = parseFloat(currentInput);

    if (isNaN(prev) || isNaN(current)) return currentInput;

    switch (operator) {
        case 'add':
            result = prev + current;
            break;
        case 'subtract':
            result = prev - current;
            break;
        case 'multiply':
            result = prev * current;
            break;
        case 'divide':
            if (current === 0) {
                return "Cannot divide by zero";
            }
            result = prev / current;
            break;
        default:
            return currentInput;
    }
    return parseFloat(result.toFixed(12)).toString(); // Ajusta la precisión
}

// --- Manejo del Cursor ---
display.addEventListener("focus", function () {
    const length = this.value.length;
    this.setSelectionRange(length, length);
});

display.addEventListener("mouseup", function (e) {
    e.preventDefault();
    const length = this.value.length;
    this.setSelectionRange(length, length);
});


// --- Manejo de la Lógica ---

// Manejo unificado de entrada de dígitos
function handleDigitInput(digit) {
    if (currentInput === "Cannot divide by zero" || currentInput === "Invalid Input") {
        currentInput = "0";
        currentExpression = ""; // Limpiar historial después de un error
    }

    // Si un cálculo acaba de terminar (historial muestra un '='),
    // y se presiona un dígito, se inicia una nueva operación.
    if (currentExpression.includes('=')) {
        currentExpression = ""; // Limpiar el historial
        previousInput = null; // Reiniciar el primer operando
        operator = null; // Reiniciar el operador
        waitingForSecondOperand = false; // Ya no esperamos el segundo operando
        currentInput = "0"; // Reiniciar la entrada actual antes de añadir el dígito
    }

    if (currentInput.length >= 16 && !waitingForSecondOperand) {
        return; // Límite de caracteres
    }

    if (waitingForSecondOperand) {
        currentInput = (digit === '.') ? "0." : digit;
        waitingForSecondOperand = false;
    } else if (currentInput === "0" && digit !== '.') {
        currentInput = digit;
    } else if (digit === '.' && currentInput.includes('.')) {
        return;
    } else {
        currentInput += digit;
    }
    updateDisplay();
    updateHistoryDisplay();
}

// Manejo unificado de operadores (+, -, x, /)
function handleOperatorInput(opId) {
    if (currentInput === "Cannot divide by zero" || currentInput === "Invalid Input") {
        return; // No permitir operadores en estados de error
    }

    // Si previousInput es nulo, significa que es el primer número de una nueva operación (ej. "5 +")
    if (previousInput === null) {
        previousInput = parseFloat(currentInput);
    }
    // Si ya hay un operador y NO estamos esperando el segundo operando, o si acabamos de terminar un cálculo 
    else if ((operator !== null && !waitingForSecondOperand) || (operator === null && previousInput !== null)) {
        // Realizar el cálculo pendiente antes de aplicar el nuevo operador
        const result = calculate();
        if (typeof result === 'string') { // Manejar errores de cálculo
            currentInput = result;
            currentExpression = "";
            operator = null;
            previousInput = null;
            waitingForSecondOperand = false;
            lastOperand = null; // Limpiar para evitar repetición de error
            lastOperator = null;
            updateDisplay();
            updateHistoryDisplay();
            return;
        }
        currentInput = result; // El resultado se convierte en la entrada actual (para mostrar en el display principal)
        previousInput = parseFloat(currentInput); // Y en el nuevo previousInput para encadenar la siguiente operación
    }
    // Si 'waitingForSecondOperand' es true (ej. "5 + -" o "5 - +"),
    // simplemente se cambia el operador sin calcular.

    operator = opId; // Establecer el nuevo operador
    waitingForSecondOperand = true; // Ahora esperamos el segundo operando

    // Actualizar currentExpression con el previousInput y el operador (para el historial)
    currentExpression = formatNumberForDisplay(previousInput.toString()) + getOperatorSymbol(operator);

    updateHistoryDisplay(); // Actualizar el display de historial
    updateDisplay(); // Asegurarse de que el display principal muestre el resultado encadenado o el primer operando
}

// Manejo unificado del botón de Igual (=)
function handleEqualInput() {
    // Si no hay operación pendiente y no hay una última operación para repetir
    if (previousInput === null || operator === null || currentInput === "Cannot divide by zero" || currentInput === "Invalid Input") {
        // Comprobar repetición de operación (ej. 5+3=8, luego = -> 8+3=11)
        if (lastOperand !== null && lastOperator !== null && previousInput !== null) {
            operator = lastOperator; // Usar el último operador
            currentInput = lastOperand.toString(); // Establecer currentInput al operando que queremos repetir
            // La función continuará con el cálculo como si fuera una nueva operación
        } else {
            return; // No hay operación para realizar
        }
    }

    // Determinar el segundo operando real para el cálculo y para mostrar en el historial.
    // Si waitingForSecondOperand es true, el usuario presionó un operador y luego '=',
    // por lo que el segundo operando es implícitamente el primero.
    let actualSecondOperandForCalculation = parseFloat(currentInput);
    if (waitingForSecondOperand) {
        actualSecondOperandForCalculation = previousInput;
    }

    // Almacenar estos valores para la próxima posible repetición del '='
    lastOperand = actualSecondOperandForCalculation;
    lastOperator = operator;

    // Construir la cadena de la expresión para el historial ANTES de realizar el cálculo.
    // Usar el estado actual de previousInput, operator, y el operando real determinado.
    currentExpression = formatNumberForDisplay(previousInput.toString()) + getOperatorSymbol(operator) + formatNumberForDisplay(actualSecondOperandForCalculation.toString()) + " =";
    updateHistoryDisplay(); // Mostrar "111 + 222 =" o "5 + 5 ="

    // Temporalmente establecer currentInput al valor que `calculate()` necesita como su segundo operando
    const originalCurrentInputForCalculate = currentInput;
    currentInput = actualSecondOperandForCalculation.toString();

    const result = calculate(); // Realiza el cálculo

    // Restablece currentInput al resultado calculado o al mensaje de error
    if (typeof result === 'string' && (result.includes("divide by zero") || result.includes("Invalid Input"))) {
        currentInput = result; // Muestra el mensaje de error
        operator = null;
        previousInput = null;
        waitingForSecondOperand = false;
        currentExpression = ""; // Limpiar la cadena de historial en caso de error
        lastOperand = null; // Limpiar el estado de repetición
        lastOperator = null;
        updateHistoryDisplay(); // Actualizar el historial para que muestre vacío
    } else {
        currentInput = result; // Muestra el resultado numérico
        previousInput = parseFloat(currentInput); // El resultado se convierte en el nuevo previousInput para encadenar
        operator = null; // Limpiar el operador, este cálculo ha terminado
        waitingForSecondOperand = false; // Ya no esperamos el segundo operando
    }

    updateDisplay(); // Actualiza el display principal con el resultado o el mensaje de error
}


// --- Manejo de Eventos: Botones ---
buttons.map((button) => {
    button.addEventListener("click", () => {
        const buttonValue = button.value;
        const buttonId = button.id;

        // 1. Manejo de entrada numérica (0-9) y el punto decimal (.)
        if (!isNaN(parseFloat(buttonValue))) {
            handleDigitInput(buttonValue);
        } else if (buttonId === 'dot') {
            handleDigitInput('.');
        }

        // 2. Manejo de botones de control (C, CE, Delete, +/-)
        else if (buttonId === 'btn-clear-all') { // Botón C (Clear All)
            currentInput = "0";
            operator = null;
            previousInput = null;
            waitingForSecondOperand = false;
            currentExpression = "";
            lastOperand = null; // Limpiar para repetición
            lastOperator = null; // Limpiar para repetición
            updateDisplay();
            updateHistoryDisplay();
        } else if (buttonId === 'btn-clear') { // Botón CE (Clear Entry)
            currentInput = "0";
            updateDisplay();
            if (currentExpression.includes('=')) { // Si se borra la entrada después de un resultado
                currentExpression = "";
                updateHistoryDisplay();
            }
        } else if (buttonId === 'btn-delete') { // Botón de retroceso (Backspace)
            if (currentInput === "Cannot divide by zero" || currentInput === "Invalid Input") {
                 currentInput = "0";
            } else if (currentInput.length > 1 && currentInput !== "0") {
                currentInput = currentInput.slice(0, -1);
                if (currentInput === "") currentInput = "0";
            } else {
                currentInput = "0";
            }
            updateDisplay();
            updateHistoryDisplay();
        } else if (buttonId === 'sign') { // Botón +/- (Cambiar signo)
            if (currentInput !== "0" && currentInput !== "0." &&
                currentInput !== "Cannot divide by zero" && currentInput !== "Invalid Input") {
                currentInput = (parseFloat(currentInput) * -1).toString();
                updateDisplay();
                updateHistoryDisplay();
            }
        }

        // 3. Manejo de Operadores (+, -, x, /)
        else if (buttonId === 'add' || buttonId === 'subtract' ||
                 buttonId === 'multiply' || buttonId === 'divide') {
            handleOperatorInput(buttonId);
        }

        // 4. Manejo del botón de Igual (=)
        else if (buttonId === 'equal') {
            handleEqualInput();
        }
        
        // 5. Manejo de operaciones unarias (%, x^2, 1/x, sqrt)
        else if (buttonId === 'btn-percentage') {
            if (currentInput !== "0" && currentInput !== "0." &&
                currentInput !== "Cannot divide by zero" && currentInput !== "Invalid Input") {
                let num = parseFloat(currentInput);
                let val;
                if (operator && previousInput !== null) {
                    val = (previousInput * num) / 100;
                } else {
                    val = num / 100;
                }
                currentInput = val.toString();
                updateDisplay();
                updateHistoryDisplay();
            }
        } else if (buttonId === 'one-divide-by-x') {
            let num = parseFloat(currentInput);
            if (num === 0) {
                currentInput = "Cannot divide by zero";
            } else {
                currentInput = (1 / num).toString();
            }
            updateDisplay();
            updateHistoryDisplay();
        } else if (buttonId === 'square-x') {
            let num = parseFloat(currentInput);
            currentInput = (num * num).toString();
            updateDisplay();
            updateHistoryDisplay();
        } else if (buttonId === 'square-root') {
            let num = parseFloat(currentInput);
            if (num < 0) {
                currentInput = "Invalid Input";
            } else {
                currentInput = Math.sqrt(num).toString();
            }
            updateDisplay();
            updateHistoryDisplay();
        }
    });
});

// --- Manejo de Eventos: Teclado Físico ---
document.addEventListener("keydown", (e) => {
    const key = e.key;

    // --- Números y punto decimal ---
    if ((key >= '0' && key <= '9') || key === '.' || key === ',') {
        e.preventDefault();
        const digit = (key === ',') ? '.' : key;
        handleDigitInput(digit);
    }
    // --- Teclas de control ---
    else if (key === 'Backspace') {
        e.preventDefault();
        if (currentInput === "Cannot divide by zero" || currentInput === "Invalid Input") {
             currentInput = "0";
        } else if (currentInput.length > 1 && currentInput !== "0") {
            currentInput = currentInput.slice(0, -1);
            if (currentInput === "") currentInput = "0";
        } else {
            currentInput = "0";
        }
        updateDisplay();
        updateHistoryDisplay();
    } else if (key === 'Escape') { // C (Clear All)
        e.preventDefault();
        currentInput = "0";
        operator = null;
        previousInput = null;
        waitingForSecondOperand = false;
        currentExpression = "";
        lastOperand = null; // Limpiar para repetición
        lastOperator = null; // Limpiar para repetición
        updateDisplay();
        updateHistoryDisplay();
    }
    // --- Operadores ---
    else if (key === '+' || key === '-' || key === '*' || key === '/') {
        e.preventDefault();
        const opIdMap = { '+': 'add', '-': 'subtract', '*': 'multiply', '/': 'divide' };
        const opId = opIdMap[key];
        handleOperatorInput(opId);
    }
    // --- Igual ---
    else if (key === 'Enter' || key === '=') {
        e.preventDefault();
        handleEqualInput();
    }
    // --- Bloquear otras teclas (letras, etc.) ---
    else {
        e.preventDefault();
    }
});