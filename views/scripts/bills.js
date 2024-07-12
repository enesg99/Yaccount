let position = 0;
const table = document.getElementsByTagName("table")[0];

function rechnungValue() {
    position++;

    const leistung = document.getElementById("leistung").value;
    const ust = parseFloat(document.getElementById("ust").value);
    const einzelpreis = parseFloat(document.getElementById("einzelpreis").value);
    const anzahl = parseFloat(document.getElementById("anzahl").value);
    const total = einzelpreis * (1 + ust) * anzahl;

    const tr = document.createElement("tr");
    const tdPosition = document.createElement("td");
    const tdLeistung = document.createElement("td");
    const tdUst = document.createElement("td");
    const tdEinzelpreis = document.createElement("td");
    const tdAnzahl = document.createElement("td");
    const tdTotal = document.createElement("td");

    tdPosition.append(position);
    tr.appendChild(tdPosition);
    tdLeistung.append(leistung);
    tr.appendChild(tdLeistung);
    tdUst.append((ust * 100).toFixed(2) + '%');
    tr.appendChild(tdUst);
    tdEinzelpreis.append(einzelpreis.toFixed(2));
    tr.appendChild(tdEinzelpreis);
    tdAnzahl.append(anzahl);
    tr.appendChild(tdAnzahl);
    tdTotal.append(total.toFixed(2));
    tdTotal.classList.add("totals");
    tr.appendChild(tdTotal);

    table.appendChild(tr);

    document.getElementById("leistung").value = "";
    document.getElementById("ust").value = "";
    document.getElementById("einzelpreis").value = "";
    document.getElementById("anzahl").value = "";
    closeValueContainer();
    totalRechner();
}

function totalRechner() {
    const totals = document.getElementsByClassName("totals");
    let totalAll = 0;
    for (let i = 0; i < totals.length; i++) {
        totalAll += parseFloat(totals[i].textContent);
    }
    console.log(totalAll.toFixed(2));
}


const addValueContainer = document.getElementById("addValueContainer");

function getNewValue() {    
    addValueContainer.style.display = "flex";
    addValueContainer.style.flexWrap = "wrap";
}

function closeValueContainer() {
    addValueContainer.style.display = "none";
}

document.addEventListener('DOMContentLoaded', function() {
    
    const kundencontainer = document.getElementById("customer");

    function createCustomerHTML(kunde, id) {
        return `
            <option id="${kunde.id}">${kunde.prename} ${kunde.name}</option>
        `;
    }

    fetch('http://localhost:4000/users/customers/data')
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        const kundendaten = data;
        kundendaten.forEach((kunde, id) => {
            kundencontainer.innerHTML += createCustomerHTML(kunde, id);
        });
        console.log(data);

        // Event Listener für Klick auf Kundennamen
        document.querySelectorAll('.customer-name').forEach(item => {
            item.addEventListener('click', function() {
                const details = this.nextElementSibling;
                if (details.style.display === "none") {
                    details.style.display = "block";
                } else {
                    details.style.display = "none";
                }
            });
        });
    })
    .catch(error => console.error('Error loading customer data:', error));
});
