import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import assert from "node:assert/strict";

const packageRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const appPath = path.join(packageRoot, "inst", "app", "assets", "app.js");
let source = fs.readFileSync(appPath, "utf8");
const expose = `
  globalThis.__chartforgeTest = {
    scalarString, scalarBoolean, normalizeRows, normalizeColumns,
    normalizeObjectList, defaultState, preflightErrors,
    setContext(nextRows, nextColumns, nextState) {
      rows = nextRows; columns = nextColumns; state = nextState;
    }
  };
`;
const insertionPoint = source.lastIndexOf("})();");
if (insertionPoint < 0) throw new Error("Could not instrument app.js.");
source = source.slice(0, insertionPoint) + expose + source.slice(insertionPoint);

const context = {
  console,
  document: { addEventListener() {} },
  window: {}, navigator: {},
  location: { hostname: "127.0.0.1", protocol: "http:" }
};
context.globalThis = context;
vm.createContext(context);
vm.runInContext(source, context, { filename: "app.js" });
const api = context.__chartforgeTest;

const boxedColumns = [
  { name: ["species"], class: ["factor"], kind: ["category"], numeric: [false], categorical: [true], categorical_reason: ["R factor"], unique_count: [3] },
  { name: ["island"], class: ["factor"], kind: ["category"], numeric: [false], categorical: [true], categorical_reason: ["R factor"], unique_count: [3] },
  { name: ["bill_length_mm"], class: ["numeric"], kind: ["number"], numeric: [true], categorical: [false], categorical_reason: [null], unique_count: [164] },
  { name: ["bill_depth_mm"], class: ["numeric"], kind: ["number"], numeric: [true], categorical: [false], categorical_reason: [null], unique_count: [80] },
  { name: ["year"], class: ["integer"], kind: ["category"], numeric: [true], categorical: [true], categorical_reason: ["integer with 3 unique values"], unique_count: [3] }
];
const columns = api.normalizeColumns(boxedColumns);
assert.deepEqual(columns.map(column => column.name), ["species", "island", "bill_length_mm", "bill_depth_mm", "year"]);
assert.equal(columns[2].numeric, true);
assert.equal(columns[2].categorical, false);
assert.equal(columns[3].numeric, true);
assert.equal(columns[3].categorical, false);
assert.equal(columns[4].categorical, true);
assert.equal(api.scalarBoolean(["FALSE"]), false);

const boxedRows = [
  { species: ["Adelie"], island: ["Torgersen"], bill_length_mm: [39.1], bill_depth_mm: [18.7], year: [2007] },
  { species: ["Gentoo"], island: ["Biscoe"], bill_length_mm: [46.1], bill_depth_mm: [13.2], year: [2008] }
];
const rows = api.normalizeRows(boxedRows, columns);
assert.equal(rows[0].species, "Adelie");
assert.equal(rows[0].bill_length_mm, 39.1);

const state = api.defaultState();
state.dataSource = "env";
state.envObject = "penguins";
state.chartType = "scatter";
state.mappings = {
  x: "bill_length_mm", y: "bill_depth_mm", group: "species",
  labels: [], sortBy: "bill_length_mm", sortDesc: false
};
api.setContext(rows, columns, state);
assert.deepEqual(Array.from(api.preflightErrors()), []);

const objects = api.normalizeObjectList([
  { name: ["penguins"], type: ["data.frame"], rows: [344], columns: [8], class: ["data.frame"] }
]);
assert.deepEqual(objects.map(object => ({ name: object.name, rows: object.rows, columns: object.columns })), [
  { name: "penguins", rows: 344, columns: 8 }
]);

console.log("Local-R penguins import regression test passed.");
