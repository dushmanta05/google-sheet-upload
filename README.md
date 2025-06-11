# Google Sheet Upload

Node.js script to upload multiple CSV files to Google Sheets using the `google-spreadsheet` npm package and Google Cloud credentials.

## Prerequisites

- Node.js **v20.6.0** or later

This project specifically supports and has been tested with **Node.js v20.6.0**, which introduces the `--env-file` flag in the Node.js runtime itself. While it may work with newer versions, compatibility should be verified with all dependencies.

## Setup

### Clone the Repository

```zsh
git clone git@github.com:dushmanta05/google-sheet-upload.git
```

### Switch to Correct Node Version

If your system uses nvm:

```zsh
nvm install    # installs version specified in .nvmrc
nvm use        # switches to that version
```

### Copy Environment Variables

```zsh
cp .env.example .env
```

## Google Cloud Credentials

To use this script, you need Google Cloud credentials:

1. Go to the [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Navigate to **APIs & Services**
4. Enable **Google Sheets API**
5. Go to the **Credentials** page and create a service account
6. Generate keys for the service account and download the JSON file (Keep this file safe, as it provides access to your cloud data and services)
7. Copy the `private_key` and `client_email` from the JSON file and paste them into the `.env` file under `PRIVATE_KEY` and `CLIENT_EMAIL`, respectively

## Google Spreadsheet Setup

1. Create a Google Spreadsheet
2. Copy the **Sheet ID** from the URL

   Example:

   ```
   https://docs.google.com/spreadsheets/d/1CEYUiV2-ufbg-KMFPcacTorVyFYBugWGQd4RHPJJbfU/edit?gid=0#gid=0
   ```

   Here, the **Sheet ID** is `1CEYUiV2-ufbg-KMFPcacTorVyFYBugWGQd4RHPJJbfU`

3. Save this **Sheet ID** in the `SPREADSHEET_ID` variable inside the `.env` file
4. Add the `client_email` from your Google Cloud credentials as an **editor** to the Google Sheet

## Running the Script

### Install Dependencies

```zsh
npm install  # or pnpm install, yarn install
```

### Upload CSV Files

1. Place all CSV files you want to upload inside the `upload` folder.
2. Run the script:

```zsh
npm start
```
