// To parse this data:
//
//   import { Convert, FrameworksUnified } from "./frameworks-unified";
//
//   const frameworksUnified = Convert.toFrameworksUnified(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

export interface FrameworksUnified {
    meta:        Meta;
    frameworks:  Framework[];
    goals:       Goal[];
    priorities:  Principle[];
    strategies:  Principle[];
    principles:  Principle[];
    pillars:     PillarElement[];
    focusAreas:  FocusArea[];
    subChapters: FocusArea[];
    targets:     Target[];
    xFactors:    XFactor[];
    allActions:  AllAction[];
    searchIndex: SearchIndex[];
}

export interface AllAction {
    id:                string;
    frameworkId:       FrameworkID;
    frameworkName:     FrameworkName;
    level:             Level;
    scope:             Scope;
    parentId:          ParentID;
    parentTitle:       string;
    priority?:         number;
    label:             string;
    summary:           string;
    stakeholderGroup?: StakeholderGroup;
    goal?:             number;
}

export type FrameworkID = "sendai" | "frdp" | "ndrrp" | "ndp";

export type FrameworkName = "Sendai" | "FRDP" | "NDRRP" | "NDP";

export type Level = "global" | "regional" | "national";

export type ParentID = "sendai-p-1" | "sendai-p-2" | "sendai-p-3" | "sendai-p-4" | "frdp-goal-1" | "frdp-goal-2" | "frdp-goal-3";

export type Scope = "national_and_local" | "global_and_regional" | "national_and_subnational_governments" | "civil_society_and_communities" | "private_sector" | "regional_organizations_and_development_partners";

export type StakeholderGroup = "Governments" | "Civil Society & Communities" | "Private Sector" | "Regional Orgs & Donors";

export interface FocusArea {
    id:               string;
    frameworkId:      FrameworkID;
    frameworkName:    FrameworkName;
    level:            Level;
    pillar:           number;
    pillarTitle:      PillarTitle;
    focusArea:        number;
    title:            string;
    summary:          string;
    focusAreaTitle?:  string;
    subChapterIndex?: number;
}

export type PillarTitle = "Economic Resilience" | "People Empowerment" | "Good Governance" | "";

export interface Framework {
    id:          FrameworkID;
    name:        string;
    acronym:     FrameworkName;
    level:       Level;
    period:      string;
    outcome?:    string;
    goal?:       string;
    vision?:     string;
    purpose?:    string;
    country?:    string;
    objective?:  string;
    vision2050?: string;
    mission?:    string;
}

export interface Goal {
    id:                 ParentID;
    frameworkId:        FrameworkID;
    frameworkName:      FrameworkName;
    level:              Level;
    goal:               number;
    title:              string;
    contextSummary:     string;
    strategicObjective: string;
    outcome:            string;
}

export interface Meta {
    title:      string;
    version:    string;
    frameworks: FrameworkID[];
    levels:     Level[];
}

export interface PillarElement {
    id:            string;
    frameworkId:   FrameworkID;
    frameworkName: FrameworkName;
    level:         Level;
    pillar:        number;
    title:         PillarTitle;
}

export interface Principle {
    id:            string;
    frameworkId:   FrameworkID;
    frameworkName: FrameworkName;
    level:         Level;
    label?:        string;
    summary:       string;
    principle?:    number;
    title?:        string;
    priority?:     number;
    strategy?:     number;
}

export interface SearchIndex {
    id:            string;
    category:      Category;
    frameworkId:   FrameworkID;
    frameworkName: FrameworkName;
    level:         Level;
    title:         string;
    parentId:      PillarTitle | number;
    parentTitle:   PillarTitle;
    pillar:        PillarTitle | number | null;
    summary:       string;
}

export type Category = "priorities" | "strategies" | "pillars" | "focusAreas" | "subChapters" | "goals" | "targets" | "xFactors" | "principles";

export interface Target {
    id:            string;
    frameworkId:   FrameworkID;
    frameworkName: FrameworkName;
    level:         Level;
    label?:        string;
    description?:  string;
    summary?:      string;
    type:          Type;
    indicator?:    string;
    target?:       string;
    pillar?:       PillarTitle;
}

export type Type = "global_target" | "national_kpi";

export interface XFactor {
    id:             string;
    frameworkId:    FrameworkID;
    frameworkName:  FrameworkName;
    level:          Level;
    xFactor:        number;
    title:          string;
    rationale:      string;
    whatWillBeDone: string;
}

// Converts JSON strings to/from your types
// and asserts the results of JSON.parse at runtime
export class Convert {
    public static toFrameworksUnified(json: string): FrameworksUnified {
        return cast(JSON.parse(json), r("FrameworksUnified"));
    }

    public static frameworksUnifiedToJson(value: FrameworksUnified): string {
        return JSON.stringify(uncast(value, r("FrameworksUnified")), null, 2);
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
    "FrameworksUnified": o([
        { json: "meta", js: "meta", typ: r("Meta") },
        { json: "frameworks", js: "frameworks", typ: a(r("Framework")) },
        { json: "goals", js: "goals", typ: a(r("Goal")) },
        { json: "priorities", js: "priorities", typ: a(r("Principle")) },
        { json: "strategies", js: "strategies", typ: a(r("Principle")) },
        { json: "principles", js: "principles", typ: a(r("Principle")) },
        { json: "pillars", js: "pillars", typ: a(r("PillarElement")) },
        { json: "focusAreas", js: "focusAreas", typ: a(r("FocusArea")) },
        { json: "subChapters", js: "subChapters", typ: a(r("FocusArea")) },
        { json: "targets", js: "targets", typ: a(r("Target")) },
        { json: "xFactors", js: "xFactors", typ: a(r("XFactor")) },
        { json: "allActions", js: "allActions", typ: a(r("AllAction")) },
        { json: "searchIndex", js: "searchIndex", typ: a(r("SearchIndex")) },
    ], false),
    "AllAction": o([
        { json: "id", js: "id", typ: "" },
        { json: "frameworkId", js: "frameworkId", typ: r("FrameworkID") },
        { json: "frameworkName", js: "frameworkName", typ: r("FrameworkName") },
        { json: "level", js: "level", typ: r("Level") },
        { json: "scope", js: "scope", typ: r("Scope") },
        { json: "parentId", js: "parentId", typ: r("ParentID") },
        { json: "parentTitle", js: "parentTitle", typ: "" },
        { json: "priority", js: "priority", typ: u(undefined, 0) },
        { json: "label", js: "label", typ: "" },
        { json: "summary", js: "summary", typ: "" },
        { json: "stakeholderGroup", js: "stakeholderGroup", typ: u(undefined, r("StakeholderGroup")) },
        { json: "goal", js: "goal", typ: u(undefined, 0) },
    ], false),
    "FocusArea": o([
        { json: "id", js: "id", typ: "" },
        { json: "frameworkId", js: "frameworkId", typ: r("FrameworkID") },
        { json: "frameworkName", js: "frameworkName", typ: r("FrameworkName") },
        { json: "level", js: "level", typ: r("Level") },
        { json: "pillar", js: "pillar", typ: 0 },
        { json: "pillarTitle", js: "pillarTitle", typ: r("PillarTitle") },
        { json: "focusArea", js: "focusArea", typ: 0 },
        { json: "title", js: "title", typ: "" },
        { json: "summary", js: "summary", typ: "" },
        { json: "focusAreaTitle", js: "focusAreaTitle", typ: u(undefined, "") },
        { json: "subChapterIndex", js: "subChapterIndex", typ: u(undefined, 0) },
    ], false),
    "Framework": o([
        { json: "id", js: "id", typ: r("FrameworkID") },
        { json: "name", js: "name", typ: "" },
        { json: "acronym", js: "acronym", typ: r("FrameworkName") },
        { json: "level", js: "level", typ: r("Level") },
        { json: "period", js: "period", typ: "" },
        { json: "outcome", js: "outcome", typ: u(undefined, "") },
        { json: "goal", js: "goal", typ: u(undefined, "") },
        { json: "vision", js: "vision", typ: u(undefined, "") },
        { json: "purpose", js: "purpose", typ: u(undefined, "") },
        { json: "country", js: "country", typ: u(undefined, "") },
        { json: "objective", js: "objective", typ: u(undefined, "") },
        { json: "vision2050", js: "vision2050", typ: u(undefined, "") },
        { json: "mission", js: "mission", typ: u(undefined, "") },
    ], false),
    "Goal": o([
        { json: "id", js: "id", typ: r("ParentID") },
        { json: "frameworkId", js: "frameworkId", typ: r("FrameworkID") },
        { json: "frameworkName", js: "frameworkName", typ: r("FrameworkName") },
        { json: "level", js: "level", typ: r("Level") },
        { json: "goal", js: "goal", typ: 0 },
        { json: "title", js: "title", typ: "" },
        { json: "contextSummary", js: "contextSummary", typ: "" },
        { json: "strategicObjective", js: "strategicObjective", typ: "" },
        { json: "outcome", js: "outcome", typ: "" },
    ], false),
    "Meta": o([
        { json: "title", js: "title", typ: "" },
        { json: "version", js: "version", typ: "" },
        { json: "frameworks", js: "frameworks", typ: a(r("FrameworkID")) },
        { json: "levels", js: "levels", typ: a(r("Level")) },
    ], false),
    "PillarElement": o([
        { json: "id", js: "id", typ: "" },
        { json: "frameworkId", js: "frameworkId", typ: r("FrameworkID") },
        { json: "frameworkName", js: "frameworkName", typ: r("FrameworkName") },
        { json: "level", js: "level", typ: r("Level") },
        { json: "pillar", js: "pillar", typ: 0 },
        { json: "title", js: "title", typ: r("PillarTitle") },
    ], false),
    "Principle": o([
        { json: "id", js: "id", typ: "" },
        { json: "frameworkId", js: "frameworkId", typ: r("FrameworkID") },
        { json: "frameworkName", js: "frameworkName", typ: r("FrameworkName") },
        { json: "level", js: "level", typ: r("Level") },
        { json: "label", js: "label", typ: u(undefined, "") },
        { json: "summary", js: "summary", typ: "" },
        { json: "principle", js: "principle", typ: u(undefined, 0) },
        { json: "title", js: "title", typ: u(undefined, "") },
        { json: "priority", js: "priority", typ: u(undefined, 0) },
        { json: "strategy", js: "strategy", typ: u(undefined, 0) },
    ], false),
    "SearchIndex": o([
        { json: "id", js: "id", typ: "" },
        { json: "category", js: "category", typ: r("Category") },
        { json: "frameworkId", js: "frameworkId", typ: r("FrameworkID") },
        { json: "frameworkName", js: "frameworkName", typ: r("FrameworkName") },
        { json: "level", js: "level", typ: r("Level") },
        { json: "title", js: "title", typ: "" },
        { json: "parentId", js: "parentId", typ: u(r("PillarTitle"), 0) },
        { json: "parentTitle", js: "parentTitle", typ: r("PillarTitle") },
        { json: "pillar", js: "pillar", typ: u(r("PillarTitle"), 0, null) },
        { json: "summary", js: "summary", typ: "" },
    ], false),
    "Target": o([
        { json: "id", js: "id", typ: "" },
        { json: "frameworkId", js: "frameworkId", typ: r("FrameworkID") },
        { json: "frameworkName", js: "frameworkName", typ: r("FrameworkName") },
        { json: "level", js: "level", typ: r("Level") },
        { json: "label", js: "label", typ: u(undefined, "") },
        { json: "description", js: "description", typ: u(undefined, "") },
        { json: "summary", js: "summary", typ: u(undefined, "") },
        { json: "type", js: "type", typ: r("Type") },
        { json: "indicator", js: "indicator", typ: u(undefined, "") },
        { json: "target", js: "target", typ: u(undefined, "") },
        { json: "pillar", js: "pillar", typ: u(undefined, r("PillarTitle")) },
    ], false),
    "XFactor": o([
        { json: "id", js: "id", typ: "" },
        { json: "frameworkId", js: "frameworkId", typ: r("FrameworkID") },
        { json: "frameworkName", js: "frameworkName", typ: r("FrameworkName") },
        { json: "level", js: "level", typ: r("Level") },
        { json: "xFactor", js: "xFactor", typ: 0 },
        { json: "title", js: "title", typ: "" },
        { json: "rationale", js: "rationale", typ: "" },
        { json: "whatWillBeDone", js: "whatWillBeDone", typ: "" },
    ], false),
    "FrameworkID": [
        "frdp",
        "ndp",
        "ndrrp",
        "sendai",
    ],
    "FrameworkName": [
        "FRDP",
        "NDP",
        "NDRRP",
        "Sendai",
    ],
    "Level": [
        "global",
        "national",
        "regional",
    ],
    "ParentID": [
        "frdp-goal-1",
        "frdp-goal-2",
        "frdp-goal-3",
        "sendai-p-1",
        "sendai-p-2",
        "sendai-p-3",
        "sendai-p-4",
    ],
    "Scope": [
        "civil_society_and_communities",
        "global_and_regional",
        "national_and_local",
        "national_and_subnational_governments",
        "private_sector",
        "regional_organizations_and_development_partners",
    ],
    "StakeholderGroup": [
        "Civil Society & Communities",
        "Governments",
        "Private Sector",
        "Regional Orgs & Donors",
    ],
    "PillarTitle": [
        "Economic Resilience",
        "",
        "Good Governance",
        "People Empowerment",
    ],
    "Category": [
        "focusAreas",
        "goals",
        "pillars",
        "principles",
        "priorities",
        "strategies",
        "subChapters",
        "targets",
        "xFactors",
    ],
    "Type": [
        "global_target",
        "national_kpi",
    ],
};
