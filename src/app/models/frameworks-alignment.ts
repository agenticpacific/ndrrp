// To parse this data:
//
//   import { Convert, FrameworksAlignment } from "./frameworks-alignment";
//
//   const frameworksAlignment = Convert.toFrameworksAlignment(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

export interface FrameworksAlignment {
    meta:                   Meta;
    frameworks:             Framework[];
    alignmentThemes:        AlignmentTheme[];
    sendaiTargetsAlignment: SendaiTargetsAlignment[];
    hierarchyLevels:        HierarchyLevels;
}

export interface AlignmentTheme {
    id:          string;
    title:       string;
    icon:        string;
    description: string;
    alignments:  Alignment[];
}

export interface Alignment {
    frameworkId:             ID;
    priority?:               number;
    priorityTitle?:          string;
    elements:                Element[];
    goal?:                   number;
    goalTitle?:              string;
    strategy?:               number;
    strategyTitle?:          string;
    focusAreas?:             string[];
    strategies?:             number[];
    strategyTitles?:         string[];
    goals?:                  number[];
    goalTitles?:             string[];
    guidingPrinciples?:      string[];
    guidingPrincipleTitles?: string[];
    priorities?:             number[];
}

export interface Element {
    type:      string;
    count?:    number;
    keyItems?: string[];
    items?:    string[];
    text?:     string;
}

export type ID = "sendai" | "frdp" | "ndrrp" | "ndp";

export interface Framework {
    id:          ID;
    name:        string;
    acronym:     string;
    level:       string;
    country:     null | string;
    period:      string;
    authority:   string;
    description: string;
    order:       number;
}

export interface HierarchyLevels {
    global:   Global;
    regional: Ional;
    national: Ional;
}

export interface Global {
    frameworks:                    ID[];
    providesOverarchingGuidanceTo: string[];
    keyFunctions:                  string[];
}

export interface Ional {
    frameworks:           ID[];
    receivesGuidanceFrom: string[];
    keyFunctions:         string[];
    providesGuidanceTo?:  string[];
}

export interface Meta {
    title:                string;
    description:          string;
    generated:            string;
    totalFrameworks:      number;
    totalAlignmentThemes: number;
}

export interface SendaiTargetsAlignment {
    sendaiTarget:   string;
    ndpIndicator:   string;
    ndrrpReference: string;
    frdpReference:  string;
}

// Converts JSON strings to/from your types
// and asserts the results of JSON.parse at runtime
export class Convert {
    public static toFrameworksAlignment(json: string): FrameworksAlignment {
        return cast(JSON.parse(json), r("FrameworksAlignment"));
    }

    public static frameworksAlignmentToJson(value: FrameworksAlignment): string {
        return JSON.stringify(uncast(value, r("FrameworksAlignment")), null, 2);
    }
}

function invalidValue(typ: any, val: any, key: any, parent: any = ''): never {
    const prettyTyp = prettyTypeName(typ);
    const parentText = parent ? ` on ${parent}` : '';
    const keyText = key ? ` for key "${key}"` : '';
    throw Error(`Invalid value${keyText}${parentText}. Expected ${prettyTyp} but got ${JSON.stringify(val)}`);
}

function prettyTypeName(typ: any): string {
    if (Array.isArray(typ)) {
        if (typ.length === 2 && typ[0] === undefined) {
            return `an optional ${prettyTypeName(typ[1])}`;
        } else {
            return `one of [${typ.map(a => { return prettyTypeName(a); }).join(", ")}]`;
        }
    } else if (typeof typ === "object" && typ.literal !== undefined) {
        return typ.literal;
    } else {
        return typeof typ;
    }
}

function jsonToJSProps(typ: any): any {
    if (typ.jsonToJS === undefined) {
        const map: any = {};
        typ.props.forEach((p: any) => map[p.json] = { key: p.js, typ: p.typ });
        typ.jsonToJS = map;
    }
    return typ.jsonToJS;
}

function jsToJSONProps(typ: any): any {
    if (typ.jsToJSON === undefined) {
        const map: any = {};
        typ.props.forEach((p: any) => map[p.js] = { key: p.json, typ: p.typ });
        typ.jsToJSON = map;
    }
    return typ.jsToJSON;
}

function transform(val: any, typ: any, getProps: any, key: any = '', parent: any = ''): any {
    function transformPrimitive(typ: string, val: any): any {
        if (typeof typ === typeof val) return val;
        return invalidValue(typ, val, key, parent);
    }

    function transformUnion(typs: any[], val: any): any {
        // val must validate against one typ in typs
        const l = typs.length;
        for (let i = 0; i < l; i++) {
            const typ = typs[i];
            try {
                return transform(val, typ, getProps);
            } catch (_) {}
        }
        return invalidValue(typs, val, key, parent);
    }

    function transformEnum(cases: string[], val: any): any {
        if (cases.indexOf(val) !== -1) return val;
        return invalidValue(cases.map(a => { return l(a); }), val, key, parent);
    }

    function transformArray(typ: any, val: any): any {
        // val must be an array with no invalid elements
        if (!Array.isArray(val)) return invalidValue(l("array"), val, key, parent);
        return val.map(el => transform(el, typ, getProps));
    }

    function transformDate(val: any): any {
        if (val === null) {
            return null;
        }
        const d = new Date(val);
        if (isNaN(d.valueOf())) {
            return invalidValue(l("Date"), val, key, parent);
        }
        return d;
    }

    function transformObject(props: { [k: string]: any }, additional: any, val: any): any {
        if (val === null || typeof val !== "object" || Array.isArray(val)) {
            return invalidValue(l(ref || "object"), val, key, parent);
        }
        const result: any = {};
        Object.getOwnPropertyNames(props).forEach(key => {
            const prop = props[key];
            const v = Object.prototype.hasOwnProperty.call(val, key) ? val[key] : undefined;
            result[prop.key] = transform(v, prop.typ, getProps, key, ref);
        });
        Object.getOwnPropertyNames(val).forEach(key => {
            if (!Object.prototype.hasOwnProperty.call(props, key)) {
                result[key] = transform(val[key], additional, getProps, key, ref);
            }
        });
        return result;
    }

    if (typ === "any") return val;
    if (typ === null) {
        if (val === null) return val;
        return invalidValue(typ, val, key, parent);
    }
    if (typ === false) return invalidValue(typ, val, key, parent);
    let ref: any = undefined;
    while (typeof typ === "object" && typ.ref !== undefined) {
        ref = typ.ref;
        typ = typeMap[typ.ref];
    }
    if (Array.isArray(typ)) return transformEnum(typ, val);
    if (typeof typ === "object") {
        return typ.hasOwnProperty("unionMembers") ? transformUnion(typ.unionMembers, val)
            : typ.hasOwnProperty("arrayItems")    ? transformArray(typ.arrayItems, val)
            : typ.hasOwnProperty("props")         ? transformObject(getProps(typ), typ.additional, val)
            : invalidValue(typ, val, key, parent);
    }
    // Numbers can be parsed by Date but shouldn't be.
    if (typ === Date && typeof val !== "number") return transformDate(val);
    return transformPrimitive(typ, val);
}

function cast<T>(val: any, typ: any): T {
    return transform(val, typ, jsonToJSProps);
}

function uncast<T>(val: T, typ: any): any {
    return transform(val, typ, jsToJSONProps);
}

function l(typ: any) {
    return { literal: typ };
}

function a(typ: any) {
    return { arrayItems: typ };
}

function u(...typs: any[]) {
    return { unionMembers: typs };
}

function o(props: any[], additional: any) {
    return { props, additional };
}

function m(additional: any) {
    return { props: [], additional };
}

function r(name: string) {
    return { ref: name };
}

const typeMap: any = {
    "FrameworksAlignment": o([
        { json: "meta", js: "meta", typ: r("Meta") },
        { json: "frameworks", js: "frameworks", typ: a(r("Framework")) },
        { json: "alignmentThemes", js: "alignmentThemes", typ: a(r("AlignmentTheme")) },
        { json: "sendaiTargetsAlignment", js: "sendaiTargetsAlignment", typ: a(r("SendaiTargetsAlignment")) },
        { json: "hierarchyLevels", js: "hierarchyLevels", typ: r("HierarchyLevels") },
    ], false),
    "AlignmentTheme": o([
        { json: "id", js: "id", typ: "" },
        { json: "title", js: "title", typ: "" },
        { json: "icon", js: "icon", typ: "" },
        { json: "description", js: "description", typ: "" },
        { json: "alignments", js: "alignments", typ: a(r("Alignment")) },
    ], false),
    "Alignment": o([
        { json: "frameworkId", js: "frameworkId", typ: r("ID") },
        { json: "priority", js: "priority", typ: u(undefined, 0) },
        { json: "priorityTitle", js: "priorityTitle", typ: u(undefined, "") },
        { json: "elements", js: "elements", typ: a(r("Element")) },
        { json: "goal", js: "goal", typ: u(undefined, 0) },
        { json: "goalTitle", js: "goalTitle", typ: u(undefined, "") },
        { json: "strategy", js: "strategy", typ: u(undefined, 0) },
        { json: "strategyTitle", js: "strategyTitle", typ: u(undefined, "") },
        { json: "focusAreas", js: "focusAreas", typ: u(undefined, a("")) },
        { json: "strategies", js: "strategies", typ: u(undefined, a(0)) },
        { json: "strategyTitles", js: "strategyTitles", typ: u(undefined, a("")) },
        { json: "goals", js: "goals", typ: u(undefined, a(0)) },
        { json: "goalTitles", js: "goalTitles", typ: u(undefined, a("")) },
        { json: "guidingPrinciples", js: "guidingPrinciples", typ: u(undefined, a("")) },
        { json: "guidingPrincipleTitles", js: "guidingPrincipleTitles", typ: u(undefined, a("")) },
        { json: "priorities", js: "priorities", typ: u(undefined, a(0)) },
    ], false),
    "Element": o([
        { json: "type", js: "type", typ: "" },
        { json: "count", js: "count", typ: u(undefined, 0) },
        { json: "keyItems", js: "keyItems", typ: u(undefined, a("")) },
        { json: "items", js: "items", typ: u(undefined, a("")) },
        { json: "text", js: "text", typ: u(undefined, "") },
    ], false),
    "Framework": o([
        { json: "id", js: "id", typ: r("ID") },
        { json: "name", js: "name", typ: "" },
        { json: "acronym", js: "acronym", typ: "" },
        { json: "level", js: "level", typ: "" },
        { json: "country", js: "country", typ: u(null, "") },
        { json: "period", js: "period", typ: "" },
        { json: "authority", js: "authority", typ: "" },
        { json: "description", js: "description", typ: "" },
        { json: "order", js: "order", typ: 0 },
    ], false),
    "HierarchyLevels": o([
        { json: "global", js: "global", typ: r("Global") },
        { json: "regional", js: "regional", typ: r("Ional") },
        { json: "national", js: "national", typ: r("Ional") },
    ], false),
    "Global": o([
        { json: "frameworks", js: "frameworks", typ: a(r("ID")) },
        { json: "providesOverarchingGuidanceTo", js: "providesOverarchingGuidanceTo", typ: a("") },
        { json: "keyFunctions", js: "keyFunctions", typ: a("") },
    ], false),
    "Ional": o([
        { json: "frameworks", js: "frameworks", typ: a(r("ID")) },
        { json: "receivesGuidanceFrom", js: "receivesGuidanceFrom", typ: a("") },
        { json: "keyFunctions", js: "keyFunctions", typ: a("") },
        { json: "providesGuidanceTo", js: "providesGuidanceTo", typ: u(undefined, a("")) },
    ], false),
    "Meta": o([
        { json: "title", js: "title", typ: "" },
        { json: "description", js: "description", typ: "" },
        { json: "generated", js: "generated", typ: "" },
        { json: "totalFrameworks", js: "totalFrameworks", typ: 0 },
        { json: "totalAlignmentThemes", js: "totalAlignmentThemes", typ: 0 },
    ], false),
    "SendaiTargetsAlignment": o([
        { json: "sendaiTarget", js: "sendaiTarget", typ: "" },
        { json: "ndpIndicator", js: "ndpIndicator", typ: "" },
        { json: "ndrrpReference", js: "ndrrpReference", typ: "" },
        { json: "frdpReference", js: "frdpReference", typ: "" },
    ], false),
    "ID": [
        "frdp",
        "ndp",
        "ndrrp",
        "sendai",
    ],
};
