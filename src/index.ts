import * as path from 'path';
import * as fs from 'fs';
import * as ts from 'typescript';
import * as pascalize from 'pascalize';
import * as got from 'got';

function createArrayType(k: string, v: Array<any>) {
    // grab all types in array
    const types = [];
    v.forEach(val => {
        if (types.indexOf(typeof val) === -1) {
            types.push(typeof val);
        }
    });

    return ts.createPropertySignature(
        undefined,
        k,
        undefined,
        ts.createArrayTypeNode(
            ts.createUnionTypeNode(
                types.map(type =>
                    ts.createTypeReferenceNode(
                        ts.createIdentifier(type),
                        undefined
                    )
                )
            )
        ),
        undefined
    );
}

/**
 * Generates a TS definition file for the given JSON object
 */
function createInterfaceFromJson(interfaceName: string, source: string) {
    const o = JSON.parse(source);
    const entries = Object.entries(o);

    // build definitions
    const members = [];

    entries.forEach(([key, value]) => {
        if (Array.isArray(value)) {
            members.push(createArrayType(key, value));
        } else {
            members.push(
                ts.createPropertySignature(
                    undefined,
                    key,
                    undefined,
                    ts.createTypeReferenceNode(
                        ts.createIdentifier(typeof value),
                        undefined
                    ),
                    undefined
                )
            );
        }
    });

    const node = ts.createInterfaceDeclaration(
        undefined,
        undefined,
        interfaceName,
        undefined,
        undefined,
        members
    );

    // create, print, and return the source
    const result = ts.createSourceFile(
        interfaceName,
        '',
        ts.ScriptTarget.Latest
    );
    const printer = ts.createPrinter({
        newLine: ts.NewLineKind.LineFeed,
    });
    return printer.printNode(ts.EmitHint.Unspecified, node, result);
}

/**
 * Generates a typescript definition file for the given JSON file
 */
function createInterfaceFromFile(filename: string) {
    const source = fs.readFileSync(filename, 'utf-8').toString();
    const interfaceName = pascalize(path.parse(filename).name);
    return createInterfaceFromJson(interfaceName, source);
}

/**
 * Generates a TypeScript interface for the resource at the given endpoint
 *
 * @param {string} url - The URL to fetch
 * @param {string} interfaceName - The interface name for this resource
 * @return {Promise<string>} - A Promise that resolves the transpiled source
 */
export default function gents(
    url: string,
    interfaceName: string
): Promise<string> {
    return got(url).then(response =>
        createInterfaceFromJson(interfaceName, response.body)
    );
}
