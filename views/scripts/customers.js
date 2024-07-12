document.addEventListener('DOMContentLoaded', function() {
    
    const kundencontainer = document.getElementById("kundencontainer");

    function createCustomerHTML(kunde, id) {
        return `
            <div class="customer" id="kunde-${id}">
                <span class="customer-name">${kunde.prename} ${kunde.name}</span>
                <div class="customer-details" style="display:none;">
                    <span id="anrede">${kunde.gender},</span>
                    <span id="nachname">${kunde.name},</span>
                    <span id="vorname">${kunde.prename},</span>
                    <span id="strasse">${kunde.adress},</span>
                    <span id="plz">${kunde.plz},</span>
                    <span id="stadt">${kunde.town}</span>
                </div>
            </div>
            <hr>
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