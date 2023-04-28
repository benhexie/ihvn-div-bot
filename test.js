function readExcel(path) {
    parseExcel = function(file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            let data = e.target.result;
            let workbook = XLSX.read(data, {
                type: 'binary'
            });
            workbook.SheetNames.forEach(function(sheetName) {
                // Here is your object
                let XL_row_object = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
                let json_object = JSON.stringify(XL_row_object);
                console.log(json_object);
            })
        };
            reader.onerror = function(ex) {
            console.log(ex);
        };
        reader.readAsBinaryString(file);
    };

    return parseExcel(path);
}

readExcel()