export const ConversationSchema = {
    "Collections": {
        "Schema": [
            {
                "Id": "68efe4c7c1e4b04cc8f8d232",
                "Name": "DialogResponse",
                "DisplayName": "Dialog Response",
                "Type": 1,
                "Description": "",
                "IdGenerator": 3,
                "Specification": "displayTextTemplate=%7BText%7D",
                "Properties": [
                    {
                        "Id": "68efe4c7c1e4b04cc8f8d22f",
                        "SharedProperty": null,
                        "Name": "Id",
                        "DisplayName": "Id",
                        "Description": "",
                        "DataType": 13,
                        "DefaultValue": null,
                        "Uniqueness": 1,
                        "Requirement": 2,
                        "ReferenceType": null,
                        "Size": 4,
                        "Specification": "display=hidden"
                    },
                    {
                        "Id": "68efe4c7c1e4b04cc8f8d230",
                        "SharedProperty": null,
                        "Name": "Text",
                        "DisplayName": "Text",
                        "Description": "",
                        "DataType": 1,
                        "DefaultValue": null,
                        "Uniqueness": 0,
                        "Requirement": 2,
                        "ReferenceType": null,
                        "Size": 0,
                        "Specification": "editor=localized-text-multiline"
                    },
                    {
                        "Id": "68efe4edc1e4b04cc8f8d240",
                        "SharedProperty": null,
                        "Name": "NextNode",
                        "DisplayName": "Next Node",
                        "Description": "",
                        "DataType": 28,
                        "DefaultValue": null,
                        "Uniqueness": 0,
                        "Requirement": 0,
                        "ReferenceType": {
                            "Id": "68efe4cbc1e4b04cc8f8d239",
                            "DisplayName": "Dialog Node"
                        },
                        "Size": 0,
                        "Specification": ""
                    },
                    {
                        "Id": "68efe4c7c1e4b04cc8f8d231",
                        "SharedProperty": null,
                        "Name": "Specification",
                        "DisplayName": "Specification",
                        "Description": "",
                        "DataType": 0,
                        "DefaultValue": null,
                        "Uniqueness": 0,
                        "Requirement": 0,
                        "ReferenceType": null,
                        "Size": 0,
                        "Specification": "display=hidden"
                    }
                ]
            },
            {
                "Id": "68efe4cbc1e4b04cc8f8d239",
                "Name": "DialogNode",
                "DisplayName": "Dialog Node",
                "Type": 1,
                "Description": "",
                "IdGenerator": 3,
                "Specification": "displayTextTemplate=%7BText%7D",
                "Properties": [
                    {
                        "Id": "68efe4cbc1e4b04cc8f8d234",
                        "SharedProperty": null,
                        "Name": "Id",
                        "DisplayName": "Id",
                        "Description": "",
                        "DataType": 13,
                        "DefaultValue": null,
                        "Uniqueness": 1,
                        "Requirement": 2,
                        "ReferenceType": null,
                        "Size": 4,
                        "Specification": "display=hidden"
                    },
                    {
                        "Id": "68efe4cbc1e4b04cc8f8d235",
                        "SharedProperty": null,
                        "Name": "Text",
                        "DisplayName": "Text",
                        "Description": "",
                        "DataType": 1,
                        "DefaultValue": null,
                        "Uniqueness": 0,
                        "Requirement": 2,
                        "ReferenceType": null,
                        "Size": 0,
                        "Specification": "editor=localized-text-multiline"
                    },
                    {
                        "Id": "68efe4cbc1e4b04cc8f8d236",
                        "SharedProperty": null,
                        "Name": "NextNode",
                        "DisplayName": "Next Node",
                        "Description": "",
                        "DataType": 28,
                        "DefaultValue": null,
                        "Uniqueness": 0,
                        "Requirement": 0,
                        "ReferenceType": {
                            "Id": "68efe4cbc1e4b04cc8f8d239",
                            "DisplayName": "Dialog Node"
                        },
                        "Size": 0,
                        "Specification": ""
                    },
                    {
                        "Id": "68efe4cbc1e4b04cc8f8d237",
                        "SharedProperty": null,
                        "Name": "Responses",
                        "DisplayName": "Responses",
                        "Description": "",
                        "DataType": 23,
                        "DefaultValue": null,
                        "Uniqueness": 0,
                        "Requirement": 2,
                        "ReferenceType": {
                            "Id": "68efe4c7c1e4b04cc8f8d232",
                            "DisplayName": "Dialog Response"
                        },
                        "Size": 0,
                        "Specification": ""
                    },
                    {
                        "Id": "68efe4cbc1e4b04cc8f8d238",
                        "SharedProperty": null,
                        "Name": "Specification",
                        "DisplayName": "Specification",
                        "Description": "",
                        "DataType": 0,
                        "DefaultValue": null,
                        "Uniqueness": 0,
                        "Requirement": 0,
                        "ReferenceType": null,
                        "Size": 0,
                        "Specification": "display=hidden"
                    }
                ]
            },
            {
                "Id": "68efe4d3c1e4b04cc8f8d23e",
                "Name": "ConversationTree",
                "DisplayName": "Conversation",
                "Type": 0,
                "Description": "",
                "IdGenerator": 0,
                "Specification": "editor=ext-conversation-editor&displayTextTemplate=%7BId%7D&icon=emoji%2Fspeech_balloon",
                "Properties": [
                    {
                        "Id": "68efe4d3c1e4b04cc8f8d23b",
                        "SharedProperty": null,
                        "Name": "Id",
                        "DisplayName": "Id",
                        "Description": "",
                        "DataType": 0,
                        "DefaultValue": null,
                        "Uniqueness": 1,
                        "Requirement": 3,
                        "ReferenceType": null,
                        "Size": 0,
                        "Specification": ""
                    },
                    {
                        "Id": "68efe527c1e4b04cc8f8d243",
                        "SharedProperty": null,
                        "Name": "RootNode",
                        "DisplayName": "Root Node",
                        "Description": "",
                        "DataType": 28,
                        "DefaultValue": null,
                        "Uniqueness": 0,
                        "Requirement": 2,
                        "ReferenceType": {
                            "Id": "68efe4cbc1e4b04cc8f8d239",
                            "DisplayName": "Dialog Node"
                        },
                        "Size": 0,
                        "Specification": ""
                    },
                    {
                        "Id": "68efe4d3c1e4b04cc8f8d23d",
                        "SharedProperty": null,
                        "Name": "Nodes",
                        "DisplayName": "Nodes",
                        "Description": "",
                        "DataType": 23,
                        "DefaultValue": null,
                        "Uniqueness": 0,
                        "Requirement": 2,
                        "ReferenceType": {
                            "Id": "68efe4cbc1e4b04cc8f8d239",
                            "DisplayName": "Dialog Node"
                        },
                        "Size": 0,
                        "Specification": ""
                    },
                    {
                        "Id": "68efe4d3c1e4b04cc8f8d23c",
                        "SharedProperty": null,
                        "Name": "Specification",
                        "DisplayName": "Specification",
                        "Description": "",
                        "DataType": 0,
                        "DefaultValue": null,
                        "Uniqueness": 0,
                        "Requirement": 0,
                        "ReferenceType": null,
                        "Size": 0,
                        "Specification": "display=hidden"
                    }
                ]
            }
        ]
    }
}