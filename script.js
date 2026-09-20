const API_KEY = "1dd6feeb5ff144e8bff601ceebb2c1df";

async function geocodeAddress(address) {

    const encodedAddress = encodeURIComponent(address);

    const url =
        `https://api.geoapify.com/v1/geocode/search?` +
        `text=${encodedAddress}` +
        `&format=json` +
        `&apiKey=${API_KEY}`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Could not look up address.");
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
        throw new Error("Address not found.");
    }

    return {
        latitude: data.results[0].lat,
        longitude: data.results[0].lon
    };
    
}

async function getDrivingDistance(start, destination) {

    const waypoints =
        `${start.latitude},${start.longitude}|` +
        `${destination.latitude},${destination.longitude}`;

    const url =
        `https://api.geoapify.com/v1/routing?` +
        `waypoints=${waypoints}` +
        `&mode=drive` +
        `&type=balanced` +
        `&units=imperial` +
        `&format=json` +
        `&apiKey=${API_KEY}`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Could not calculate driving route.");
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
        throw new Error("No driving route found.");
    }

    return data.results[0].distance;
}

document
    .getElementById("calculateButton")
    .addEventListener("click", calculateDistance);



// ----------------------
// PROVIDERS
// ----------------------


function addProvider() {

    const container =
        document.getElementById("providersContainer");

    const providerDiv =
        document.createElement("div");

    providerDiv.classList.add("provider");

    providerDiv.innerHTML = `

        <button
            type="button"
            class="removeProviderButton"
            title="Remove Provider"
        >
            ×
        </button>

        <br>

        <label>Provider Name</label>
        <input class="providerName" type="text">

        <br><br>

        <label>Provider Address</label>
        <input class="providerAddress" type="text">

        <br><br>

        <label>Appointments</label>
        <input
            class="appointments"
            type="number"
            min="1"
        >

    `;

    container.appendChild(providerDiv);
}

document
    .getElementById("addProviderButton")
    .addEventListener("click", addProvider);

document
    .getElementById("providersContainer")
    .addEventListener("click", function (event) {

        if (
            event.target.classList.contains(
                "removeProviderButton"
            )
        ) {

            const providerCards =
                document.querySelectorAll(".provider");

            // Always keep at least one provider box
            if (providerCards.length === 1) {
                return;
            }

            event.target
                .closest(".provider")
                .remove();
        }
    });




// ----------------------
// CALCULATION
// ----------------------

async function calculateDistance() {

    const clientName =
        document.getElementById("clientName").value.trim();

    const startAddress =
        document.getElementById("startAddress").value.trim();

    const mileageRate =
        Number(
            document.getElementById("mileageRate").value
        );

    const formMessage =
        document.getElementById("formMessage");

    const providerCards =
        document.querySelectorAll(".provider");

    formMessage.textContent =
        "Calculating mileage...";

    try {

        // Look up the client's home only once
        const startLocation =
            await geocodeAddress(startAddress);

        let grandTotalMileage = 0;
        let grandTotalExpense = 0;

        let providerReport = "";


        for (const card of providerCards) {

            const providerName =
                card
                    .querySelector(".providerName")
                    .value
                    .trim();

            const providerAddress =
                card
                    .querySelector(".providerAddress")
                    .value
                    .trim();

            const appointments =
                Number(
                    card
                        .querySelector(".appointments")
                        .value
                );


            const providerLocation =
                await geocodeAddress(providerAddress);


            const miles =
                await getDrivingDistance(
                    startLocation,
                    providerLocation
                );


// Round one-way route to nearest whole mile
// BEFORE multiplying by return trip and visits
            const roundedOneWayMiles =
                Math.round(miles);


            const totalMileage =
                roundedOneWayMiles *
                2 *
                appointments;


            const expense =
                totalMileage *
                mileageRate;


            grandTotalMileage +=
                totalMileage;


            grandTotalExpense +=
                expense;


            providerReport += `

                <div class="providerResult">

                    <p>
                        <strong>Name:</strong>
                        ${providerName}
                    </p>

                    <p>
                        <strong>Total Appointments:</strong>
                        ${appointments}
                    </p>

                    <p>
                        <strong>Address:</strong>
                        ${providerAddress}
                    </p>

                    <p>
                        <strong>Total Mileage:</strong>
                        ${totalMileage} mi
                        <em>(includes return trips)</em>
                    </p>

                </div>

            `;

            console.log("Raw driving miles:", miles);
            console.log("Mileage used:", roundedOneWayMiles);
        }


        const report =
            document.getElementById("report");


        report.innerHTML = `

            <h1>Mileage Report</h1>

            <p>
                <strong>Client Name:</strong>
                ${clientName}
            </p>

            <p>
                <strong>Starting Address:</strong>
                <br>
                ${startAddress}
            </p>

            <h2>Providers</h2>

            ${providerReport}

            <hr>

            <p>
                <strong>Total Mileage:</strong>
                ${grandTotalMileage} mi
                <em>(includes return trips)</em>
            </p>

            <p>
                <strong>Mileage Rate:</strong>
                $${mileageRate}
            </p>

            <p>
                <strong>Mileage Expenses:</strong>
                $${grandTotalExpense.toFixed(2)}
            </p>

        `;


        showResults();


    } catch (error) {

        console.error(error);

        formMessage.textContent =
            error.message;
    }
}

document
    .getElementById("calculateButton")
    .addEventListener(
        "click",
        calculateDistance
    );


// ----------------------
// PAGE NAVIGATION
// ----------------------

function showResults() {

    document.getElementById("formPage").hidden =
        true;

    document.getElementById("resultsPage").hidden =
        false;
}

function showForm() {

    document.getElementById("resultsPage").hidden =
        true;

    document.getElementById("formPage").hidden =
        false;
}

document
    .getElementById("modifyButton")
    .addEventListener("click", showForm);