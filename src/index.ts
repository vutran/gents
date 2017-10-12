import * as path from 'path';
import * as fs from 'fs';
import * as ts from 'typescript';
import * as pascalize from 'pascalize';
import * as got from 'got';

export interface Options {
    // set to true to automatically generate subtypes for non-primitives
    subtypes: boolean;
}

interface ArrayOptions {
    // use a custom type name
    typeName: string;
}

function createTypeDeclaration(key: string, values: Array<any>) {
    // grab all types in array
    const types = [];
    values.forEach(val => {
        if (types.indexOf(typeof val) === -1) {
            types.push(typeof val);
        }
    });

    return ts.createTypeAliasDeclaration(
        undefined,
        undefined,
        pascalize(key),
        undefined,
        ts.createUnionTypeNode(
            types.map(type =>
                ts.createTypeReferenceNode(ts.createIdentifier(type), undefined)
            )
        )
    );
}

function createArrayType(k: string, v: Array<any>, options?: ArrayOptions) {
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
            // use the `typeName` if it exists.
            // otherwise, create a union type of the different types for this key
            options.typeName
                ? ts.createTypeReferenceNode(
                      ts.createIdentifier(pascalize(options.typeName)),
                      undefined
                  )
                : ts.createUnionTypeNode(
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
function createDefinition(
    interfaceName: string,
    source: string,
    options?: Options
) {
    const o = JSON.parse(source);
    const entries = Object.entries(o);

    // build primary interface
    const members = [];

    // build subtypes
    const subtypes = [];

    entries.forEach(([key, value]) => {
        if (Array.isArray(value)) {
            // create and associate a custom type if necessary
            if (options.subtypes) {
                subtypes.push(createTypeDeclaration(key, value));
                members.push(createArrayType(key, value, { typeName: key }));
            } else {
                members.push(createArrayType(key, value));
            }
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

    let main = printer.printNode(ts.EmitHint.Unspecified, node, result);
    subtypes.forEach(subtype => {
        main += '\n';
        main += printer.printNode(ts.EmitHint.Unspecified, subtype, result);
    });

    return main;
}

/**
 * Generates a typescript definition file for the given JSON file
 */
function createInterfaceFromFile(filename: string) {
    const source = fs.readFileSync(filename, 'utf-8').toString();
    const interfaceName = pascalize(path.parse(filename).name);
    return createDefinition(interfaceName, source);
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
    interfaceName: string,
    options?: Options
): Promise<string> {
    return got(url).then(response =>
        createDefinition(interfaceName, response.body, options)
    );
}
