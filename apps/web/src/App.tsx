import { useMemo, useState } from "react";
import { Picker, RecipeTable, Toggle } from "@brew-recipe/ui";
import { calculateRecipe, type RecipeInput } from "@brew-recipe/calculator";
import {
  DEFAULT_BLOOM_GRAMS,
  DEFAULT_BLOOM_TIME_SEC,
  DEFAULT_COFFEE_GRAMS,
  DEFAULT_NUM_POURS,
  DEFAULT_RATIO,
  DEFAULT_TOTAL_TIME_SEC,
} from "./defaults";

export function App() {
  const [coffeeGrams, setCoffeeGrams] = useState(DEFAULT_COFFEE_GRAMS);
  const [ratio, setRatio] = useState(DEFAULT_RATIO);
  const [bloomGrams, setBloomGrams] = useState(DEFAULT_BLOOM_GRAMS);
  const [numPours, setNumPours] = useState(DEFAULT_NUM_POURS);
  const [useTiming, setUseTiming] = useState(false);
  const [bloomTimeSec, setBloomTimeSec] = useState(DEFAULT_BLOOM_TIME_SEC);
  const [totalTimeSec, setTotalTimeSec] = useState(DEFAULT_TOTAL_TIME_SEC);

  const input: RecipeInput = useMemo(
    () => ({
      coffeeGrams,
      ratio,
      bloomGrams,
      numPours,
      ...(useTiming ? { bloomTimeSec, totalTimeSec } : {}),
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
            <label>Coffee (g)</label>
            <Picker min={8} max={25} value={coffeeGrams} onChange={setCoffeeGrams} />
          </div>
          <div className="field">
            <label>Ratio (1 : y)</label>
            <Picker
              min={2}
              max={20}
              step={0.5}
              value={ratio}
              onChange={setRatio}
              format={(v) => v.toFixed(1)}
            />
          </div>
        </div>

        <div className="row">
          <div className="field">
            <label>Bloom (g)</label>
            <input
              type="number"
              min={0}
              value={bloomGrams}
              onChange={(e) => setBloomGrams(Number(e.target.value))}
            />
          </div>
          <div className="field">
            <label>Number of pours</label>
            <Picker min={1} max={10} value={numPours} onChange={setNumPours} />
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
              <label>Bloom time (s)</label>
              <Picker
                min={5}
                max={120}
                step={5}
                value={bloomTimeSec}
                onChange={setBloomTimeSec}
              />
            </div>
            <div className="field">
              <label>Total brew time (s)</label>
              <Picker
                min={30}
                max={600}
                step={5}
                value={totalTimeSec}
                onChange={setTotalTimeSec}
              />
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