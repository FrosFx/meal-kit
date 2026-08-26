// NAPOMENA: Ovo je samo osnovna zaštita za prototip, ne prava
// autentifikacija. Lozinka je vidljiva u izvornom kodu (i u JS bandlu
// koji stiže do browsera) — ne koristiti ovakav pristup u pravoj
// (produkcionoj) aplikaciji sa stvarnim korisnicima.
export const ADMIN_PASSWORD = "meal-kit-admin";

// Ključ pod kojim čuvamo lozinku u sessionStorage nakon uspešnog logina,
// da bismo je mogli poslati kao header uz zahteve ka admin API rutama.
export const ADMIN_AUTH_STORAGE_KEY = "meal-kit-admin-auth";

// Header koji admin panel šalje uz zahteve koji menjaju podatke
// (dodavanje/izmena/brisanje recepata), da server zna da je zahtev
// zaista došao iz ulogovanog admin panela.
export const ADMIN_PASSWORD_HEADER = "x-admin-password";
