import { useMemo, useState } from "react";
import { RecipeTable, Toggle } from "@brew-recipe/ui";
import { calculateRecipe, type RecipeInput } from "@brew-recipe/calculator";
import { formatMMSS } from "./format";
import {
  DEFAULT_BLOOM_GRAMS,
  DEFAULT_BLOOM_TIME_SEC,
  DEFAULT_COFFEE_GRAMS,
  DEFAULT_NUM_POURS,
  DEFAULT_RATIO,
  DEFAULT_TOTAL_TIME_SEC,
} from "./defaults";

export function App() {
  // Inputs are kept as strings so the user can clear a field (e.g. backspace
  // to empty) without React forcing it back to "0" via Number("") === 0.
  // The numeric values for the calculator are derived in the useMemo below.
  const [coffeeGrams, setCoffeeGrams] = useState(String(DEFAULT_COFFEE_GRAMS));
  const [ratio, setRatio] = useState(String(DEFAULT_RATIO));
  const [bloomGrams, setBloomGrams] = useState(String(DEFAULT_BLOOM_GRAMS));
  const [numPours, setNumPours] = useState(String(DEFAULT_NUM_POURS));
  const [useTiming, setUseTiming] = useState(false);
  const [bloomTimeSec, setBloomTimeSec] = useState(String(DEFAULT_BLOOM_TIME_SEC));
  const [totalTimeSec, setTotalTimeSec] = useState(String(DEFAULT_TOTAL_TIME_SEC));

  // Coerce each string to a number, falling back to the default if the user
  // has cleared the field. Done inside useMemo so the calculator only
  // recomputes when the parsed values actually change.
  const input: RecipeInput = useMemo(
    () => ({
      coffeeGrams: parseFloat(coffeeGrams) || DEFAULT_COFFEE_GRAMS,
      ratio: parseFloat(ratio) || DEFAULT_RATIO,
      bloomGrams: parseFloat(bloomGrams) || DEFAULT_BLOOM_GRAMS,
      numPours: parseInt(numPours, 10) || DEFAULT_NUM_POURS,
      ...(useTiming
        ? {
            bloomTimeSec: parseFloat(bloomTimeSec) || DEFAULT_BLOOM_TIME_SEC,
            totalTimeSec: parseFloat(totalTimeSec) || DEFAULT_TOTAL_TIME_SEC,
          }
        : {}),
    }),
    [
      coffeeGrams,
      ratio,
      bloomGrams,
      numPours,
      useTiming,
      bloomTimeSec,
      totalTimeSec,
    ],
  );

  const recipe = useMemo(() => calculateRecipe(input), [input]);

  const hasTiming = useTiming;

  return (
    <div className="app">
      <h1>Coffee Drip Calculator</h1>
      <p className="subtitle">Pourover math, dialed in.</p>

      <div className="card">
        <div className="row">
          <div className="field">
            <label htmlFor="coffee-grams">Coffee (g)</label>
            <div className="input-with-unit">
              <input
                id="coffee-grams"
                type="number"
                min={8}
                max={25}
                step={1}
                value={coffeeGrams}
                onChange={(e) => setCoffeeGrams(e.target.value)}
              />
              <span className="unit">g</span>
            </div>
          </div>
          <div className="field">
            <label htmlFor="ratio">Ratio (1 : y)</label>
            <div className="input-with-unit">
              <input
                id="ratio"
                type="number"
                min={2}
                max={20}
                step={0.5}
                value={ratio}
                onChange={(e) => setRatio(e.target.value)}
              />
              <span className="unit">: 1</span>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="field">
            <label htmlFor="bloom-grams">Bloom (g)</label>
            <div className="input-with-unit">
              <input
                id="bloom-grams"
                type="number"
                min={0}
                step={1}
                value={bloomGrams}
                onChange={(e) => setBloomGrams(e.target.value)}
              />
              <span className="unit">g</span>
            </div>
          </div>
          <div className="field">
            <label htmlFor="num-pours">Number of pours</label>
            <div className="input-with-unit">
              <input
                id="num-pours"
                type="number"
                min={1}
                max={10}
                step={1}
                value={numPours}
                onChange={(e) => setNumPours(e.target.value)}
              />
              <span className="unit">pours</span>
            </div>
          </div>
        </div>

        <div className="field">
          <Toggle
            id="advanced-toggle"
            checked={useTiming}
            onChange={setUseTiming}
            label="Include advanced timing"
          />
        </div>

        {useTiming && (
          <div className="row">
            <div className="field">
              <label htmlFor="bloom-time">Bloom time (s)</label>
              <div className="input-with-unit">
                <input
                  id="bloom-time"
                  type="number"
                  min={5}
                  max={120}
                  step={5}
                  value={bloomTimeSec}
                  onChange={(e) => setBloomTimeSec(e.target.value)}
                />
                <span className="unit">s</span>
              </div>
            </div>
            <div className="field">
              <label htmlFor="total-time">Total brew time (s)</label>
              <div className="input-with-unit">
                <input
                  id="total-time"
                  type="number"
                  min={30}
                  max={600}
                  step={5}
                  value={totalTimeSec}
                  onChange={(e) => setTotalTimeSec(e.target.value)}
                />
                <span className="unit">s</span>
              </div>
              <span className="input-hint">{formatMMSS(totalTimeSec)}</span>
            </div>
          </div>
        )}
      </div>

      <div className="card">
        <div className="summary">
          <div>
            <span>Total water</span>
            <strong>{recipe.totalWater} g</strong>
          </div>
          <div>
            <span>Per pour</span>
            <strong>{recipe.perPour} g</strong>
          </div>
          <div>
            <span>Pours</span>
            <strong>{recipe.pours.length}</strong>
          </div>
        </div>

        <RecipeTable
          columns={
            hasTiming
              ? [
                  { key: "step", label: "Step" },
                  { key: "add", label: "Add" },
                  { key: "scale", label: "Scale reads" },
                  { key: "time", label: "At time" },
                ]
              : [
                  { key: "step", label: "Step" },
                  { key: "add", label: "Add" },
                  { key: "scale", label: "Scale reads" },
                ]
          }
          rows={[
            {
              key: "bloom",
              cells: [
                "Bloom",
                `${recipe.bloom.deltaGrams} g`,
                `${recipe.bloom.cumulativeGrams} g`,
                recipe.bloom.cumulativeTimeSec !== null
                  ? `${recipe.bloom.cumulativeTimeSec}s`
                  : "—",
              ].slice(0, hasTiming ? 4 : 3),
            },
            ...recipe.pours.map((p) => ({
              key: `pour-${p.index}`,
              cells: [
                `Pour ${p.index}`,
                `${p.deltaGrams} g`,
                `${p.cumulativeGrams} g`,
                p.cumulativeTimeSec !== null ? `${p.cumulativeTimeSec}s` : "—",
              ].slice(0, hasTiming ? 4 : 3),
            })),
          ]}
        />
      </div>
    </div>
  );
}
