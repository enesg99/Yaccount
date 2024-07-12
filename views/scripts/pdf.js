// function testKunden() {
//     const kunde = document.getElementById("customer").value;
//     fetch("http://localhost:4000/users/bills/customdata")
//     .then(response => {
//         if (!response.ok) {
//             throw new Error('Network response was not ok');
//         }
//         return response.json();
//     })
//     .then(data => {
//         console.log(data);
//     })
//     .catch(error => console.error('Error loading customer data:', error));
// }

async function fetchOwnerData() {
    try {
        const response = await fetch('/users/bills/ownerData');
        if (!response.ok) {
            throw new Error('Netzwerkantwort war nicht ok ' + response.statusText);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Es gab ein Problem mit der Fetch-Operation:', error);
        throw error;
    }
}

async function getBase64Image(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error('Error fetching image:', error);
        throw error;
    }
}


async function createPDF() {
    const ownerData = await fetchOwnerData();
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Abrufen der Daten aus den Eingabefeldern
    // const anrede = document.getElementById("anrede").value;
    // const nachname = document.getElementById("nachname").value;
    // const vorname = document.getElementById("vorname").value;
    // const adresse = document.getElementById("adresse").value;
    // const plz = document.getElementById("plz").value;
    // const stadt = document.getElementById("stadt").value;

    // Placeholder der Texte
    const kopfzeile = "Yakup Festsaal - Stemwederbergstraße 112 - 32351 Stemwede";
    const inhName = "Yakup Festsaal";
    const inhaber = "Inh. " + ownerData.prename + ownerData.name;
    const inhAdresse = "Stemwederbergstraße 112";
    const inhOrt = "32351 Stemwede";
    const inhHandy = "Mobil: +49 176 43217192";
    const inhEmail = "yakup.festsaal@gmail.com";
    const inhWebsite = "https://www.yakupfestsaal.com";
    const inhBankName = "Volksbank Lübbecker Land eG";
    const inhBIC = "BIC: GENODEM1LUB";
    const inhIBAN = "IBAN: DE37 4909 2650 2717 2478 00";
    const inhSteuerNr = "Steuernummer: 331/5752/1198/ NAST";
    const inhFinanzamt = "Finanzamt: Finanzamt Lübbecke";

    try {
        // Logo Design
        const imgData = await getBase64Image('/static/Logo.jpg');
        doc.addImage(imgData, 'JPG', 15, 0, 45, 35);
    } catch (error) {
        return;
    }

    console.log("Kleiner Test")

    // Anrede Inhaber
    doc.setFontSize(8);
    doc.setFont('Helvetica', 'bold');
    doc.text(inhName, 150, 30);
    doc.setFont('Helvetica', 'normal');
    doc.text(inhaber, 150, 34);
    doc.text(inhAdresse, 150, 38);
    doc.text(inhOrt, 150, 42);
    doc.text(inhHandy, 150, 50);
    doc.text(inhEmail, 150, 54);
    // doc.text(inhWebsite, 150, 58);

    // Kopfzeile eigene Infos
    doc.setFontSize(6);
    doc.text(kopfzeile, 20, 40);
    const kopfzeileTextWidth = doc.getTextWidth(kopfzeile);
    doc.line(20, 41, 21 + kopfzeileTextWidth, 41);

    // Anrede Kunde
    // doc.setFontSize(8);
    // doc.text(anrede + " " + vorname + " " + nachname, 20, 50);
    // doc.text(adresse, 20, 54);
    // doc.text(plz + " " + stadt, 20, 58);

    // Kopfzeile Rechnung
    doc.setFontSize(10);
    doc.setFont('Helvetica', 'bold');
    doc.text("Rechnung", 20, 70);
    doc.setFontSize(8);
    doc.setFont('Helvetica', 'normal');
    doc.text("Rechnungsnummer: 2024-1007-0001", 20, 74);
    doc.text("Kundennummer: 0001", 85, 74);
    doc.text("Datum: 25.06.2024", 150, 74);

    const newTable = document.getElementsByTagName("table")[0];
    const tableRows = document.getElementsByTagName("tr");

    const columns = ["Position", "Leistung", "UST", "Einzelpreis", "Anzahl", "Total"];
    const rows = [];

    // Start from 1 to skip the header row
    for (let i = 1; i < tableRows.length; i++) {
        const cells = tableRows[i].getElementsByTagName("td");
        const rowData = [];
        
        for (let j = 0; j < cells.length; j++) {
            rowData.push(cells[j].textContent.trim());
        }
        
        rows.push(rowData);
    }

    doc.autoTable({
        startY: 85, // Position from the top
        head: [columns],
        body: rows,
        theme: 'striped', // Optional: 'striped', 'grid', 'plain'
        styles: { 
            fontSize: 8 
        },
        headStyles: {
            fillColor: [22, 160, 133] // Optional: customize header color
        },
        margin: { top: 10 } // Optional: adjust the margins
    });

    const finalY = doc.lastAutoTable.finalY;

    // Summierter Betrag
    doc.setFontSize(8);
    doc.text("Nettobetrag: ", 150, 10 + finalY);
    doc.text("Bruttobetrag: ", 150, 14 + finalY);

    // Fußzeile
    doc.line(20, 250, 190, 250);
    doc.setFontSize(7);
    doc.text(inhName, 25, 254);
    doc.text(inhaber, 25, 258);
    doc.text(inhAdresse, 25, 262);
    doc.text(inhOrt, 25, 266);

    doc.text(inhHandy, 85, 254);
    doc.text(inhEmail, 85, 258);
    doc.text(inhWebsite, 85, 262);

    doc.text(inhBankName, 150, 254);
    doc.text(inhBIC, 150, 258);
    doc.text(inhIBAN, 150, 262);
    doc.text(inhSteuerNr, 150, 266);
    doc.text(inhFinanzamt, 150, 272);

    // PDF herunterladen / öffnen
    // doc.save(vorname + nachname + "-Rechnung.pdf");
    doc.save("Rechnung.pdf");
    
    // Das soll das in einem neuen Fenster öffnen, funktioniert aber irgendwie nicht :(
    // const pdfDataUrl = doc.output('dataurlnewwindow');
    // window.open(pdfDataUrl);
}