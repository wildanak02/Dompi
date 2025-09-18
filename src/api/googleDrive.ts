// src/api/googleDrive.ts
import { DRIVE_FILE_NAME } from '@/constants/config';

async function driveFindFile(token: string){
  const q = encodeURIComponent(`name='${DRIVE_FILE_NAME}' and trashed=false`);
  const r = await fetch(`https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name)`,{ headers:{Authorization:`Bearer ${token}`}});
  const j = await r.json();
  return (j.files && j.files[0]) || null;
}

export async function driveUploadJSON(token: string, obj: any){
  const metadata = { name: DRIVE_FILE_NAME, mimeType:'application/json' };
  const boundary = 'xYz' + Date.now();
  const body = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n--${boundary}\r\nContent-Type: application/json\r\n\r\n${JSON.stringify(obj)}\r\n--${boundary}--`;
  const file = await driveFindFile(token);
  const url = file ? `https://www.googleapis.com/upload/drive/v3/files/${file.id}?uploadType=multipart` : `https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart`;
  const method = file ? 'PATCH' : 'POST';
  const r = await fetch(url, { method, headers: { Authorization:`Bearer ${token}`, 'Content-Type':`multipart/related; boundary=${boundary}` }, body });
  if(!r.ok) throw new Error('Upload gagal');
}

export async function driveDownloadJSON(token: string){
  const file = await driveFindFile(token);
  if(!file) throw new Error('File backup belum ada di Drive');
  const r = await fetch(`https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`, { headers:{ Authorization:`Bearer ${token}` } });
  if(!r.ok) throw new Error('Unduh gagal');
  return await r.json();
}

export async function fetchUserInfo(token: string){
  const r = await fetch('https://www.googleapis.com/oauth2/v3/userinfo',{ headers:{ Authorization:`Bearer ${token}` }});
  if(!r.ok) return null;
  return await r.json();
}
