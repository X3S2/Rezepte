// Export als ZIP-Datei mit allen Rezeptdaten
async function exportRecipe() {
    const recipeName = document.getElementById("recipeName").value;
    if (!recipeName) {
        alert("Bitte geben Sie einen Namen für das Rezept ein.");
        return;
    }

    try {
        // Erstelle ein neues ZIP
        const zip = new JSZip();
        
        // Sammle alle Rezeptdaten
        const recipeData = {
            name: recipeName,
            difficulty: document.getElementById("difficulty").value,
            prepTime: document.getElementById("prepTime").value,
            cookTime: document.getElementById("cookTime").value,
            ingredients: [],
            steps: [],
            tips: []
        };

        // Zutaten sammeln
        document.querySelectorAll("#ingredients .flex").forEach(row => {
            const menge = row.querySelector("input[type='number']").value;
            const einheit = row.querySelector("select").value;
            const zutat = row.querySelector("input[type='text']").value;
            if (menge && zutat) {
                recipeData.ingredients.push({ menge, einheit, zutat });
            }
        });

        // Schritte sammeln
        document.querySelectorAll("#steps textarea").forEach(step => {
            if (step.value.trim()) {
                recipeData.steps.push(step.value.trim());
            }
        });

        // Tipps sammeln
        document.querySelectorAll("#tips input").forEach(tip => {
            if (tip.value.trim()) {
                recipeData.tips.push(tip.value.trim());
            }
        });

        // Bild hinzufügen
        const imageData = document.getElementById("previewImage").src;
        if (imageData && !imageData.includes('placeholder.png')) {
            // Wenn es ein Base64-Bild ist, extrahiere die Daten
            const base64Data = imageData.split(',')[1];
            zip.file("image.png", base64Data, {base64: true});
            recipeData.hasImage = true;
        } else {
            recipeData.hasImage = false;
        }

        // Füge die Rezeptdaten als JSON hinzu
        zip.file("recipe.json", JSON.stringify(recipeData, null, 2));

        // Generiere die ZIP-Datei
        const content = await zip.generateAsync({type: "blob"});
        
        // Erstelle Download-Link
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = `${recipeName}.zip`;
        link.click();
        URL.revokeObjectURL(link.href);
    } catch (error) {
        console.error('Export-Fehler:', error);
        alert('Fehler beim Exportieren: ' + error.message);
    }
}

// Import einer ZIP-Datei mit Rezeptdaten
async function importRecipe(file) {
    try {
        const zip = new JSZip();
        const contents = await zip.loadAsync(file);
        
        // Lade die Rezeptdaten
        const recipeJSON = await contents.file("recipe.json").async("string");
        const recipeData = JSON.parse(recipeJSON);
        
        // Setze die Grunddaten
        document.getElementById("recipeName").value = recipeData.name;
        document.getElementById("difficulty").value = recipeData.difficulty;
        document.getElementById("prepTime").value = recipeData.prepTime;
        document.getElementById("cookTime").value = recipeData.cookTime;
        
        // Lösche bestehende Einträge
        document.getElementById("ingredients").innerHTML = "";
        document.getElementById("steps").innerHTML = "";
        document.getElementById("tips").innerHTML = "";
        
        // Zähler zurücksetzen
        ingredientCount = 0;
        stepCount = 0;
        tipCount = 0;
        
        // Zutaten wiederherstellen
        for (const ing of recipeData.ingredients) {
            addIngredient();
            const lastRow = document.querySelector("#ingredients .flex:last-child");
            lastRow.querySelector("input[type='number']").value = ing.menge;
            lastRow.querySelector("select").value = ing.einheit;
            lastRow.querySelector("input[type='text']").value = ing.zutat;
        }
        
        // Schritte wiederherstellen
        for (const step of recipeData.steps) {
            addStep();
            const lastStep = document.querySelector("#steps textarea:last-child");
            lastStep.value = step;
        }
        
        // Tipps wiederherstellen
        for (const tip of recipeData.tips) {
            addTip();
            const lastTip = document.querySelector("#tips input:last-child");
            lastTip.value = tip;
        }
        
        // Bild wiederherstellen, falls vorhanden
        if (recipeData.hasImage) {
            const imageData = await contents.file("image.png").async("base64");
            document.getElementById("previewImage").src = `data:image/png;base64,${imageData}`;
        }
        
        // Vorschau aktualisieren
        updatePreview();
        
    } catch (error) {
        console.error('Import-Fehler:', error);
        alert('Fehler beim Importieren: ' + error.message);
    }
}

// Exportiere die Vorschau als Bild (PNG)
function exportImage() {
    // Validierung der Pflichtfelder
    const errors = [];
    const recipeName = document.getElementById("recipeName").value;
    const prepTime = document.getElementById("prepTime").value;
    const cookTime = document.getElementById("cookTime").value;
    const ingredients = document.querySelectorAll("#ingredients .flex");
    const steps = document.querySelectorAll("#steps textarea");
    const imageUrl = document.getElementById("previewImage").src;

    if (!recipeName) errors.push("Name des Rezepts");
    if (!prepTime) errors.push("Vorbereitungszeit");
    if (!cookTime) errors.push("Kochzeit");
    if (ingredients.length === 0 || !Array.from(ingredients).some(row => 
        row.querySelector("input[type='number']").value && 
        row.querySelector("input[type='text']").value)) {
        errors.push("mindestens eine Zutat");
    }
    if (steps.length === 0 || !Array.from(steps).some(step => step.value.trim())) {
        errors.push("mindestens einen Zubereitungsschritt");
    }
    if (imageUrl.includes('placeholder.png')) errors.push("ein Bild");

    if (errors.length > 0) {
        alert(`Bitte fülle folgende Pflichtfelder aus, bevor du ein Bild erstellst:\n\n- ${errors.join("\n- ")}`);
        return;
    }

    const element = document.getElementById("preview");
    if (window.domtoimage && typeof window.domtoimage.toPng === 'function') {
        window.domtoimage.toPng(element, { bgcolor: '#fff' })
            .then(function (dataUrl) {
                const link = document.createElement('a');
                link.download = `${recipeName}.png`;
                link.href = dataUrl;
                link.click();
            })
            .catch(function (error) {
                console.error('Bild-Export Fehler:', error);
                alert('Bild-Export fehlgeschlagen. Bitte stelle sicher, dass alle Eingaben korrekt sind.');
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
    // Validierung der Pflichtfelder
    const errors = [];
    const recipeName = document.getElementById("recipeName").value;
    const prepTime = document.getElementById("prepTime").value;
    const cookTime = document.getElementById("cookTime").value;
    const ingredients = document.querySelectorAll("#ingredients .flex");
    const steps = document.querySelectorAll("#steps textarea");
    const imageUrl = document.getElementById("previewImage").src;

    if (!recipeName) errors.push("Name des Rezepts");
    if (!prepTime) errors.push("Vorbereitungszeit");
    if (!cookTime) errors.push("Kochzeit");
    if (ingredients.length === 0 || !Array.from(ingredients).some(row => 
        row.querySelector("input[type='number']").value && 
        row.querySelector("input[type='text']").value)) {
        errors.push("mindestens eine Zutat");
    }
    if (steps.length === 0 || !Array.from(steps).some(step => step.value.trim())) {
        errors.push("mindestens einen Zubereitungsschritt");
    }
    if (imageUrl.includes('placeholder.png')) errors.push("ein Bild");

    if (errors.length > 0) {
        alert(`Bitte fülle folgende Pflichtfelder aus, bevor du ein PDF erstellst:\n\n- ${errors.join("\n- ")}`);
        return;
    }

    // Überprüfe, ob html2pdf verfügbar ist
    if (typeof html2pdf === 'undefined') {
        alert('PDF-Export nicht möglich: Die PDF-Bibliothek konnte nicht geladen werden.');
        return;
    }

    const element = document.getElementById("preview");
    // Container für PDF-Export erstellen
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '0';
    document.body.appendChild(container);

    // Kopie des Elements für den PDF-Export
    const pdfContent = element.cloneNode(true);
    container.appendChild(pdfContent);

    // Stile für PDF-Content
    pdfContent.style.width = '210mm';
    pdfContent.style.backgroundColor = 'white';
    pdfContent.style.padding = '20mm';
    pdfContent.style.position = 'relative';
    pdfContent.style.overflow = 'visible';

    // Stelle sicher, dass das Bild vollständig geladen ist
    const image = pdfContent.querySelector('#previewImage');
    image.style.maxWidth = '170mm'; // A4 Breite minus Ränder
    image.style.height = 'auto';
    
    const imagePromise = new Promise((resolve) => {
        if (image.complete) {
            resolve();
        } else {
            image.onload = resolve;
        }
    });

    // Tabellenstile anpassen
    const table = pdfContent.querySelector('table');
    if (table) {
        table.style.width = '100%';
        table.style.borderCollapse = 'collapse';
        const cells = table.getElementsByTagName('td');
        for (let cell of cells) {
            cell.style.padding = '2mm';
            cell.style.borderBottom = '0.1mm solid #ccc';
        }
    }

    // Listen-Stile anpassen
    const lists = pdfContent.querySelectorAll('ul, ol');
    lists.forEach(list => {
        list.style.paddingLeft = '5mm';
        list.style.marginBottom = '3mm';
        const items = list.getElementsByTagName('li');
        for (let item of items) {
            item.style.marginBottom = '1mm';
        }
    });

    // Zeige Ladeindikator
    const loadingMsg = document.createElement("div");
    loadingMsg.innerText = "PDF wird erstellt...";
    loadingMsg.style.position = "fixed";
    loadingMsg.style.top = "50%";
    loadingMsg.style.left = "50%";
    loadingMsg.style.transform = "translate(-50%, -50%)";
    loadingMsg.style.padding = "1rem 2rem";
    loadingMsg.style.backgroundColor = "#4CAF50";
    loadingMsg.style.color = "white";
    loadingMsg.style.borderRadius = "0.5rem";
    loadingMsg.style.zIndex = "1000";
    document.body.appendChild(loadingMsg);

    // Warte bis das Bild geladen ist und erstelle dann das PDF
    imagePromise.then(() => {
        // PDF-Optionen
        const opt = {
            margin: 0,
            filename: `${recipeName}.pdf`,
            image: { type: 'jpeg', quality: 1 },
            html2canvas: { 
                scale: 2,
                useCORS: true,
                logging: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                width: 795, // A4 Breite in Pixeln bei 96 DPI
                height: 1123, // A4 Höhe in Pixeln bei 96 DPI
                onclone: function(clonedDoc) {
                    // Zusätzliche Stile für geklontes Element
                    const clonedElement = clonedDoc.querySelector('#preview');
                    if (clonedElement) {
                        clonedElement.style.transformOrigin = 'top left';
                        clonedElement.style.transform = 'scale(1)';
                    }
                }
            },
            jsPDF: { 
                unit: 'mm', 
                format: 'a4', 
                orientation: 'portrait',
                compress: true
            }
        };

        // PDF generieren mit Fehlerbehandlung
        html2pdf()
            .set(opt)
            .from(pdfContent)
            .save()
            .then(() => {
                document.body.removeChild(loadingMsg);
                document.body.removeChild(container);
                console.log('PDF erfolgreich erstellt');
            })
            .catch(error => {
                console.error('PDF-Export Fehler:', error);
                alert('Beim PDF-Export ist ein Fehler aufgetreten. Bitte versuche es erneut.');
                document.body.removeChild(loadingMsg);
                document.body.removeChild(container);
            });
    });
}
