import js from '@eslint/js';
import pluginVue from 'eslint-plugin-vue';
import configPrettier from 'eslint-config-prettier';

export default [
    js.configs.recommended,
    ...pluginVue.configs['flat/recommended'],
    {
        rules: {
            'no-unused-vars': 'warn',
            'no-console': 'warn',
            'vue/multi-word-component-names': 'off',
        },
    },
    configPrettier,
];
