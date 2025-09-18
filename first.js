  function calculateShare() {
      const amount = parseFloat(document.getElementById("amount").value);
      const employees = parseInt(document.getElementById("employees").value);
      const resultDiv = document.getElementById("result");

      if (isNaN(amount) || isNaN(employees)) {
        resultDiv.innerHTML = "<p>Please enter valid numbers.</p>";
        return;
      }

      if (employees <= 0) {
        resultDiv.innerHTML = "<p style='color:#ff6b81;'>Error: Number of employees must be greater than 0!</p>";
        return;
      }

      const share = amount / employees;
      resultDiv.innerHTML = `<p>Each employee will get: <strong style="color:#00e5ff;">${share.toFixed(2)}</strong></p>`;
    }

    function resetForm() {
      document.getElementById("amount").value = "";
      document.getElementById("employees").value = "";
      document.getElementById("result").innerHTML = "";
    }