# OnlyOffice Backend Integration

This project implements the backend endpoints required for integrating OnlyOffice Document Editor.

## API Endpoints

### 1. Get Editor Configuration
**GET** `/onlyoffice/config/:fileName`

Returns the configuration object needed to initialize the OnlyOffice Document Editor on the frontend.

- **URL Param**: `fileName` (e.g., `document.docx`)
- **Query Param**: `userIp` (Optional, defaults to request IP)

**Response Example:**
```json
{
  "document": {
    "fileType": "docx",
    "key": "document.docx-123456789",
    "title": "document.docx",
    "url": "http://localhost:3000/files/document.docx"
  },
  "documentType": "word",
  "editorConfig": {
    "callbackUrl": "http://localhost:3000/onlyoffice/callback?fileName=document.docx",
    "mode": "edit",
    "user": {
      "id": "127.0.0.1",
      "name": "User 127.0.0.1"
    }
  },
  "documentServerUrl": "http://localhost:8080"
}
```

### 2. Document Server Callback
**POST** `/onlyoffice/callback`

Handles the callback from OnlyOffice Document Server (saving the file back to the server).

- **Query Param**: `fileName`
- **Body**: standard OnlyOffice JSON body

### 3. File Download
**GET** `/files/:fileName`

Serves the file content to OnlyOffice Document Server (and potentially the user).

## Setup

1.  **OnlyOffice Document Server**: You need a running instance of OnlyOffice Document Server (e.g., via Docker).
    ```bash
    docker run -i -t -d -p 8080:80 onlyoffice/documentserver
    ```
2.  **Configuration**: 
    - In `src/onlyoffice/onlyoffice.service.ts`, update `serverUrl` to your backend's reachable URL (e.g., your local IP if running OnlyOffice in a separate container/machine).
    - Update `documentServerUrl` to point to your OnlyOffice instance.

## Testing

1.  Start the NestJS application:
    ```bash
    pnpm start:dev
    ```
2.  Use Postman or a browser to query the config: `http://localhost:3000/onlyoffice/config/test.docx` (This will create a default file if it doesn't exist).
