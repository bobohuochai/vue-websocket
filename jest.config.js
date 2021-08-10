module.exports = {
  testRegex: "(/test/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$",
  testPathIgnorePatterns: ["/lib/", "/node_modules/"],
  moduleFileExtensions: ['vue', 'js', 'json', 'jsx', 'ts', 'tsx', 'node'],
  collectCoverage: true,
  globals: {
    "ts-jest": {
      tsConfigFile: "tsconfig.json"
    }
  },
  testURL: "http://localhost",
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  transform: {
    "^.+\\.vue$": "vue-jest",
    "^.+\\js$": "babel-jest",
    "^.+\\.tsx?$": "ts-jest"
  },
};

