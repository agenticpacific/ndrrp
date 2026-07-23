// To parse this data:
//
//   import { Convert, Ndp } from "./NDP";
//
//   const ndp = Convert.toNdp(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

export interface Ndp {
    framework:                string;
    level:                    string;
    country:                  string;
    period:                   string;
    vision_2050:              Vision2050;
    vision:                   Mission;
    mission:                  Mission;
    cross_cutting_priorities: CrossCuttingPriority[];
    pillars:                  Pillar[];
    x_factors:                XFactor[];
    targets_and_kpis:         TargetsAndKpi[];
}

export interface CrossCuttingPriority {
    priority: string;
    summary:  string;
}

export interface Mission {
    title:   string;
    summary: string;
}

export interface Pillar {
    pillar:      number;
    title:       Title;
    focus_areas: FocusArea[];
}

export interface FocusArea {
    focus_area:    number;
    title:         string;
    summary:       string;
    sub_chapters?: Mission[];
}

export type Title = "Economic Resilience" | "People Empowerment" | "Good Governance";

export interface TargetsAndKpi {
    indicator: string;
    target:    string;
    pillar:    Title;
}

export interface Vision2050 {
    summary: string;
}

export interface XFactor {
    x_factor:          number;
    title:             string;
    rationale:         string;
    what_will_be_done: string;
}

// Converts JSON strings to/from your types
// and asserts the results of JSON.parse at runtime
export class Convert {
    public static toNdp(json: string): Ndp {
        return cast(JSON.parse(json), r("Ndp"));
    }

    public static ndpToJson(value: Ndp): string {
        return JSON.stringify(uncast(value, r("Ndp")), null, 2);
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
    "Ndp": o([
        { json: "framework", js: "framework", typ: "" },
        { json: "level", js: "level", typ: "" },
        { json: "country", js: "country", typ: "" },
        { json: "period", js: "period", typ: "" },
        { json: "vision_2050", js: "vision_2050", typ: r("Vision2050") },
        { json: "vision", js: "vision", typ: r("Mission") },
        { json: "mission", js: "mission", typ: r("Mission") },
        { json: "cross_cutting_priorities", js: "cross_cutting_priorities", typ: a(r("CrossCuttingPriority")) },
        { json: "pillars", js: "pillars", typ: a(r("Pillar")) },
        { json: "x_factors", js: "x_factors", typ: a(r("XFactor")) },
        { json: "targets_and_kpis", js: "targets_and_kpis", typ: a(r("TargetsAndKpi")) },
    ], false),
    "CrossCuttingPriority": o([
        { json: "priority", js: "priority", typ: "" },
        { json: "summary", js: "summary", typ: "" },
    ], false),
    "Mission": o([
        { json: "title", js: "title", typ: "" },
        { json: "summary", js: "summary", typ: "" },
    ], false),
    "Pillar": o([
        { json: "pillar", js: "pillar", typ: 0 },
        { json: "title", js: "title", typ: r("Title") },
        { json: "focus_areas", js: "focus_areas", typ: a(r("FocusArea")) },
    ], false),
    "FocusArea": o([
        { json: "focus_area", js: "focus_area", typ: 0 },
        { json: "title", js: "title", typ: "" },
        { json: "summary", js: "summary", typ: "" },
        { json: "sub_chapters", js: "sub_chapters", typ: u(undefined, a(r("Mission"))) },
    ], false),
    "TargetsAndKpi": o([
        { json: "indicator", js: "indicator", typ: "" },
        { json: "target", js: "target", typ: "" },
        { json: "pillar", js: "pillar", typ: r("Title") },
    ], false),
    "Vision2050": o([
        { json: "summary", js: "summary", typ: "" },
    ], false),
    "XFactor": o([
        { json: "x_factor", js: "x_factor", typ: 0 },
        { json: "title", js: "title", typ: "" },
        { json: "rationale", js: "rationale", typ: "" },
        { json: "what_will_be_done", js: "what_will_be_done", typ: "" },
    ], false),
    "Title": [
        "Economic Resilience",
        "Good Governance",
        "People Empowerment",
    ],
};
