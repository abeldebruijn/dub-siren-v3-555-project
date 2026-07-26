(function () {
  var explorer = document.querySelector("[data-bit-explorer]");
  if (!explorer) return;

  var input = explorer.querySelector("[data-channel-input]");
  var numberOutput = explorer.querySelector("[data-channel-number]");
  var binaryOutput = explorer.querySelector("[data-channel-binary]");
  var s0Equation = explorer.querySelector("[data-s0-equation]");
  var s1Equation = explorer.querySelector("[data-s1-equation]");
  var rows = explorer.querySelectorAll("[data-channel-row]");
  var digits = explorer.querySelectorAll("[data-bit-position]");

  function binary3(number) {
    return number.toString(2).padStart(3, "0");
  }

  function update() {
    var channel = Number(input.value);
    var binary = binary3(channel);
    var shifted = channel >> 1;
    var s0 = channel & 1;
    var s1 = shifted & 1;

    numberOutput.textContent = channel;
    binaryOutput.textContent = binary;
    s0Equation.textContent =
      binary + " & 001 = " + binary3(channel & 1) + "\nS0 = " + s0;
    s1Equation.textContent =
      binary + " >> 1 = " + binary3(shifted) + "\n" +
      binary3(shifted) + " & 001 = " + binary3(s1) + "\nS1 = " + s1;

    digits.forEach(function (digit) {
      var position = Number(digit.dataset.bitPosition);
      var value = (channel >> position) & 1;
      digit.querySelector("strong").textContent = value;
      digit.classList.toggle("is-on", value === 1);
    });

    rows.forEach(function (row) {
      row.classList.toggle(
        "is-selected",
        Number(row.dataset.channelRow) === channel
      );
    });
  }

  input.addEventListener("input", update);
  update();
})();
