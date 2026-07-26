(function () {
  var keywords = new Set([
    "False", "None", "True", "and", "as", "assert", "break", "class",
    "continue", "def", "del", "elif", "else", "except", "finally", "for",
    "from", "global", "if", "import", "in", "is", "lambda", "nonlocal",
    "not", "or", "pass", "raise", "return", "try", "while", "with", "yield"
  ]);

  var builtins = new Set([
    "abs", "bool", "dict", "float", "int", "len", "list", "max", "min",
    "print", "range", "round", "set", "str", "sum", "tuple"
  ]);

  function escapeHtml(text) {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function span(className, text) {
    return '<span class="' + className + '">' + escapeHtml(text) + "</span>";
  }

  function readString(source, start) {
    var quote = source[start];
    var triple = source.slice(start, start + 3) === quote + quote + quote;
    var endQuote = triple ? quote + quote + quote : quote;
    var index = start + (triple ? 3 : 1);

    while (index < source.length) {
      if (source[index] === "\\") {
        index += 2;
        continue;
      }

      if (source.slice(index, index + endQuote.length) === endQuote) {
        return source.slice(start, index + endQuote.length);
      }

      index += 1;
    }

    return source.slice(start);
  }

  function highlightPython(source) {
    var output = "";
    var index = 0;

    while (index < source.length) {
      var char = source[index];

      if (char === "#") {
        var commentEnd = source.indexOf("\n", index);
        if (commentEnd === -1) commentEnd = source.length;
        output += span("py-comment", source.slice(index, commentEnd));
        index = commentEnd;
        continue;
      }

      if (char === '"' || char === "'") {
        var stringToken = readString(source, index);
        output += span("py-string", stringToken);
        index += stringToken.length;
        continue;
      }

      if (/[0-9]/.test(char)) {
        var numberMatch = source.slice(index).match(/^[0-9]+(?:\.[0-9]+)?/);
        output += span("py-number", numberMatch[0]);
        index += numberMatch[0].length;
        continue;
      }

      if (/[A-Za-z_]/.test(char)) {
        var wordMatch = source.slice(index).match(/^[A-Za-z_][A-Za-z0-9_]*/);
        var word = wordMatch[0];
        var nextChar = source[index + word.length];

        if (keywords.has(word)) {
          output += span("py-keyword", word);
        } else if (builtins.has(word)) {
          output += span("py-builtin", word);
        } else if (nextChar === "(") {
          output += span("py-call", word);
        } else {
          output += escapeHtml(word);
        }

        index += word.length;
        continue;
      }

      output += escapeHtml(char);
      index += 1;
    }

    return output;
  }

  document.querySelectorAll("pre code").forEach(function (block) {
    if (block.dataset.highlighted === "python") return;
    block.innerHTML = highlightPython(block.textContent);
    block.dataset.highlighted = "python";
  });
})();
