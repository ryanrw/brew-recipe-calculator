import { useMemo, useState, type KeyboardEvent } from "react";
import { RecipeTable, Toggle } from "@brew-recipe/ui";
import {
  calculateRecipe,
  redistributePours,
  type PourStep,
  type RecipeInput,
} from "@brew-recipe/calculator";
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

  // Per-pour edit state. `editingPour` is the 0-based pour index currently in
  // edit mode, or null. `editDraft` is the in-flight value typed by the user.
  // `editedDeltas` is a sparse map of pour index → user-confirmed delta; the
  // UI reads it to render the "edited" pill and to drive redistribution.
  const [editingPour, setEditingPour] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState<string>("");
  const [editedDeltas, setEditedDeltas] = useState<Record<number, number>>({});

  // Prune edits whose pour index is now out of range (e.g. the user reduced
  // the number of pours). We re-derive this on every render so the dep arrays
  // of the useMemos below don't have to reach into editedDeltas keys.
  const activeEditedDeltas = useMemo(() => {
    const out: Record<number, number> = {};
    for (const [k, v] of Object.entries(editedDeltas)) {
      const i = Number(k);
      if (Number.isInteger(i) && i >= 0) out[i] = v;
    }
    return out;
  }, [editedDeltas]);

  const hasEdits = Object.keys(activeEditedDeltas).length > 0;

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

  const baseRecipe = useMemo(() => calculateRecipe(input), [input]);

  /**
   * The pours the table renders. When there are no edits this is just
   * `baseRecipe.pours` — no extra computation. When the user has edited at
   * least one pour, we feed the edited deltas (and the unedited ones from
   * the base recipe) into `redistributePours` to get the new per-pour layout.
   *
   * `redistributePours` keeps the final cumulative on `totalWater` whenever
   * any pour is unedited, so unedited rows absorb the inverse of the net
   * edit. Timing follows the same uniform spacing as `calculateRecipe`.
   */
  const effectivePours = useMemo<PourStep[]>(() => {
    if (!hasEdits) return baseRecipe.pours;
    const pourDeltas = baseRecipe.pours.map(
      (p, i) => activeEditedDeltas[i] ?? p.deltaGrams,
    );
    const editedIndices = Object.keys(activeEditedDeltas)
      .map(Number)
      .filter((i) => i < baseRecipe.pours.length);
    const r = redistributePours(
      {
        bloomGrams: baseRecipe.bloom.deltaGrams,
        totalWater: baseRecipe.totalWater,
        numPours: baseRecipe.pours.length,
        pourDeltas,
        editedIndices,
      },
      useTiming
        ? {
            bloomTimeSec: input.bloomTimeSec ?? DEFAULT_BLOOM_TIME_SEC,
            totalTimeSec: input.totalTimeSec ?? DEFAULT_TOTAL_TIME_SEC,
          }
        : undefined,
    );
    return r.pours.map((p) => ({
      index: p.index,
      deltaGrams: p.deltaGrams,
      cumulativeGrams: p.cumulativeGrams,
      cumulativeTimeSec: p.cumulativeTimeSec,
    }));
  }, [baseRecipe, activeEditedDeltas, hasEdits, useTiming, input.bloomTimeSec, input.totalTimeSec]);

  const deviation = useMemo(() => {
    if (!hasEdits) return 0;
    const sumDeltas = effectivePours.reduce((s, p) => s + p.deltaGrams, 0);
    return baseRecipe.totalWater - (baseRecipe.bloom.deltaGrams + sumDeltas);
  }, [hasEdits, effectivePours, baseRecipe]);

  /**
   * Hand the host (web app) the per-cell className so the "Add" cells of pour
   * rows get the editable affordance. Bloom is intentionally not editable —
   * the spec says to keep it edited at the top of the form.
   */
  const getCellClassName = (rowKey: string, columnKey: string) =>
    columnKey === "add" && rowKey !== "bloom"
      ? "recipe-table__cell--editable"
      : undefined;

  /**
   * Begin editing pour i. The input is pre-filled with the current effective
   * delta so the user can see the starting value and either tweak or replace.
   */
  const beginEdit = (i: number, currentValue: number) => {
    setEditingPour(i);
    setEditDraft(String(currentValue));
  };

  /**
   * Commit the in-flight draft. Empty string → 0g. Negative or non-numeric
   * values fall back to 0 (the input also has `min={0}` so this is defense
   * in depth). After committing, exit edit mode.
   */
  const commitEdit = (pourIndex: number) => {
    const parsed = parseFloat(editDraft);
    const value = Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
    setEditedDeltas((prev) => ({ ...prev, [pourIndex]: value }));
    setEditingPour(null);
  };

  const cancelEdit = () => {
    setEditingPour(null);
  };

  const handleEditKeyDown = (e: KeyboardEvent<HTMLInputElement>, pourIndex: number) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commitEdit(pourIndex);
    } else if (e.key === "Escape") {
      e.preventDefault();
      cancelEdit();
    }
  };

  const resetEdits = () => {
    setEditedDeltas({});
    setEditingPour(null);
  };

  const hasTiming = useTiming;
  const showDeviation = hasEdits && Math.abs(deviation) > 0.005;
  const deviationClass =
    deviation > 0 ? "recipe-deviation--under" : "recipe-deviation--over";
  const deviationText =
    deviation > 0
      ? `${Math.abs(deviation)}g under the ideal recipe`
      : `${Math.abs(deviation)}g over the ideal recipe`;

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
            <strong>{baseRecipe.totalWater} g</strong>
          </div>
          <div>
            <span>Per pour</span>
            <strong>{baseRecipe.perPour} g</strong>
          </div>
          <div>
            <span>Pours</span>
            <strong>{baseRecipe.pours.length}</strong>
          </div>
        </div>

        <div className="recipe-actions">
          <span className="recipe-actions-hint">
            {hasEdits
              ? "Edited pours are marked below. Reset to restore the ideal recipe."
              : 'Tap any "Add" cell to adjust a pour — the rest will recalculate.'}
          </span>
          {hasEdits && (
            <button type="button" className="recipe-reset" onClick={resetEdits}>
              Reset edits
            </button>
          )}
        </div>

        {showDeviation && (
          <div className={`recipe-deviation ${deviationClass}`}>{deviationText}</div>
        )}

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
                `${baseRecipe.bloom.deltaGrams} g`,
                `${baseRecipe.bloom.cumulativeGrams} g`,
                baseRecipe.bloom.cumulativeTimeSec !== null
                  ? `${baseRecipe.bloom.cumulativeTimeSec}s`
                  : "—",
              ].slice(0, hasTiming ? 4 : 3),
            },
            ...effectivePours.map((p, i) => {
              const isEditing = editingPour === i;
              const isEdited = activeEditedDeltas[i] !== undefined;
              const addCell = isEditing ? (
                <input
                  key={`p${i}-input`}
                  type="number"
                  inputMode="decimal"
                  autoFocus
                  className="cell-input"
                  min={0}
                  step={1}
                  value={editDraft}
                  onChange={(e) => setEditDraft(e.target.value)}
                  onBlur={() => commitEdit(i)}
                  onKeyDown={(e) => handleEditKeyDown(e, i)}
                  aria-label={`Pour ${p.index} amount in grams`}
                />
              ) : (
                <button
                  key={`p${i}-btn`}
                  type="button"
                  className="cell-edit-trigger"
                  onClick={() => beginEdit(i, p.deltaGrams)}
                  aria-label={`Edit pour ${p.index} amount`}
                >
                  {p.deltaGrams} g
                  {isEdited ? <span className="edited-tag">edited</span> : null}
                </button>
              );
              return {
                key: `pour-${p.index}`,
                cells: [
                  `Pour ${p.index}`,
                  addCell,
                  `${p.cumulativeGrams} g`,
                  p.cumulativeTimeSec !== null ? `${p.cumulativeTimeSec}s` : "—",
                ].slice(0, hasTiming ? 4 : 3),
              };
            }),
          ]}
          getCellClassName={getCellClassName}
        />
      </div>
    </div>
  );
}