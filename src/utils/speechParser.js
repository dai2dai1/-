/**
 * Calculates the Levenshtein distance between two strings.
 */
const levenshteinDistance = (a, b) => {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    const matrix = [];

    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // substitution
                    Math.min(
                        matrix[i][j - 1] + 1, // insertion
                        matrix[i - 1][j] + 1 // deletion
                    )
                );
            }
        }
    }

    return matrix[b.length][a.length];
};

/**
 * Parses speech text into structured commands.
 * Pattern: 给 [Name] [Add/Deduct] [Points] [Unit] [Reason]
 * Example: "给萱萱加100分因为她学会了跆拳道"
 * Example: "扣闹闹50分吃饭不好好"
 */
export const parseCommand = (text, children) => {
    // 1. Identify Name (Smart & Fuzzy Match)
    let targetChild = null;
    let targetName = null;
    let bestMatchScore = Infinity; // Lower is better (edit distance)
    let matchedIdentifier = '';

    // Normalize text (remove punctuation)
    const normalizedText = text.replace(/[，,。？！?!]/g, ' ');

    // Strategy 1: Exact Match (Fastest & Most Accurate)
    for (const child of children) {
        const identifiers = [child.name, ...(child.aliases || [])];
        for (const id of identifiers) {
            if (normalizedText.includes(id)) {
                targetChild = child;
                targetName = child.name;
                matchedIdentifier = id;
                bestMatchScore = 0;
                break;
            }
        }
        if (targetChild) break;
    }

    // Strategy 2: Fuzzy Match (Levenshtein)
    // Only if no exact match found
    if (!targetChild) {
        // Iterate through text with sliding window to find close matches
        for (const child of children) {
            const identifiers = [child.name, ...(child.aliases || [])];

            for (const id of identifiers) {
                // Heuristic: only check substrings of length roughly equal to ID length
                // Allow window variance of +/- 1 char
                const len = id.length;
                for (let i = 0; i < normalizedText.length; i++) {
                    // check windows of size len, len-1, len+1
                    const windows = [
                        normalizedText.substr(i, len),
                        normalizedText.substr(i, len - 1),
                        normalizedText.substr(i, len + 1)
                    ];

                    for (const windowStr of windows) {
                        if (!windowStr) continue;
                        const dist = levenshteinDistance(id, windowStr);

                        // Threshold: 
                        // For 2-char names, allow 1 edit? (e.g. 圈圈 -> 萱萱 might be 2 edits if totally different chars, but visually/phonetically different)
                        // Actually Levenshtein handles chars. "圈" vs "萱" is 1 sub.
                        // Threshold depends on length.
                        const threshold = len <= 2 ? 1 : 2;

                        if (dist <= threshold && dist < bestMatchScore) {
                            bestMatchScore = dist;
                            targetChild = child;
                            targetName = child.name;
                            matchedIdentifier = windowStr; // The part of text that matched
                        }
                    }
                }
            }
        }
    }

    if (!targetChild) {
        return { success: false, error: '未识别到名字（可以试试说"给小萱..."）' };
    }

    // 2. Identify Action and Points
    // Regex for points: (加|奖励|赠送|扣|减|罚)(\d+)(分|积分)?
    // Expanded for homophones or casual speech
    const pointRegex = /(加|奖励|赠送|给|扣|减|罚|plus|minus|jiā|kòu)\s*(\d+)\s*(分|积分|点)?/i;
    const match = normalizedText.match(pointRegex);

    if (!match) {
        return { success: false, error: '未识别到分值变化', name: targetName };
    }

    const actionKeyword = match[1];
    let points = parseInt(match[2], 10);

    // Detect negative intent
    if (['扣', '减', '罚', 'minus'].some(kw => actionKeyword.includes(kw))) {
        points = -points;
    }

    // 3. Extract Reason
    // Reason is usually the rest of the sentence.
    let reason = text
        .replace(targetName, '')
        .replace(matchedIdentifier, '') // Remove the actual fuzzy matched text
        .replace(match[0], '') // Remove action/points
        .replace(/[，,。？！?!]/g, ' ')
        .trim();

    // Remove aliases from reason if they exist
    if (targetChild.aliases) {
        targetChild.aliases.forEach(alias => {
            reason = reason.replace(alias, '');
        });
    }

    if (!reason) {
        reason = points > 0 ? '表现不错' : '需要改进';
    }

    // Clean up reason prefix like "因为"
    if (reason.startsWith('因为')) {
        reason = reason.substring(2).trim();
    }

    return {
        success: true,
        name: targetName, // Return canonical name ID
        childId: targetChild.id,
        points,
        reason: reason.trim(), // Assuming 'reason' is defined in logic above or we need to ensure it
        originalText: text
    };
};
