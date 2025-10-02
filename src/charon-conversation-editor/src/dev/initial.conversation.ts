import { ConversationTree } from "../models";

export const initialConversation: ConversationTree = {
    "Id": "CouncilOfElrond",
    "RootNode": { "Id": "ElrondOpening", "DisplayName": "ElrondOpensCouncil" },
    "Nodes": [
        {
            "Id": "ElrondOpening",
            "Text": "Elrond: Strangers from distant lands, friends of old. You have been summoned here to answer the threat of Mordor. Middle-earth stands upon the brink of destruction. None can escape it. You will unite, or you will fall.",
            "NextNode": { "Id": "BoromirIntroduction", "DisplayName": "BoromirSpeaks" },
            "Responses": [],
            "Specification": ''
        },
        {
            "Id": "BoromirIntroduction",
            "Text": "Boromir: In a dream I saw the Eastern sky grow dark, but in the West a pale light lingered. A voice was crying: 'Your doom is near at hand. Isildur's Bane shall be found.'",
            "NextNode": { "Id": "ElrondReveal", "DisplayName": "ElrondRevealsRing" },
            "Responses": [],
            "Specification": ''
        },
        {
            "Id": "ElrondReveal",
            "Text": "Elrond: The Ring of Power. Forged by the Dark Lord Sauron in the fires of Mount Doom. Taken by Isildur from the hand of Sauron himself.",
            "NextNode": null,
            "Responses": [
                {
                    "Id": "BoromirQuestion",
                    "Text": "Boromir: So it is true. The One Ring of legend. What chance do we have against such power?",
                    "NextNode": { "Id": "ElrondWarning", "DisplayName": "ElrondWarns" },
                    "Specification": ''
                },
                {
                    "Id": "GimliReaction",
                    "Text": "Gimli: Then what are we waiting for? [He stands and raises his axe]",
                    "NextNode": { "Id": "ElrondStopsGimli", "DisplayName": "ElrondIntervenes" },
                    "Specification": ''
                }
            ],
            "Specification": ''
        },
        {
            "Id": "ElrondWarning",
            "Text": "Elrond: The Ring cannot be wielded by any here. It answers to Sauron alone. It has no other master.",
            "NextNode": null,
            "Responses": [
                {
                    "Id": "BoromirDoubt",
                    "Text": "Boromir: And what would a Ranger know of this matter?",
                    "NextNode": null,
                    "Specification": ''
                }
            ],
            "Specification": ''
        },
        {
            "Id": "ElrondStopsGimli",
            "Text": "Elrond: [Stopping Gimli] The Ring cannot be destroyed, Gimli, son of Glóin, by any craft that we here possess. The Ring was made in the fires of Mount Doom. Only there can it be unmade.",
            "NextNode": null,
            "Responses": [
                {
                    "Id": "GimliResponse",
                    "Text": "Gimli: Then it has all been in vain. The Fellowship has failed.",
                    "NextNode": null,
                    "Specification": ''
                }
            ],
            "Specification": ''
        }
    ],
    "Specification": ''
};