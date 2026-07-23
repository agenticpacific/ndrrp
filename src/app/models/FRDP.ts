// To parse this data:
//
//   import { Convert, Frdp } from "./FRDP";
//
//   const frdp = Convert.toFrdp(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

export interface Frdp {
    framework:          string;
    level:              string;
    period:             string;
    vision:             Purpose;
    purpose:            Purpose;
    guiding_principles: GuidingPrinciple[];
    goals:              Goal[];
}

export interface Goal {
    goal:                   number;
    title:                  string;
    context_and_challenges: ContextAndChallenges;
    strategic_objective:    ContextAndChallenges;
    outcome:                ContextAndChallenges;
    priority_actions:       PriorityActions;
}

export interface ContextAndChallenges {
    summary: string;
}

export interface PriorityActions {
    national_and_subnational_governments:            CivilSocietyAndCommunity[];
    civil_society_and_communities:                   CivilSocietyAndCommunity[];
    private_sector:                                  CivilSocietyAndCommunity[];
    regional_organizations_and_development_partners: CivilSocietyAndCommunity[];
}

export interface CivilSocietyAndCommunity {
    action:  string;
    summary: string;
}

export interface GuidingPrinciple {
    principle: string;
    summary:   string;
}

export interface Purpose {
    title:   string;
    summary: string;
}

// Converts JSON strings to/from your types
// and asserts the results of JSON.parse at runtime
export class Convert {
    public static toFrdp(json: string): Frdp {
        return cast(JSON.parse(json), r("Frdp"));
    }

    public static frdpToJson(value: Frdp): string {
        return JSON.stringify(uncast(value, r("Frdp")), null, 2);
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
    "Frdp": o([
        { json: "framework", js: "framework", typ: "" },
        { json: "level", js: "level", typ: "" },
        { json: "period", js: "period", typ: "" },
        { json: "vision", js: "vision", typ: r("Purpose") },
        { json: "purpose", js: "purpose", typ: r("Purpose") },
        { json: "guiding_principles", js: "guiding_principles", typ: a(r("GuidingPrinciple")) },
        { json: "goals", js: "goals", typ: a(r("Goal")) },
    ], false),
    "Goal": o([
        { json: "goal", js: "goal", typ: 0 },
        { json: "title", js: "title", typ: "" },
        { json: "context_and_challenges", js: "context_and_challenges", typ: r("ContextAndChallenges") },
        { json: "strategic_objective", js: "strategic_objective", typ: r("ContextAndChallenges") },
        { json: "outcome", js: "outcome", typ: r("ContextAndChallenges") },
        { json: "priority_actions", js: "priority_actions", typ: r("PriorityActions") },
    ], false),
    "ContextAndChallenges": o([
        { json: "summary", js: "summary", typ: "" },
    ], false),
    "PriorityActions": o([
        { json: "national_and_subnational_governments", js: "national_and_subnational_governments", typ: a(r("CivilSocietyAndCommunity")) },
        { json: "civil_society_and_communities", js: "civil_society_and_communities", typ: a(r("CivilSocietyAndCommunity")) },
        { json: "private_sector", js: "private_sector", typ: a(r("CivilSocietyAndCommunity")) },
        { json: "regional_organizations_and_development_partners", js: "regional_organizations_and_development_partners", typ: a(r("CivilSocietyAndCommunity")) },
    ], false),
    "CivilSocietyAndCommunity": o([
        { json: "action", js: "action", typ: "" },
        { json: "summary", js: "summary", typ: "" },
    ], false),
    "GuidingPrinciple": o([
        { json: "principle", js: "principle", typ: "" },
        { json: "summary", js: "summary", typ: "" },
    ], false),
    "Purpose": o([
        { json: "title", js: "title", typ: "" },
        { json: "summary", js: "summary", typ: "" },
    ], false),
};
