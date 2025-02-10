const fs = require("node:fs");
const path = require("node:path");
const { GoogleSpreadsheet } = require("google-spreadsheet");
const { JWT } = require("google-auth-library");

const { ACCOUNT_EMAIL, PRIVATE_KEY, SPREADSHEET_ID } = process.env;
const formattedKey = PRIVATE_KEY.replace(/\\n/g, "\n");
const UPLOAD_FOLDER = "upload";
const CHUNK_SIZE = 3900;

function cleanData(value) {
  const newValue = value.trim();
  if (newValue === '""') return "";
  return newValue.replace(/^"(.*)"$/, "$1");
}

function getColumnLetter(columnIndex) {
  let letter = "";
  let index = columnIndex;
  while (index >= 0) {
    letter = String.fromCharCode(65 + (index % 26)) + letter;
    index = Math.floor(index / 26) - 1;
  }
  return letter;
}

async function uploadToGoogleSheets(data, sheetName) {
  try {
    const serviceAccountAuth = new JWT({
      email: ACCOUNT_EMAIL,
      key: formattedKey,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const doc = new GoogleSpreadsheet(SPREADSHEET_ID, serviceAccountAuth);
    await doc.loadInfo();

    const rows = data.split("\n").map((row) => row.split(",").map(cleanData));
    const headers = rows[0];
    const values = rows.slice(1).filter((row) => row.length > 1);

    const existingSheet = doc.sheetsByTitle[sheetName];
    if (existingSheet) {
      await existingSheet.delete();
    }

    const sheet = await doc.addSheet({
      title: sheetName,
      headerValues: headers,
      gridProperties: {
        rowCount: values.length + 1,
        columnCount: headers.length,
      },
    });

    for (let i = 0; i < values.length; i += CHUNK_SIZE) {
      const chunk = values.slice(i, i + CHUNK_SIZE);
      const rowsToAdd = chunk.map((row) => {
        const rowData = {};
        headers.forEach((header, index) => {
          rowData[header] = row[index];
        });
        return rowData;
      });

      await sheet.addRows(rowsToAdd);
      console.log(
        `Uploaded rows ${i + 1} to ${i + chunk.length} for ${sheetName}`
      );
    }

    const lastColumn = getColumnLetter(headers.length - 1);
    await sheet.loadCells(`A1:${lastColumn}1`);
    for (let i = 0; i < headers.length; i++) {
      const cell = sheet.getCell(0, i);
      cell.textFormat = { bold: true };
    }
    await sheet.saveUpdatedCells();

    console.log(`Data uploaded to Google Sheets - ${sheetName}`);
  } catch (error) {
    console.error(
      `Error uploading to Google Sheets - ${sheetName}:`,
      error.message
    );
  }
}

async function processAllFiles() {
  console.log("Starting CSV upload process...");

  if (!fs.existsSync(UPLOAD_FOLDER)) {
    fs.mkdirSync(UPLOAD_FOLDER);
    console.log(`Created ${UPLOAD_FOLDER} folder`);
  }

  const files = fs
    .readdirSync(UPLOAD_FOLDER)
    .filter((file) => file.endsWith(".csv"));

  if (files.length === 0) {
    console.log("No CSV files found in upload folder");
    return;
  }

  for (const file of files) {
    const filePath = path.join(UPLOAD_FOLDER, file);
    const sheetName = path.basename(file, ".csv");
    console.log(`Processing ${file}...`);

    try {
      const fileContent = fs.readFileSync(filePath, "utf-8");
      await uploadToGoogleSheets(fileContent, sheetName);
    } catch (error) {
      console.error(`Error processing ${file}:`, error.message);
    }
  }

  console.log("All files processed successfully!");
}

processAllFiles();
