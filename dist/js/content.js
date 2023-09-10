"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
let database = { status: [] };
const HTML_ELEMENTS = {
    CONTAINER: ".mat-table.cdk-table.table-stripes",
    TABLE: "tbody",
    ALL_STATUS: ".mat-row.example-element-row",
    ODOMETER_CELL: "mat-cell cdk-cell log-table-cell cdk-column-odometer mat-column-odometer",
    DATE_CELL: "mat-cell cdk-cell log-table-cell cdk-column-time mat-column-time",
    RELOAD_BTN: "#reloadBTnMilesHour",
};
const { ALL_STATUS, ODOMETER_CELL, DATE_CELL, RELOAD_BTN } = HTML_ELEMENTS;
const $ = (query) => document.querySelector(query);
const $$ = (query) => document.querySelectorAll(query);
const parseOdometer = (odometerText) => Number(odometerText.replace(" ", ""));
const addReloadHtmlBtn = (containerHtmlQuery = ".d-flex.w-90") => {
    console.log("adding reload btn");
    const htmlReloadBtn = document.createElement("button");
    htmlReloadBtn.id = RELOAD_BTN.replace("#", "");
    htmlReloadBtn.textContent = "Reload miles per hour";
    htmlReloadBtn.addEventListener("click", fetchAndProcessStatus);
    const container = $(containerHtmlQuery);
    if (!container)
        return console.log("container doest exits");
    container.appendChild(htmlReloadBtn);
};
const getOdometerHtml = (status) => {
    const htmlStatusOdometer = status.getElementsByClassName(ODOMETER_CELL)[0];
    const number = htmlStatusOdometer.textContent || "0";
    const odometer = { number, html: htmlStatusOdometer };
    return odometer;
};
const getStatusDateHtml = (status) => {
    const htmlDateCell = status.getElementsByClassName(DATE_CELL)[0];
    const parsedDate = new Date(htmlDateCell.textContent || "");
    const date = { parsed: parsedDate, html: htmlDateCell };
    return date;
};
function createOdometerMilesPerHourSpan(odometer) {
    const span = document.createElement("span");
    span.textContent = odometer.toString();
    span.id = Math.floor(Math.random() * 500).toString();
    span.style.color = "purple";
    return span;
}
const fetchAndProcessStatus = () => __awaiter(void 0, void 0, void 0, function* () {
    console.log("3. processing status");
    database.status = []; // TODO: same cache data instead of clearing the database
    const allStatusDatabase = database.status;
    try {
        const htmlAllStatus = $$(ALL_STATUS);
        // save html table status on a list "statusDatabase"
        for (let i = 0; i < htmlAllStatus.length; i++) {
            const htmlStatus = htmlAllStatus[i];
            const id = htmlStatus.id;
            const currentStatus = document.getElementById(id);
            if (!currentStatus)
                continue;
            const { parsed } = getStatusDateHtml(currentStatus);
            const { number } = getOdometerHtml(currentStatus);
            const odometerParsed = parseOdometer(number);
            const status = { id, odometer: odometerParsed, date: parsed };
            allStatusDatabase.push(status);
        }
        // modify the html body
        for (let i = 0; i < allStatusDatabase.length; i++) {
            const statusElement = allStatusDatabase[i];
            const currentStatus = document.getElementById(statusElement.id);
            if (!currentStatus)
                continue;
            const odometer = getOdometerHtml(currentStatus);
            if (odometer) {
                const htmlOdometerCell = odometer.html;
                const firstElement = i === 0;
                if (!firstElement) {
                    const beforeElement = allStatusDatabase[i - 1];
                    const milesPerHour = statusElement.odometer - beforeElement.odometer;
                    if (isNaN(milesPerHour))
                        continue;
                    // modify html
                    const spanMilesPerHour = createOdometerMilesPerHourSpan(milesPerHour);
                    htmlOdometerCell.appendChild(spanMilesPerHour);
                }
            }
        }
    }
    catch (error) {
        alert("OMG Something went wring");
        console.error("Error fetching data:", error);
    }
});
const runApp = () => {
    fetchAndProcessStatus();
    console.log("4. status proceed");
    setTimeout(() => console.clear(), 3000);
    console.log("console cleared");
};
const startObserver = () => {
    console.log("2. observing");
    const bodyObserver = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            // every time the log is changed (next day)
            if (mutation.type === "childList" && mutation.target === document.body) {
                console.log("✨body changed");
                // if reload btn doesn't exits -> add it
                if (!$(RELOAD_BTN))
                    addReloadHtmlBtn();
                runApp();
            }
        });
    });
    const bodyObserverConfig = {
        childList: true,
        subtree: true, // Watch all nested elements as well
    };
    // Start observing the body for changes
    bodyObserver.observe(document.body, bodyObserverConfig);
};
window.onload = () => {
    console.log("1. extension is running");
    // first page load
    startObserver();
    addReloadHtmlBtn();
    fetchAndProcessStatus();
};
