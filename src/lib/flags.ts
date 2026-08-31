/**
 * Generate the emoji flag of a country from its ISO code 3166-1 alpha-2.
 * @param countryCode 2 letters country code (ex: "be", "FR")
 */
function getFlag(countryCode: string): string {
    const codeMaj = countryCode.toUpperCase();

    if (codeMaj.length !== 2) {
        throw new Error("Le code pays doit contenir exactement 2 lettres.");
    }

    // U+1F1E6 (A) is the offset 0x1F1E6 since character 'A' (65)
    const char1 = String.fromCodePoint((codeMaj.charCodeAt(0) - 65) + 0x1F1E6);
    const char2 = String.fromCodePoint((codeMaj.charCodeAt(1) - 65) + 0x1F1E6);

    return `${char1}${char2}`;
}
