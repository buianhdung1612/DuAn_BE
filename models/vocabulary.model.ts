import mongoose, { Schema, Document } from "mongoose";

export interface IVocabulary extends Document {
    userId: string;
    word: string;
    rootWord?: string;
    category: "word" | "phrasal_verb" | "collocation" | "phrase" | "lexical_set";
    partOfSpeech: string;
    topicId: string;
    ipa: string;
    audio: string;
    definition: string;
    examples: { title: string; sentences: { text: string; translation: string }[] }[];
    imageUrl: string;
    wordFamily: {
        word: string; partOfSpeech: string; definition: string; ipa: string; note: string;
        examples: { title: string; sentences: { text: string; translation: string }[] }[];
        synonyms: string[]; shouldStudy: boolean
    }[];
    relatedWords: {
        word: string; partOfSpeech: string; definition: string; ipa: string; note: string;
        examples: { title: string; sentences: { text: string; translation: string }[] }[];
        synonyms: string[]; shouldStudy: boolean
    }[];
    synonyms: string[];
    groupedWords?: { word: string; definition: string; note: string }[];
    note: string;
    level: number; // 0: Mới, 1-5: Độ thuộc bài
    nextReview: Date;
    interval: number; // Khoảng cách ngày (days)
    easeFactor: number; // Hệ số dễ (SM-2 algorithm)
    repetitionCount: number;
    deleted: boolean;
    deletedAt?: Date;
}

const VocabularySchema: Schema = new Schema(
    {
        userId: { type: String, required: true },
        word: { type: String, required: true },
        rootWord: { type: String },
        category: { type: String, enum: ["word", "phrasal_verb", "collocation", "phrase", "lexical_set"], default: "word" },
        partOfSpeech: { type: String },
        topicId: { type: Schema.Types.ObjectId, ref: 'VocabularyTopic' },
        ipa: { type: String },
        audio: { type: String },
        definition: { type: String },
        examples: [
            {
                title: { type: String },
                sentences: [
                    {
                        text: { type: String },
                        translation: { type: String }
                    }
                ]
            },
        ],
        imageUrl: { type: String },
        wordFamily: [
            {
                word: { type: String },
                partOfSpeech: { type: String },
                definition: { type: String },
                ipa: { type: String },
                note: { type: String },
                examples: [
                    {
                        title: { type: String },
                        sentences: [
                            {
                                text: { type: String },
                                translation: { type: String }
                            }
                        ]
                    }
                ],

                synonyms: [{ type: String }],
                shouldStudy: { type: Boolean, default: false }
            },
        ],
        relatedWords: [
            {
                word: { type: String },
                partOfSpeech: { type: String },
                definition: { type: String },
                ipa: { type: String },
                note: { type: String },
                examples: [
                    {
                        title: { type: String },
                        sentences: [
                            {
                                text: { type: String },
                                translation: { type: String }
                            }
                        ]
                    }
                ],

                synonyms: [{ type: String }],
                shouldStudy: { type: Boolean, default: false }
            },
        ],

        synonyms: [{ type: String }],
        groupedWords: [
            {
                word: { type: String },
                ipa: { type: String },
                definition: { type: String },
                note: { type: String },
                imageUrl: { type: String },
            }
        ],
        note: { type: String },
        level: { type: Number, default: 0 },
        nextReview: { type: Date, default: Date.now },
        interval: { type: Number, default: 0 },
        easeFactor: { type: Number, default: 2.5 },
        repetitionCount: { type: Number, default: 0 },
        deleted: { type: Boolean, default: false },
        deletedAt: { type: Date },
    },
    { timestamps: true }
);

export default mongoose.model<IVocabulary>("Vocabulary", VocabularySchema);
