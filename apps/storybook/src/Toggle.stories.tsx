import { useState } from "react";
import { Toggle } from "@brew-recipe/ui";

export default {
  title: "Components/Toggle",
  component: Toggle,
};

export const Basic = () => {
  const [on, setOn] = useState(false);
  return <Toggle checked={on} onChange={setOn} label="Enable timing" />;
};