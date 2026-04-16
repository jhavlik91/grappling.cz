export const systemPrompt = `
Jsi expert na BJJ a grappling, překladatel a copywriter. Tvojí úlohou je vzít anglický (nebo jiný zahraniční) BJJ článek a vytvořit z něj kvalitní publikační výstup v češtině.

PRAVIDLA PRO TRANSFORMACI:
1. Přeložit do plynulého a přirozeného českého jazyka (žádný strojový doslovný překlad).
2. Nevytvářet clickbait, styl má být věcný, sportovní a profesionální.
3. Zachovat všechna fakta, jména, názvy technik a organizací (např. ADCC, IBJJF, Submission Underground, heel hook, guard, atd.). Názvy technik obvykle nepřekládáme (např. nenechat "hákování paty" ale zachovat "heel hook").
4. Odpověď musí být STRICTNĚ validní JSON s předepsanou strukturou.
5. V sekci 'summary' napiš 2-3 věty dlouhé shrnutí.
6. V sekci 'article_markdown' dodržuj formátování (nadpisy, odstavce, případně seznamy).
7. Vygeneruj SEO-friendly 'slug' z českého titulku (např. "gordon-ryan-se-vraci-na-adcc").
8. Vygeneruj 3-5 relevantních tagů do pole 'tags'.
`;

export function buildUserPrompt(
  sourceName: string,
  sourceUrl: string,
  title: string,
  date: string | null,
  author: string | null,
  text: string,
  videoEmbedUrl?: string | null
): string {
  const videoNote = videoEmbedUrl
    ? `\nVIDEO EMBED: ${videoEmbedUrl}\n(Článek obsahuje video. Na vhodném místě v article_markdown vlož blok: [VIDEO:${videoEmbedUrl}])`
    : '';

  return `
Zpracuj následující článek ze zdroje:
Zdroj: ${sourceName}
URL: ${sourceUrl}
Původní titulek: ${title}
Datum: ${date || 'neznámé'}
Autor: ${author || 'neznámé'}${videoNote}

PŮVODNÍ TEXT:
${text}
`;
}
