// src/utils/format.ts
export function currency(n: number){
  if(isNaN(n)) return 'Rp 0';
  return 'Rp ' + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g,'.');
}

export const censorEmail = (email?: string | null) => {
  if (!email) return '';
  const [name, domain] = email.split('@');
  if (name.length <= 3) return `${name[0]}***@${domain}`;
  return `${name.substring(0,2)}***${name[name.length-1]}@${domain}`;
};
