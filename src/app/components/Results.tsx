import { Result } from "../types";

const BLOOM_LEVELS = [
  "Knowledge",
  "Comprehension",
  "Application",
  "Analysis",
  "Synthesis",
  "Evaluation",
];

const MODEL_GROUPS = {
  "Traditional ML": ["knn", "multinomial_nb", "rf_ngram", "svm_ngram"],
  "N-gram Based": ["nb_trigram", "nb_ngram", "lr_trigram", "lr_ngram"],
  Transformers: ["bert", "distilbert", "roberta"],
};

function getVotedLevel(
  predictions: Record<string, { prediction: number; probability: number }>
) {
  // Count votes for each level
  const votes = new Array(6).fill(0);
  Object.values(predictions).forEach(({ prediction }) => {
    votes[prediction]++;
  });

  // Find the level with most votes
  const maxVotes = Math.max(...votes);
  const votedLevel = votes.indexOf(maxVotes);

  return {
    level: BLOOM_LEVELS[votedLevel],
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
                              {
                                BLOOM_LEVELS[
                                  result.predictions[model].prediction
                                ]
                              }
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
