//Variables
let display = document.getElementById("display");
let buttons = Array.from(document.getElementsByClassName("btn"));

//Limitando los caracteres a maximo 16.
display.addEventListener("input", function () {
  if (this.value.length > 16) {
    this.value = this.value.slice(0, 16);
  }
});

//Separando los valores con ,

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
