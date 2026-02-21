export default {
  theme: {
    extend: {
      colors: {
        primary: 'var(--p-primary-color)',
      },
    },
  },
  content: ['./index.html', './src/**/*.{vue,ts}'],
  safelist: [
    {
      pattern: /bg-(.+)-(100|200|300|400|500|600|700|800|900)/,
    },
  ],
};
