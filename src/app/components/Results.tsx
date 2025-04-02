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
) {
  // Initialize counters for each Bloom level
  const voteCount: Record<string, number> = {};
  TRANSFORMER_BLOOM_LEVELS.forEach((level) => (voteCount[level] = 0));

  // Count votes for each model
  Object.entries(predictions).forEach(([model, data]) => {
    const level = getBloomLevel(model, data.prediction);
    voteCount[level] = (voteCount[level] || 0) + 1;
  });

  // Find the level with most votes
  const maxVotes = Math.max(...Object.values(voteCount));
  const votedLevel =
    Object.entries(voteCount).find(([_, count]) => count === maxVotes)?.[0] ||
    "";

  return {
    level: votedLevel,
    voteCount: maxVotes,
    totalVotes: Object.keys(predictions).length,
  };
}

export default function Results({ results }: { results: Result[] }) {
  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Classification Results</h2>
      <div className="space-y-8">
        {results.map((result, index) => (
          <div key={index} className="border p-6 rounded-lg shadow-sm">
            <p className="font-medium text-lg mb-4">Question: {result.text}</p>

            {/* Voted Result */}
            {result.predictions && (
              <div className="mb-6 bg-blue-50 p-4 rounded-md">
                <h3 className="font-semibold">Final Classification (Voting)</h3>
                {(() => {
                  const { level, voteCount, totalVotes } = getVotedLevel(
                    result.predictions
                  );
                  return (
                    <p className="text-lg text-blue-700">
                      {level} ({voteCount}/{totalVotes} votes)
                    </p>
                  );
                })()}
              </div>
            )}

            {/* Individual Model Predictions */}
            <div className="space-y-4">
              {Object.entries(MODEL_GROUPS).map(([groupName, models]) => (
                <div key={groupName} className="border-t pt-4">
                  <h4 className="font-medium mb-2">{groupName} Models</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {models.map((model) => (
                      <div key={model} className="bg-gray-50 p-3 rounded">
                        <p className="font-medium">{model}</p>
                        {result.predictions && result.predictions[model] && (
                          <>
                            <p>
                              Level:{" "}
                              {getBloomLevel(
                                model,
                                result.predictions[model].prediction
                              )}
                            </p>
                            <p className="text-sm text-gray-600">
                              Confidence:{" "}
                              {(
                                result.predictions[model].probability * 100
                              ).toFixed(1)}
                              %
                            </p>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
