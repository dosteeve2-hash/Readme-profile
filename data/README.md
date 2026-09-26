# data/

## `certifications.json`

La liste des certifications affichées sur le profil GitHub **et** — à terme — dans le portfolio.
Une seule source, deux destinations : on ne saisit jamais la même chose deux fois.

Chaque entrée :

```json
{
  "titre": "Google Cybersecurity Professional Certificate",
  "organisme": "Google · Coursera",
  "date": "2026-08",
  "url": "https://coursera.org/verify/...",
  "competences": ["SIEM", "Linux", "Python"],
  "logo": "google"
}
```

| Champ | Obligatoire | Note |
|---|---|---|
| `titre` | oui | Le nom exact figurant sur l'attestation |
| `organisme` | oui | Qui l'a délivrée, et via quelle plateforme |
| `date` | oui | `AAAA-MM` — sert au tri, du plus récent au plus ancien |
| `url` | non | **Le lien de vérification.** Sans lui, une certification n'est qu'une affirmation — c'est exactement la doctrine du dossier vérifiable de COMBINE, appliquée à soi-même |
| `competences` | non | 2 à 4 mots-clés, affichés en puces |
| `logo` | non | Slug [simple-icons](https://simpleicons.org) (`google`, `coursera`, `cisco`, `ibm`…) pour le badge |

Après modification : `node scripts/certifications.mjs` régénère le bloc du `README.md`.
La CI le fait toute seule à chaque push touchant ce fichier.

### Pour Codex — la tâche qui attend

Claude tourne dans une session cloud : **il n'a pas accès au disque de Steve ni à son LinkedIn.**
Cette liste ne peut donc être remplie que depuis la machine. Répartition conforme à la Règle #13 :

```
codex exec "Lis les attestations de certification dans le profil de Steve
(Documents, Téléchargements, Bureau — PDF et images), et la section
Licences & certifications de https://www.linkedin.com/in/steeve-donald-compaoré-65ba13296.
Remplis data/certifications.json selon le schéma décrit dans data/README.md,
puis lance node scripts/certifications.mjs et ouvre une PR sur une branche codex/certifications."
```
