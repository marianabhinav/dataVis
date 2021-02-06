module.exports = {
    env: {
        browser: true,
        es6: true,
    },
    extends: 'airbnb-base',
    globals: {
        Atomics: 'readonly',
        SharedArrayBuffer: 'readonly',
    },
    parserOptions: {
        ecmaVersion: 2018,
        sourceType: 'module',
    },
    rules: {
        "indent": ["error", 4],
        "max-len": ["error", { "code": 200 }],
        "no-console": "off",
        "camelcase": "off",
        "no-plusplus": "off",
        "consistent-return": "off",
        "import/prefer-default-export": "off",
        "func-names": "off",
    },
};
