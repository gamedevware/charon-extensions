import { DataType, DocumentControl, getRootDocumentControl } from 'charon-extensions';
import { ConversationTree } from '../models';
import { validateSchema } from './validate.schema';
import { SchemaValidationError } from './schema.validation.error';
import { useCallback, useState } from 'react';
import { DataSourceWithImport } from './game.data.source.with.import';
import { migrateSchema } from './migrate.schema';

function SchemaValidationResult({ documentControl }: { documentControl: DocumentControl<ConversationTree> }) {
    const errors = validateSchema(documentControl.schema);
    const validationResult = { isValid: !errors.length, errors };

    const [migrationError, setMigrationError] = useState<string>('');
    const services = getRootDocumentControl(documentControl).services;
    const dataService = services.dataService as DataSourceWithImport;
    const [migrateIsPending, setMigrateIsPending] = useState<boolean>(false);

    // Renamed handler for clarity
    const migrateSchemaHandler = useCallback(() => {
        setMigrateIsPending(true); // Updated state name
        setMigrationError(''); // reset error

        migrateSchema(documentControl.schema, dataService)
            .then(
                () => {
                    window.location.reload();
                    console.log(`Successfully migrated ${documentControl.schema.displayName} schema.`);
                },
                (error) => {
                    setMigrationError(String(error));
                    console.error(error);
                }
            )
            .finally(() => setMigrateIsPending(false)); // Updated state name
    }, [dataService, documentControl]);

    return (
        <>
            <div className="ext-ce-schema-validation-container">
                <div className="ext-ce-validation-header">
                    <h2>Schema Validation</h2>
                    <p>
                        This editor requires a specific document schema to function properly. You can correct the errors listed below or
                        <strong>migrate</strong> the schema to the required format.
                    </p>
                    {validationResult.isValid ? (
                        <div className="ext-ce-validation-status valid">
                            <span className="ext-ce-status-icon">✓</span>
                            Schema is valid
                        </div>
                    ) : (
                        <div className="ext-ce-validation-status invalid">
                            <span className="ext-ce-status-icon">✗</span>
                            Schema has {validationResult.errors.length} error{validationResult.errors.length !== 1 ? 's' : ''}
                        </div>
                    )}
                </div>

                {!validationResult.isValid && (
                    <div className="ext-ce-validation-errors">
                        <h3>Validation Errors</h3>
                        {validationResult.errors.map((error, index) => (
                            <ValidationErrorItem key={index} error={error} />
                        ))}
                    </div>
                )}

                <div className="ext-ce-schema-import">
                    <h3>Schema Migration</h3>
                    <p>
                        <strong>Migrate</strong> the <span className='ext-ce-schema-name'>{documentControl.schema.displayName}</span> schema to the required structure. This action will attempt to fix structural issues while preserving existing data.
                    </p>
                    <button className='ext-ce-migrate-button' onClick={migrateSchemaHandler} disabled={migrateIsPending}>Migrate Schema</button>
                </div>

                {migrationError && (
                    <div className="ext-ce-validation-error-item">
                        <span className="ext-ce-error-message">
                            <strong>Schema Migration Error:</strong> {migrationError}
                        </span>

                    </div>
                )}
            </div>
        </>
    );
}

function ValidationErrorItem({ error }: { error: SchemaValidationError }) {
    const modelPathStr = error.modelPath.join(' → ');
    const expectedTypesStr = error.expectedTypes.map(getDataTypeName).join(' or ');

    function getDataTypeName(dataType: DataType): string {
        switch (dataType) {
            case DataType.Date: return 'Date';
            case DataType.Document: return 'Document';
            case DataType.DocumentCollection: return 'Collection of Documents';
            case DataType.MultiPickList: return 'Multi-Pick List';
            case DataType.Formula: return 'Formula';
            case DataType.Integer: return 'Number (Integer)';
            case DataType.LocalizedText: return 'Text (Localizable)';
            case DataType.Logical: return 'Logical';
            case DataType.Number: return 'Number';
            case DataType.PickList: return 'Pick List';
            case DataType.Reference: return 'Reference';
            case DataType.ReferenceCollection: return 'Collection of References';
            case DataType.Text: return 'Text';
            case DataType.Time: return 'Time';
            default: return DataType[dataType];
        }
    }

    return (
        <div className="ext-ce-validation-error-item">
            <div className="ext-ce-error-path">{modelPathStr}</div>
            <div className="ext-ce-error-details">
                <span className="ext-ce-property-name">{error.propertyName}</span>
                {error.missing ? (
                    <span className="ext-ce-error-message">
                        Property is missing. Expected type: <code>{expectedTypesStr}</code>
                    </span>
                ) : (
                    <span className="ext-ce-error-message">
                        Invalid type: <code>{error.actualType !== undefined ? getDataTypeName(error.actualType) : 'Unknown'}</code>
                        {' '}(expected: <code>{expectedTypesStr}</code>)
                    </span>
                )}
            </div>
        </div>
    );
}

export default SchemaValidationResult;