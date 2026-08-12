/* Generator ikon PWA — czysty Node, zero zależności.
   Rysuje literę F (znak FightLog) w kolorze --combat na tle --bg.

   Uruchomienie:  node tools/make-icons.mjs
   Wynik trafia do icons/ i jest commitowany — normalnie nie trzeba go
   odpalać, chyba że zmienią się kolory w design systemie. */

import { deflateSync, crc32 } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';

const BG = [0x0a, 0x0a, 0x0a];
const FG = [0xc6, 0x28, 0x28];

const SIZES = [
    ['icon-192.png', 192],
    ['icon-512.png', 512],
    ['apple-touch-icon.png', 180]
];

function chunk(type, data) {
    const length = Buffer.alloc(4);
    length.writeUInt32BE(data.length);

    const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
    const checksum = Buffer.alloc(4);
    checksum.writeUInt32BE(crc32(body) >>> 0);

    return Buffer.concat([length, body, checksum]);
}

function png(size, pixel) {
    const header = Buffer.alloc(13);
    header.writeUInt32BE(size, 0);
    header.writeUInt32BE(size, 4);
    header[8] = 8;      // bitów na kanał
    header[9] = 2;      // truecolor RGB
    // bajty 10-12: kompresja, filtr, przeplot — wartości domyślne (0)

    const raw = Buffer.alloc(size * (size * 3 + 1));
    let offset = 0;

    for (let y = 0; y < size; y++) {
        raw[offset++] = 0;                      // typ filtra wiersza: none
        for (let x = 0; x < size; x++) {
            const [r, g, b] = pixel(x, y, size);
            raw[offset++] = r;
            raw[offset++] = g;
            raw[offset++] = b;
        }
    }

    return Buffer.concat([
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
        chunk('IHDR', header),
        chunk('IDAT', deflateSync(raw, { level: 9 })),
        chunk('IEND', Buffer.alloc(0))
    ]);
}

/* Litera F z trzech prostokątów, wpisana w środkowe 56% płótna — tyle mieści
   się w bezpiecznym obszarze ikony maskable (środkowe 80% koła), więc jeden
   plik obsługuje i „any", i „maskable". */
function glyph(x, y, size) {
    const unit = size / 100;
    const inside = (left, top, width, height) =>
        x >= left * unit && x < (left + width) * unit
        && y >= top * unit && y < (top + height) * unit;

    const stem = inside(30, 22, 11, 56);
    const top = inside(30, 22, 40, 11);
    const middle = inside(30, 44, 31, 10);

    return stem || top || middle ? FG : BG;
}

const target = process.argv[2] ?? 'icons';
mkdirSync(target, { recursive: true });

for (const [name, size] of SIZES) {
    writeFileSync(`${target}/${name}`, png(size, glyph));
    console.log(`${target}/${name} — ${size}×${size}`);
}
