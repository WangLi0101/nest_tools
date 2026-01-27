import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import * as jwt from 'jsonwebtoken';
import { PDFDocument, rgb } from 'pdf-lib';
@Injectable()
export class OnlyofficeService {
  private readonly logger = new Logger(OnlyofficeService.name);
  private readonly filesDir = path.resolve(process.cwd(), 'files');
  private readonly secret = 'your_secret_key'; // In a real app, use env variable
  private readonly documentServerUrl = 'http://localhost:8080'; // The OnlyOffice Document Server URL
  private readonly serverUrl = 'http://host.docker.internal:3000';
  constructor() {
    // 确保 files 目录存在
    if (!fs.existsSync(this.filesDir)) {
      fs.mkdirSync(this.filesDir, { recursive: true });
    }
  }
  async createDefaultPdfFile(filePath: string) {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 400]);
    page.drawText('Hello World', {
      x: 50,
      y: 350,
      size: 24,
      color: rgb(0, 0, 0),
    });
    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(filePath, pdfBytes);
  }
  // 生成前端初始化编辑器所需的配置
  async getEditorConfig(fileId: string, userIp: string) {
    const fileName = fileId; // 为了简单起见，假设 fileId 就是文件名
    const filePath = path.join(this.filesDir, fileName);
    // 文件类型
    const fileType = path.extname(fileName).toLowerCase();

    // 基本检查文件是否存在，或者创建一个默认文件
    if (!fs.existsSync(filePath)) {
      // 仅用于演示目的，我们可能会检查是否应该创建它或抛出错误
      if (fileType === '.pdf') {
        await this.createDefaultPdfFile(filePath);
      } else {
        fs.writeFileSync(filePath, 'hello world');
      }
    }

    const fileStat = fs.statSync(filePath);
    // Use the LAN IP address so OnlyOffice (in Docker) can reach the backend
    // Use host.docker.internal for Docker Desktop on Windows/Mac
    // This allows the container to access the host machine's localhost

    const config = {
      document: {
        fileType: path.extname(fileName).slice(1),
        key: `${fileName}-${fileStat.mtime.getTime()}`, // 文档版本的唯一标识符
        title: fileName,
        url: `${this.serverUrl}/files/${fileName}`, // OnlyOffice 下载文件的 URL
        permissions: {
          // ⭐⭐⭐ 核心补丁
          edit: true, // 允许编辑并保存
          download: true,
          print: true,
        },
      },
      documentType: this.getDocumentType(fileName),
      editorConfig: {
        callbackUrl: `${this.serverUrl}/onlyoffice/callback?fileName=${fileName}`,
        customization: {
          forcesave: true, // Allow manual saving to backend
        },
        lang: 'zh-CN',
        mode: 'edit',
        coEditing: {
          mode: 'fast', // 实时协作
          change: true, // 是否可编辑
        },
        user: {
          id: new Date().getTime().toString(),
          name: 'User ' + new Date().getTime().toString(),
        },
      },
    };
    const token = jwt.sign(config, this.secret);

    return {
      ...config,
      token,
      documentServerUrl: this.documentServerUrl, // 传递给前端以加载 API 脚本
    };
  }

  // 处理来自 OnlyOffice Document Server 的回调
  async handleCallback(body: any, query: any) {
    const { status, url } = body;
    const { fileName } = query;

    this.logger.log(`Callback for ${fileName} with status ${status}`);

    await this.processSave(body, fileName);

    return { error: 0 };
  }
  async processSave(body: any, fileName: string) {
    const { status, url } = body;

    if (status !== 2 && status !== 6) return;

    let downloadUrl = url;

    try {
      const urlObj = new URL(url);
      downloadUrl = `${this.documentServerUrl}${urlObj.pathname}${urlObj.search}`;
    } catch (e) {
      this.logger.error('URL parse error', e);
      return;
    }

    try {
      const response = await axios.get(downloadUrl, {
        responseType: 'stream',
      });

      const filePath = path.join(this.filesDir, fileName);
      const writer = fs.createWriteStream(filePath);

      response.data.pipe(writer);

      writer.on('finish', () => {
        this.logger.log('File saved successfully (async)');
      });
    } catch (error) {
      this.logger.error('Async save failed', error);
    }
  }

  private getDocumentType(fileName: string): string {
    const ext = path.extname(fileName).toLowerCase();
    if (['.doc', '.docx', '.txt'].includes(ext)) return 'word';
    if (['.xls', '.xlsx', '.csv'].includes(ext)) return 'cell';
    if (['.ppt', '.pptx'].includes(ext)) return 'slide';
    if (['.pdf'].includes(ext)) return 'pdf';
    return 'word';
  }
}
