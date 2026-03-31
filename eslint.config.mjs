// // @ts-check

// import eslint from '@eslint/js';
// import tseslint from 'typescript-eslint';

// export default tseslint.config(
//   eslint.configs.recommended,
// //   tseslint.configs.recommended,
// tseslint.configs.strict,
//   tseslint.configs.stylistic,
//   {
//     rules:{
//         "no-console": "warn",
//     }
//   }
// );

// @ts-check
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config({
  ignores: ["dist", "node_modules"],

  extends: [
    eslint.configs.recommended,
    // tseslint.configs.recommended, // optional
    tseslint.configs.strict,
    tseslint.configs.stylistic,
  ],

  rules: {
    "no-console": "warn",
  },
});