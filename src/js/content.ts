interface Status {
	odometer: number;
	id: string;
	date: Date;
}

interface Database {
	status: Status[];
}

const HTML_ELEMENTS = {
	CONTAINER: ".mat-table.cdk-table.table-stripes",
	TABLE: "tbody",
	ALL_STATUS: ".mat-row.example-element-row",
	ODOMETER_CELL:
		"mat-cell cdk-cell log-table-cell cdk-column-odometer mat-column-odometer",
	DATE_CELL: "mat-cell cdk-cell log-table-cell cdk-column-time mat-column-time",
	RELOAD_BTN: "#reloadBTnMilesHour",
};

const database: Database = { status: [] };

const { ALL_STATUS, ODOMETER_CELL, DATE_CELL, RELOAD_BTN } = HTML_ELEMENTS;

const $ = (query: string) => document.querySelector(query);
const $$ = (query: string) => document.querySelectorAll(query);

const parseOdometer = (odometerText: string): number =>
	Number(odometerText.replace(" ", ""));

const createOdometerMilesPerHourSpan = (odometer: number): HTMLSpanElement => {
	const span = document.createElement("span");
	span.textContent = odometer.toString();
	span.id = Math.floor(Math.random() * 500).toString();
	span.style.color = "purple";
	return span;
};

const getOdometerHtml = (status: HTMLElement) => {
	const htmlStatusOdometer = status.getElementsByClassName(ODOMETER_CELL)[0];
	const number = htmlStatusOdometer.textContent || "0";
	return { number, html: htmlStatusOdometer };
};

const getStatusDateHtml = (status: HTMLElement) => {
	const htmlDateCell = status.getElementsByClassName(DATE_CELL)[0];
	const parsedDate = new Date(htmlDateCell.textContent || "");
	return { parsed: parsedDate, html: htmlDateCell };
};

const addReloadHtmlBtn = (containerHtmlQuery = ".d-flex.w-90") => {
	console.log("adding reload btn");
	const htmlReloadBtn = document.createElement("button");
	htmlReloadBtn.id = RELOAD_BTN.replace("#", "");
	htmlReloadBtn.textContent = "Reload miles per hour";
	htmlReloadBtn.addEventListener("click", fetchAndProcessStatus);
	const container = $(containerHtmlQuery);

	if (!container) return console.log("container does not exist");

	container.appendChild(htmlReloadBtn);
};

const fetchAndProcessStatus = async () => {
	console.log("3. processing status");
	database.status = [];
	const allStatusDatabase = database.status; // TODO: add data saving with cache

	try {
		const htmlAllStatus = $$(ALL_STATUS);

		for (let i = 0; i < htmlAllStatus.length; i++) {
			const htmlStatus = htmlAllStatus[i];
			const id = htmlStatus.id;
			const currentStatus = document.getElementById(id);

			if (!currentStatus) continue;

			const { parsed } = getStatusDateHtml(currentStatus);
			const { number } = getOdometerHtml(currentStatus);
			const odometerParsed = parseOdometer(number);

			const status = { id, odometer: odometerParsed, date: parsed };

			allStatusDatabase.push(status);
		}

		for (let i = 0; i < allStatusDatabase.length; i++) {
			const statusElement = allStatusDatabase[i];
			const currentStatus = document.getElementById(statusElement.id);

			if (!currentStatus) continue;
			const odometer = getOdometerHtml(currentStatus);

			if (odometer) {
				const htmlOdometerCell = odometer.html;
				const firstElement = i === 0;

				if (!firstElement) {
					const beforeElement = allStatusDatabase[i - 1];
					const milesPerHour = statusElement.odometer - beforeElement.odometer;

					if (!isNaN(milesPerHour)) {
						const spanMilesPerHour =
							createOdometerMilesPerHourSpan(milesPerHour);
						htmlOdometerCell.appendChild(spanMilesPerHour);
					}
				}
			}
		}
	} catch (error) {
		alert("OMG Something went wrong");
		console.error("Error fetching data:", error);
	}
};

const runApp = () => {
	fetchAndProcessStatus();
	console.log("4. status processed");
	setTimeout(() => console.clear(), 3000);
	console.log("console cleared");
};

const startObserver = () => {
	console.log("2. observing");
	const bodyObserver = new MutationObserver(mutations => {
		mutations.forEach(mutation => {
			if (mutation.type === "childList" && mutation.target === document.body) {
				console.log("✨body changed");
				if (!$(RELOAD_BTN)) addReloadHtmlBtn();
				runApp();
			}
		});
	});

	const bodyObserverConfig = {
		childList: true,
		subtree: true,
	};

	bodyObserver.observe(document.body, bodyObserverConfig);
};

window.onload = () => {
	console.log("1. extension is running");
	startObserver();
	addReloadHtmlBtn();
	fetchAndProcessStatus();
};
