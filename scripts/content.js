/**
 ***************** STEPS *****************
 * Read data from excel sheet
 * Loop through data and get name and acctno
 * 
 * Set acctno and dates - start and end
 * click "Go" button
 * Check if received Account Name changed
 * If yes, store the opening and closing balances retrieved in an array
 * 
 ******** EXTRAS *********
 * Generate Excel sheet for download.
 * Compute the dividends
 * 
 */

const big_data = [];
let prevName = "";

(() => {
    // Create Extension Layout
    createInputLayout();
})()

async function botStart() {
    const file = document.getElementById("div-bot-file-input")?.files[0];
    let reader = new FileReader();
    reader.onload = async function(e) {
        let data = e.target.result;
        let workbook = XLSX.read(data, {
            type: 'binary',
        });
        
        let XL_row_object = XLSX.utils.sheet_to_row_object_array(workbook.Sheets["Div'22"]);
        let json_object = JSON.parse(JSON.stringify(XL_row_object));
        json_formatted = json_object.map(x => ({
            name: x["__EMPTY"],
            acctno: x["__EMPTY_1"]
        }))
        setDate(["2022-01-01", "2022-12-31"])
        for (let index = 0; index < json_formatted.length; index++) {
            const {name, acctno} = json_formatted[index];
            if (acctno) {
                setAza(String(acctno))
                document.getElementById('go2')?.click();
                await new Promise((res, rej) => {
                    const interval = setInterval(() => {
                        const info = readData(name)
                        if (info  && info.Name !== prevName) {
                            big_data.push({
                                ...info,
                                acctno,
                            })
                            prevName = info.Name;
                            inside = false;
                            clearInterval(interval);
                            res();
                        }
                    }, 300)
                }).catch(err => {})
            }
        }
        writeExcel(big_data);
    };
    reader.onerror = function(ex) {
        console.log(ex);
    };
    reader.readAsBinaryString(file);
}

function setDate(range) {
    const startDateElm = document.getElementById("datepicker1");
    const endDateElm = document.getElementById("datepicker2");

    if (startDateElm && endDateElm && range?.length === 2) {
        [startDateElm.value, endDateElm.value] = range;
    }
}

function setAza(aza) {
    const accElm = document.querySelector("input[name='acctno']");
    accElm && (accElm.value = aza);
}

function readData() {
    const dataElms = document.querySelectorAll(`tr[scope="col"] td`)

    if (dataElms && dataElms.length === 6) {
        return {
            Name: dataElms[0].textContent,
            ["Opening Balance"]: dataElms[2].textContent,
            ["Closing Balance"]: dataElms[5].textContent,
        }
    }
    return null;
}

function writeExcel(data) {
    const outputFileName = `(Mod) ${document.getElementById("div-bot-file-input")?.files[0].name}`;

    // Create a new workbook and add a worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    // Generate a binary string from the workbook
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);

    // Create a link and click it to initiate the download
    const link = document.createElement("a");
    link.href = url;
    link.download = outputFileName;
    link.click();

    // Clean up the URL object to free up memory
    URL.revokeObjectURL(url);
}

function createInputLayout() {
    document.body.insertAdjacentHTML('afterbegin', `
        <style>
            #div-bot-input-layout {
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                right: 0 !important;
                bottom: 0 !important;
                pointer-events: none !important;
                background-color: transparent !important;
                z-index: 9999 !important;
                display: flex !important;
                justify-content: flex-start !important;
                align-items: flex-end !important;
            }
            #div-bot-input-layout > div {
                width: 100%;
                height: 48px;
                display: flex;
                padding-inline: 20px;
                align-items: center;
                justify-content: space-between;
                background-color: blue;
                pointer-events: all !important;
                color: white;
            }
        </style>
        <div id="div-bot-input-layout">
            <div>
                <input type="file" id="div-bot-file-input" />
                <button id="div-bot-file-input-btn">Start</button>
            </div>
        </div>
    `)
    document.getElementById("div-bot-file-input-btn").addEventListener('click', botStart)
}