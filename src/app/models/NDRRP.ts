// To parse this data:
//
//   import { Convert, Ndrrp } from "./NDRRP";
//
//   const ndrrp = Convert.toNdrrp(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

export interface Ndrrp {
    framework:               string;
    level:                   string;
    country:                 string;
    period:                  string;
    enacted:                 string;
    responsible_ministry:    string;
    policy_objective:        Policy;
    policy_goal:             Policy;
    guiding_principles:      GuidingPrinciple[];
    policy_strategies:       PolicyStrategy[];
    policy_premise:          PolicyPremise;
    action_items_categories: ActionItemsCategory[];
    note_on_action_items:    string;
}

export interface ActionItemsCategory {
    category:                     string;
    strategy_alignment:           string;
    identified_action_references: IdentifiedActionReference[];
    note?:                        string;
}

export interface IdentifiedActionReference {
    number: number;
    action: string;
}

export interface GuidingPrinciple {
    principle: number;
    title:     string;
    summary:   string;
}

export interface Policy {
    title:   string;
    summary: string;
}

export interface PolicyPremise {
    characteristics_of_climate_change_and_disaster_risks: CharacteristicsOfClimateChangeAndDisasterRisks;
    sectoral_implications:                                CharacteristicsOfClimateChangeAndDisasterRisks;
    constrained_conditions:                               CharacteristicsOfClimateChangeAndDisasterRisks;
}

export interface CharacteristicsOfClimateChangeAndDisasterRisks {
    summary: string;
}

export interface PolicyStrategy {
    strategy: number;
    title:    string;
    summary:  string;
}

// Converts JSON strings to/from your types
// and asserts the results of JSON.parse at runtime
export class Convert {
    public static toNdrrp(json: string): Ndrrp {
        return cast(JSON.parse(json), r("Ndrrp"));
    }

    public static ndrrpToJson(value: Ndrrp): string {
        return JSON.stringify(uncast(value, r("Ndrrp")), null, 2);
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
    "Ndrrp": o([
        { json: "framework", js: "framework", typ: "" },
        { json: "level", js: "level", typ: "" },
        { json: "country", js: "country", typ: "" },
        { json: "period", js: "period", typ: "" },
        { json: "enacted", js: "enacted", typ: "" },
        { json: "responsible_ministry", js: "responsible_ministry", typ: "" },
        { json: "policy_objective", js: "policy_objective", typ: r("Policy") },
        { json: "policy_goal", js: "policy_goal", typ: r("Policy") },
        { json: "guiding_principles", js: "guiding_principles", typ: a(r("GuidingPrinciple")) },
        { json: "policy_strategies", js: "policy_strategies", typ: a(r("PolicyStrategy")) },
        { json: "policy_premise", js: "policy_premise", typ: r("PolicyPremise") },
        { json: "action_items_categories", js: "action_items_categories", typ: a(r("ActionItemsCategory")) },
        { json: "note_on_action_items", js: "note_on_action_items", typ: "" },
    ], false),
    "ActionItemsCategory": o([
        { json: "category", js: "category", typ: "" },
        { json: "strategy_alignment", js: "strategy_alignment", typ: "" },
        { json: "identified_action_references", js: "identified_action_references", typ: a(r("IdentifiedActionReference")) },
        { json: "note", js: "note", typ: u(undefined, "") },
    ], false),
    "IdentifiedActionReference": o([
        { json: "number", js: "number", typ: 0 },
        { json: "action", js: "action", typ: "" },
    ], false),
    "GuidingPrinciple": o([
        { json: "principle", js: "principle", typ: 0 },
        { json: "title", js: "title", typ: "" },
        { json: "summary", js: "summary", typ: "" },
    ], false),
    "Policy": o([
        { json: "title", js: "title", typ: "" },
        { json: "summary", js: "summary", typ: "" },
    ], false),
    "PolicyPremise": o([
        { json: "characteristics_of_climate_change_and_disaster_risks", js: "characteristics_of_climate_change_and_disaster_risks", typ: r("CharacteristicsOfClimateChangeAndDisasterRisks") },
        { json: "sectoral_implications", js: "sectoral_implications", typ: r("CharacteristicsOfClimateChangeAndDisasterRisks") },
        { json: "constrained_conditions", js: "constrained_conditions", typ: r("CharacteristicsOfClimateChangeAndDisasterRisks") },
    ], false),
    "CharacteristicsOfClimateChangeAndDisasterRisks": o([
        { json: "summary", js: "summary", typ: "" },
    ], false),
    "PolicyStrategy": o([
        { json: "strategy", js: "strategy", typ: 0 },
        { json: "title", js: "title", typ: "" },
        { json: "summary", js: "summary", typ: "" },
    ], false),
};
