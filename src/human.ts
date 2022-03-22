import { EvaluateResult } from "./compile";

export type HumanFriendlyData = any;
export const toHumanFriendlyData = (
  result: EvaluateResult
): HumanFriendlyData => {
  throw new Error("This function is not implemented");
  console.log(result);
  //
  return [];
};

// assume a single line of text
export const toHumanFriendlyString = (result: EvaluateResult): string => {
  throw new Error("This function is not implemented");
  return ``;
};

// divs and spans with inline styles, plus semantic where appropriate
export const toHumanFriendlyHTML = (result: EvaluateResult): string => {
  throw new Error("This function is not implemented");
  return ``;
};

// use colors to syntax highlight
export const toHumanFriendlyCLIString = (result: EvaluateResult): string => {
  throw new Error("This function is not implemented");
  return ``;
};
