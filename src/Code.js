function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  var sheetName = data.sheet; // "Usuarios" o "Compras"
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  sheet.appendRow(data.row);
  return ContentService
    .createTextOutput(JSON.stringify({ result: "success" }))
    .setMimeType(ContentService.MimeType.JSON);
}
