import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import axios, { AxiosError, AxiosResponse } from 'axios';
import * as path from 'path';
import * as http from 'http';

@Injectable()
export class DownloadService {
  /** 固定的浏览器伪装请求头 */
  private static readonly BROWSER_HEADERS = {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    Accept: 'video/webm,video/mp4,video/*;q=0.9,*/*;q=0.8',
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
    'Accept-Encoding': 'identity',
  };

  private readonly logger = new Logger(DownloadService.name);

  async pipeRemoteFile(url: string, res: Response): Promise<void> {
    try {
      new URL(url);
    } catch {
      throw new BadRequestException(`无效的 URL: ${url}`);
    }

    this.logger.debug(`开始代理下载: ${url}`);

    let axiosResponse: AxiosResponse<any>;
    try {
      axiosResponse = await axios.get(url, {
        responseType: 'stream',
        headers: {
          ...DownloadService.BROWSER_HEADERS,
          Referer: new URL(url).origin,
        },
        timeout: 30_000,
        maxRedirects: 10,
      });
    } catch (err) {
      const axiosErr = err as AxiosError;
      const status = axiosErr.response?.status;
      this.logger.error(
        `远程请求失败 [${status ?? 'N/A'}]: ${axiosErr.message}`,
      );
      throw new BadGatewayException(
        `无法获取远程文件 (${status ?? axiosErr.message})`,
      );
    }

    const remoteHeaders = axiosResponse.headers as http.IncomingHttpHeaders;
    const fileName = this.resolveFileName(url, remoteHeaders);
    const contentType =
      (remoteHeaders['content-type'] as string) || 'application/octet-stream';
    const contentLength = remoteHeaders['content-length'];

    res.setHeader(
      'Content-Disposition',
      `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`,
    );
    res.setHeader('Content-Type', contentType);
    if (contentLength) res.setHeader('Content-Length', contentLength);

    axiosResponse.data.pipe(res);

    await new Promise<void>((resolve, reject) => {
      axiosResponse.data.on('end', () => {
        this.logger.debug(`下载完成: ${fileName}`);
        resolve();
      });
      axiosResponse.data.on('error', (err: Error) => {
        this.logger.error('流传输错误', err);
        reject(new BadGatewayException('远程文件传输中断'));
      });
      res.on('close', resolve);
    });
  }

  private resolveFileName(
    url: string,
    headers: http.IncomingHttpHeaders,
  ): string {
    const disposition = headers['content-disposition'] as string | undefined;
    if (disposition) {
      const utf8Match = /filename\*=UTF-8''(.+)/i.exec(disposition);
      if (utf8Match) return decodeURIComponent(utf8Match[1]);
      const asciiMatch = /filename="?([^";\r\n]+)"?/i.exec(disposition);
      if (asciiMatch) return asciiMatch[1].trim();
    }
    try {
      const base = path.posix.basename(new URL(url).pathname);
      if (base && base !== '/') return base;
    } catch {
      /* ignore */
    }
    return 'download';
  }
}
