import {
    DataDocument, DataDocumentReference, DataType, IdGeneratorType, Language, Metadata, ProjectSettings, Requirement,
    Schema, SchemaDocument, SchemaProperty, SchemaPropertyDocument, SchemaReference, SchemaType,
    SpecificationDictionary, Uniqueness
} from "charon-extensions";

export class DevMetadata implements Metadata {

    private readonly _schemas: DevSchema[];
    private readonly _sharedProperty: DevSchemaProperty[];

    public readonly projectSettings: DevProjectSettings;
    public get schemas(): readonly DevSchema[] {
        return this._schemas;
    }

    constructor() {
        this.projectSettings = new DevProjectSettings();
        this._schemas = [];
        this._sharedProperty = [];
    }

    public *getSchemas(): IterableIterator<DevSchema> {
        yield* this._schemas;
    }
    public getSchema(schemaNameOrId: string): DevSchema {
        const schema = this.findSchema(schemaNameOrId);
        if (!schema) {
            throw new Error(`Unable to find schema with '${schemaNameOrId}' name or id.`);
        }
        return schema;
    }
    public findSchema(schemaNameOrId: string): DevSchema | null {
        return this._schemas.find(schema => schema.id === schemaNameOrId || schema.name === schemaNameOrId) ?? null;
    }
    public hasSchema(schemaNameOrId: string): boolean {
        return Boolean(this.findSchema(schemaNameOrId));
    }
    public defineSchema(name: string, buildFn?: (schema: DevSchema) => void): DevSchema {
        if (this.findSchema(name)) {
            throw new Error(`Schema with '${name}' name is already exists.`);
        }
        const newSchema = new DevSchema(this);
        newSchema.name = name;
        newSchema.displayName = name;

        if (buildFn) {
            buildFn(newSchema);
        }

        this._schemas.push(newSchema);
        return newSchema;
    }
    public referenceSchema(schemaNameOrId: string): DevSchemaReference {
        const schema = this.findSchema(schemaNameOrId);
        return new DevSchemaReference(this, schemaNameOrId, schema?.displayName || schemaNameOrId);
    }
    public *getSharedSchemaProperties(): IterableIterator<DevSchemaProperty> {
        yield* this._sharedProperty;
    }
    public getSharedSchemaProperty(sharedSchemaPropertyNameOrId: string): DevSchemaProperty {
        const schemaProperty = this.findSharedSchemaProperty(sharedSchemaPropertyNameOrId);
        if (!schemaProperty) {
            throw new Error(`Unable to find shared proeprty with '${sharedSchemaPropertyNameOrId}' name or id.`);
        }
        return schemaProperty;
    }
    public findSharedSchemaProperty(sharedSchemaPropertyNameOrId: string): DevSchemaProperty | null {
        return this._sharedProperty.find(schemaProperty => schemaProperty.id === sharedSchemaPropertyNameOrId || schemaProperty.name === sharedSchemaPropertyNameOrId) ?? null;

    }
    public hasSharedSchemaProperty(sharedSchemaPropertyNameOrId: string): boolean {
        return Boolean(this.findSharedSchemaProperty(sharedSchemaPropertyNameOrId));
    }
    public defineSharedSchemaProperty(name: string, dataType: DataType, buildFn?: (sharedSchemaProperty: DevSchemaProperty) => void): DevSchemaProperty {
        if (this.findSharedSchemaProperty(name)) {
            throw new Error(`Shared schema property with '${name}' name is already exists.`);
        }
        const newSchemaProperty = new DevSchemaProperty(this, null);
        newSchemaProperty.name = name;
        newSchemaProperty.displayName = name;
        newSchemaProperty.dataType = dataType;
        if (dataType === DataType.DocumentCollection ||
            dataType === DataType.ReferenceCollection
        ) {
            newSchemaProperty.requirement = Requirement.NotEmpty;
        }

        if (buildFn) {
            buildFn(newSchemaProperty);
        }

        this._sharedProperty.push(newSchemaProperty);
        return newSchemaProperty;
    }
    public getHashCode(): number {
        return 0;
    }
}

export class DevSchema implements Schema {
    private readonly _properties: DevSchemaProperty[];
    private _specification: DevSpecificationDictionary;

    public id: string;
    public name: string;
    public displayName: string;
    public description: string;
    public type: SchemaType;
    public idGenerator: IdGeneratorType;
    public specification: string;
    public group: string;

    public get properties(): readonly DevSchemaProperty[] {
        return this._properties;
    }

    constructor(public metadata: DevMetadata) {
        this.id = newBsonId();
        this.name = '';
        this.displayName = '';
        this.description = '';
        this.type = SchemaType.Normal;
        this.idGenerator = IdGeneratorType.None;
        this.specification = '';
        this.group = '';
        this._properties = [];
        this._specification = new DevSpecificationDictionary();
    }

    public getSpecification(): DevSpecificationDictionary {
        return this._specification;
    }
    public setSpecification(value: DevSpecificationDictionary) {
        this._specification = value;
    }
    public hasSchemaProperty(schemaPropertyIdOrName: string): boolean {
        return Boolean(this.findSchemaProperty(schemaPropertyIdOrName));
    }
    public findSchemaProperty(schemaPropertyIdOrName: string): SchemaProperty | null {
        return this._properties.find(schemaProperty => schemaProperty.id === schemaPropertyIdOrName || schemaProperty.name === schemaPropertyIdOrName) ?? null;
    }
    public getSchemaProperty(schemaPropertyIdOrName: string): SchemaProperty {
        const schemaProperty = this.findSchemaProperty(schemaPropertyIdOrName);
        if (!schemaProperty) {
            throw new Error(`Unable to find proeprty with '${schemaPropertyIdOrName}' name or id.`);
        }
        return schemaProperty;
    }
    public defineIdSchemaProperty(dataType: DataType, buildFn?: (schemaProperty: DevSchemaProperty) => void): DevSchemaProperty {
        return this.defineSchemaProperty('Id', dataType, schemaProperty => {
            if (buildFn) {
                buildFn(schemaProperty);
            }
            schemaProperty.uniqueness = Uniqueness.Unique;
            schemaProperty.defaultValue = null;
            schemaProperty.requirement = Requirement.NotNull;
        });
    }
    public defineSchemaProperty(name: string, dataType: DataType, buildFn?: (schemaProperty: DevSchemaProperty) => void): DevSchemaProperty {
        if (this.findSchemaProperty(name)) {
            throw new Error(`Schema property with '${name}' name is already exists.`);
        }
        const newSchemaProperty = new DevSchemaProperty(this.metadata, this);
        newSchemaProperty.name = name;
        newSchemaProperty.displayName = name;
        newSchemaProperty.dataType = dataType;
        switch (dataType) {

            case DataType.Number:
            case DataType.Integer:
            case DataType.PickList:
            case DataType.MultiPickList:
                newSchemaProperty.size = 4;
                break;
            case DataType.DocumentCollection:
            case DataType.ReferenceCollection:
                newSchemaProperty.requirement = Requirement.NotEmpty;
                break;
            case DataType.Document:
            case DataType.Reference:
            case DataType.Text:
            case DataType.LocalizedText:
            case DataType.Logical:
            case DataType.Time:
            case DataType.Date:
            case DataType.Formula:
                break;
        }

        if (buildFn) {
            buildFn(newSchemaProperty);
        }

        this._properties.push(newSchemaProperty);
        return newSchemaProperty;
    }
    public getReferencedBySchemas(): ReadonlySet<Schema> {
        return new Set([...this.metadata.getSchemas()].filter(
            schema => schema.properties.some(schemaProperty => schemaProperty.getReferencedSchemaOrNull() === this)
        ));
    }
    public getReferencedBySchemaProperty(): ReadonlySet<SchemaProperty> {
        return new Set([...this.metadata.getSchemas()].flatMap(schema => schema.properties).filter(
            schemaProperty => schemaProperty.getReferencedSchemaOrNull() === this)
        );
    }
    public getContainedBySchemas(): ReadonlySet<Schema> {
        const containedBySchemas = new Set<Schema>();
        containedBySchemas.add(this);
        let containedBySchemasCount = 0;
        do {
            containedBySchemasCount = containedBySchemas.size;

            for (const schema of this.metadata.getSchemas()) {
                for (const schemaProperty of schema.properties) {
                    if (schemaProperty.dataType !== DataType.Document && schemaProperty.dataType !== DataType.DocumentCollection) {
                        continue;
                    }
                    if (schemaProperty.referenceType == null) {
                        continue;
                    }
                    const referencedSchema = schemaProperty.referenceType.getSchema();
                    if (containedBySchemas.has(referencedSchema)) {
                        containedBySchemas.add(schema);
                    }
                }
            }

        } while (containedBySchemas.size !== containedBySchemasCount);

        containedBySchemas.delete(this);
        return containedBySchemas;
    }
    public getSchemaPropertyOrder(): ReadonlyArray<string> {
        return this.properties.map(schemaProperty => schemaProperty.name);
    }
    public getSchemaPropertyNames(): ReadonlySet<string> {
        return new Set(this.properties.map(schemaProperty => schemaProperty.name));
    }
    public getUniqueSchemaProperties(): ReadonlySet<SchemaProperty> {
        return new Set(this.properties.filter(schemaProperty => schemaProperty.uniqueness !== Uniqueness.None));
    }
    public getIdProperty(): SchemaProperty {
        return this.getSchemaProperty('Id');
    }
    public convertIdToString(id: any): string {
        return this.getIdProperty().convertToString(id) ?? '';
    }
    public formatDisplayText(document: DataDocument): string {
        if (!document) {
            return 'None';
        }
        const displayName = document.DisplayName ?? document.Name ?? document.Title;
        if (displayName) {
            return String(displayName);
        }
        return this.convertIdToString(document.Id);
    }
    public getHashCode(): number {
        return 0;
    }
    public toDocument(): SchemaDocument {
        return {
            Id: this.id,
            Name: this.name,
            DisplayName: this.displayName,
            Type: this.type,
            Description: this.description,
            IdGenerator: this.idGenerator,
            Specification: this.specification,
            Properties: this.properties.map(property => property.toDocument())
        };
    }
    public toString(): string {
        return this.name;
    }

}

export class DevSchemaReference implements SchemaReference {
    public constructor(
        public readonly metadata: DevMetadata,
        public readonly id: string,
        public readonly displayName: string
    ) {

    }

    getSchema(): Schema {
        return this.metadata.getSchema(this.id);
    }
    toString(): string {
        return this.metadata.findSchema(this.id)?.displayName || this.displayName || this.id;
    }

}

export class DevSchemaProperty implements SchemaProperty {
    private _specification: DevSpecificationDictionary;
    private _typedDefaultValue: any;

    public id: string;
    public name: string;
    public displayName: string;
    public description: string;
    public dataType: DataType;
    public defaultValue: string | null;
    public uniqueness: Uniqueness;
    public requirement: Requirement;
    public referenceType: SchemaReference | null;
    public sharedProperty: SchemaReference | null;
    public size: number;
    public specification: string;

    constructor(public metadata: DevMetadata, public schema: Schema | null) {
        this.id = newBsonId();
        this.name = '';
        this.displayName = '';
        this.description = '';
        this.dataType = DataType.Text;
        this.defaultValue = null;
        this.uniqueness = Uniqueness.None;
        this.requirement = Requirement.None;
        this.referenceType = null;
        this.sharedProperty = null;
        this.size = 0;
        this.specification = '';
        this._specification = new DevSpecificationDictionary();
        this._typedDefaultValue = undefined;
    }

    public getReferencedSchema(): Schema {
        if (!this.referenceType?.id) {
            throw new Error(`Property '${this.name}' of '${this.schema?.name}' schema doesn't has 'referenceType' value and can't ` +
                'provide referenced schema.');  // TODO localize?
        } else {
            return this.metadata.getSchema(this.referenceType.id);
        }
    }
    public getReferencedSchemaOrNull(): Schema | null {
        return this.metadata.findSchema(this.referenceType?.id ?? '');
    }
    public getSpecification(): SpecificationDictionary {
        return this._specification;
    }
    public setSpecification(value: DevSpecificationDictionary) {
        this._specification = value;
    }
    public getTypedDefaultValue() {
        if (typeof this._typedDefaultValue === 'undefined') {
            this._typedDefaultValue = this.convertFrom(this.defaultValue);
        }
        return this._typedDefaultValue;
    }
    public getValueForNewDocument() {
        const typedDefaultValue = this.getTypedDefaultValue();
        if (typedDefaultValue != null) {
            return typedDefaultValue;
        }
        if (this.requirement === Requirement.None) {
            return null;
        }

        switch (this.dataType) {
            case DataType.MultiPickList:
            case DataType.PickList:
            case DataType.Integer: return 0;
            case DataType.Number: return 0;
            case DataType.Logical: return false;
            case DataType.LocalizedText:
            case DataType.Text:
            case DataType.Time:
            case DataType.Reference:
            case DataType.Document:
            case DataType.Formula:
            case DataType.DocumentCollection:
            case DataType.ReferenceCollection: return null;
            case DataType.Date: return new Date();
            default: return null;
        }
    }
    public convertFrom(value: any): any {
        if (typeof (value) === 'undefined' || value === null || (value === '' && this.dataType !== DataType.Text &&
            this.dataType !== DataType.LocalizedText)) {
            return null;
        }
        if (typeof (value) === 'string' && this.name === 'Id' && value.startsWith('_ID_')) {
            return value; // it is valid Id property
        }

        try {
            switch (this.dataType) {
                case DataType.Text:
                    return value.toString();
                case DataType.Number:
                    return Number(value);
                case DataType.Integer:
                    if (this.size > 4) {
                        return BigInt(value);
                    } else {
                        return Number(value) | 0;
                    }
                case DataType.PickList:
                    {
                        const pickListValue = this.getSpecification().mapPickList(value);
                        if (this.size <= 4 && pickListValue !== null) {
                            return Number(pickListValue);
                        } else {
                            return pickListValue;
                        }
                    }
                case DataType.MultiPickList:
                    {
                        const multiPickList = this.getSpecification().mapMultiPickList(value);
                        if (this.size <= 4 && multiPickList !== null) {
                            return Number(multiPickList);
                        } else {
                            return multiPickList;
                        }
                    }
                case DataType.Logical:
                    switch (typeof value) {
                        case 'boolean': return value;
                        case 'string':
                            if (value.toLowerCase() === 'true' || value.toLowerCase() === 'yes') {
                                return true;
                            } else if (value.toLowerCase() === 'false' || value.toLowerCase() === 'no') {
                                return false;
                            } else {
                                return null;
                            }
                        default:
                            return null;
                    }
                case DataType.ReferenceCollection:
                    if (typeof value === 'string') {
                        const stringValue = value.valueOf().trim();
                        if (stringValue.startsWith('[') && stringValue.endsWith(']')) {
                            return JSON.parse(stringValue);
                        } else {
                            return stringValue.split(',').map(v => ({ 'Id': v }));
                        }
                    } else if (typeof value === 'object') {
                        return value;
                    } else {
                        return null;
                    }
                case DataType.DocumentCollection:
                    if (typeof value === 'string') {
                        const stringValue = value.valueOf().trim();
                        if (stringValue.startsWith('[') && stringValue.endsWith(']')) {
                            return JSON.parse(stringValue);
                        } else {
                            return [];
                        }
                    } else if (typeof value === 'object') {
                        return value;
                    } else {
                        return null;
                    }
                case DataType.Formula:
                case DataType.Document:
                    if (typeof value === 'string') {
                        const stringValue = value.valueOf().trim();
                        if (stringValue.startsWith('{') && stringValue.endsWith('}')) {
                            return JSON.parse(stringValue);
                        } else if (this.dataType === DataType.Formula) {
                            return stringValue;
                        } else {
                            return null;
                        }
                    } else if (typeof value === 'object') {
                        return value;
                    } else {
                        return null;
                    }
                case DataType.Reference:
                    if (typeof value === 'string') {
                        const stringValue = value.valueOf().trim();
                        if (stringValue.startsWith('{') && stringValue.endsWith('}')) {
                            return JSON.parse(stringValue);
                        } else {
                            return ({ 'Id': stringValue });
                        }
                    } else if (typeof value === 'object') {
                        return value;
                    } else {
                        return null;
                    }
                case DataType.LocalizedText:
                    if (typeof value === 'string' || value instanceof String) {
                        const stringValue = value.valueOf().trim();
                        if (stringValue.startsWith('{') && stringValue.endsWith('}')) {
                            return JSON.parse(stringValue);
                        } else {
                            return <object>{ [this.metadata.projectSettings.getPrimaryLanguage().id]: stringValue };
                        }
                    } else if (typeof value === 'object') {
                        return value;
                    } else {
                        return null;
                    }
                case DataType.Date:
                    return this.parseDateOrNull(value.toString());
                case DataType.Time:
                    return TimeSpan.parseOrNull(value.toString());
                default:
                    return null;
            }
        } catch {
            return null;
        }
    }
    public convertToString(value: any): string | null {
        if (typeof (value) === 'undefined' || value === null) {
            return null;
        }
        try {
            value = this.convertFrom(value);
            switch (this.dataType) {
                case DataType.Text:
                    return value.toString();
                case DataType.LocalizedText:
                    if (typeof value === 'object') {
                        return value[this.metadata.projectSettings.getPrimaryLanguage().id] || null;
                    } else {
                        return value.toString();
                    }
                case DataType.Logical:
                    if (value instanceof Boolean) {
                        value = value.valueOf();
                    } else if (typeof value !== 'boolean') {
                        value = value === 'True' || value === 'true' || Number(value) > 0;
                    }
                    return value ? 'True' : 'False';
                case DataType.Time:
                    return TimeSpan.parse(value).toString();
                case DataType.Date:
                    if (value instanceof Date === false) {
                        value = this.parseDateOrNull(String(value));
                    }
                    if (!value) {
                        return null;
                    }
                    return String(value);
                case DataType.Number:
                    {
                        const precision = this.getSpecification().getPrecision() || null;
                        if (precision != null) {
                            return String(value);
                        } else {
                            return value.toString();
                        }
                    }
                case DataType.Integer:
                    return BigInt(value).toString();
                case DataType.PickList:
                    return this.getSpecification().formatPickList(BigInt(value));
                case DataType.MultiPickList:
                    return this.getSpecification().formatMultiPickList(BigInt(value));
                case DataType.DocumentCollection:
                case DataType.ReferenceCollection:
                    return (<Array<any>>value).map(v => v.Id).join(', ');
                case DataType.Document:
                case DataType.Reference:
                    return value.Id.toString();
                case DataType.Formula:
                    return JSON.stringify(value);
                default:
                    return null;
            }
        } catch {
            return null;
        }
    }
    public convertToDisplayString(value: any): string {
        if (typeof value === 'undefined' || value === null) {
            return 'None';
        }

        try {
            let convertedValue = this.convertFrom(value) ?? value;
            const specification = this.getSpecification();
            switch (this.dataType) {
                case DataType.Text:
                    return convertedValue.toString() ?? 'None';
                case DataType.LocalizedText:
                    if (typeof convertedValue === 'object') {
                        return convertedValue[this.metadata.projectSettings.getPrimaryLanguage().id] ?? 'None';
                    } else {
                        return convertedValue.toString() ?? 'None';
                    }
                case DataType.Logical:
                    if (convertedValue instanceof Boolean) {
                        convertedValue = convertedValue.valueOf();
                    } else if (typeof convertedValue !== 'boolean') {
                        convertedValue = convertedValue === 'True' || convertedValue === 'true' ||
                            Number(convertedValue) > 0;
                    }
                    return convertedValue ? 'Yes' : 'No';
                case DataType.Time:
                    return TimeSpan.parse(convertedValue).toString();
                case DataType.Date:
                    if (convertedValue instanceof Date) {
                        convertedValue = this.parseDateOrNull(convertedValue.toString());
                    }
                    if (!convertedValue) {
                        return 'None';
                    }
                    return String(convertedValue);
                case DataType.Number:
                case DataType.Integer:
                    return String(convertedValue);
                case DataType.PickList:
                    return specification.formatPickList(BigInt(convertedValue));
                case DataType.MultiPickList:
                    return specification.formatMultiPickList(BigInt(convertedValue));
                case DataType.Reference:
                    return String(convertedValue.DisplayName ?? convertedValue.Id?.toString() ?? 'None');
                case DataType.ReferenceCollection:
                    {
                        const referenceList = convertedValue as DataDocumentReference[];
                        if (referenceList.length === 0) {
                            return 'None';
                        }
                        return referenceList.map(reference => reference.DisplayName ?? reference.Id?.toString() ?? 'None').join(', ');
                    }
                case DataType.Document:
                    {
                        const documentReferencedSchema = this.getReferencedSchema();
                        return documentReferencedSchema.formatDisplayText(convertedValue, specification);
                    }
                case DataType.DocumentCollection:
                    {
                        const listReferencedSchema = this.getReferencedSchema();
                        const documentList = (<Array<DataDocument>>convertedValue);
                        if (documentList.length === 0) {
                            return 'None';
                        }
                        return documentList.map(document => listReferencedSchema.formatDisplayText(document, specification)).join(', ');
                    }
                case DataType.Formula:
                    return convertedValue._cs ?? JSON.stringify(convertedValue);
                default:
                    return '<unknown data type>';
            }
        } catch {
            return String(value);
        }
    }

    public valuesAreEquals(left: any, right: any): boolean {
        if (left === undefined) {
            left = null;
        }
        if (right === undefined) {
            right = null;
        }
        if ((left == null) !== (right == null)) {
            return false;
        } else if (Object.is(left, right)) {
            return true;
        }

        let referencedSchema: Schema;
        switch (this.dataType) {
            // compared by structure
            case DataType.LocalizedText:
            case DataType.Formula: return JSON.stringify(left) === JSON.stringify(right);
            case DataType.Reference:
                {
                    const leftReference = left as DataDocumentReference;
                    const rightReference = right as DataDocumentReference;

                    if ((leftReference == null) !== (rightReference == null)) {
                        return false;
                    } else if (Object.is(leftReference, rightReference)) {
                        return true;
                    }

                    return leftReference.Id === rightReference.Id;
                }
            case DataType.ReferenceCollection:
                {
                    referencedSchema = this.getReferencedSchema();
                    const leftReferenceCollection = left as DataDocumentReference[];
                    const rightReferenceCollection = right as DataDocumentReference[];
                    if (leftReferenceCollection.length !== rightReferenceCollection.length) {
                        return false;
                    }
                    for (let i = 0; i < leftReferenceCollection.length; i++) {
                        const leftListReference = leftReferenceCollection[i];
                        const rightListReference = rightReferenceCollection[i];

                        if ((leftListReference == null) !== (rightListReference == null)) {
                            return false;
                        } else if (Object.is(leftListReference, rightListReference)) {
                            return true;
                        }

                        if (leftListReference.Id !== rightListReference.Id) {
                            return false;
                        }
                    }
                    return true;
                }
            case DataType.Document:
                {
                    referencedSchema = this.getReferencedSchema();
                    const leftDocument = left as DataDocument;
                    const rightDocument = right as DataDocument;

                    if ((leftDocument == null) !== (rightDocument == null)) {
                        return false;
                    } else if (Object.is(leftDocument, rightDocument)) {
                        return true;
                    }

                    for (const schemaProperty of referencedSchema.properties) {
                        if (schemaProperty.valuesAreEquals(leftDocument[schemaProperty.name], rightDocument[schemaProperty.name]) === false) {
                            return false;
                        }
                    }
                    return true;
                }
            case DataType.DocumentCollection:
                {
                    referencedSchema = this.getReferencedSchema();
                    const leftDocumentCollection = left as DataDocument[];
                    const rightDocumentCollection = right as DataDocument[];
                    if (leftDocumentCollection.length !== rightDocumentCollection.length) {
                        return false;
                    }
                    for (let i = 0; i < leftDocumentCollection.length; i++) {
                        const leftListDocument = leftDocumentCollection[i];
                        const rightListDocument = rightDocumentCollection[i];

                        if ((leftListDocument == null) !== (rightListDocument == null)) {
                            return false;
                        } else if (Object.is(leftListDocument, rightListDocument)) {
                            continue;
                        }

                        for (const schemaProperty of referencedSchema.properties) {
                            const leftValue = leftListDocument[schemaProperty.name];
                            const rightValue = rightListDocument[schemaProperty.name];
                            if (!schemaProperty.valuesAreEquals(leftValue, rightValue)) {
                                return false;
                            }
                        }
                    }
                    return true;
                }
            case DataType.Date:
            case DataType.MultiPickList:
            case DataType.Integer:
            case DataType.Logical:
            case DataType.Number:
            case DataType.PickList:
            case DataType.Text:
            case DataType.Time:
            default:
                if (left == null || right == null) {
                    return false;
                } else if ((typeof (left) === 'bigint' && typeof (right) === 'number') ||
                    (typeof (left) === 'number' && typeof (right) === 'bigint')) {
                    return BigInt(left) === BigInt(right);
                } else {
                    return left.valueOf() === right.valueOf();
                }
        }
    }

    public getMinValue(): bigint | undefined {
        if (this.dataType !== DataType.Integer) {
            return;
        }

        switch (this.size) {
            case 1: return -128n;
            case 2: return -32768n;
            case 3: return -16777216n;
            case 4: return -2147483648n;
            case 5: return -549755813888n;
            case 6: return -140737488355328n;
            case 7: return -36028797018963968n;
            case 8: return -9223372036854775808n;
            default: return;
        }
    }
    public getMaxValue(): bigint | undefined {
        if (this.dataType !== DataType.Integer) {
            return;
        }

        switch (this.size) {
            case 1: return 127n;
            case 2: return 32767n;
            case 3: return 16777217n;
            case 4: return 2147483647n;
            case 5: return 549755813887n;
            case 6: return 140737488355327n;
            case 7: return 36028797018963967n;
            case 8: return 9223372036854775807n;
            default: return;
        }
    }
    public getHashCode(): number {
        return 0;
    }
    public toDocument(): SchemaPropertyDocument {
        return {

            Id: this.id,
            SharedProperty: this.sharedProperty ? { Id: this.sharedProperty.id } : null,
            Name: this.name,
            DisplayName: this.displayName,
            Description: this.description,
            DataType: this.dataType,
            DefaultValue: this.defaultValue,
            Uniqueness: this.uniqueness,
            Requirement: this.requirement,
            ReferenceType: this.referenceType ? { Id: this.referenceType.id, DisplayName: this.referenceType.displayName } : null,
            Size: this.size,
            Specification: this.specification,

        };
    }
    public toString(): string {
        return this.name;
    }

    private parseDateOrNull(value: any): Date | null {
        try {
            return new Date(value);
        } catch {
            return null;
        }
    }
}

export class DevProjectSettings implements ProjectSettings {
    private readonly _languages: Language[];
    private _primaryLanguage: Language;
    private _extensions: Map<string, string>;

    public id: string;
    public name: string;
    public version: string;
    public copyright: string;
    public languages: string;
    public get primaryLanguage(): string {
        return this._primaryLanguage.id;
    }
    public extensions: string;

    public constructor() {
        this.id = newBsonId();
        this.name = "Untitled Project";
        this.version = "0.0.0.0";
        this.copyright = "";
        this.languages = "";
        this._primaryLanguage = { id: "en-US", lcid: "1033", name: "English (United States)", twoLetterIsoName: "us" };
        this.extensions = "";

        this._extensions = new Map();
        this._languages = [];
    }

    public getLanguages(): ReadonlyArray<Language> {
        return this._languages;
    }
    public addLanguage(value: Language) {
        this._languages.push(value);
    }
    public removeLanguage(value: Language) {
        const index = this._languages.findIndex(language => language.id === value.id);
        if (index >= 0) {
            this._languages.splice(index, 1);
        }
    }
    public getLanguageIds(): ReadonlyArray<string> {
        return this._languages.map(language => language.id);
    }
    public getPrimaryLanguage(): Language {
        return this._primaryLanguage;
    }
    public setPrimaryLanguage(value: Language) {
        this._primaryLanguage = value;
    }
    public getExtensions(): ReadonlyMap<string, string> {
        return this._extensions;
    }
    public addExtension(name: string, version: string) {
        this._extensions.set(name, version);
    }
    public removeExtension(name: string) {
        this._extensions.delete(name);
    }
    public getHashCode(): number {
        return 0;
    }
    public toString(): string {
        return this.name;
    }

}

export class DevSpecificationDictionary implements SpecificationDictionary {

    public readonly values: Map<string, string[]>;

    constructor() {
        this.values = new Map();
    }

    public is(key: string, value: string | readonly string[]): boolean {
        const currentValue = this.values.get(key) ?? [];
        const expectedValue = Array.isArray(value) ? value : [value];
        return currentValue.length === expectedValue.length && currentValue.every((v, i) => v === expectedValue[i]);
    }
    public has(key: string): boolean {
        return this.values.has(key);
    }
    public get(key: string): ReadonlySet<string> | null {
        return this.values.has(key) ? new Set(this.values.get(key) ?? []) : null;
    }
    public add(key: string, value: string | readonly string[]) {
        const newValues = new Set(this.values.get(key) ?? []);
        if (Array.isArray(value)) {
            for (const item of value) {
                newValues.add(item);
            }
        } else if (typeof value === 'string') {
            newValues.add(value);
        }
        this.values.set(key, [...newValues]);
    }
    public tuples(): ReadonlyArray<readonly [string, string]> {
        return [...this.values].flatMap(([key, values]) => values.map(value => [key, value]));
    }
    public isPickList(): boolean {
        return [...this.values.keys()].some(key => key.startsWith('pick.'));
    }
    public getLayoutRowName(): string | null {
        return this.getFirstOrDefault('layout.rowName');
    }
    public getLayoutOrder(): number | null {
        return this.has('layout.order') ? Number(this.getFirstOrDefault('layout.order')) : null;
    }
    public getGroup(): string {
        return this.getFirstOrDefault('group') ?? '';
    }
    public isDisplayHidden(): boolean {
        const displayValues = this.get('display');
        return !!displayValues && displayValues.has('hidden');
    }
    public getCustomEditor(): string | null {
        return this.getFirstOrDefault('editor');
    }
    public getFunctionParameters(): ReadonlyArray<readonly [string, string]> | null {
        throw new Error("Method not implemented.");
    }
    public getIcon(): string | null {
        const icon = this.getFirstOrDefault('icon');
        if (icon && icon.indexOf('/') < 0) {
            return 'fugue16/' + icon;
        } else {
            return icon;
        }
    }
    public getMenuVisibility(): "visible" | "hidden" {
        const visibility = this.getFirstOrDefault('menuVisibility');
        if (visibility === "hidden") {
            return "hidden";
        }
        return "visible";
    }
    public getTypeName(): string | null {
        return this.getFirstOrDefault('typeName');
    }
    public getDisplayTextTemplate(): string | null {
        let template = this.getFirstOrDefault('displayTextTemplate');

        const propertyName = this.getFirstOrDefault('displayName') ??
            this.getFirstOrDefault('displayNameAttribute');
        if ((template ?? '') === '' && (propertyName ?? '') !== '') {
            template = '{' + propertyName + '}';
        }

        return template;
    }
    public getParsedDisplayTextTemplate(): { render(document: any, schema: any): string; } | null {
        throw new Error("Method not implemented.");
    }
    public getPrecision(): number | null {
        const precision = Number(this.getFirstOrDefault('precision'));
        if (isNaN(precision) || !isFinite(precision)) {
            return null;
        }
        return precision;
    }
    public getDisplayPrecision(): number | null {
        const precision = Number(this.getFirstOrDefault('displayPrecision'));
        if (isNaN(precision) || !isFinite(precision)) {
            return null;
        }
        return precision;
    }
    public getMinRows(): number | null {
        const rows = Number(this.getFirstOrDefault('minRows'));
        if (isNaN(rows) || !isFinite(rows)) {
            return null;
        }
        return rows;
    }
    public getMaxRows(): number | null {
        const rows = Number(this.getFirstOrDefault('maxRows'));
        if (isNaN(rows) || !isFinite(rows)) {
            return null;
        }
        return rows;
    }
    public getPickList(): ReadonlyArray<readonly [string, string, bigint]> {
        return [...this.values]
            .filter(([key, value]) => key.startsWith('pick.') && isBigInt(value[0]))
            // remove pick. prefix
            .map(([key, value]) => [key.substring(5), value[0], BigInt(value[0])] as const)
            // sort in reverse order from bigger to smaller
            .sort((x, y) => Math.sign(Number(y[2] - x[2])));

        function isBigInt(value: string) {
            if (typeof value !== 'string' || !value.length) {
                return false;
            }
            try {
                return typeof BigInt(value) === 'bigint';
            } catch {
                return false;
            }
        }
    }
    public mapPickList(value: any): bigint | null {
        const pickList = this.getPickList();
        if (!pickList || !pickList.length) {
            return null;
        }
        if (value === null || typeof value === 'undefined') {
            return null;
        }

        const valueStr = String(value).trim();
        const pickIndex = pickList.findIndex(([pickName, pickValueStr, pickValue]) => pickName === valueStr || pickValueStr === valueStr || value === pickValue);
        if (pickIndex >= 0) {
            return BigInt(pickList[pickIndex][1]);
        } else {
            return null;
        }
    }
    public mapMultiPickList(value: any): bigint | null {
        const pickList = this.getPickList();
        if (!pickList || !pickList.length) {
            return null;
        }
        if (value === null || typeof value === 'undefined') {
            return null;
        } else if (typeof value === 'bigint' || typeof value === 'number') {
            return BigInt(value);
        }

        const valueStr = String(value).trim();
        const pickIndex = pickList.findIndex(([pickName, pickValueStr, pickValue]) => pickName === valueStr || pickValueStr === valueStr || value === pickValue);
        if (pickIndex >= 0) {
            return BigInt(pickList[pickIndex][1]);
        }

        if (valueStr.match(/^\d+$/)) {
            return BigInt(valueStr);
        }

        let result: bigint | null = null;
        const parts = valueStr.split(/[, ;|]+/)
            .filter(Boolean) // Removes empty strings
            .map(this.mapPickList, this);
        for (const flag of parts) {
            result = (result ?? 0n) | (flag ?? 0n);
        }
        return result;
    }
    public formatPickList(value: bigint | number): string {
        const pickList = this.getPickList();
        if (!pickList || !pickList.length) {
            return String(value) || 'None';
        }
        if (typeof value === 'number') {
            if (isNaN(value) || !isFinite(value)) {
                return 'None';
            }
        }
        const valueStr = String(value).trim();
        const pickIndex = pickList.findIndex(([pickName, pickValueStr, pickValue]) => pickName === valueStr || pickValueStr === valueStr || value === pickValue);
        if (pickIndex >= 0) {
            return pickList[pickIndex][0];
        } else {
            return String(value) || 'None';
        }
    }
    public formatMultiPickList(value: number | bigint): string {
        const pickList = this.getPickList();
        if (!pickList || !pickList.length) {
            return String(value) || 'None';
        }
        if (typeof value === 'number') {
            if (isNaN(value) || !isFinite(value)) {
                return 'None';
            }
        }

        value = this.mapMultiPickList(value) ?? 0n;
        let result = '';
        let zeroName = '';
        for (const [pickName, , pickValue] of pickList) {
            const flag = pickValue;
            if (flag === 0n) {
                zeroName = pickName;
                continue;
            }
            if ((value & flag) === flag) {
                result += pickName + ', ';
                value = value & ~flag;
            }
        }

        if (value !== 0n) {
            result += value.toString();
        }

        if (result.length === 0) {
            result = zeroName || value.toString() || 'None';
        } else {
            result = result.substr(0, result.length - 2);
        }

        return result;
    }
    public splitMultiPickList(value: number | bigint): bigint[] {
        const pickList = this.getPickList();
        if (!pickList || !pickList.length) {
            return [];
        }
        if (typeof value === 'number') {
            if (isNaN(value) || !isFinite(value)) {
                return [];
            }
        }
        value = BigInt(value);
        const result = new Array<bigint>();
        for (const [, , pickValue] of pickList) {
            const flag = pickValue;
            if (flag === 0n) {
                continue;
            }
            if ((value & flag) === flag) {
                result.push(flag);
                value = value & ~flag;
            }
        }
        return result;
    }
    public getAssetTypes(): readonly string[] {
        return [...this.get('assetType') ?? []];
    }
    public getLocalOnly(): boolean {
        return Boolean(this.get('localOnly')?.has('true'));
    }
    public getPathFilter(): string | null {
        return this.getFirstOrDefault('pathFilter');
    }

    private getFirstOrDefault(key: string, defaultValue?: string): string | null {
        const values = this.get(key);
        if (!values) {
            return defaultValue ?? null;
        }
        for (const value of values) {
            return value ?? defaultValue ?? null;
        }
        return defaultValue ?? null;
    }

    public toString(): string {
        return this.tuples().map(([key, value]) => encodeURIComponent(key) + "=" + encodeURIComponent(value)).join('&');
    }

}

function newBsonId() {
    return Array.from(crypto.getRandomValues(new Uint8Array(12)), byte => byte.toString(16).padStart(2, '0')).join('');
}