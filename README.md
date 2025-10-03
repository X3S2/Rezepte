# 🍴 Rezept-App

Ein modernes Rezept-Template als Web-App mit PDF-Export.

## 🚀 Nutzung

1. Ordner `rezept-app` in **Visual Studio Code** öffnen.  
2. Erweiterung **Live Server** installieren (empfohlen).  
3. `index.html` mit Rechtsklick → **"Open with Live Server"** starten.  
4. Rezept eingeben → Zutaten, Schritte, Tipps hinzufügen → PDF exportieren.

## 🛠️ Technologie
- **TailwindCSS** (Design)
- **html2pdf.js** (PDF-Export)
- **Vanilla JS** (Logik)

## ✨ Features
- Dynamisches Hinzufügen von Zutaten, Schritten, Tipps
- Bild-Upload
- Schwierigkeit mit Sternen
- Zeitberechnung (Vorbereitung + Kochzeit → Gesamtzeit)
- Vorschau & PDF-Export
- Export von Rezepten als JSON-Datei
- Import von gespeicherten Rezepten
  - Unterstützt JSON-Format
  - Automatische Validierung der importierten Daten
  - Einfaches Wiederherstellen gespeicherter Rezepte

## 💾 Export & Import
### Export
- Klicken Sie auf den "Export"-Button, um Ihr Rezept als JSON-Datei zu speichern
- Die exportierte Datei enthält alle Rezeptdetails:
  - Titel und Beschreibung
  - Zutatenliste
  - Zubereitungsschritte
  - Bilder (als Base64)
  - Zeitangaben und Schwierigkeitsgrad
  - Tipps und Anmerkungen

### Import
1. Klicken Sie auf den "Import"-Button
2. Wählen Sie eine zuvor exportierte Rezept-JSON-Datei aus
3. Das System prüft automatisch die Dateistruktur
4. Nach erfolgreicher Validierung wird das Rezept mit allen Details geladen
5. Sie können das importierte Rezept direkt bearbeiten oder als PDF exportieren
