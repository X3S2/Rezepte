// Exportiere die Vorschau als Bild (PNG)
function exportImage() {
  const element = document.getElementById("preview");
  if (window.domtoimage && typeof window.domtoimage.toPng === 'function') {
    window.domtoimage.toPng(element, { bgcolor: '#fff' })
      .then(function (dataUrl) {
        const link = document.createElement('a');
        link.download = `${document.getElementById("recipeName").value || "Rezept"}.png`;
        link.href = dataUrl;
        link.click();
      })
      .catch(function (error) {
        alert('Bild-Export fehlgeschlagen: ' + (error && error.message ? error.message : error));
        console.error('Bild-Export Fehler:', error);
      });
  } else {
    alert('Bild-Export nicht möglich: dom-to-image Bibliothek wurde nicht geladen.');
  }
}
let ingredientCount = 0, stepCount = 0, tipCount = 0;

function addIngredient() {
  ingredientCount++;
  const div = document.getElementById("ingredients");
  const row = document.createElement("div");
  row.className = "flex gap-2 mb-2";
  // Mengenangabe
  const menge = document.createElement("input");
  menge.type = "number";
  menge.placeholder = "Menge";
  menge.className = "p-2 border rounded-lg";
  menge.style.width = "95px";
  menge.oninput = updatePreview;
  // Mengeneinheit
  const einheit = document.createElement("select");
  einheit.className = "p-2 border rounded-lg w-24";
  ["EL","TL","Stück","L","ml","g","kg","Prise","Päckchen","Dose","Bund","Scheibe","Tasse"].forEach(e => {
    const opt = document.createElement("option");
    opt.value = e;
    opt.text = e;
    einheit.appendChild(opt);
  });
  einheit.onchange = updatePreview;
  // Zutat
  const zutat = document.createElement("input");
  zutat.type = "text";
  zutat.placeholder = `Zutat ${ingredientCount}`;
  zutat.className = "p-2 border rounded-lg flex-1";
  zutat.oninput = updatePreview;
  row.appendChild(menge);
  row.appendChild(einheit);
  row.appendChild(zutat);
  div.appendChild(row);
}

function addStep() {
  stepCount++;
  const div = document.getElementById("steps");
  const textarea = document.createElement("textarea");
  textarea.placeholder = `Schritt ${stepCount}`;
  textarea.className = "w-full p-2 border rounded-lg mb-2";
  textarea.oninput = updatePreview;
  div.appendChild(textarea);
}

function addTip() {
  tipCount++;
  const div = document.getElementById("tips");
  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = `Tipp ${tipCount}`;
  input.className = "w-full p-2 border rounded-lg mb-2";
  input.oninput = updatePreview;
  div.appendChild(input);
}

document.getElementById("imageUpload").addEventListener("change", function(evt) {
  const file = evt.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = e => document.getElementById("previewImage").src = e.target.result;
    reader.readAsDataURL(file);
  }
});

function updatePreview() {
  document.getElementById("previewName").innerText = document.getElementById("recipeName").value || "Rezeptname";

  const difficulty = document.getElementById("difficulty").value;
  const stars = "★★★★★☆☆☆☆☆".slice(5 - difficulty, 10 - difficulty);
  const prep = parseInt(document.getElementById("prepTime").value) || 0;
  const cook = parseInt(document.getElementById("cookTime").value) || 0;
  const total = prep + cook;
  document.getElementById("previewMeta").innerText =
    `Schwierigkeit: ${stars} | Gesamtzeit: ${total} Min. (${prep} Min. Vorbereitung, ${cook} Min. Kochen)`;

  const ingList = document.getElementById("previewIngredients");
  ingList.innerHTML = "";
  // Zutaten als Tabelle darstellen
  const rows = document.getElementById("ingredients").getElementsByClassName("flex");
  if (rows.length > 0) {
    const table = document.createElement("table");
    table.style.width = "100%";
    table.style.borderCollapse = "collapse";
    table.innerHTML = `<colgroup>
      <col style='width:15%'>
      <col style='width:20%'>
      <col style='width:65%'>
    </colgroup>
    <thead><tr>
      <th style='text-align:left; padding:4px; border-bottom:1px solid #ccc;'>Menge</th>
      <th style='text-align:left; padding:4px; border-bottom:1px solid #ccc;'>Einheit</th>
      <th style='text-align:left; padding:4px; border-bottom:1px solid #ccc;'>Zutat</th>
    </tr></thead><tbody></tbody>`;
    const tbody = table.querySelector("tbody");
    for (let row of rows) {
      const menge = row.querySelector("input[type='number']")?.value;
      const einheit = row.querySelector("select")?.value;
      const zutat = row.querySelector("input[type='text']")?.value;
      if (menge && zutat) {
        const tr = document.createElement("tr");
        tr.innerHTML = `<td style='padding:4px;'>${menge}</td><td style='padding:4px;'>${einheit}</td><td style='padding:4px;'>${zutat}</td>`;
        tbody.appendChild(tr);
      }
    }
    ingList.appendChild(table);
  }

  const stepList = document.getElementById("previewSteps");
  stepList.innerHTML = "";
  document.querySelectorAll("#steps textarea").forEach(input => {
    if (input.value.trim()) {
      const li = document.createElement("li");
      li.innerText = input.value;
      stepList.appendChild(li);
    }
  });

  const tipList = document.getElementById("previewTips");
  tipList.innerHTML = "";
  document.querySelectorAll("#tips input").forEach(input => {
    if (input.value.trim()) {
      const li = document.createElement("li");
      li.innerText = input.value;
      tipList.appendChild(li);
    }
  });
}

function generatePDF() {
  const element = document.getElementById("preview");
  const opt = {
    margin:       0.5,
    filename:     `${document.getElementById("recipeName").value || "Rezept"}.pdf`,
    image:        { type: 'jpeg', quality: 0.95 },
    html2canvas:  { scale: 2 },
    jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
  };
  html2pdf().set(opt).from(element).save();
}
