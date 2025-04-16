import { Result } from "../types";

// Traditional ML Models mapping
const TRADITIONAL_BLOOM_LEVELS = [
  "Analyzing",
  "Applying",
  "Creating",
  "Evaluating",
  "Remembering",
  "Understanding",
];

// Transformer Models mapping
const TRANSFORMER_BLOOM_LEVELS = [
  "Remembering",
  "Understanding",
  "Applying",
  "Analyzing",
  "Evaluating",
  "Creating",
];

const MODEL_GROUPS = {
  "Traditional ML": ["knn", "multinomial_nb", "rf_ngram", "svm_ngram"],
  "N-gram Based": ["nb_trigram", "nb_ngram", "lr_trigram", "lr_ngram"],
  Transformers: ["bert", "distilbert", "roberta"],
};

function getBloomLevel(model: string, prediction: number): string {
  if (MODEL_GROUPS["Transformers"].includes(model)) {
    return TRANSFORMER_BLOOM_LEVELS[prediction];
  }
  return TRADITIONAL_BLOOM_LEVELS[prediction];
}

function getVotedLevel(
  predictions: Record<string, { prediction: number; probability: number }>
): { level: string; voteCount: number; totalVotes: number } {
  const votes: Record<string, number> = {};
  let totalVotes = 0;

  // Count votes for each level
  Object.entries(predictions).forEach(([model, { prediction }]) => {
    const level = getBloomLevel(model, prediction);
    votes[level] = (votes[level] || 0) + 1;
    totalVotes++;
  });

  // Find the level with the most votes
  let maxVotes = 0;
  let winningLevel = "";
  Object.entries(votes).forEach(([level, count]) => {
    if (count > maxVotes) {
      maxVotes = count;
      winningLevel = level;
    }
  });

  return {
    level: winningLevel,
    voteCount: maxVotes,
    totalVotes,
  };
}

export default function Results({ results }: { results: Result[] }) {
  if (!results || results.length === 0) return null;

  return (
    <div className="mt-8 space-y-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Classification Results
      </h2>

      {results.map((result, index) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow-sm border p-6 space-y-4"
        >
          {/* Question Text */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-medium text-gray-900">Question:</h3>
            <p className="mt-1 text-gray-700">{result.text}</p>
          </div>

          {/* Voted Result */}
          {result.predictions && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900">
                Final Classification (Majority Vote)
              </h4>
              {(() => {
                const { level, voteCount, totalVotes } = getVotedLevel(
                  result.predictions
                );
                return (
                  <p className="mt-2 text-lg font-medium text-blue-700">
                    {level} ({voteCount}/{totalVotes} votes)
                  </p>
                );
              })()}
            </div>
          )}

          {/* Model Groups */}
          <div className="mt-6 space-y-6">
            {Object.entries(MODEL_GROUPS).map(([groupName, models]) => (
              <div key={groupName} className="space-y-2">
                <h4 className="font-semibold text-gray-800">
                  {groupName} Models
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {models.map(
                    (model) =>
                      result.predictions?.[model] && (
                        <div
                          key={model}
                          className="bg-gray-50 rounded p-3 border border-gray-100"
                        >
                          <p className="text-sm text-gray-600 mb-1">{model}</p>
                          <p className="font-medium text-gray-900">
                            {getBloomLevel(
                              model,
                              result.predictions[model].prediction
                            )}
                          </p>
                          <p className="text-sm text-gray-500">
                            Confidence:{" "}
                            {(
                              result.predictions[model].probability * 100
                            ).toFixed(2)}
                            %
                          </p>
                        </div>
                      )
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
