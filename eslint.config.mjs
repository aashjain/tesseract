import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    // The react-three-fiber render loop is imperative by design: `useFrame`
    // runs outside React's render cycle and mutates three.js objects (camera,
    // materials, instance matrices) directly every frame. That is the intended
    // architecture, not an accident — the alternative is per-frame React state
    // updates, which would be far slower and cause exactly the tearing these
    // rules exist to prevent.
    //
    // Scoped to the renderer only. Everything outside this directory is still
    // held to the full React Compiler rules. Purity is NOT relaxed here:
    // randomness is seeded (see ./random.ts) rather than suppressed.
    files: ["src/components/experience/**/*.tsx"],
    rules: {
      "react-hooks/immutability": "off",
    },
  },
]);

export default eslintConfig;
