import { useState } from "react";
import { Picker } from "@brew-recipe/ui";

export default {
  title: "Components/Picker",
  component: Picker,
};

export const CoffeeGrams = () => {
  const [v, setV] = useState(15);
  return (
    <div style={{ padding: 16, maxWidth: 200 }}>
      <Picker min={8} max={25} value={v} onChange={setV} />
    </div>
  );
};

export const Ratio = () => {
  const [v, setV] = useState(17.5);
  return (
    <div style={{ padding: 16, maxWidth: 200 }}>
      <Picker
        min={2}
        max={20}
        step={0.5}
        value={v}
        onChange={setV}
        format={(n) => n.toFixed(1)}
      />
    </div>
  );
};