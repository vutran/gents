"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var fs = require("fs");
var ts = require("typescript");
var pascalize = require("pascalize");
var got = require("got");
function createArrayType(k, v) {
    // grab all types in array
    var types = [];
    v.forEach(function (val) {
        if (types.indexOf(typeof val) === -1) {
            types.push(typeof val);
        }
    });
    return ts.createPropertySignature(undefined, k, undefined, ts.createArrayTypeNode(ts.createUnionTypeNode(types.map(function (type) {
        return ts.createTypeReferenceNode(ts.createIdentifier(type), undefined);
    }))), undefined);
}
/**
 * Generates a TS definition file for the given JSON object
 */
function createInterfaceFromJson(interfaceName, source) {
    var o = JSON.parse(source);
    var entries = Object.entries(o);
    // build definitions
    var members = [];
    entries.forEach(function (_a) {
        var key = _a[0], value = _a[1];
        if (Array.isArray(value)) {
            members.push(createArrayType(key, value));
        }
        else {
            members.push(ts.createPropertySignature(undefined, key, undefined, ts.createTypeReferenceNode(ts.createIdentifier(typeof value), undefined), undefined));
        }
    });
    var node = ts.createInterfaceDeclaration(undefined, undefined, interfaceName, undefined, undefined, members);
    // create, print, and return the source
    var result = ts.createSourceFile(interfaceName, '', ts.ScriptTarget.Latest);
    var printer = ts.createPrinter({
        newLine: ts.NewLineKind.LineFeed,
    });
    return printer.printNode(ts.EmitHint.Unspecified, node, result);
}
/**
 * Generates a typescript definition file for the given JSON file
 */
function createInterfaceFromFile(filename) {
    var source = fs.readFileSync(filename, 'utf-8').toString();
    var interfaceName = pascalize(path.parse(filename).name);
    return createInterfaceFromJson(interfaceName, source);
}
/**
 * Generates a TypeScript interface for the resource at the given endpoint
 *
 * @param {string} url - The URL to fetch
 * @param {string} interfaceName - The interface name for this resource
 * @return {Promise<string>} - A Promise that resolves the transpiled source
 */
function gents(url, interfaceName) {
    return got(url).then(function (response) {
        return createInterfaceFromJson(interfaceName, response.body);
    });
}
exports.default = gents;
