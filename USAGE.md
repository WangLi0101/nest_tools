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

## Douyin 无水印解析

### POST `/douyin/resolve`

请求体：

```json
{
  "shareText": "8.97 复制打开抖音，看看【学院派Academia的作品】... https://v.douyin.com/IQ-uaVSmjUc/ bNJ:/ y@G.vF 06/26"
}
```

返回示例（统一响应体中的 `data`）：

```json
{
  "shareUrl": "https://v.douyin.com/IQ-uaVSmjUc/",
  "resolvedUrl": "https://www.douyin.com/video/7523320109629281576?...",
  "awemeId": "7523320109629281576",
  "mediaType": "video",
  "title": "伊朗何以至此...",
  "author": "学院派Academia",
  "coverUrl": "https://p3-sign.douyinpic.com/xxx.jpeg",
  "videoUrls": [
    "https://aweme.snssdk.com/aweme/v1/play/?video_id=xxx"
  ],
  "imageUrls": [],
  "imageVideoUrls": []
}
```

### GET `/douyin/resolve?shareText=...`

也支持通过 query 直接传 `shareText` 调用，适合浏览器或简单调试场景。
