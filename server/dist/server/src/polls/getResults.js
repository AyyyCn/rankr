"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (rankings, nominations, votesPerVoter) => {
    const scores = {};
    Object.values(rankings).forEach((userRankings) => {
        userRankings.forEach((nominationID, n) => {
            var _a;
            const voteValue = Math.pow((votesPerVoter - 0.5 * n) / votesPerVoter, n + 1);
            scores[nominationID] = ((_a = scores[nominationID]) !== null && _a !== void 0 ? _a : 0) + voteValue;
        });
    });
    const results = Object.entries(scores).map(([nominationID, score]) => ({
        nominationID,
        nominationText: nominations[nominationID].text,
        score,
    }));
    results.sort((res1, res2) => res2.score - res1.score);
    return results;
};
//# sourceMappingURL=getResults.js.map