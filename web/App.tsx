import React, { ChangeEvent, useMemo, useState } from "react";
import { compileQuery, toEnglishString, matches, EvaluateResult } from "src";

export const App = () => {
  return (
    <div style={{ padding: 24 }}>
      <Demo />
    </div>
  );
};

const ENVS: Record<string, Parameters<typeof matches>[1]> = {
  "Fairphone 4": {
    widthPx: 540,
    heightPx: 1170,
    deviceWidthPx: 540,
    deviceHeightPx: 1170,
    dppx: 2,
    anyHover: "none",
    hover: "none",
    anyPointer: "coarse",
    pointer: "coarse",
  },
  "Kindle Paperwhite": {
    widthPx: 1072,
    heightPx: 1448,
    deviceWidthPx: 1072,
    deviceHeightPx: 1448,
    dppx: 1,
    anyHover: "none",
    hover: "none",
    anyPointer: "coarse",
    pointer: "coarse",
    update: "slow",
    monochromeBits: 4,
    colorGamut: "not-srgb",
    colorBits: 0,
  },
  "iPhone 12 mini": {
    widthPx: 375,
    heightPx: 812,
    deviceWidthPx: 375,
    deviceHeightPx: 812,
    dppx: 3,
    anyHover: "none",
    hover: "none",
    anyPointer: "coarse",
    pointer: "coarse",
  },
  "M1 MacBook Air": {
    widthPx: 1440,
    heightPx: 900,
    deviceWidthPx: 1440,
    deviceHeightPx: 900,
    dppx: 1.77778,
    colorGamut: "p3-but-not-rec2020",
  },
};

export const Demo = () => {
  const [input, setIsInput] = useState("(min-width: 1000px)");
  const [device, setDevice] = useState("Fairphone 4");

  const env = ENVS[device];

  const { errors, warnings, compiled } = useMemo(() => {
    let errors = "";
    let warnings = "";
    let compiled: EvaluateResult | null = null;
    try {
      compiled = compileQuery(input);
    } catch (err) {
      if (err instanceof Error) {
        errors = err.message;
      }
    }
    if (compiled !== null) {
      if (compiled.invalidFeatures.length > 0) {
        errors = (
          `This following features are invalid: ${compiled.invalidFeatures.join(
            ", "
          )}\n` + errors
        ).trim();
      }
      if (compiled.simplePerms.length === 0) {
        errors = ("This query will never match a device\n" + errors).trim();
      }
      if (compiled.falseFeatures.length > 0) {
        warnings = (
          `This following features prevent some permutations from being matched: ${compiled.falseFeatures.join(
            ", "
          )}\n` + errors
        ).trim();
      }

      if (compiled.simplePerms.some((perm) => JSON.stringify(perm) === "{}")) {
        warnings = (
          `This query will always match every device\n` + errors
        ).trim();
      }
    }
    return {
      errors,
      warnings,
      compiled,
    };
  }, [input]);

  const onChange = (ev: ChangeEvent<HTMLInputElement>) => {
    setDevice(ev.target.value);
  };

  return (
    <div>
      <label>
        <input
          onChange={onChange}
          type="radio"
          name="device"
          value="Fairphone 4"
        />{" "}
        Fairphone 4
      </label>
      <br />
      <label>
        <input
          onChange={onChange}
          type="radio"
          name="device"
          value="Kindle Paperwhite"
        />{" "}
        Kindle Paperwhite
      </label>
      <br />
      <label>
        <input
          onChange={onChange}
          type="radio"
          name="device"
          value="iPhone 12 mini"
        />{" "}
        iPhone 12 mini
      </label>
      <br />
      <label>
        <input
          onChange={onChange}
          type="radio"
          name="device"
          value="M1 MacBook Air"
        />{" "}
        M1 Macbook Air
      </label>
      <br />

      <div style={{ padding: "16px 0" }}>
        <hr />
      </div>

      <div className="input-wrapper">
        <span className="input-placeholder">@media&nbsp;</span>
        <input
          className="text-input"
          placeholder="(min-width: 1000px)"
          style={{
            width: `calc(${input.length + 1}ch + 16px)`,
          }}
          value={input}
          onChange={(ev) => {
            setIsInput(ev.target.value);
          }}
        />
        <span className="input-placeholder">&nbsp;{"{"}&nbsp;...</span>
      </div>

      <h2>Matches:</h2>
      <p>{compiled === null ? "never" : toEnglishString(compiled)}</p>

      <h2>Matches {device}:</h2>
      <p>{compiled === null ? "never" : matches(compiled, env).toString()}</p>

      {errors.length > 0 ? (
        <div>
          <h2>Errors</h2>
          <ul>
            {errors
              .split("\n")
              .filter((str) => str.trim().length > 0)
              .map((msg, i) => (
                <li key={i}>{msg}</li>
              ))}
          </ul>
        </div>
      ) : null}

      {warnings.length > 0 ? (
        <div>
          <h2>Warnings</h2>
          <ul>
            {warnings
              .split("\n")
              .filter((str) => str.trim().length > 0)
              .map((msg, i) => (
                <li key={i}>{msg}</li>
              ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
};
