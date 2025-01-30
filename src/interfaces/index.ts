export interface PayLoadJwt {
  sub: string;
  email: string;
}

export interface UploadFileFormatOptions {
  width?: number;
  height?: number;
  crop?: string;
  format?: string;
}

export interface UploadFileOptions {
  public_id?: string;
  folder?: string;
}
