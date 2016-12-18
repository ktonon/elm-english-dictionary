module PartOfSpeech exposing (PartOfSpeech, decoder, toString)

{-| Part of speech enumeration with decoder and toString

@docs PartOfSpeech, decoder, toString
-}

import Json.Decode as Decode exposing (succeed, andThen)


{-| Part of speech enumeration. Possible positions of a word in a sentence.
-}
type PartOfSpeech
    = Adjective
    | Adverb
    | Noun
    | Verb
    | Unexpected String


{-| Decodes a part of speech string representation
-}
decoder : Decode.Decoder PartOfSpeech
decoder =
    Decode.string |> andThen rawDecoder


rawDecoder : String -> Decode.Decoder PartOfSpeech
rawDecoder raw =
    case raw of
        "adj" ->
            succeed Adjective

        "adv" ->
            succeed Adverb

        "noun" ->
            succeed Noun

        "verb" ->
            succeed Verb

        _ ->
            succeed (Unexpected raw)


{-| A readable string representation
-}
toString : PartOfSpeech -> String
toString pos =
    case pos of
        Adjective ->
            "Adjective"

        Adverb ->
            "Adverb"

        Noun ->
            "Noun"

        Verb ->
            "Verb"

        Unexpected raw ->
            raw
