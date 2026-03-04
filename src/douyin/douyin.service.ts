import { Injectable } from '@nestjs/common';
import axios from 'axios';
import {
  ExternalServiceBusinessException,
  ValidationBusinessException,
} from '../common/exceptions/custom.exceptions';

type DouyinTypeHint = 'video' | 'images' | null;

type AwemeMeta = {
  awemeId: string;
  typeHint: DouyinTypeHint;
};

type DouyinResolveResult = {
  shareUrl: string;
  resolvedUrl: string;
  awemeId: string;
  mediaType: 'video' | 'images';
  title: string;
  author: string;
  coverUrl: string;
  videoUrls: string[];
  imageUrls: string[];
  imageVideoUrls: string[];
};

@Injectable()
export class DouyinService {
  // 使用移动端 UA，稳定拿到分享页中的路由数据
  private readonly mobileUserAgent =
    'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';

  async resolveNoWatermarkShareLink(
    input: string,
  ): Promise<DouyinResolveResult> {
    if (!input || !input.trim()) {
      throw new ValidationBusinessException('shareText is required');
    }

    const shareUrl = this.extractShareUrl(input);
    const resolvedUrl = await this.resolveRedirectUrl(shareUrl);
    const resolvedMeta = this.extractAwemeMeta(resolvedUrl);
    const shareMeta = this.extractAwemeMeta(shareUrl);
    const awemeMeta = resolvedMeta || shareMeta;

    const candidateUrls = this.buildCandidateUrls(
      resolvedUrl,
      awemeMeta?.awemeId,
      awemeMeta?.typeHint || null,
    );

    let parsedItem: Record<string, any> | null = null;
    let lastErrorMessage = '';

    for (const candidate of candidateUrls) {
      try {
        const html = await this.fetchHtml(candidate);
        parsedItem = this.extractAwemeItemFromHtml(html);
        if (parsedItem) {
          break;
        }
      } catch (error) {
        lastErrorMessage = this.stringifyError(error);
      }
    }

    if (!parsedItem) {
      throw new ExternalServiceBusinessException(
        'Unable to parse Douyin share page without cookie',
        {
          shareUrl,
          resolvedUrl,
          candidates: candidateUrls,
          error:
            lastErrorMessage || 'No parsable aweme item found in page source',
        },
      );
    }

    return this.buildResolveResult(
      parsedItem,
      shareUrl,
      resolvedUrl,
      awemeMeta,
    );
  }

  private async resolveRedirectUrl(shareUrl: string): Promise<string> {
    try {
      const response = await axios.get<string>(shareUrl, {
        responseType: 'text',
        maxRedirects: 5,
        timeout: 10000,
        validateStatus: () => true,
        headers: {
          'User-Agent': this.mobileUserAgent,
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'zh-CN,zh;q=0.9',
        },
      });

      const finalUrl = response.request?.res?.responseUrl || shareUrl;
      if (!finalUrl) {
        throw new Error('No redirect url resolved');
      }
      return finalUrl;
    } catch (error) {
      throw new ExternalServiceBusinessException(
        'Failed to resolve Douyin short link',
        {
          shareUrl,
          error: this.stringifyError(error),
        },
      );
    }
  }

  private async fetchHtml(url: string): Promise<string> {
    const response = await axios.get<string>(url, {
      responseType: 'text',
      maxRedirects: 5,
      timeout: 10000,
      validateStatus: (status) => status >= 200 && status < 400,
      headers: {
        'User-Agent': this.mobileUserAgent,
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9',
      },
      transformResponse: [(data) => data],
    });

    if (typeof response.data !== 'string' || !response.data.trim()) {
      throw new ExternalServiceBusinessException('Douyin page html is empty', {
        url,
      });
    }
    return response.data;
  }

  private extractShareUrl(input: string): string {
    const match = input.match(/https?:\/\/[^\s]+/i);
    if (!match) {
      throw new ValidationBusinessException('No valid URL found in shareText', {
        input,
      });
    }

    return this.stripUrlTailPunctuation(match[0]);
  }

  private stripUrlTailPunctuation(url: string): string {
    return url.replace(/[),.;!?，。；！）】》]+$/g, '');
  }

  private extractAwemeMeta(url: string): AwemeMeta | null {
    const patterns: Array<{ regex: RegExp; typeHint: DouyinTypeHint }> = [
      { regex: /\/(?:video|share\/video)\/(\d+)/, typeHint: 'video' },
      { regex: /\/(?:note|share\/note)\/(\d+)/, typeHint: 'images' },
      { regex: /[?&]modal_id=(\d+)/, typeHint: null },
      { regex: /[?&]item_ids=(\d+)/, typeHint: null },
    ];

    for (const { regex, typeHint } of patterns) {
      const match = url.match(regex);
      if (match?.[1]) {
        return {
          awemeId: match[1],
          typeHint,
        };
      }
    }
    return null;
  }

  private buildCandidateUrls(
    resolvedUrl: string,
    awemeId?: string,
    typeHint: DouyinTypeHint = null,
  ): string[] {
    const urls: string[] = [resolvedUrl];

    if (awemeId) {
      if (typeHint === 'images') {
        urls.push(`https://www.iesdouyin.com/share/note/${awemeId}/`);
        urls.push(`https://www.iesdouyin.com/share/video/${awemeId}/`);
      } else {
        urls.push(`https://www.iesdouyin.com/share/video/${awemeId}/`);
        urls.push(`https://www.iesdouyin.com/share/note/${awemeId}/`);
      }
    }

    return this.uniqueStrings(urls);
  }

  private extractAwemeItemFromHtml(html: string): Record<string, any> | null {
    const routerData = this.extractJsonByMarker(html, 'window._ROUTER_DATA = ');
    if (routerData) {
      const item = this.findAwemeItem(routerData);
      if (item) {
        return item;
      }
    }

    const initialState = this.extractJsonByMarker(
      html,
      'window.__INITIAL_STATE__ = ',
    );
    if (initialState) {
      const item = this.findAwemeItem(initialState);
      if (item) {
        return item;
      }
    }

    return null;
  }

  private extractJsonByMarker(html: string, marker: string): any | null {
    const start = html.indexOf(marker);
    if (start < 0) {
      return null;
    }

    const scriptEnd = html.indexOf('</script>', start);
    if (scriptEnd < 0) {
      return null;
    }

    const jsonSegment = html
      .slice(start + marker.length, scriptEnd)
      .trim()
      .replace(/;$/, '');

    if (!jsonSegment) {
      return null;
    }

    try {
      return JSON.parse(jsonSegment);
    } catch {
      return null;
    }
  }

  private findAwemeItem(node: unknown, depth = 0): Record<string, any> | null {
    if (node == null || depth > 14) {
      return null;
    }

    if (Array.isArray(node)) {
      for (const entry of node) {
        const found = this.findAwemeItem(entry, depth + 1);
        if (found) {
          return found;
        }
      }
      return null;
    }

    if (typeof node !== 'object') {
      return null;
    }

    const obj = node as Record<string, any>;
    const itemList = obj.item_list;
    if (Array.isArray(itemList) && itemList.length > 0) {
      const first = itemList[0];
      if (
        first &&
        typeof first === 'object' &&
        (first.aweme_id ||
          first.video ||
          (Array.isArray(first.images) && first.images.length))
      ) {
        return first;
      }
    }

    for (const value of Object.values(obj)) {
      const found = this.findAwemeItem(value, depth + 1);
      if (found) {
        return found;
      }
    }
    return null;
  }

  private buildResolveResult(
    item: Record<string, any>,
    shareUrl: string,
    resolvedUrl: string,
    awemeMeta: AwemeMeta | null,
  ): DouyinResolveResult {
    const awemeId = String(item.aweme_id || awemeMeta?.awemeId || '');
    if (!awemeId) {
      throw new ExternalServiceBusinessException(
        'Parsed aweme item misses aweme_id',
        {
          shareUrl,
          resolvedUrl,
        },
      );
    }

    const imageUrls = this.extractImageUrls(item);
    const imageVideoUrls = this.extractImageVideoUrls(item);
    const videoUrls = this.extractVideoUrls(item);

    const mediaType: 'video' | 'images' =
      imageUrls.length > 0 ? 'images' : 'video';
    if (mediaType === 'video' && videoUrls.length === 0) {
      throw new ExternalServiceBusinessException(
        'No downloadable video url found',
        {
          awemeId,
        },
      );
    }

    const coverUrl = this.pickFirstString(
      item.video?.cover?.url_list,
      item.video?.origin_cover?.url_list,
      imageUrls,
    );

    return {
      shareUrl,
      resolvedUrl,
      awemeId,
      mediaType,
      title: String(item.desc || ''),
      author: String(item.author?.nickname || ''),
      coverUrl,
      videoUrls,
      imageUrls,
      imageVideoUrls,
    };
  }

  private extractVideoUrls(item: Record<string, any>): string[] {
    const bitRateList = Array.isArray(item.video?.bit_rate)
      ? item.video.bit_rate
      : [];
    const bitrateUrls = bitRateList.flatMap((bitRate: Record<string, any>) =>
      this.collectStringUrls(
        bitRate?.play_addr?.url_list,
        bitRate?.play_addr_h264?.url_list,
        bitRate?.play_addr_bytevc1?.url_list,
        bitRate?.download_addr?.url_list,
        bitRate?.url_list,
      ),
    );

    const urls = this.collectStringUrls(
      item.video?.play_addr?.url_list,
      item.video?.play_addr_h264?.url_list,
      item.video?.play_addr_lowbr?.url_list,
      item.video?.download_addr?.url_list,
      bitrateUrls,
    ).map((url) => this.toNoWatermarkVideoUrl(url));

    return this.uniqueStrings(urls);
  }

  private extractImageUrls(item: Record<string, any>): string[] {
    const images = Array.isArray(item.images) ? item.images : [];
    const urls = images.map((image: Record<string, any>) =>
      this.pickFirstString(image?.url_list),
    );
    return this.uniqueStrings(urls.filter(Boolean));
  }

  private extractImageVideoUrls(item: Record<string, any>): string[] {
    const images = Array.isArray(item.images) ? item.images : [];
    const imageVideoUrls = images.flatMap((image: Record<string, any>) =>
      this.collectStringUrls(
        image?.video_play_addr?.url_list,
        image?.video_download_addr?.url_list,
        image?.video?.play_addr?.url_list,
        image?.video?.download_addr?.url_list,
      ),
    );

    const imgBitrateList = Array.isArray(item.img_bitrate)
      ? item.img_bitrate
      : [];
    const imgBitrateUrls = imgBitrateList.flatMap(
      (bitRate: Record<string, any>) =>
        this.collectStringUrls(
          bitRate?.play_addr?.url_list,
          bitRate?.play_addr_h264?.url_list,
          bitRate?.play_addr_bytevc1?.url_list,
          bitRate?.download_addr?.url_list,
          bitRate?.url_list,
        ),
    );

    return this.uniqueStrings(
      [...imageVideoUrls, ...imgBitrateUrls].map((url) =>
        this.toNoWatermarkVideoUrl(url),
      ),
    );
  }

  private toNoWatermarkVideoUrl(url: string): string {
    return url
      .replace(/\/playwm\//g, '/play/')
      .replace(/([?&])watermark=\d+/g, '$1watermark=0')
      .replace(/\?&/g, '?');
  }

  private pickFirstString(...values: unknown[]): string {
    for (const value of values) {
      if (Array.isArray(value)) {
        for (const entry of value) {
          if (typeof entry === 'string' && entry.trim()) {
            return entry.trim();
          }
        }
      } else if (typeof value === 'string' && value.trim()) {
        return value.trim();
      }
    }
    return '';
  }

  private collectStringUrls(...values: unknown[]): string[] {
    const result: string[] = [];
    for (const value of values) {
      if (Array.isArray(value)) {
        for (const entry of value) {
          if (typeof entry === 'string' && entry.trim()) {
            result.push(entry.trim());
          }
        }
      } else if (typeof value === 'string' && value.trim()) {
        result.push(value.trim());
      }
    }
    return result;
  }

  private uniqueStrings(values: string[]): string[] {
    return [...new Set(values.filter((value) => Boolean(value)))];
  }

  private stringifyError(error: unknown): string {
    if (!error) {
      return '';
    }

    if (error instanceof Error) {
      return error.message;
    }

    return String(error);
  }
}
