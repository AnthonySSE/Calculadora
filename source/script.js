//Variables
let display = document.getElementById("display");
let buttons = Array.from(document.getElementsByClassName("btn"));

//Limitando los caracteres a maximo 16.
display.addEventListener("input", function () {
  if (this.value.length > 16) {
    this.value = this.value.slice(0, 16);
  }
});

//Colocando el cursor al final del display

//Al enfocar
display.addEventListener("focus", function () {
  const length = this.value.length;
  this.setSelectionRange(length, length);
});

//Al hacer click
display.addEventListener("mouseup", function (e) {
  e.preventDefault(); // Previene que el navegador cambie la posición del cursor
  const length = this.value.length;
  this.setSelectionRange(length, length);
});

//Eliminar el valor de 0 si se pulsa cualquier numero.
display.addEventListener("input", function () {
  if (this.value.length > 1 && this.value.startsWith("0")) {
    this.value = this.value.slice(1); // Elimina el 0 inicial
  }
});

//Solo permitir ingresar numeros.
display.addEventListener("input", function (e) {
  const key = e.key;
  if (key < "0" || key > "9") {
    e.preventDefault();
  }
});

//Obteniendo el valor de los botones y añadiendolos al display.
buttons.map((button) => {
  button.addEventListener("click", () => {
    let valor = button.value;
    if (display.value.length < 16) {
      if (display.value === "0") {
        display.value = valor;
      } else {
        display.value += valor;
      }
    }
  });
});