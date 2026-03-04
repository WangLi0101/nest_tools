import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';
import axios, { AxiosError } from 'axios';
import * as path from 'path';
import * as http from 'http';

/** 模拟浏览器的基础请求头，用于绕过远端反爬检测 */
const BROWSER_HEADERS: Record<string, string> = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  Accept: 'video/webm,video/mp4,video/*;q=0.9,*/*;q=0.8',
  'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
  'Accept-Encoding': 'identity', // 不压缩，方便 Content-Length 透传
  Connection: 'keep-alive',
};

/** 从客户端请求头中允许透传到远端的字段 */
const PASSTHROUGH_REQUEST_HEADERS = [
  'referer',
  'cookie',
  'range', // 支持断点续传
  'origin',
];

@Injectable()
export class DownloadService {
  private readonly logger = new Logger(DownloadService.name);

  /**
   * 将远程 URL 的内容以流的方式 pipe 到 express Response
   * @param url    要下载的远程 URL
   * @param res    express Response 对象
   * @param req    express Request 对象（用于透传请求头）
   */
  async pipeRemoteFile(
    url: string,
    res: Response,
    req: Request,
  ): Promise<void> {
    // 校验 URL 合法性
    try {
      new URL(url);
    } catch {
      throw new BadRequestException(`无效的 URL: ${url}`);
    }

    // 合并请求头：浏览器基础头 + 客户端透传头
    const forwardHeaders: Record<string, string> = { ...BROWSER_HEADERS };
    for (const key of PASSTHROUGH_REQUEST_HEADERS) {
      const val = req.headers[key];
      if (val) {
        forwardHeaders[key] = Array.isArray(val) ? val.join(', ') : val;
      }
    }
    // 如果客户端没有提供 Referer，自动使用目标 URL 的 origin 作为 Referer
    if (!forwardHeaders['referer']) {
      try {
        const { origin } = new URL(url);
        forwardHeaders['referer'] = origin;
      } catch {
        // ignore
      }
    }

    this.logger.debug(`开始代理下载: ${url}`);

    let axiosResponse: Awaited<ReturnType<typeof axios.get>>;
    try {
      axiosResponse = await axios.get(url, {
        responseType: 'stream',
        headers: forwardHeaders,
        timeout: 30_000, // 30s 超时
        maxRedirects: 10,
        validateStatus: (status) => status < 400, // 允许 2xx / 3xx
      });
    } catch (err) {
      const axiosErr = err as AxiosError;
      const status = axiosErr.response?.status;
      const message = axiosErr.message;
      this.logger.error(`远程请求失败 [${status ?? 'N/A'}]: ${message}`);
      throw new BadGatewayException(`无法获取远程文件 (${status ?? message})`);
    }

    const remoteHeaders = axiosResponse.headers as http.IncomingHttpHeaders;
    const remoteStatus = axiosResponse.status;

    // 推断文件名
    const fileName = this.resolveFileName(url, remoteHeaders);
    // 推断 Content-Type
    const contentType =
      (remoteHeaders['content-type'] as string) || 'application/octet-stream';
    const contentLength = remoteHeaders['content-length'];

    // 断点续传：如果远端返回 206，透传给客户端
    res.status(remoteStatus === 206 ? 206 : 200);

    res.setHeader(
      'Content-Disposition',
      `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`,
    );
    res.setHeader('Content-Type', contentType);

    if (contentLength) {
      res.setHeader('Content-Length', contentLength);
    }
    if (remoteHeaders['content-range']) {
      res.setHeader('Content-Range', remoteHeaders['content-range'] as string);
      res.setHeader('Accept-Ranges', 'bytes');
    }

    // 流式 pipe
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
      res.on('close', resolve); // 客户端提前断开连接时也正常结束
    });
  }

  /**
   * 从 Content-Disposition 或 URL 路径中解析文件名
   */
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
      const pathname = new URL(url).pathname;
      const base = path.posix.basename(pathname);
      if (base && base !== '/') return base;
    } catch {
      // ignore
    }

    return 'download';
  }
}
