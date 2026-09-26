/**
 * Régénère le bloc « Certifications » du README à partir de data/certifications.json.
 *
 *   node scripts/certifications.mjs            # écrit le README
 *   node scripts/certifications.mjs --verifier # n'écrit rien, sort en 1 si le bloc est périmé
 *
 * Pourquoi un générateur plutôt que du Markdown écrit à la main : la même liste doit
 * alimenter le profil GitHub et le portfolio. Deux copies d'une liste divergent
 * toujours ; une source et deux rendus, non.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const RACINE = join(dirname(fileURLToPath(import.meta.url)), '..');
const DEBUT = '<!-- CERTIFICATIONS:DEBUT';
const FIN = '<!-- CERTIFICATIONS:FIN -->';

const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

/** `2026-08` → `août 2026`. Une date non reconnue est rendue telle quelle. */
function dateLisible(brut) {
  const m = /^(\d{4})-(\d{2})$/.exec(String(brut ?? ''));
  if (!m) return String(brut ?? '');
  const mois = MOIS[Number(m[2]) - 1];
  return mois ? `${mois} ${m[1]}` : m[1];
}

/** Échappe ce qui casserait une cellule de tableau Markdown. */
function cellule(v) {
  return String(v ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
}

function rendre(certifs) {
  if (certifs.length === 0) return '';

  const lignes = [...certifs]
    .sort((a, b) => String(b.date ?? '').localeCompare(String(a.date ?? '')))
    .map((c) => {
      const badge = c.logo
        ? `<img src="https://img.shields.io/badge/-${encodeURIComponent(c.organisme?.split('·')[0]?.trim() ?? c.logo)}-070e1f?style=flat-square&logo=${encodeURIComponent(c.logo)}&logoColor=f0a832" alt="" /> `
        : '';
      const titre = c.url
        ? `**[${cellule(c.titre)}](${c.url})**`
        : `**${cellule(c.titre)}**`;
      const verif = c.url ? ' ✔️' : '';
      const comp = Array.isArray(c.competences) && c.competences.length > 0
        ? cellule(c.competences.join(' · '))
        : '—';
      return `| ${badge}${cellule(c.organisme)} | ${titre}${verif} | ${dateLisible(c.date)} | ${comp} |`;
    });

  const verifiables = certifs.filter((c) => c.url).length;
  const note = verifiables === certifs.length
    ? 'Toutes vérifiables : chaque titre est un lien vers l\'attestation.'
    : `${verifiables} sur ${certifs.length} portent un lien de vérification.`;

  return [
    '## 🎓 Certifications',
    '',
    '| Organisme | Certification | Obtenue | Compétences |',
    '|---|---|---|---|',
    ...lignes,
    '',
    `<sub>${note}</sub>`,
    '',
    '---',
    '',
  ].join('\n');
}

const certifs = JSON.parse(readFileSync(join(RACINE, 'data/certifications.json'), 'utf8'));
if (!Array.isArray(certifs)) {
  console.error('data/certifications.json doit contenir un tableau.');
  process.exit(1);
}

const manquants = certifs.filter((c) => !c.titre || !c.organisme || !c.date);
if (manquants.length > 0) {
  console.error(`${manquants.length} entrée(s) sans titre, organisme ou date.`);
  process.exit(1);
}

const chemin = join(RACINE, 'README.md');
const readme = readFileSync(chemin, 'utf8');
const i = readme.indexOf(DEBUT);
const j = readme.indexOf(FIN);
if (i === -1 || j === -1 || j < i) {
  console.error(`Balises ${DEBUT}…${FIN} introuvables dans README.md.`);
  process.exit(1);
}

const finBalise = readme.indexOf('-->', i) + 3;
const avant = readme.slice(0, finBalise);
const apres = readme.slice(j);
const corps = rendre(certifs);
const sortie = `${avant}\n${corps}${apres}`;

if (process.argv.includes('--verifier')) {
  if (sortie !== readme) {
    console.error('README.md est périmé — lance `node scripts/certifications.mjs`.');
    process.exit(1);
  }
  console.log(`À jour — ${certifs.length} certification(s).`);
} else {
  writeFileSync(chemin, sortie);
  console.log(`README.md régénéré — ${certifs.length} certification(s).`);
}
